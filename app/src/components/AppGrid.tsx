import React, {useEffect, useState, useCallback} from 'react';
import {GridLayout} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import MapPanel from './MapPanel';
import SimControlPanel from './SimControlPanel';
import UnitInfoPanel from './UnitInfoPanel';
import DataLogPanel from './DataLogPanel';
import {GRID_COLS, GRID_ROW_HEIGHT, GRID_MARGIN} from '../constants';

const AppGrid: React.FC = () => {
    const [bodySize, setBodySize] = useState({
        width: window.innerWidth, height: window.innerHeight - 52
    });

    const onResize = useCallback(() => {
        const menubar = document.querySelector('.app-menubar') as HTMLElement | null;
        const menuH = menubar ? menubar.offsetHeight : 52;
        setBodySize({width: window.innerWidth, height: window.innerHeight - menuH});
    }, []);

    useEffect(() => {
        window.addEventListener('resize', onResize);
        setTimeout(onResize, 50);
        return () => window.removeEventListener('resize', onResize);
    }, [onResize]);

    const rows = Math.floor((bodySize.height - GRID_MARGIN[1] * 2) / (GRID_ROW_HEIGHT + GRID_MARGIN[1]));
    const mapCols = 8;
    const sidebarCols = GRID_COLS - mapCols;
    const sideRow1 = Math.floor(rows / 3);
    const sideRow2 = Math.floor(rows / 3);
    const sideRow3 = rows - sideRow1 - sideRow2;

    const layout = [
        {i: 'map', x: 0, y: 0, w: mapCols, h: rows, minW: 3, minH: 4},
        {i: 'simControl', x: mapCols, y: 0, w: sidebarCols, h: sideRow1, minW: 2, minH: 3},
        {i: 'unitInfo', x: mapCols, y: sideRow1, w: sidebarCols, h: sideRow2, minW: 2, minH: 3},
        {i: 'dataLog', x: mapCols, y: sideRow1 + sideRow2, w: sidebarCols, h: sideRow3, minW: 2, minH: 3},
    ];

    return (
        <div className="app-body" style={{height: bodySize.height, overflow: 'hidden'}}>
            <GridLayout
                layout={layout}
                width={bodySize.width}
                gridConfig={{
                    cols: GRID_COLS,
                    rowHeight: GRID_ROW_HEIGHT,
                    margin: GRID_MARGIN,
                    containerPadding: GRID_MARGIN
                }}
                dragConfig={{enabled: true, handle: '.panel-header'}}
                resizeConfig={{enabled: true}}
            >
                <div key="map" className="grid-panel"><MapPanel/></div>
                <div key="simControl" className="grid-panel"><SimControlPanel/></div>
                <div key="unitInfo" className="grid-panel"><UnitInfoPanel/></div>
                <div key="dataLog" className="grid-panel"><DataLogPanel/></div>
            </GridLayout>
        </div>
    );
};

export default AppGrid;
