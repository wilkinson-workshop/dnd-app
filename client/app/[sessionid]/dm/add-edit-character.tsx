import { FC, FormEvent, useContext, useEffect, useState } from "react";
import { Character, CharacterType, EMPTY_GUID, HpBoundaryOptions } from "../../_apis/character";
import { Autocomplete, Box, Button, TextField } from "@mui/material";
import AddIcon from '@mui/icons-material/PersonAdd'
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { HpAdjust } from "./hp-adjust";
import { ConditionsContext } from "./page";
import { APIReference, Monster } from "@/app/_apis/dnd5eTypings";
import { getAllMonsters, getMonster } from "@/app/_apis/dnd5eApi";
import { RsvpOutlined } from "@mui/icons-material";


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
    const [monster, setMonster] = useState('')
    const [currentHp, setCurrentHp] = useState(1);
    const [maxHp, setMaxHp] = useState(1)
    const [initiative, setInitiative] = useState(1);
    const [name, setName] = useState('Character');
    const [conditions, setConditions] = useState<string[]>([]);
    const [monsterOptions, setMonsterOptions] = useState<APIReference[]>([]);
    const [monsterInfo, setMonsterInfo] = useState<Monster | null>(null);

    const conditionOptions = useContext(ConditionsContext);

    const isPlayer = existingCharacter ? existingCharacter.role == CharacterType.Player : false;

    useEffect(() => {
        getMonsterOptions();
    }, []);

    useEffect(() => {
        if(monster != ''){
            let index = monsterOptions.find(x => x.name == monster)?.index;
            if(index){
                getMonsterInfo(index);
            } else {
                setMonsterInfo(null);
            }
        }
    },[monster]);

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

    function getMonsterOptions(){
        getAllMonsters()
        .then(m => {
            setMonsterOptions(m.results);
        });
    }

    function getMonsterInfo(monsterId: string){        
        getMonster(monsterId)
        .then(m => setMonsterInfo(m));
    }


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

    function randomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
        }

    function generateHp(): void {
        if(monsterInfo){
            const strValue = monsterInfo.hit_points_roll;
            var values = RegExp(/(\d+)d(\d+)(\+|\-*)(\d*)/);
            const result = values.exec(strValue);
            if(result){
                const count = Number.parseInt(result[1]);
                const multiple = Number.parseInt(result[2]);
                const isAdd = result[3] == '+';
                const addition = result[4] == '' ? 0 : Number.parseInt(result[4]);

                const maxHp = randomNumber(multiple + addition, (count*multiple + addition));
                setCurrentHp(maxHp);
                setMaxHp(maxHp);
            }

        }

        
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
                <TextField sx={{maxWidth: 150}} size="small" label="Starting HP" value={currentHp} variant="outlined" onChange={x => setCurrentHp(Number.parseInt(x.target.value? x.target.value : '0'))} />
                <TextField sx={{maxWidth: 150}} size="small" label="Max HP" value={maxHp} variant="outlined" onChange={x => setMaxHp(Number.parseInt(x.target.value? x.target.value : '0'))} />
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
                <TextField sx={{ width: 300 }} size="small" label="Initiative" value={initiative} variant="outlined" onChange={x => setInitiative(Number.parseInt(x.target.value? x.target.value : '0'))} />
            </Box>
            <Box>
                <Autocomplete
                    id="monster"
                    freeSolo
                    autoSelect
                    sx={{ width: 300 }}
                    onChange={(e, v) =>
                        setMonster(v!)}
                    options={monsterOptions.map((option) => option.name)}
                    renderInput={(params) => <TextField {...params} label="Monster" size="small" variant="outlined" />}
                />
            </Box>
            <Box sx={{margin: '10px 0'}}>
                <TextField sx={{ width: 300 }} size="small" label="Name" value={name} variant="outlined" onChange={x => setName(x.target.value)} />
            </Box>
            <Box>
                Hit Points Roll: {monsterInfo?.hit_points_roll}
                <Button variant="contained" onClick={generateHp}>Generate HP</Button>
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