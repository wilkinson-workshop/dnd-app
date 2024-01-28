import { FC, useState } from "react";
import { Autocomplete, Box, Button, Checkbox, ListItemText, OutlinedInput, TextField } from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { sharePlayerSecret } from "@/app/_apis/sessionApi";
import { EMPTY_GUID } from "@/app/_apis/character";

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

const recipientOptions = [EMPTY_GUID, "Another"];//This should contain individual player characters too.

export interface SendPlayerSecretProps{
    sessionId: string
}

export const SendPlayerSecret:FC<SendPlayerSecretProps> = ({sessionId}) => {
    const [edit, onEdit] = useState(false);
    const [recipients, setRecipient] = useState<string[]>([]);
    const [secretMsg, setSecretMsg] = useState('');

    function handleClickRequestRoll() {
        onEdit(false);
        sharePlayerSecret(sessionId, {
            secret: secretMsg,
            recipients: recipients
        }).then();
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
                <h2>Player Input Request</h2>
                <Box sx={{margin: '10px 0'}}>
                    <TextField onChange={e => setSecretMsg(e.target.value)} label="Secret" size="small" variant="outlined" />
                </Box>
                <Box sx={{margin: '10px 0'}}>
                    <FormControl sx={{ width: 300 }}>
                        <InputLabel id="recipient">Recipients</InputLabel>
                        <Select
                            labelId="recipient"
                            value={recipients}
                            multiple
                            label="Recipients"
                            onChange={handleChangeRecipient}
                            renderValue={(selected) => selected.join(', ')}  
                            MenuProps={MenuProps}
                        >
                            {recipientOptions.map(s =>  
                            <MenuItem key={s} value={s}>
                                <Checkbox checked={recipients.indexOf(s) > -1} />
                                <ListItemText primary={s} />
                            </MenuItem>
                            )}
                        </Select>
                    </FormControl>
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
                Send Player Secret
            </Button>
        </Box>
        )
    }    
}