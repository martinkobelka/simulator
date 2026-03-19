# Simulator Server

Node.js WebSocket server that runs the simulation engine and broadcasts state updates to connected clients.

## Structure

```
server/
├── index.js              # Entry point, WebSocket server setup
├── SimulationEngine.js   # Core simulation logic and tick loop
├── entities.js           # Default entity definitions
├── broadcast.js          # Broadcasts events to all connected clients
├── constants.js          # Configuration (port, tick rate, speed)
├── logger.js             # Console logging utilities
└── package.json
```

## Setup

```bash
npm install
npm start
```

Runs on port **8999** by default. Override with:

```bash
node index.js --port 9000
```

## WebSocket Protocol

### Server → Client events

| Type | Description |
|---|---|
| `INIT` | Full state snapshot sent on connection |
| `ENTITY_UPDATE` | Position, speed, damage, ammo of an entity |
| `ENTITY_CREATED` | New entity was added |
| `ENTITY_DESTROYED` | Entity was removed |
| `ENTITIES_RESET` | All entities reset to defaults |
| `ROUTE_UPDATED` | Entity route changed |
| `SIM_STATE_CHANGED` | Simulation state: `stopped`, `paused`, `running` |
| `SIM_TIME` | Current simulation time |
| `LOG` | Log message with severity and category |

### Client → Server commands

| Type | Payload | Description |
|---|---|---|
| `PLAY` | — | Start simulation |
| `PAUSE` | — | Pause simulation |
| `STOP` | — | Stop and reset to initial state |
| `STEP` | — | Advance one tick |
| `RESET` | — | Reset entities to defaults |
| `SET_SPEED` | `multiplier` | Set speed multiplier (1–1000) |
| `ADD_WAYPOINT` | `entityId`, `position` | Add waypoint to entity route |
| `ADD_ENTITY` | `entity` | Add a new entity |
| `REMOVE_ENTITY` | `entityId` | Remove an entity |
| `LOAD_STATE` | `entities` | Load positions and routes |
