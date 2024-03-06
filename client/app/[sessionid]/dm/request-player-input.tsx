import { FC, useContext, useEffect, useState } from "react";
import { Autocomplete, Box, Button, Checkbox, ListItemText, TextField } from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { DiceTypes } from "@/app/_apis/playerInput";
import { requestPlayerInput } from "@/app/_apis/sessionApi";
import { Character, EMPTY_GUID } from "@/app/_apis/character";
import { INIT_DESC, getAllSkills, getSkil } from "@/app/_apis/dnd5eApi";
import { APIReference } from "@/app/_apis/dnd5eTypings";

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

export interface RequestPlayerInputProps{
    sessionId: string,
    recipientOptions: Character[]
}

export const RequestPlayerInput:FC<RequestPlayerInputProps> = ({sessionId, recipientOptions}) => {
    const [edit, onEdit] = useState(false);
    const [requestDiceType, setRequestDiceType] = useState(20);
    const [recipients, setRecipient] = useState<string[]>([]);
    const [reason, setReason] = useState<string | null>(null);
    const [rollOptions, setRollOptions] = useState<APIReference[]>([]);
    const [description, setDescription] = useState<string[]>([]);

    useEffect(() => {
        getSkillOptions();
    }, []);

    useEffect(() => {
        if(reason != null){
            let index = rollOptions.find(x => x.name == reason)?.index;
            if(index){
                getDescription(index);
            } else {
                setDescription([]);
            }
        }
    },[reason]);

    function getDescription(skillId: string){
        if(skillId == 'initiative'){
            setDescription([INIT_DESC]);
            return;
        }
        
        getSkil(skillId)
        .then(c => setDescription(c.desc));
    }


    function getSkillOptions(){
        getAllSkills()
        .then(s => {
            const skills = [{index: 'initiative', name:'Initiative', url: ''}, ...s.results];
            setRollOptions(skills);
        });
    }

    function handleClickRequestRoll() {
        if(reason == null || recipients.length == 0) 
            return;

        onEdit(false);

        let actualRecipients = recipients;

        if(recipients.length > 0 && recipients[0] == EMPTY_GUID){
            actualRecipients = recipientOptions.filter(x => x.creature_id != EMPTY_GUID).map(x => x.creature_id);
        }

        requestPlayerInput(sessionId, {
          dice_type: requestDiceType, 
          client_uuids: actualRecipients, 
          reason: reason
        }).then();
        setRecipient([]);
        setRequestDiceType(20);
        setReason('');
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
        if(value)

        setRecipient(typeof value === 'string' ? value.split(',') : value);
    }

        if(edit){ return (
            <Box>
                <Box sx={{width: '100%'}}>
                    <h2>Player Input Request</h2>
                    <Box sx={{margin: '10px 0'}}>
                        <Autocomplete
                            id="role-reason"
                            sx={{ width: 300 }}
                            freeSolo
                            autoSelect
                            onChange={(e, v) =>
                                setReason(v!)}
                            options={rollOptions.map((option) => option.name)}
                            renderInput={(params) => <TextField {...params} error={reason == null} label="Reason" size="small" variant="outlined" />}
                        />  
                    </Box>
                    <Box sx={{whiteSpace: 'pre-wrap'}}>{description.join('/n')}</Box>
                    <Box sx={{margin: '10px 0'}}>
                        <FormControl sx={{ width: 300 }}>
                            <InputLabel id="recipient">Recipient</InputLabel>
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
                        <Button variant="contained" disabled={reason == null || recipients.length == 0} aria-label="Request Roll" onClick={handleClickRequestRoll}>
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