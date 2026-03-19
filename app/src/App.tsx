import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import {Provider} from 'react-redux';
import {store} from './store/store';
import {useAppSelector} from './store/hooks';
import {wsService} from './services/websocketService';

import {ConfirmDialog} from 'primereact/confirmdialog';
import AppMenuBar from './components/AppMenuBar';
import AppGrid from './components/AppGrid';
import LoadingScreen from './components/LoadingScreen';


function AppLayout() {
    const wsStatus = useAppSelector((s) => s.simulation.wsStatus);

    if (wsStatus !== 'connected') {
        return <LoadingScreen status={wsStatus}/>;
    }

    return (
        <div className="app-root">
            <ConfirmDialog/>
            <AppMenuBar/>
            <AppGrid/>
        </div>
    );
}

function App() {
    const {t, i18n} = useTranslation();

    useEffect(() => {
        wsService.connect();
    }, []);

    useEffect(() => {
        document.title = t('app.title');
    }, [t, i18n.language]);

    return (
        <Provider store={store}>
            <AppLayout/>
        </Provider>
    );
}

export default App;
