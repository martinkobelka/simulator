import React, { useState, useEffect, useCallback } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';
import { wsService } from '../services/websocketService';
import { buildOptions } from '../services/uiService';
import { SIDC_SYMBOL_MAP, symbolUrl } from '../data/sidcSymbols';

interface Props {
  position: [number, number] | null;
  onHide: () => void;
}

const SIDC_KEYS = Object.keys(SIDC_SYMBOL_MAP);

const UNIT_TYPE_KEYS = [
  'unit.types.mechanizedInfantry',
  'unit.types.armorCompany',
  'unit.types.artilleryBattery',
  'unit.types.hostileInfantry',
  'unit.types.hostileArmorBattalion',
];

const UNIT_TASK_KEYS = [
  'unit.tasks.sectorDefense',
  'unit.tasks.moveToReserve',
  'unit.tasks.fireSuppport',
  'unit.tasks.attackNorthFlank',
  'unit.tasks.breachDefense',
];

const sidcItemTemplate = (option: { label: string; value: string }) => (
  <div className="sidc-option">
    <img src={symbolUrl(option.value)} alt={option.label} className="sidc-option-img" />
    <span>{option.label}</span>
  </div>
);

const AddEntityDialog: React.FC<Props> = ({ position, onHide }) => {
  const { t } = useTranslation();
  const [callsign, setCallsign] = useState('');
  const [sidc, setSidc] = useState(SIDC_KEYS[0]);
  const [speed, setSpeed] = useState<number | null>(30);
  const [type, setType] = useState(UNIT_TYPE_KEYS[0]);
  const [task, setTask] = useState(UNIT_TASK_KEYS[1]);
  const [submitted, setSubmitted] = useState(false);

  const resetForm = useCallback(() => {
    setCallsign('');
    setSidc(SIDC_KEYS[0]);
    setSpeed(30);
    setType(UNIT_TYPE_KEYS[0]);
    setTask(UNIT_TASK_KEYS[1]);
    setSubmitted(false);
  }, []);

  useEffect(() => {
    if (position) resetForm();
  }, [position, resetForm]);

  const errors = {
    callsign: !callsign.trim() ? t('addEntity.errors.callsignRequired') : null,
    speed: speed === null ? t('addEntity.errors.speedRequired') : null,
  };

  const sidcValueTemplate = (option: { label: string; value: string } | null) => {
    if (!option) return <span>{t(`addEntity.sidcOptions.${sidc}`)}</span>;
    return (
      <div className="sidc-option">
        <img src={symbolUrl(option.value)} alt={option.label} className="sidc-option-img" />
        <span>{option.label}</span>
      </div>
    );
  };

  const handleAdd = () => {
    setSubmitted(true);
    if (errors.callsign || errors.speed || !position) return;
    wsService.send({
      type: 'ADD_ENTITY',
      entity: { callsign: callsign.trim(), sidc, speed: speed ?? 0, type, task, position },
    });
    onHide();
  };

  const footer = (
    <div className="add-entity-footer">
      <Button label={t('addEntity.add')} icon="pi pi-check" onClick={handleAdd} />
    </div>
  );

  return (
    <Dialog
      header={t('addEntity.title')}
      visible={!!position}
      onHide={onHide}
      footer={footer}
      className="add-entity-dialog"
      modal
    >
      <div className="add-entity-form">
        <div className="add-entity-field">
          <label>{t('addEntity.callsign')}</label>
          <InputText
            value={callsign}
            onChange={(e) => setCallsign(e.target.value)}
            className={submitted && errors.callsign ? 'p-invalid' : ''}
            autoFocus
          />
          {submitted && errors.callsign && <small className="p-error">{errors.callsign}</small>}
        </div>
        <div className="add-entity-field">
          <label>{t('addEntity.sidc')}</label>
          <Dropdown
            value={sidc}
            options={buildOptions(SIDC_KEYS, (k) => t(`addEntity.sidcOptions.${k}`))}
            onChange={(e) => setSidc(e.value)}
            itemTemplate={sidcItemTemplate}
            valueTemplate={sidcValueTemplate}
          />
        </div>
        <div className="add-entity-field">
          <label>{t('addEntity.speed')}</label>
          <InputNumber
            value={speed}
            onValueChange={(e) => setSpeed(e.value ?? null)}
            min={0}
            max={999}
            showButtons
            inputClassName={submitted && errors.speed ? 'p-invalid' : ''}
          />
          {submitted && errors.speed && <small className="p-error">{errors.speed}</small>}
        </div>
        <div className="add-entity-field">
          <label>{t('addEntity.type')}</label>
          <Dropdown value={type} options={buildOptions(UNIT_TYPE_KEYS, t)} onChange={(e) => setType(e.value)} />
        </div>
        <div className="add-entity-field">
          <label>{t('addEntity.task')}</label>
          <Dropdown value={task} options={buildOptions(UNIT_TASK_KEYS, t)} onChange={(e) => setTask(e.value)} />
        </div>
      </div>
    </Dialog>
  );
};

export default AddEntityDialog;
