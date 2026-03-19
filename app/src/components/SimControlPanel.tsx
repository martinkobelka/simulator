import React from 'react';
import { Button } from 'primereact/button';
import { Slider } from 'primereact/slider';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../store/hooks';
import { wsService } from '../services/websocketService';
import { formatTime } from '../services/formatService';

const SimControlPanel: React.FC = () => {
  const { t } = useTranslation();
  const simState = useAppSelector((s) => s.simulation.simState);
  const simTime  = useAppSelector((s) => s.simulation.simTime);
  const speedMult = useAppSelector((s) => s.simulation.speedMult);
  const [speed, setSpeed] = React.useState<number>(speedMult);

  React.useEffect(() => {
    setSpeed(speedMult);
  }, [speedMult]);

  return (
    <div className="panel sim-control-panel">
      <div className="panel-header">
        <i className="pi pi-sliders-h" />
        <span>{t('panels.simControl')}</span>
        <span className="sim-clock">{formatTime(simTime)}</span>
      </div>
      <div className="panel-content">
        <div className="sim-buttons">
          <Button icon="pi pi-play"         className="p-button-success p-button-sm" disabled={simState === 'running'} onClick={() => wsService.send({ type: 'PLAY' })}  tooltip={t('menu.start')} />
          <Button icon="pi pi-pause"        className="p-button-warning p-button-sm" disabled={simState !== 'running'} onClick={() => wsService.send({ type: 'PAUSE' })} tooltip={t('menu.pause')} />
          <Button icon="pi pi-step-forward" className="p-button-info p-button-sm"   disabled={simState === 'running'} onClick={() => wsService.send({ type: 'STEP' })}  tooltip={t('sim.step')} />
          <Button icon="pi pi-stop"         className="p-button-danger p-button-sm"  disabled={simState === 'stopped'} onClick={() => wsService.send({ type: 'STOP' })}  tooltip={t('menu.stop')} />
        </div>
        <div className="sim-speed">
          <label>{t('sim.speed')}: {speed}×</label>
          <Slider value={speed} min={1} max={1000} onChange={(e) => {
            const val = e.value as number;
            setSpeed(val);
            wsService.send({ type: 'SET_SPEED', multiplier: val });
          }} />
        </div>
      </div>
    </div>
  );
};

export default SimControlPanel;
