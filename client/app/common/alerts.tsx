import Box from '@mui/material/Box';
import Alert, { AlertColor } from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import { FC, useState, useEffect } from 'react';

export interface AlertInfo {
    message: string;
    type: AlertColor;
}

export interface AlertProps {
    info: AlertInfo | null
}

export const Alerts: FC<AlertProps> = ({info}) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(info != null);
        setTimeout(() => {setOpen(false)}, 3000);
    },[info])

    return (
        <Box sx={{ width: '100%' }}>
            <Collapse in={open}>
                <Alert
                    severity={info?.type}
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }
                    sx={{ mb: 2 }}
                >
                    {info?.message}
                </Alert>
            </Collapse>
        </Box>
    );
}
