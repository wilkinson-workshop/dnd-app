import { FC, FormEvent, useContext, useEffect, useState } from "react";
import { Character, CharacterType, EMPTY_GUID, HpBoundaryOptions } from "../../_apis/character";
import { Box, Button, TextField } from "@mui/material";
import AddIcon from '@mui/icons-material/PersonAdd'
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { HpAdjust } from "./hp-adjust";
import { ConditionsContext } from "./page";


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

export interface AddCharacterProps{
    existingCharacter: Character | null,
    onAddClick: (character: Character) => void
    onCancelClick: () => void
}

export const AddCharacter:FC<AddCharacterProps> = ({existingCharacter, onAddClick, onCancelClick}) => {
    const [edit, onEdit] = useState(false);
    const [currentHp, setCurrentHp] = useState(1);
    const [maxHp, setMaxHp] = useState(1)
    const [initiative, setInitiative] = useState(1);
    const [name, setName] = useState('Character');
    const [conditions, setConditions] = useState<string[]>([]);

    const conditionOptions = useContext(ConditionsContext);

    const isPlayer = existingCharacter ? existingCharacter.role == CharacterType.Player : false;

    useEffect(() => {
        if(existingCharacter != null){
            setCurrentHp(existingCharacter.hit_points[0]);
            setMaxHp(existingCharacter.hit_points[1])
            setInitiative(existingCharacter.initiative);
            setName(existingCharacter.name);
            setConditions(existingCharacter.conditions);
            onEdit(true);
        }
    }, [existingCharacter]);


    function handleSubmit(): void {
        if(currentHp > maxHp){
            console.log("Can't set HP more then the max")
            return;
        }

        onEdit(false);
        onAddClick({
            creature_id:  existingCharacter ? existingCharacter.creature_id : EMPTY_GUID,
            initiative: initiative,
            name: name, 
            hit_points: [currentHp, maxHp],
            conditions: conditions,
            role: existingCharacter ? existingCharacter.role : CharacterType.NonPlayer
        });
        resetForm();
    }

    function handleCancel(): void {
        onEdit(false);
        resetForm();
        onCancelClick();
    }

    function resetForm(){
        setInitiative(1);
        setCurrentHp(1);
        setMaxHp(1);
        setName('Character')
        setConditions([]);
    }

    const handleChange = (event: SelectChangeEvent<typeof conditions>) => {  
        const {  
            target: { value },  
        } = event;  
        setConditions(  
            // On autofill we get a stringified value.  
            typeof value === 'string' ? value.split(',') : value,  
        );  
    }; 

    function updateExistingCurrentHp(newHp: number) {
        if(newHp < 0){
            setCurrentHp(0);
            return;
        }

        setCurrentHp(newHp > maxHp ? maxHp : newHp);
        return;       
    }

    const hpEdit =  () => {
        if(existingCharacter == null){
           return (<>
                <TextField sx={{maxWidth: 80}} size="small" label="Starting HP" value={currentHp} variant="outlined" onChange={x => setCurrentHp(Number.parseInt(x.target.value? x.target.value : '0'))} />
                <TextField sx={{maxWidth: 80}} size="small" label="Max HP" value={maxHp} variant="outlined" onChange={x => setMaxHp(Number.parseInt(x.target.value? x.target.value : '0'))} />
            </>);
        } else if(isPlayer){
            return (
                <Select
                    labelId="label"
                    id="select"
                    value={currentHp}
                    label="HP"
                    onChange={(x) => setCurrentHp(Number.parseInt(x.target.value.toString()))}
              >
                {HpBoundaryOptions.map(o => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
                
              </Select>
            )
        } else {
            return (<HpAdjust hp={currentHp} updateHp={x => updateExistingCurrentHp(x)} />);
        }
    }

    if(edit){ return (
    <>
        <Box sx={{width: '100%'}}>
            <h2>{existingCharacter ? `Edit ${existingCharacter.name}`: 'Add New Character'} </h2>
            <Box sx={{margin: '10px 0'}}>
                <TextField size="small" label="Initiative" value={initiative} variant="outlined" onChange={x => setInitiative(Number.parseInt(x.target.value? x.target.value : '0'))} />
            </Box>
            <Box sx={{margin: '10px 0'}}>
                <TextField size="small" label="Name" value={name} variant="outlined" onChange={x => setName(x.target.value)} />
            </Box>
            <Box sx={{margin: '10px 0'}}>
                {hpEdit()}
            </Box>
            <Box sx={{margin: '10px 0'}}>
                <FormControl sx={{ width: 300 }}>  
                    <InputLabel id="label">Conditions</InputLabel>  
                    <Select  
                        labelId="label"  
                        id="name"  
                        multiple  
                        value={conditions}  
                        onChange={handleChange}  
                        input={<OutlinedInput size="small" label="Conditions" />}  
                        MenuProps={MenuProps}  
                    >  
                        {conditionOptions.map(c =>  
                        <MenuItem  
                            key={c.index}  
                            value={c.index} 
                        >  
                            {c.name}  
                        </MenuItem>  
                        )}  
                    </Select>  
                </FormControl> 
            </Box>
            <Box sx={{margin: '10px 0'}}>
                <Button variant="contained" aria-label="add" onClick={handleSubmit}>
                    Save
                </Button>
                <Button variant="contained" aria-label="cancel" onClick={handleCancel}>
                    Cancel
                </Button>

            </Box>
        </Box>
    </>
    )
    } else {
        return (
            <>
                <Button variant="contained" endIcon={<AddIcon />} onClick={_ => onEdit(true)}>
                    Add
                </Button>
            </>
        )
    }    
}