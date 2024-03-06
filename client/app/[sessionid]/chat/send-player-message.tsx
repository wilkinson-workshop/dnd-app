import { FC, useEffect, useState } from "react";
import { Box, Button, Checkbox, Icon, IconButton, ListItemText, Paper, TextField } from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { sendPlayerMessageApi } from "@/app/_apis/sessionApi";
import { Character, EMPTY_GUID } from "@/app/_apis/character";
import { getClientId, getName } from "@/app/_apis/sessionStorage";
import AddCommentIcon from "@mui/icons-material/AddComment";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

export interface SendPlayerMessageProps {
    sessionId: string,
    recipientOptions: Character[]
}

export const SendPlayerMessage: FC<SendPlayerMessageProps> = ({ sessionId, recipientOptions }) => {
    const [edit, onEdit] = useState(false);
    //When starting a conversation as DM it add the DM as a recipient even though they are not an option
    //this causes no ill effect and there is a potential future story to add them so keeping the side effect for now.
    const [recipients, setRecipient] = useState<string[]>([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setRecipient([getClientId()])
    }, [recipientOptions])

    function handleClickRequestRoll() {
        onEdit(false);

        sendPlayerMessageApi(sessionId, {
            sender: getName(),
            message: message,
            client_uuids: recipients
        }).then();
        setRecipient([getClientId()]);
        setMessage('');
    }

    function handleChangeRecipient(event: SelectChangeEvent<typeof recipients>) {
        const {
            target: { value },
        } = event;

        let selectedRecipients = value;

        //account for "All Players" Option
        if (selectedRecipients.includes(EMPTY_GUID)) {
            selectedRecipients = recipientOptions.filter(x => x.creature_id != EMPTY_GUID).map(x => x.creature_id);
        }

        setRecipient(typeof selectedRecipients === 'string' ? selectedRecipients.split(',') : selectedRecipients);
    }

    if (edit) {
        return (
            <Paper sx={{maxHeigh: 400, width: 400, position: 'fixed',  bottom: 60, right: 0}}>
                <Box sx={{ width: '100%' }}>
                    <h2>New Conversation</h2>
                    <Box sx={{ margin: '10px 0' }}>
                        <FormControl sx={{ width: 300 }}>
                            <InputLabel id="recipient">Recipients</InputLabel>
                            <Select
                                labelId="recipient"
                                value={recipients}
                                multiple
                                label="Recipients"
                                onChange={handleChangeRecipient}
                                renderValue={(selected) => selected.map(s => recipientOptions.find(c => c.creature_id == s)?.name).join(', ')}
                                MenuProps={MenuProps}
                            >
                                {recipientOptions.map(s =>
                                    <MenuItem disabled={s.creature_id == getClientId()} key={s.creature_id} value={s.creature_id}>
                                        <Checkbox checked={recipients.indexOf(s.creature_id) > -1} />
                                        <ListItemText primary={s.name} />
                                    </MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{ margin: '10px 0' }}>
                        <TextField multiline sx={{ width: 300 }} onChange={e => setMessage(e.target.value)} label="Message" size="small" variant="outlined" />
                    </Box>
                    <Box sx={{ margin: '10px 0' }}>
                        <Button variant="contained" aria-label="Send" onClick={handleClickRequestRoll}>
                            Send
                        </Button>
                        <Button variant="contained" aria-label="cancel" onClick={_ => onEdit(false)}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Paper>
        )
    } else {
        return (
            <Box sx={{ margin: '10px 0', float: "right"}}>
                <IconButton aria-label="add comment" onClick={_ => onEdit(true)}>
                    <AddCommentIcon />
                </IconButton>
            </Box>
        )
    }
}