import { FC, FormEvent, useContext, useEffect, useState } from "react";
import { Character, CharacterType, EMPTY_GUID, HpBoundaryOptions } from "../../_apis/character";
import { Autocomplete, Box, Button, TextField } from "@mui/material";
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { ConditionsContext } from "./page";
import { APIReference, Monster } from "@/app/_apis/dnd5eTypings";
import { getAllMonsters, getMonster } from "@/app/_apis/dnd5eApi";

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

interface CalculatedMonsterInfo {
    initiativeAdd: number,
    minHp: number,
    maxHp: number,
    averageHp: number
}

const DEFAULT_CALC_MONSTER_INFO: CalculatedMonsterInfo = {
    initiativeAdd: 1,
    minHp: 1,
    maxHp: 1,
    averageHp: 1
}

export interface AddCharacterProps{
    onAddClick: (character: Character) => void
}

export const AddCharacter:FC<AddCharacterProps> = ({onAddClick}) => {
    const [monster, setMonster] = useState('')
    const [currentHp, setCurrentHp] = useState(1);
    const [maxHp, setMaxHp] = useState(1)
    const [initiative, setInitiative] = useState('1');
    const [name, setName] = useState('Creature');
    const [conditions, setConditions] = useState<string[]>([]);
    const [monsterOptions, setMonsterOptions] = useState<APIReference[]>([]);
    const [monsterInfo, setMonsterInfo] = useState<Monster | null>(null);
    const [calculatedMonsterInfo, setCalculatedMonsterInfo] = useState<CalculatedMonsterInfo>(DEFAULT_CALC_MONSTER_INFO);

    const conditionOptions = useContext(ConditionsContext);

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
                setCalculatedMonsterInfo(DEFAULT_CALC_MONSTER_INFO);
            }
        }
    },[monster]);

    function getMonsterOptions(){
        getAllMonsters([])
        .then(m => {
            setMonsterOptions(m.results);
        });
    }

    function getMonsterInfo(monsterId: string){        
        getMonster(monsterId)
        .then(m => {
            setMonsterInfo(m);
            const hp = calculateHp(m);
            setCalculatedMonsterInfo({
                initiativeAdd: calculateInitiative(m),
                minHp: hp[0],
                maxHp: hp[1],                
                averageHp: hp[2]
            });
        });
    }

    function handleSubmit(): void {
        if(currentHp > maxHp){
            console.log("Can't set HP more then the max")
            return;
        }

        const newInit = Number.parseFloat(initiative ? initiative : '0')

        onAddClick({
            creature_id: EMPTY_GUID,
            initiative: newInit,
            name: name, 
            hit_points: [currentHp, maxHp],
            conditions: conditions,
            role: CharacterType.NonPlayer,
            monster: monsterInfo!.index
        });
        resetForm();
    }

    function randomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function calculateInitiative(monsterInfo: Monster): number {
        const dex = monsterInfo.dexterity;
        return Math.floor((dex - 10)/2);
    }

    function generateInitiative(): void {
        const add = calculatedMonsterInfo.initiativeAdd;
        const init = randomNumber(1, 20);
        setInitiative((init + add).toString());
    }

    function calculateHp(monsterInfo: Monster): number[] {
        const strValue = monsterInfo.hit_points_roll;
        var values = RegExp(/(\d+)d(\d+)(\+|\-*)(\d*)/);
        const result = values.exec(strValue);
        if(result){
            const count = Number.parseInt(result[1]);
            const multiple = Number.parseInt(result[2]);
            const isAdd = result[3] == '+';
            const addition = result[4] == '' ? 0 : Number.parseInt(result[4]);

            const min =  isAdd ? (count + addition) : (count - addition);
            const max = isAdd ? (count*multiple + addition) : (count*multiple - addition);
            const average = (max-min)/2 + min;

            return [min, max, average];
        }

        return [1,1,1];
    } 


    function generateHp(): void {
        const min = calculatedMonsterInfo.minHp;
        const max = calculatedMonsterInfo. maxHp;

        const maxHp = randomNumber(min, max);
        setCurrentHp(maxHp);
        setMaxHp(maxHp);
    } 

    function resetForm(){
        setInitiative('1');
        setCurrentHp(1);
        setMaxHp(1);
        //setName('Creature');
        //setMonster('')
        setConditions([]);
        //setMonsterInfo(null);
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

    const hpEdit =  () => {
        return (<>
            <TextField sx={{maxWidth: 80}} size="small" label="Starting HP" value={currentHp} variant="outlined" onChange={x => setCurrentHp(Number.parseInt(x.target.value ? x.target.value : '0'))} />
            <TextField sx={{maxWidth: 80}} size="small" label="Max HP" value={maxHp} variant="outlined" onChange={x => setMaxHp(Number.parseInt(x.target.value ? x.target.value : '0'))} />
            <Button variant="contained" disabled={monster == ''} onClick={generateHp}>Generate HP</Button>
        </>)
    }

   return (
    <>
        <Box sx={{width: '100%'}}>
            <Box>
                <Autocomplete
                    id="monster"
                    autoSelect
                    sx={{ width: 300 }}
                    onChange={(e, v) => {
                        setMonster(v!);
                        if(v != null)
                            setName(v!);
                        else 
                            setName('Creature');
                    }}
                    options={monsterOptions.map((option) => option.name)}
                    renderInput={(params) => <TextField {...params} label="Monster" size="small" variant="outlined" />}
                />
            </Box>
            <Box>
                Initiative Bonus: {calculatedMonsterInfo.initiativeAdd}
            </Box>
            <Box sx={{margin: '10px 0'}}>
                <TextField sx={{ width: 100 }} size="small" label="Initiative" value={initiative} variant="outlined" onChange={x => setInitiative(x.target.value)} />
                <Button variant="contained" disabled={monster == ''} onClick={generateInitiative}>Generate Initiative</Button>
            </Box>
            <Box sx={{margin: '10px 0'}}>
                <TextField sx={{ width: 300 }} size="small" label="Name" value={name} variant="outlined" onChange={x => setName(x.target.value)} />
            </Box>
            <Box>
                Hit Points Roll: {monsterInfo?.hit_points_roll} Average: {calculatedMonsterInfo.averageHp}               
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
                    Add
                </Button>
            </Box>
        </Box>
    </>
    )
}