import { Box, Button, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import { FC } from 'react';

export interface ResponseDialogInfo {
    title: string,
    message: string[]
}

export interface ResponseDialogProps {
    open: boolean,
    info: ResponseDialogInfo,
    onClose: (isYes: boolean) => void
  }  

export const ResponseDialog: FC<ResponseDialogProps> = ({ onClose, info, open }) => {
  const handleClose = (isYes: boolean) => {
    onClose(isYes);
  };

  return (
    <Dialog onClose={() => handleClose(false)} open={open}>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {info.title}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => handleClose(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
            {info.message.map((m, i) => (<Box key={i}>{m}</Box>))}
        </DialogContent>
        <DialogActions>
            <Button variant="contained" aria-label="add" onClick={() => handleClose(true)}>
                Yes
            </Button>
            <Button variant="contained" aria-label="cancel" onClick={() => handleClose(false)}>
                No
            </Button>
        </DialogActions>      
    </Dialog>
  );
}