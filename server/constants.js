// ── Simulation engine ────────────────────────────────────────────
const TICK_MS = 250;           // simulation tick interval (4 Hz)
const KM_PER_DEG = 111.32;    // approximate km per degree of latitude
const DEFAULT_SPEED_MULT = 10; // default speed multiplier

// ── Server ───────────────────────────────────────────────────────
const DEFAULT_PORT = 8999; // can be overridden via --port CLI argument

module.exports = { TICK_MS, KM_PER_DEG, DEFAULT_SPEED_MULT, DEFAULT_PORT };
