import { FC, useContext, useEffect, useRef, useState } from "react";
import { Character, CharacterType, EMPTY_GUID } from "../../../_apis/character";
import { Autocomplete, Box, Button, Checkbox, FormControlLabel, FormGroup, TextField } from "@mui/material";
import { APIReference, Monster } from "@/app/_apis/dnd5eTypings";
import { getAllMonsters, getMonster } from "@/app/_apis/dnd5eApi";
import { getCustomMonster, getCustomMonsters } from '@/app/_apis/customMonsterApi';
import { SessionContext } from "../../../common/session-context";
import { ConditionsContext } from "../../../common/conditions-context";

const EMPTY_MONSTER_OPTION: APIReference = { index: '', name: '', url: ''};

export interface AddRandomCharacterProps{
    onAddClick: (characters: Character[]) => void
}

export const AddRandomCharacter:FC<AddRandomCharacterProps> = ({onAddClick}) => {
    const monsters = useRef<Character[]>([]);
    const [count, setCount] = useState(1);
    const [challengeRatings, setChallengeRatings] = useState<string>('');
    const [conditions, setConditions] = useState(false);
    const [monsterOptions, setMonsterOptions] = useState<APIReference[]>([]);
    const [monster, setMonster] = useState(EMPTY_MONSTER_OPTION);

    const sessionId = useContext(SessionContext);
    const conditionOptions = useContext(ConditionsContext);

    useEffect(() => {
        getMonsterOptions();
    }, []);

    function getMonsterOptions(){
        Promise.all([getAllMonsters([]), getCustomMonsters(sessionId)])        
        .then(m => {
            setMonsterOptions([...m[0].results, ...m[1]]);
        });
    }

    function getMonsterInfo(monsterId: string){  
        let getApi: Promise<Monster>;
        if(monsterId.startsWith('custom')){
            getApi = getCustomMonster(sessionId, monsterId)
        } else {
            getApi = getMonster(monsterId)
        }

        getApi
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
            onAddClick(monsters.current);
            resetForm();
        }
    }

    function handleSubmit(): void {
        if(monster.index != ''){
            let number = 0;
            let index = monster.index         
            while(number < count){
                //ideally only make request once since only creating one monster type
                //but this api is force cached so not actually making multple calls.
                getMonsterInfo(index);   
                number++;
            }
        } else {
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
        if(strValue == ''){
            const hp = monsterInfo.hit_points;
            return [hp, hp];
        }
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
        return [0, 0]
    }

    function resetForm(){
        setCount(1);
        monsters.current = [];
        setChallengeRatings('');
        setConditions(false);
        setMonster(EMPTY_MONSTER_OPTION);
    }

    return (
    <>
        <Box sx={{width: '100%'}}>
            <Box>
                <Autocomplete
                    id="monster"
                    autoSelect
                    sx={{ width: 300 }}
                    getOptionLabel={x => x.name}
                    getOptionKey={X => X.index}
                    onChange={(e, v) => {
                        setMonster(v!);
                    }}
                    options={monsterOptions}
                    renderInput={(params) => <TextField {...params} label="Monster" size="small" variant="outlined" />}
                />
            </Box>
            <Box>
                -OR-
            </Box>
            <Box sx={{margin: '10px 0'}}>
                <TextField sx={{ width: 300 }} size="small" helperText="Comma separated list" label="Challenge Ratings" value={challengeRatings} variant="outlined" onChange={x => setChallengeRatings(x.target.value)} />
            </Box>
            <Box>
                <TextField sx={{ width: 300 }} size="small" label="Count" value={count} variant="outlined" onChange={x => setCount(Number.parseInt(x.target.value))} />
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
                <Button fullWidth variant="contained" aria-label="add" onClick={handleSubmit}>
                    Add
                </Button>
            </Box>
        </Box>
    </>
    )   
}