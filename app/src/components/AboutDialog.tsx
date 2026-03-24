import React from 'react';
import {Dialog} from 'primereact/dialog';
import {useTranslation} from 'react-i18next';

interface Props {
    visible: boolean;
    onHide: () => void;
}

const AboutDialog: React.FC<Props> = ({visible, onHide}) => {
    const {t} = useTranslation();

    return (
        <Dialog header={t('about.title')} visible={visible} onHide={onHide} className="about-dialog" modal>
            <div className="about-content">
                <div className="about-row">
                    <i className="pi pi-github"/>
                    <a href="https://github.com/martinkobelka/simulator" target="_blank" rel="noopener noreferrer">
                        github.com/martinkobelka/simulator
                    </a>
                </div>
                <div className="about-row">
                    <i className="pi pi-globe"/>
                    <a href="https://martinkobelka.cz" target="_blank" rel="noopener noreferrer">
                        martinkobelka.cz
                    </a>
                </div>
                <div className="about-row">
                    <i className="pi pi-tag"/>
                    <span>{t('about.version')}: v{process.env.REACT_APP_VERSION || '0.1.0'}</span>
                </div>
                <div className="about-row">
                    <i className="pi pi-calendar"/>
                    <span>{t('about.builtAt')}: {new Date(process.env.REACT_APP_BUILD_TIME || Date.now()).toLocaleString()}</span>
                </div>
            </div>
        </Dialog>
    );
};

export default AboutDialog;
