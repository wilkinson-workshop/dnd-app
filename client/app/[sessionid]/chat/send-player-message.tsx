import { FC, useState } from "react";
import { Box, Button, Checkbox, ListItemText, TextField } from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { sendPlayerMessageApi } from "@/app/_apis/sessionApi";
import { Character, EMPTY_GUID } from "@/app/_apis/character";
import { getName } from "@/app/_apis/sessionStorage";

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

export interface SendPlayerMessageProps{
    sessionId: string,
    recipientOptions: Character[]
}

export const SendPlayerMessage:FC<SendPlayerMessageProps> = ({sessionId, recipientOptions}) => {
    const [edit, onEdit] = useState(false);
    const [recipients, setRecipient] = useState<string[]>([]);
    const [message, setMessage] = useState('');

    function handleClickRequestRoll() {
        onEdit(false);

        let actualRecipients = recipients;

        //account for "All Players" Option
        if(recipients.length > 0 && recipients[0] == EMPTY_GUID){
            actualRecipients = recipientOptions.filter(x => x.creature_id != EMPTY_GUID).map(x => x.creature_id);
        }

        sendPlayerMessageApi(sessionId, {
            sender: getName(),
            message: message,
            client_uuids: actualRecipients
        }).then();
        setRecipient([]);
        setMessage('');
    }

    function handleChangeRecipient(event: SelectChangeEvent<typeof recipients>){
        const {  
            target: { value },  
        } = event;
        setRecipient(typeof value === 'string' ? value.split(',') : value);
    }

    if(edit){ return (
        <Box>
            <Box sx={{width: '100%'}}>
                <h2>New Conversation</h2>
                <Box sx={{margin: '10px 0'}}>
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
                            <MenuItem key={s.creature_id} value={s.creature_id}>
                                <Checkbox checked={recipients.indexOf(s.creature_id) > -1} />
                                <ListItemText primary={s.name} />
                            </MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{margin: '10px 0'}}>
                    <TextField sx={{ width: 300 }} onChange={e => setMessage(e.target.value)} label="Message" size="small" variant="outlined" />
                </Box>
                <Box sx={{margin: '10px 0'}}>
                    <Button variant="contained" aria-label="Send" onClick={handleClickRequestRoll}>
                        Send
                    </Button>
                    <Button variant="contained" aria-label="cancel" onClick={_ => onEdit(false)}>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Box>
        )
    } else {
        return (
        <Box sx={{margin: '10px 0'}}>
            <Button variant="contained" onClick={_ => onEdit(true)}>
                New Conversation
            </Button>
        </Box>
        )
    }    
}