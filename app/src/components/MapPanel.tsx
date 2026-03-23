import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddEntityDialog from './AddEntityDialog';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Style, Icon, Stroke } from 'ol/style';
import 'ol/ol.css';
import { confirmDialog } from 'primereact/confirmdialog';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectEntity } from '../store/simulationSlice';
import { wsService } from '../services/websocketService';
import { milSymbolStyle } from '../services/mapStyleService';

const MapPanel: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const entities = useAppSelector((s) => s.simulation.entities);
  const selectedEntityId = useAppSelector((s) => s.simulation.selectedEntityId);

  const [newEntityPosition, setNewEntityPosition] = useState<[number, number] | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const entityLayerRef = useRef<VectorLayer<VectorSource> | undefined>(undefined);
  const entitySourceRef = useRef(new VectorSource());
  const routeSourceRef = useRef(new VectorSource());
  const selectedEntityIdRef = useRef<string | null>(null);
  const entitiesRef = useRef(entities);

  // Keep refs in sync for map click handler (avoids stale closure)
  useEffect(() => {
    selectedEntityIdRef.current = selectedEntityId;
  }, [selectedEntityId]);

  // Delete key removes selected entity (with confirmation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Delete') {
        return;
      }
      const entityId = selectedEntityIdRef.current;
      if (!entityId) {
        return;
      }
      const entity = entitiesRef.current.find((en) => en.id === entityId);
      confirmDialog({
        message: t('map.deleteConfirm', { callsign: entity?.callsign ?? entityId }),
        header: t('map.deleteHeader'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: t('map.deleteAccept'),
        rejectLabel: t('map.deleteReject'),
        acceptClassName: 'p-button-danger',
        accept: () => wsService.send({ type: 'REMOVE_ENTITY', entityId }),
      });
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [t]);

  useEffect(() => {
    entitiesRef.current = entities;
  }, [entities]);

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) {
      return;
    }

    const entityLayer = new VectorLayer({ source: entitySourceRef.current, zIndex: 2 });
    entityLayerRef.current = entityLayer;

    const routeLayer = new VectorLayer({
      source: routeSourceRef.current,
      zIndex: 1,
      style: new Style({
        stroke: new Stroke({ color: '#f59e0b', width: 2, lineDash: [8, 6] }),
      }),
    });

    const map = new Map({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() }), routeLayer, entityLayer],
      view: new View({ center: fromLonLat([15.8, 49.5]), zoom: 7 }),
    });

    // Map click — unified handler
    map.on('click', (e) => {
      const hitEntityId = map.forEachFeatureAtPixel(
        e.pixel,
        (f) => f.get('entityId'),
        { layerFilter: (l) => l === entityLayer }
      );

      const currentId = selectedEntityIdRef.current;

      if (hitEntityId) {
        if (hitEntityId === currentId) {
          // Klik na již označenou jednotku → odznačit
          selectedEntityIdRef.current = null;
          dispatch(selectEntity(null));
        } else {
          // Klik na jinou jednotku → označit
          selectedEntityIdRef.current = hitEntityId;
          dispatch(selectEntity(hitEntityId));
        }
      } else {
        // Klik na prázdné místo
        if (currentId) {
          const selectedEntity = entitiesRef.current.find((en) => en.id === currentId);
          if (selectedEntity && selectedEntity.speed > 0 && selectedEntity.damage < 100) {
            const [lon, lat] = toLonLat(e.coordinate);
            wsService.send({ type: 'ADD_WAYPOINT', entityId: currentId, position: [lon, lat] });
          }
        } else {
          const [lon, lat] = toLonLat(e.coordinate);
          setNewEntityPosition([lon, lat]);
        }
      }
    });

    mapInstance.current = map;
    return () => {
      map.setTarget(undefined);
      mapInstance.current = null;
    };
  }, []); // eslint-disable-line

  // Sync entity features
  useEffect(() => {
    entitySourceRef.current.clear();
    entities.forEach((entity) => {
      const feature = new Feature({ geometry: new Point(fromLonLat(entity.position)) });
      feature.set('entityId', entity.id);
      feature.setStyle(milSymbolStyle(entity.sidc, entity.damage, entity.ammo));
      entitySourceRef.current.addFeature(feature);
    });
  }, [entities]);

  // Draw route for selected entity
  useEffect(() => {
    routeSourceRef.current.clear();
    if (!selectedEntityId) {
      return;
    }
    const entity = entities.find((e) => e.id === selectedEntityId);
    if (!entity || entity.route.length < 2) {
      return;
    }

    routeSourceRef.current.addFeature(
      new Feature({ geometry: new LineString(entity.route.map((p) => fromLonLat(p))) })
    );

    entity.route.forEach((point, idx) => {
      const color =
        idx === 0 ? '%2322c55e'
        : idx === entity.route.length - 1 ? '%23ef4444'
        : '%23f59e0b';
      const wp = new Feature({ geometry: new Point(fromLonLat(point)) });
      wp.setStyle(new Style({
        image: new Icon({
          src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><circle cx="6" cy="6" r="5" fill="${color}" stroke="white" stroke-width="1.5"/></svg>`,
          anchor: [0.5, 0.5],
        }),
      }));
      routeSourceRef.current.addFeature(wp);
    });
  }, [selectedEntityId, entities]);

  // Crosshair cursor when entity selected (visual affordance for waypoint mode)
  const selectedEntity = entities.find((e) => e.id === selectedEntityId);
  const canAddWaypoint = !!selectedEntity && selectedEntity.speed > 0 && selectedEntity.damage < 100;
  const cursorStyle = canAddWaypoint ? 'crosshair' : 'default';

  return (
    <div className="panel map-panel">
      <div className="panel-header">
        <i className="pi pi-map" />
        <span>{t('panels.map')}</span>
        {canAddWaypoint && (
          <span className="map-waypoint-hint">{t('map.waypointHint')}</span>
        )}
      </div>
      <div ref={mapRef} className="map-container" style={{ cursor: cursorStyle }} />
      <AddEntityDialog position={newEntityPosition} onHide={() => setNewEntityPosition(null)} />
    </div>
  );
};

export default MapPanel;
