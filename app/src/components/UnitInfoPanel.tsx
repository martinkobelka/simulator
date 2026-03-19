import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { useAppSelector } from '../store/hooks';
import { barColor } from '../services/uiService';

const UnitInfoPanel: React.FC = () => {
  const { t } = useTranslation();
  const entities = useAppSelector((s) => s.simulation.entities);
  const selectedEntityId = useAppSelector((s) => s.simulation.selectedEntityId);
  const entity = entities.find((e) => e.id === selectedEntityId);

  return (
    <div className="panel unit-info-panel">
      <div className="panel-header">
        <i className="pi pi-info-circle" />
        <span>{t('panels.unitInfo')}</span>
        {entity && (
          <Tag value={entity.callsign} severity="info" className="unit-callsign-tag" />
        )}
      </div>
      <div className="panel-content">
        {!entity ? (
          <p className="no-selection">{t('unit.noSelection')}</p>
        ) : (
          <table className="unit-table">
            <tbody>
              <tr><td>{t('unit.callsign')}</td><td><strong>{entity.callsign}</strong></td></tr>
              <tr><td>{t('unit.type')}</td><td>{t(entity.type)}</td></tr>
              <tr><td>{t('unit.position')}</td><td>{entity.position[1].toFixed(4)}°N, {entity.position[0].toFixed(4)}°E</td></tr>
              <tr><td>{t('unit.task')}</td><td>{t(entity.task)}</td></tr>
              <tr><td>{t('unit.speed')}</td><td>{entity.speed} km/h</td></tr>
              <tr>
                <td>{t('unit.damage')}</td>
                <td>
                  <ProgressBar value={entity.damage} color={barColor(entity.damage)} className="unit-progress-bar" showValue={false} />
                  <span className="unit-progress-value">{entity.damage} %</span>
                </td>
              </tr>
              <tr>
                <td>{t('unit.ammo')}</td>
                <td>
                  <ProgressBar value={entity.ammo} color={barColor(entity.ammo, true)} className="unit-progress-bar" showValue={false} />
                  <span className="unit-progress-value">{entity.ammo} %</span>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UnitInfoPanel;
