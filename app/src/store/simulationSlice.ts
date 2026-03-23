import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Entity {
  id: string;
  callsign: string;
  sidc: string;
  position: [number, number];
  type: string;
  task: string;
  speed: number;
  damage: number;
  ammo: number;
  route: [number, number][];
}

export type LogCategory = 'system' | 'route' | 'position';

export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  params?: Record<string, string>;
  severity: 'info' | 'warning' | 'error';
  category: LogCategory;
}

export type SimState = 'stopped' | 'running' | 'paused';
export type WsStatus = 'connecting' | 'connected' | 'disconnected';

interface SimulationState {
  wsStatus: WsStatus;
  entities: Entity[];
  selectedEntityId: string | null;
  simState: SimState;
  simTime: number;
  speedMult: number;
  logs: LogEntry[];
}

let logCounter = 0;

const initialState: SimulationState = {
  wsStatus: 'connecting',
  entities: [],
  selectedEntityId: null,
  simState: 'stopped',
  simTime: 0,
  speedMult: 10,
  logs: [],
};

const simulationSlice = createSlice({
  name: 'simulation',
  initialState,
  reducers: {
    setWsStatus(state, action: PayloadAction<WsStatus>) {
      state.wsStatus = action.payload;
    },

    initFromServer(state, action: PayloadAction<{ simState: SimState; simTime: number; speedMult?: number; entities: Entity[] }>) {
      state.entities = action.payload.entities;
      state.simState = action.payload.simState;
      state.simTime = action.payload.simTime;
      if (action.payload.speedMult !== undefined) {
        state.speedMult = action.payload.speedMult;
      }
      state.logs = [];
    },

    applyEntityUpdate(state, action: PayloadAction<{ id: string; position: [number, number]; speed: number; damage: number; ammo: number; simTime?: number }>) {
      const entity = state.entities.find(e => e.id === action.payload.id);
      if (entity) {
        entity.position = action.payload.position;
        entity.speed = action.payload.speed;
        entity.damage = action.payload.damage;
        entity.ammo = action.payload.ammo;
      }
      if (action.payload.simTime !== undefined) {
        state.simTime = action.payload.simTime;
      }
    },

    applyEntityCreated(state, action: PayloadAction<Entity>) {
      state.entities.push(action.payload);
    },

    applyEntityDestroyed(state, action: PayloadAction<string>) {
      state.entities = state.entities.filter(e => e.id !== action.payload);
      if (state.selectedEntityId === action.payload) {
        state.selectedEntityId = null;
      }
    },

    applySimStateChanged(state, action: PayloadAction<{ simState: SimState; simTime: number }>) {
      state.simState = action.payload.simState;
      state.simTime = action.payload.simTime;
    },

    applyRouteUpdated(state, action: PayloadAction<{ id: string; route: [number, number][] }>) {
      const entity = state.entities.find(e => e.id === action.payload.id);
      if (entity) {
        entity.route = action.payload.route;
      }
    },

    selectEntity(state, action: PayloadAction<string | null>) {
      state.selectedEntityId = action.payload;
    },

    clearLogs(state) {
      state.logs = [];
    },

    addLog(state, action: PayloadAction<{ message: string; params?: Record<string, string>; severity?: LogEntry['severity']; category?: LogCategory }>) {
      state.logs.unshift({
        id: ++logCounter,
        timestamp: new Date().toLocaleTimeString('cs-CZ'),
        message: action.payload.message,
        params: action.payload.params,
        severity: action.payload.severity ?? 'info',
        category: action.payload.category ?? 'system',
      });
    },
  },
});

export const {
  setWsStatus,
  initFromServer,
  applyEntityUpdate,
  applyEntityCreated,
  applyEntityDestroyed,
  applySimStateChanged,
  applyRouteUpdated,
  selectEntity,
  clearLogs,
  addLog,
} = simulationSlice.actions;

export default simulationSlice.reducer;
