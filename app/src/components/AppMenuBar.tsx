import React, {useRef, useState} from 'react';
import {Menubar} from 'primereact/menubar';
import {MenuItem} from 'primereact/menuitem';
import {Button} from 'primereact/button';
import {useTranslation} from 'react-i18next';
import {useAppSelector} from '../store/hooks';
import {nextLanguage} from '../constants';
import {exportEntities, loadStateFromFile, confirmResetServer} from '../services/menuService';
import DistanceMeasureDialog from './DistanceMeasureDialog';
import HelpDialog from './HelpDialog';
import AboutDialog from './AboutDialog';

const AppMenuBar: React.FC = () => {
    const {t, i18n} = useTranslation();
    const [measureVisible, setMeasureVisible] = useState(false);
    const [helpVisible, setHelpVisible] = useState(false);
    const [aboutVisible, setAboutVisible] = useState(false);
    const entities = useAppSelector((s) => s.simulation.entities);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const items: MenuItem[] = [
        {
            label: t('menu.file'),
            icon: 'pi pi-file',
            items: [
                {
                    label: t('menu.export'),
                    icon: 'pi pi-download',
                    command: () => exportEntities(entities)
                },
                {
                    label: t('menu.loadFromFile'),
                    icon: 'pi pi-upload',
                    command: () => fileInputRef.current?.click()
                },
                {
                    separator: true
                },
                {
                    label: t('menu.reset'),
                    icon: 'pi pi-refresh',
                    command: () => confirmResetServer(t)
                },
            ],
        },
        {
            label: t('menu.tools'),
            icon: 'pi pi-wrench',
            items: [
                {
                    label: t('menu.measureDistance'),
                    icon: 'pi pi-arrows-h',
                    command: () => setMeasureVisible(true)
                },
            ],
        },
        {
            label: t('menu.help'),
            icon: 'pi pi-question-circle',
            command: () => setHelpVisible(true),
        },
        {
            label: t('about.title'),
            icon: 'pi pi-info-circle',
            command: () => setAboutVisible(true),
        },
    ];

    const start = (
        <div className="menubar-start">
            <i className="pi pi-map-marker"/>
            <span className="menubar-title">{t('app.title')}</span>
        </div>
    );

    const end = (
        <Button
            label={i18n.language.toUpperCase()}
            outlined
            severity="secondary"
            size="small"
            onClick={() => i18n.changeLanguage(nextLanguage(i18n.language))}
        />
    );

    return (
        <>
            <Menubar model={items} start={start} end={end} className="app-menubar"/>
            <DistanceMeasureDialog visible={measureVisible} onHide={() => setMeasureVisible(false)}/>
            <HelpDialog visible={helpVisible} onHide={() => setHelpVisible(false)}/>
            <AboutDialog visible={aboutVisible} onHide={() => setAboutVisible(false)}/>
            <input ref={fileInputRef} type="file" accept=".json" style={{display: 'none'}}
                   onChange={loadStateFromFile}/>
        </>
    );
};

export default AppMenuBar;
