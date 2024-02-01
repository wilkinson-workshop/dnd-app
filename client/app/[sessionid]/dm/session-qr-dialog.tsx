import Dialog from '@mui/material/Dialog';
import QRCode from "react-qr-code";

export interface SimpleDialogProps {
    open: boolean;
    url: string;
    onClose: () => void;
  }  

export const SessionQrDialog = (props: SimpleDialogProps) => {
  const { onClose, url, open } = props;

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <QRCode value={url}/>
    </Dialog>
  );
}
