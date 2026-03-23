import React from 'react';
import { useTranslation } from 'react-i18next';
import { WsStatus } from '../store/simulationSlice';

interface Props {
  status: WsStatus;
}

const LoadingScreen: React.FC<Props> = ({ status }) => {
  const { t } = useTranslation();
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <i className="pi pi-spin pi-spinner loading-spinner" />
        <div className="loading-title">{t('app.title')}</div>
        <div className="loading-status">{t(`ws.${status}`)}</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
