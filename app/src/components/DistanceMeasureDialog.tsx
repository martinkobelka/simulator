import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { useTranslation } from 'react-i18next';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { fromLonLat } from 'ol/proj';
import { Style, Stroke, Text, Fill } from 'ol/style';
import { boundingExtent, buffer } from 'ol/extent';
import 'ol/ol.css';
import { useAppSelector } from '../store/hooks';
import { shallowEqual } from 'react-redux';
import { haversineKm } from '../services/geoService';
import { entityStyle } from '../services/mapStyleService';
import { Entity } from '../store/simulationSlice';

interface Props {
  visible: boolean;
  onHide: () => void;
}


const DistanceMeasureDialog: React.FC<Props> = ({ visible, onHide }) => {
  const { t } = useTranslation();
  // Stable options — callsigns/types don't change during simulation
  const options = useAppSelector(
    (s) => s.simulation.entities.map((e) => ({ label: `${e.callsign} (${t(e.type)})`, value: e.id, sidc: e.sidc })),
    shallowEqual
  );

  const [id1, setId1] = useState<string | null>(null);
  const [id2, setId2] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setId1(null);
      setId2(null);
    }
  }, [visible]);

  // Only re-render when the selected entities' positions actually change
  const e1 = useAppSelector(
    (s) => s.simulation.entities.find((e) => e.id === id1) ?? null,
    (a, b) => a?.position[0] === b?.position[0] && a?.position[1] === b?.position[1] && a?.id === b?.id
  );
  const e2 = useAppSelector(
    (s) => s.simulation.entities.find((e) => e.id === id2) ?? null,
    (a, b) => a?.position[0] === b?.position[0] && a?.position[1] === b?.position[1] && a?.id === b?.id
  );

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const vectorSource = useRef(new VectorSource());

  const options1 = options.filter((o) => o.value !== id2);
  const options2 = options.filter((o) => o.value !== id1);
  const distance = e1 && e2 ? haversineKm(e1.position, e2.position) : null;

  const initMap = () => {
    if (!mapRef.current || mapInstance.current) {
      return;
    }
    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ source: vectorSource.current, zIndex: 1 }),
      ],
      view: new View({ center: fromLonLat([15.8, 49.5]), zoom: 6 }),
      controls: [],
    });
    setTimeout(() => mapInstance.current?.updateSize(), 0);
  };

  const destroyMap = () => {
    mapInstance.current?.setTarget(undefined);
    mapInstance.current = null;
    vectorSource.current.clear();
  };

  // Fit view with animation when selection changes
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !e1 || !e2) {
      return;
    }
    const p1 = fromLonLat(e1.position);
    const p2 = fromLonLat(e2.position);
    const extent = buffer(boundingExtent([p1, p2]), 30000);
    map.getView().fit(extent, { duration: 400, padding: [40, 40, 40, 40] });
  }, [id1, id2]); // eslint-disable-line

  // Update features and refit instantly when positions change
  useEffect(() => {
    vectorSource.current.clear();
    const map = mapInstance.current;
    if (!map) {
      return;
    }

    if (e1) {
      const f = new Feature({ geometry: new Point(fromLonLat(e1.position)) });
      f.setStyle(entityStyle(e1));
      vectorSource.current.addFeature(f);
    }

    if (e2) {
      const f = new Feature({ geometry: new Point(fromLonLat(e2.position)) });
      f.setStyle(entityStyle(e2));
      vectorSource.current.addFeature(f);
    }

    if (e1 && e2) {
      const p1 = fromLonLat(e1.position);
      const p2 = fromLonLat(e2.position);
      const mid = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];

      const line = new Feature({ geometry: new LineString([p1, p2]) });
      line.setStyle(new Style({
        stroke: new Stroke({ color: '#2563eb', width: 2, lineDash: [6, 4] }),
      }));
      vectorSource.current.addFeature(line);

      const label = new Feature({ geometry: new Point(mid) });
      label.setStyle(new Style({
        text: new Text({
          text: `${distance!.toFixed(1)} km`,
          font: 'bold 13px sans-serif',
          fill: new Fill({ color: '#1d4ed8' }),
          stroke: new Stroke({ color: '#ffffff', width: 3 }),
          offsetY: -14,
        }),
      }));
      vectorSource.current.addFeature(label);

      const extent = buffer(boundingExtent([p1, p2]), 30000);
      map.getView().fit(extent, { duration: 0, padding: [40, 40, 40, 40] });
    }

    map.render();
  }, [e1, e2, distance]);

  return (
    <Dialog header={t('dialog.measureDistance')} visible={visible} onShow={initMap} onHide={() => { destroyMap(); setId1(null); setId2(null); onHide(); }} className="measure-dialog-root" modal>
      <div className="measure-dialog">
        <div className="measure-row">
          <label>{t('dialog.entity1')}</label>
          <Dropdown value={id1} options={options1} onChange={(e) => setId1(e.value)} placeholder={t('dialog.select')} />
        </div>
        <div className="measure-row">
          <label>{t('dialog.entity2')}</label>
          <Dropdown value={id2} options={options2} onChange={(e) => setId2(e.value)} placeholder={t('dialog.select')} />
        </div>

        <div ref={mapRef} className="measure-minimap" />

        {distance !== null && (
          <div className="measure-result">
            <i className="pi pi-arrows-h" />
            <span>{distance.toFixed(2)} km</span>
          </div>
        )}

      </div>
    </Dialog>
  );
};

export default DistanceMeasureDialog;
