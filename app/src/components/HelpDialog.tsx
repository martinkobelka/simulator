import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  onHide: () => void;
}

const HelpDialog: React.FC<Props> = ({ visible, onHide }) => {
  const { t, i18n } = useTranslation();
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (!visible) return;
    fetch(`/help/${i18n.language}.html`)
      .then((r) => r.text())
      .then(setHtml)
      .catch(() => setHtml('<p>Nápověda není dostupná.</p>'));
  }, [visible, i18n.language]);

  return (
    <Dialog header={t('menu.help')} visible={visible} onHide={onHide} className="help-dialog" modal>
      <div className="help-content" dangerouslySetInnerHTML={{ __html: html }} />
    </Dialog>
  );
};

export default HelpDialog;
