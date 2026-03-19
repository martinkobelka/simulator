# Simulator App

React frontend for the military unit simulator. Connects to the simulation server via WebSocket and displays entities on an interactive map.

## Structure

```
app/
├── public/
│   ├── index.html
│   ├── symbols/          # SVG military unit symbols
│   └── help/             # Help pages (cs, en, sk)
├── src/
│   ├── components/       # UI components
│   │   ├── MapPanel.tsx
│   │   ├── SimControlPanel.tsx
│   │   ├── UnitInfoPanel.tsx
│   │   ├── DataLogPanel.tsx
│   │   ├── AddEntityDialog.tsx
│   │   └── ...
│   ├── data/             # Entity definitions, SIDC symbols
│   ├── locales/          # Translations (cs, en, sk)
│   ├── services/         # Map, WebSocket, UI logic
│   ├── store/            # Redux state (simulationSlice)
│   └── App.tsx
└── package.json
```

## Setup

```bash
npm install
npm start
```

Opens at `http://localhost:3000`. Requires the simulation server to be running on port **8999**.

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start development server |
| `npm run build` | Build for production (output: `build/`) |
| `npm test` | Run tests |
