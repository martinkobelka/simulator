import { Style, Icon } from 'ol/style';
import { symbolUrl } from '../data/sidcSymbols';
import { Entity } from '../store/simulationSlice';

const DESTROYED_X = '/symbols/destroyed-x.svg';

export function milSymbolStyle(sidc: string, damage: number, ammo: number): Style | Style[] {
  const icon = new Style({
    image: new Icon({
      src: symbolUrl(sidc),
      anchor: [0.5, 0.5],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
    }),
  });

  if (damage >= 100) {
    return [icon, new Style({ image: new Icon({ src: DESTROYED_X, anchor: [0.5, 0.5] }) })];
  }
  return icon;
}

export function entityStyle(entity: Entity): Style {
  return new Style({
    image: new Icon({
      src: symbolUrl(entity.sidc),
      anchor: [0.5, 0.5],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      scale: 0.8,
    }),
  });
}
