import { FC, useState } from "react";
import { Autocomplete, Box, Button, Checkbox, ListItemText, TextField } from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { DiceTypes } from "@/app/_apis/playerInput";
import { requestPlayerInput } from "@/app/_apis/sessionApi";
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

const recipientOptions = [EMPTY_GUID, 'All'];//This should contain individual player characters too.
const rollOptions = ['Initiative']

export interface RequestPlayerInputProps{
    sessionId: string
}

export const RequestPlayerInput:FC<RequestPlayerInputProps> = ({sessionId}) => {
    const [edit, onEdit] = useState(false);
    const [requestDiceType, setRequestDiceType] = useState(20);
    const [recipients, setRecipient] = useState<string[]>([]);
    const [reason, setReason] = useState('');

    function handleClickRequestRoll() {
        onEdit(false);
        requestPlayerInput(sessionId, {
          dice_type: requestDiceType, 
          client_uuids: recipients, 
          reason: reason
        }).then();
      }

    function handleChangeDiceType(event: SelectChangeEvent<typeof requestDiceType>){
        const {  
            target: { value },  
        } = event;
        setRequestDiceType(Number.parseInt(value as string));
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
                        <Autocomplete
                            id="role-reason"
                            freeSolo
                            onChange={(e, v) => 
                            setReason(v!)}
                            options={rollOptions.map((option) => option)}
                            renderInput={(params) => <TextField {...params} label="Reason" size="small" variant="outlined" />}
                        />  
                    </Box>
                    <Box sx={{margin: '10px 0'}}>
                        <FormControl sx={{ width: 300 }}>
                            <InputLabel id="recipient">Recipient</InputLabel>
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
                        <FormControl sx={{ width: 300 }}>  
                            <InputLabel id="diceType">Dice Type</InputLabel>
                            <Select
                                labelId="diceType"
                                value={requestDiceType}
                                label="Dice Type"
                                onChange={handleChangeDiceType}
                            >
                                {DiceTypes.map(s =>  
                                <MenuItem key={s} value={s}>{s}</MenuItem>
                                )}
                            </Select> 
                        </FormControl> 
                    </Box>
                    <Box sx={{margin: '10px 0'}}>
                        <Button variant="contained" aria-label="Request Roll" onClick={handleClickRequestRoll}>
                            Request Roll
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
                        Request Player Input
                    </Button>
                </Box>
            )
        }    
}