import { store } from '../store/store';
import { WS_URL } from '../constants';
import {
  initFromServer,
  applyEntityUpdate,
  applyEntityCreated,
  applyEntityDestroyed,
  applySimStateChanged,
  applyRouteUpdated,
  addLog,
  setWsStatus,
} from '../store/simulationSlice';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  connect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }

    store.dispatch(setWsStatus('connecting'));
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      store.dispatch(setWsStatus('connected'));
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        this._handle(msg);
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    this.ws.onclose = () => {
      store.dispatch(setWsStatus('disconnected'));
      this.reconnectTimer = setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = () => {
      // onclose fires after onerror — reconnect handled there
    };
  }

  send(msg: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private _handle(msg: any) {
    switch (msg.type) {
      case 'INIT':
        store.dispatch(initFromServer(msg));
        break;
      case 'ENTITY_UPDATE':
        store.dispatch(applyEntityUpdate(msg));
        break;
      case 'ENTITY_CREATED':
        store.dispatch(applyEntityCreated(msg.entity));
        break;
      case 'ENTITIES_RESET':
        store.dispatch(initFromServer({ ...store.getState().simulation, entities: msg.entities, simState: 'stopped', simTime: 0 }));
        break;
      case 'ENTITY_DESTROYED':
        store.dispatch(applyEntityDestroyed(msg.id));
        break;
      case 'SIM_STATE_CHANGED':
        store.dispatch(applySimStateChanged(msg));
        break;
      case 'SIM_TIME':
        store.dispatch(applySimStateChanged({ simState: store.getState().simulation.simState, simTime: msg.simTime }));
        break;
      case 'ROUTE_UPDATED':
        store.dispatch(applyRouteUpdated(msg));
        break;
      case 'LOG':
        store.dispatch(addLog({ message: msg.message, params: msg.params, severity: msg.severity, category: msg.category }));
        break;
    }
  }
}

export const wsService = new WebSocketService();
