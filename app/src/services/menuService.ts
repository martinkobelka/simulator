import React from 'react';
import { confirmDialog } from 'primereact/confirmdialog';
import { Entity } from '../store/simulationSlice';
import { wsService } from './websocketService';

export function exportEntities(entities: Entity[]): void {
  const data = {
    exportedAt: new Date().toISOString(),
    entities: entities.map(({ id, callsign, position, route }) => ({
      id,
      callsign,
      position: route.length > 0 ? route[0] : position,
      route,
    })),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `simulator_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function loadStateFromFile(e: React.ChangeEvent<HTMLInputElement>): void {
  const file = e.target.files?.[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target?.result as string);
      if (Array.isArray(data.entities)) {
        wsService.send({ type: 'LOAD_STATE', entities: data.entities });
      }
    } catch {
      console.error('Invalid export file');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

export function confirmResetServer(t: (key: string) => string): void {
  confirmDialog({
    message: t('menu.resetConfirm'),
    header: t('menu.resetHeader'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('menu.resetAccept'),
    rejectLabel: t('menu.resetReject'),
    acceptClassName: 'p-button-danger',
    accept: () => wsService.send({ type: 'RESET' }),
  });
}
