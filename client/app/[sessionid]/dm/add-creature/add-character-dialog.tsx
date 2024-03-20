import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Box, Button, DialogActions, DialogContent, DialogTitle, Fab, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/PersonAdd'
import Dialog from '@mui/material/Dialog';
import { FC, useContext, useState } from 'react';
import { AddRandomCharacter } from './add-random-character';
import { Character } from '@/app/_apis/character';
import { addCharacter, addMultipleCharacter } from '@/app/_apis/characterApi';
import { AlertInfo, Alerts } from '../../alert/alerts';
import { AddCharacter } from './add-character';
import { CustomTabPanel, a11yProps } from '@/app/common/tab-common';
import { AddCustomCharacter } from './custom-creature/add-custom_character';
import { Monster } from '@/app/_apis/dnd5eTypings';
import { addCustomMonster } from '@/app/_apis/customMonsterApi';
import { SessionContext } from '../../../common/session-context';

export interface AddCharacterDialogProps {
}

export const AddCharacterDialog: FC<AddCharacterDialogProps> = ({ }) => {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState(0);
    const [alert, setAlert] = useState<AlertInfo | null>(null);

    let sessionId = useContext(SessionContext);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    function handleClose() {
        setOpen(false);
        setAlert(null);
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

    function handleAddCustomCharacter(monster: Monster){
        addCustomMonster(sessionId, monster)
        .then(_ =>
            setAlert({ type: 'success', message: `${monster.name} added!` })
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
                    <DialogContent sx={{pt: 0}}>
                        <Alerts info={alert} />
                        <Box sx={{ width: '100%' }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                    <Tab label="Single" {...a11yProps(0)} />
                                    <Tab label="Multiple" {...a11yProps(1)} />
                                    <Tab label="Custom" {...a11yProps(2)} />
                                </Tabs>
                            </Box>
                            <CustomTabPanel value={value} index={0}>
                                <AddCharacter onAddClick={handleAddCharacter} />
                            </CustomTabPanel>
                            <CustomTabPanel value={value} index={1}>
                                <AddRandomCharacter onAddClick={handleAddMultipleCharacters} />
                            </CustomTabPanel>
                            <CustomTabPanel value={value} index={2}>
                                <AddCustomCharacter onAddClick={handleAddCustomCharacter} />
                            </CustomTabPanel>
                        </Box>
                    </DialogContent>
                </Dialog>) : (
                <Fab sx={{ position: 'fixed', bottom: 75, right: 16, }} color="primary" onClick={() => setOpen(true)}>
                    <AddIcon />
                </Fab>
            )}
        </>
    );
}