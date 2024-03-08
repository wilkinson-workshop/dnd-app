import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { Box, Button, DialogActions, DialogContent, DialogTitle, Fab, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/PersonAdd'
import Dialog from '@mui/material/Dialog';
import { FC, useState } from 'react';
import { AddRandomCharacter } from './add-random-character';
import { Character } from '@/app/_apis/character';
import { addCharacter, addMultipleCharacter } from '@/app/_apis/characterApi';
import { AlertInfo, Alerts } from '../alert/alerts';
import { AddCharacter } from './add-character';
import { CustomTabPanel, a11yProps } from '@/app/common/tab-common';

export interface AddCharacterDialogProps {
    sessionId: string,
    closeDialog: () => void
}

export const AddCharacterDialog: FC<AddCharacterDialogProps> = ({ sessionId, closeDialog }) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(0);
    const [alert, setAlert] = useState<AlertInfo | null>(null);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    function handleClose() {
        setOpen(false);
        closeDialog();
    }

    function handleAddMultipleCharacters(characters: Character[]) {
        addMultipleCharacter(sessionId, { characters })
            .then(_ =>
                setAlert({ type: 'success', message: `${characters.length} creature(s) added!` }));
    }

    function handleAddCharacter(character: Character) {
        addCharacter(sessionId, character)
            .then(_ =>
                setAlert({ type: 'success', message: `${character.name} added!` })
            );
    }

    return (
        <>
            {open ? (
                <Dialog onClose={handleClose} open={open}>
                    <DialogTitle sx={{ m: 0, p: 2 }}>
                        Add Creatures
                    </DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
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
                        <Alerts info={alert} />
                        <Box sx={{ width: '100%' }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                    <Tab label="Single" {...a11yProps(0)} />
                                    <Tab label="Multiple" {...a11yProps(1)} />
                                </Tabs>
                            </Box>
                            <CustomTabPanel value={value} index={0}>
                                <AddCharacter onAddClick={handleAddCharacter} />
                            </CustomTabPanel>
                            <CustomTabPanel value={value} index={1}>
                                <AddRandomCharacter onAddClick={handleAddMultipleCharacters} />
                            </CustomTabPanel>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" aria-label="cancel" onClick={handleClose}>
                            Done
                        </Button>
                    </DialogActions>
                </Dialog>) : (
                <Fab sx={{ position: 'fixed', bottom: 75, right: 16, }} color="primary" onClick={() => setOpen(true)}>
                    <AddIcon />
                </Fab>
            )}
        </>
    );
}