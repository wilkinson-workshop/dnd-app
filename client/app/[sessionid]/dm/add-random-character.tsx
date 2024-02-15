import { FC, useContext, useEffect, useRef, useState } from "react";
import { Character, CharacterType, EMPTY_GUID } from "../../_apis/character";
import { Box, Button, Checkbox, FormControlLabel, FormGroup, TextField } from "@mui/material";
import AddIcon from '@mui/icons-material/PersonAdd'
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

export interface AddRandomCharacterProps{
    onAddClick: (characters: Character[]) => void
    onCancelClick: () => void
}

export const AddRandomCharacter:FC<AddRandomCharacterProps> = ({onAddClick, onCancelClick}) => {
    const [edit, onEdit] = useState(false);
    const monsters = useRef<Character[]>([]);
    const [count, setCount] = useState(1);
    const [challengeRatings, setChallengeRatings] = useState<string>('');
    const [conditions, setConditions] = useState(false);

    const conditionOptions = useContext(ConditionsContext);

    function getMonsterInfo(monsterId: string){        
        getMonster(monsterId)
        .then(m => generateMonster(m));
    }

    function generateMonster(monsterInfo: Monster) {
        const monster = {
            creature_id: EMPTY_GUID,
            initiative: generateInitiative(monsterInfo),
            name: monsterInfo.name, 
            hit_points: generateHp(monsterInfo),
            conditions: conditions ? [generateCondition()]: [],
            role: CharacterType.NonPlayer,
            monster: monsterInfo.index
        };

        monsters.current.push(monster);
        if(monsters.current.length == count){
            onEdit(false);
            onAddClick(monsters.current);
            resetForm();
        }
    }

    function handleSubmit(): void {
        getAllMonsters(challengeRatings.split(','))
        .then(m => {
            let number = 0;
            while(number < count){
                const selectedMonster = randomNumber(0, m.results.length-1);
                getMonsterInfo(m.results[selectedMonster].index);
                number++;
            }
        });
    }

    function randomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateCondition(){
        const index = randomNumber(0, conditionOptions.length -1);
        return conditionOptions[index].index;
    }

    function generateInitiative(monsterInfo: Monster): number {
        const dex = monsterInfo.dexterity;
        const min =  1;
        const add = Math.floor((dex - 10)/2);

        const init = randomNumber(min, 20);
        return init + add;
    }

    function generateHp(monsterInfo: Monster): number[] {
        const strValue = monsterInfo.hit_points_roll;
        var values = RegExp(/(\d+)d(\d+)(\+|\-*)(\d*)/);
        const result = values.exec(strValue);
        if(result){
            const count = Number.parseInt(result[1]);
            const multiple = Number.parseInt(result[2]);
            const isAdd = result[3] == '+';
            const addition = result[4] == '' ? 0 : Number.parseInt(result[4]);

            const min =  isAdd ? (count + addition) : (count - addition)
            const max = isAdd ? (count*multiple + addition) : (count*multiple - addition)

            const maxHp = randomNumber(min, max);
            return [maxHp, maxHp];
        }        
        return [0]
    }

    function handleCancel(): void {
        onEdit(false);
        resetForm();
        onCancelClick();
    }

    function resetForm(){
        setCount(1);
        monsters.current = [];
        setChallengeRatings('');
        setConditions(false);
    }

    if(edit){ return (
    <>
        <Box sx={{width: '100%'}}>
            <h2>Add Random New Creature(s)</h2>
            <Box>
                <TextField sx={{ width: 300 }} size="small" label="Count" value={count} variant="outlined" onChange={x => setCount(Number.parseInt(x.target.value))} />
            </Box>
            <Box sx={{margin: '10px 0'}}>
                <TextField sx={{ width: 300 }} size="small" label="Challenge Ratings" value={challengeRatings} variant="outlined" onChange={x => setChallengeRatings(x.target.value)} />
            </Box>
            <Box sx={{margin: '10px 0'}}>
            <FormGroup>
                <FormControlLabel control={
                    <Checkbox
                    checked={conditions}
                    onChange={(e, c) => setConditions(c)}
                    inputProps={{ 'aria-label': 'controlled' }}
                    />}
                label="Set a Condition" />
            </FormGroup>
            </Box>
            <Box sx={{margin: '10px 0'}}>
                <Button variant="contained" aria-label="add" onClick={handleSubmit}>
                    Create
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
                    Add Random
                </Button>
            </>
        )
    }    
}