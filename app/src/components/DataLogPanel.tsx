import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearLogs, LogCategory } from '../store/simulationSlice';

const severityColor: Record<string, string> = {
  info: '#60a5fa',
  warning: '#f59e0b',
  error: '#ef4444',
};

const CATEGORIES: LogCategory[] = ['system', 'route', 'position'];

const DataLogPanel: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const logs = useAppSelector((s) => s.simulation.logs);
  const [activeCategories, setActiveCategories] = useState<Set<LogCategory>>(
    new Set<LogCategory>(['system', 'route'])
  );

  const toggleCategory = (cat: LogCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const filtered = logs.filter((e) => activeCategories.has(e.category));

  return (
    <div className="panel data-log-panel">
      <div className="panel-header">
        <i className="pi pi-list" />
        <span>{t('panels.dataLog')}</span>
        <div className="log-category-toggles">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`log-cat-btn${activeCategories.has(cat) ? ' log-cat-btn--active' : ''}`}
              onClick={() => toggleCategory(cat)}
              title={t(`log.categories.${cat}`)}
            >
              {t(`log.categories.${cat}`)}
            </button>
          ))}
        </div>
        {logs.length > 0 && (
          <Button
            icon="pi pi-trash"
            className="p-button-text p-button-sm p-button-secondary log-clear-btn"
            onClick={() => dispatch(clearLogs())}
            tooltip={t('log.clear')}
          />
        )}
      </div>
      <div className="panel-content log-scroll">
        {filtered.length === 0 ? (
          <span className="log-empty">{t('log.empty')}</span>
        ) : (
          filtered.map((entry) => (
            <div key={entry.id} className="log-entry">
              <span className="log-time">{entry.timestamp}</span>
              <span className="log-dot" style={{ background: severityColor[entry.severity] }} />
              <span className="log-msg">{t(entry.message, { defaultValue: entry.message, ...entry.params })}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DataLogPanel;
