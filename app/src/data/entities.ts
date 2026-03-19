import { Entity } from '../store/simulationSlice';

// SIDC format: APP-6C (15 chars)
// S F G P U C I - - - - - - - - = Friendly Ground Infantry
// S H G P U C A - - - - - - - - = Hostile Ground Armor
export const ENTITIES: Entity[] = [
  {
    id: '1',
    callsign: 'ALPHA-1',
    sidc: 'SFGPUCI----K----',   // Friendly infantry
    position: [16.45, 49.10],
    type: 'unit.types.mechanizedInfantry',
    task: 'unit.tasks.sectorDefense',
    speed: 0,
    damage: 10,
    ammo: 85,
    route: [
      [16.45, 49.10],
      [16.52, 49.15],
      [16.61, 49.19],
      [16.70, 49.23],
      [16.78, 49.20],
    ],
  },
  {
    id: '2',
    callsign: 'BRAVO-2',
    sidc: 'SFGPUCA----K----',   // Friendly armor
    position: [15.82, 50.21],
    type: 'unit.types.armorCompany',
    task: 'unit.tasks.moveToReserve',
    speed: 45,
    damage: 0,
    ammo: 100,
    route: [
      [15.60, 50.35],
      [15.70, 50.29],
      [15.82, 50.21],
      [15.92, 50.14],
    ],
  },
  {
    id: '3',
    callsign: 'DELTA-3',
    sidc: 'SFGPUCF----K----',   // Friendly artillery
    position: [14.43, 50.08],
    type: 'unit.types.artilleryBattery',
    task: 'unit.tasks.fireSuppport',
    speed: 0,
    damage: 25,
    ammo: 60,
    route: [
      [14.30, 50.00],
      [14.43, 50.08],
      [14.55, 50.15],
    ],
  },
  {
    id: '4',
    callsign: 'TANGO-1',
    sidc: 'SHGPUCI----K----',   // Hostile infantry
    position: [17.10, 48.82],
    type: 'unit.types.hostileInfantry',
    task: 'unit.tasks.attackNorthFlank',
    speed: 12,
    damage: 40,
    ammo: 50,
    route: [
      [17.30, 48.65],
      [17.20, 48.72],
      [17.10, 48.82],
      [16.95, 48.95],
    ],
  },
  {
    id: '5',
    callsign: 'TANGO-2',
    sidc: 'SHGPUCA----K----',   // Hostile armor
    position: [16.75, 48.60],
    type: 'unit.types.hostileArmorBattalion',
    task: 'unit.tasks.breachDefense',
    speed: 30,
    damage: 5,
    ammo: 90,
    route: [
      [17.00, 48.40],
      [16.90, 48.50],
      [16.75, 48.60],
      [16.60, 48.75],
    ],
  },
  {
    id: '6',
    callsign: 'ECHO-1',
    sidc: 'SFGPUCA----K----',   // Friendly armor — destroyed
    position: [16.10, 49.55],
    type: 'unit.types.armorCompany',
    task: 'unit.tasks.sectorDefense',
    speed: 45,
    damage: 100,
    ammo: 0,
    route: [],
  },
  {
    id: '7',
    callsign: 'RECON-1',
    sidc: 'SFGPUCR----K----',   // Friendly reconnaissance
    position: [16.20, 49.30],
    type: 'unit.types.reconPlatoon',
    task: 'unit.tasks.screenNorthFlank',
    speed: 55,
    damage: 0,
    ammo: 95,
    route: [
      [16.10, 49.20],
      [16.20, 49.30],
      [16.35, 49.40],
      [16.50, 49.48],
    ],
  },
  {
    id: '8',
    callsign: 'ENGR-1',
    sidc: 'SFGPUCE----K----',   // Friendly engineer
    position: [15.50, 49.85],
    type: 'unit.types.engineerCompany',
    task: 'unit.tasks.bridgeConstruction',
    speed: 0,
    damage: 5,
    ammo: 70,
    route: [
      [15.40, 49.75],
      [15.50, 49.85],
      [15.60, 49.95],
    ],
  },
  {
    id: '9',
    callsign: 'TANGO-3',
    sidc: 'SHGPUCF----K----',   // Hostile artillery
    position: [17.50, 48.55],
    type: 'unit.types.hostileArtilleryBattery',
    task: 'unit.tasks.counterBattery',
    speed: 0,
    damage: 60,
    ammo: 75,
    route: [
      [17.60, 48.45],
      [17.50, 48.55],
      [17.40, 48.65],
    ],
  },
  {
    id: '10',
    callsign: 'TANGO-4',
    sidc: 'SHGPUCR----K----',   // Hostile reconnaissance
    position: [16.90, 49.05],
    type: 'unit.types.hostileReconUnit',
    task: 'unit.tasks.reconForward',
    speed: 48,
    damage: 15,
    ammo: 80,
    route: [
      [17.10, 48.90],
      [16.90, 49.05],
      [16.70, 49.15],
      [16.55, 49.25],
    ],
  },
];
