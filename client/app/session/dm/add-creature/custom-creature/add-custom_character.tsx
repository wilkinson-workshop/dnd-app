import { FC, useEffect, useState } from "react";
import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import { Action, Monster, Proficiency, Senses, SpecialAbility, Speed } from "@/app/_apis/dnd5eTypings";
import { CustomActions } from "./custom-actions-list";
import { CustomAbilities } from "./custom-ability-list";
import { CustomSpeed } from "./custom-speed";
import { CUSTOM_MONSTER } from "@/app/_apis/customMonsterApi";
import { CustomProficiencies } from "./custom-proficiencies";
import { getAllAlignments } from "@/app/_apis/dnd5eApi";
import { CustomSense } from "./custom-sense";

type sizeType = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
type alignmentType = 'chaotic neutral' | 'chaotic evil' | 'chaotic good' | 'lawful neutral' | 'lawful evil' | 'lawful good' | 'neutral' | 'neutral evil' | 'neutral good' | 'any alignment' | 'unaligned';

const SIZE: sizeType[] = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
const TYPE = ['aberation', 'beast', 'celestial', 'construct', 'dragon', 'elemental', 'fey', 'fiend', 'giant', 'humanoid', 'monstrosity', 'ooze', 'plant', 'undead']
const ALIGNMENT: alignmentType[] = ['chaotic neutral', 'chaotic evil', 'chaotic good', 'lawful neutral', 'lawful evil', 'lawful good', 'neutral', 'neutral evil', 'neutral good', 'any alignment', 'unaligned']

export interface AddCustomCharacterProps {
    currentMonsterInfo: Monster,
    onAddClick: (monster: Monster) => void
}

export const AddCustomCharacter: FC<AddCustomCharacterProps> = ({ currentMonsterInfo, onAddClick }) => {
    const [monsterInfo, setMonsterInfo] = useState<Monster>(currentMonsterInfo);
    const [alignments, setAlignments] = useState<string[]>([]);
    const [hpRoll, setHpRoll] = useState('');

    useEffect(() => {
        getAlignmentOptions();
    }, []);

    useEffect(() => {
        setMonsterInfo(currentMonsterInfo);
        setHpRoll(currentMonsterInfo.hit_points_roll);
    }, [currentMonsterInfo]);

    function getAlignmentOptions() {
        getAllAlignments()
            .then(s => {
                //type discrepencies in monster as enum vs string.
                setAlignments(s.results.map(s => s.name));
            });
    }

    function handleSubmit(): void {
        let speed = monsterInfo.speed;
        if (speed.walk && !speed.walk.endsWith('ft.')) {
            speed.walk = speed.walk + " ft.";
        }
        
        if (speed.fly && !speed.fly.endsWith('ft.')) {
            speed.fly = speed.fly + " ft.";
        }
        
        if (speed.swim && !speed.swim.endsWith('ft.')) {
            speed.swim = speed.swim + " ft.";
        }
        
        if (speed.climb && !speed.climb.endsWith('ft.')) {
            speed.climb = speed.climb + " ft.";
        } 
        
        if (speed.burrow && !speed.burrow.endsWith('ft.')) {
            speed.burrow = speed.burrow + " ft.";
        }

        let senses = monsterInfo.senses;
        if (senses.blindsight && !senses.blindsight.endsWith('ft.')) {
            senses.blindsight = senses.blindsight + " ft.";
        }

        if (senses.darkvision && !senses.darkvision.endsWith('ft.')) {
            senses.darkvision = senses.darkvision + " ft.";
        }

        if (senses.tremorsense && !senses.tremorsense.endsWith('ft.')) {
            senses.tremorsense = senses.tremorsense + " ft.";
        }

        if (senses.truesight && !senses.truesight.endsWith('ft.')) {
            senses.truesight = senses.truesight + " ft.";
        }

        setMonsterInfo(m => { return { ...m, speed: speed, senses: senses }; });

        onAddClick(monsterInfo);
        resetForm();
    }

    function resetForm() {
        setMonsterInfo(CUSTOM_MONSTER);
    }

    function setHp(value: string) {
        let newMonster: Monster;
        const num = Number.parseInt(value ? value : '0');
        newMonster = { ...monsterInfo, hit_points: num }
        setMonsterInfo(m => newMonster);
    }

    function handleSetHpRoll(value: string) {
        let newMonster: Monster;
        setHpRoll(value);

        if (value.indexOf('d') > 0) {
            var values = RegExp(/(\d+)d(\d+)(\+|\-*)(\d*)/);
            const result = values.exec(value);

            if (result) {
                newMonster = { ...monsterInfo, hit_points_roll: value }
                setMonsterInfo(m => newMonster);
                return;
            }
        }

        if (monsterInfo.hit_points_roll != '') {
            newMonster = { ...monsterInfo, hit_points_roll: value }
            setMonsterInfo(m => newMonster);
        }
    }

    function setStrength(value: string) {
        const num = Number.parseInt(value ? value : '0');
        setMonsterInfo(m => { return { ...m, strength: num }; });
    }

    function setDexterity(value: string) {
        const num = Number.parseInt(value ? value : '0');
        const newMonster: Monster = { ...monsterInfo, dexterity: num }
        setMonsterInfo(m => newMonster);
    }

    function setConstitution(value: string) {
        const num = Number.parseInt(value ? value : '0');
        setMonsterInfo(m => { return { ...m, constitution: num }; });
    }

    function setIntelligence(value: string) {
        const num = Number.parseInt(value ? value : '0');
        setMonsterInfo(m => { return { ...m, intelligence: num }; });
    }

    function setWisdom(value: string) {
        const num = Number.parseInt(value ? value : '0');
        setMonsterInfo(m => { return { ...m, wisdom: num }; });
    }

    function setCharisma(value: string) {
        const num = Number.parseInt(value ? value : '0');
        setMonsterInfo(m => { return { ...m, charisma: num }; });
    }

    function setName(value: string) {
        setMonsterInfo(m => { return { ...m, name: value }; });
    }

    function handleChangeSize(event: SelectChangeEvent<sizeType>) {
        setMonsterInfo(m => { return { ...m, size: event.target.value as sizeType }; });
    }

    function handleChangeType(event: SelectChangeEvent<string>) {
        setMonsterInfo(m => { return { ...m, type: event.target.value }; });
    }

    function handleChangeAlignment(event: SelectChangeEvent<alignmentType>) {
        setMonsterInfo(m => { return { ...m, alignment: event.target.value as alignmentType }; });
    }

    function setSpeed(value: Speed) {
        setMonsterInfo(m => { return { ...m, speed: value }; });
    }

    function setSenses(value: Senses) {
        setMonsterInfo(m => { return { ...m, senses: value }; });
    }

    function setAC(value: string) {
        const num = Number.parseInt(value ? value : '0');
        let currentAC = monsterInfo.armor_class[0];
        currentAC.value = num;
        setMonsterInfo(m => { return { ...m, armor_class: [currentAC] }; });
    }

    function setProficiencyBonus(value: string) {
        const num = Number.parseInt(value ? value : '0');
        setMonsterInfo(m => { return { ...m, proficiency_bonus: num }; });
    }

    function setProficiencies(value: Proficiency[]){
        setMonsterInfo(m => { return { ...m, proficiencies: value }; });
    }

    function setActions(actions: Action[]) {
        setMonsterInfo(m => { return { ...m, actions: actions }; });
    }

    function setLedgendaryActions(actions: Action[]) {
        setMonsterInfo(m => { return { ...m, legendary_actions: actions }; });
    }

    function setSpecialAbilities(abilities: SpecialAbility[]) {
        setMonsterInfo(m => { return { ...m, special_abilities: abilities }; });
    }

    function setReactions(reactions: Action[]) {
        setMonsterInfo(m => { return { ...m, reactions: reactions }; });
    }

    function setBonusActions(bonusActions: Action[]) {
        setMonsterInfo(m => { return { ...m, bonus_actions: bonusActions }; });
    }

    return (
        <>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ margin: '10px 0' }}>
                    <TextField fullWidth size="small" label="Name" value={monsterInfo.name} variant="outlined" onChange={x => setName(x.target.value)} />
                </Box>
                <Grid sx={{ paddingTop: 1 }} container spacing={2}>
                    <Grid item xs={4}>
                        <FormControl fullWidth>
                            <InputLabel id="recipient">Size</InputLabel>
                            <Select
                                labelId="speed"
                                value={monsterInfo.size}
                                size="small"
                                label="Speed Type"
                                onChange={handleChangeSize}
                            >
                                {SIZE.map(s => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl fullWidth>
                            <InputLabel id="recipient">Type</InputLabel>
                            <Select
                                labelId="speed"
                                value={monsterInfo.type}
                                size="small"
                                label="Speed Type"
                                onChange={handleChangeType}
                            >
                                {TYPE.map(s => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl fullWidth>
                            <InputLabel id="recipient">Alignment</InputLabel>
                            <Select
                                labelId="speed"
                                value={monsterInfo.alignment}
                                size="small"
                                label="Speed Type"
                                onChange={handleChangeAlignment}
                            >
                                {ALIGNMENT.map(s => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                <Box sx={{ margin: '10px 0' }}>
                    <TextField sx={{ width: 300 }} size="small" label="AC" value={monsterInfo.armor_class[0].value} variant="outlined" onChange={x => setAC(x.target.value)} />
                    <CustomSpeed currentSpeed={monsterInfo.speed} saveSpeed={setSpeed} />
                    <CustomSense currentSense={monsterInfo.senses} saveSense={setSenses} />
                </Box>
                <Box>
                    <Grid sx={{ paddingTop: 1 }} container spacing={2}>
                        <Grid item xs={2}>
                            <Box sx={{ textAlign: 'center' }}>STR</Box>
                        </Grid>
                        <Grid item xs={2}>
                            <Box sx={{ textAlign: 'center' }}>DEX</Box>
                        </Grid>
                        <Grid item xs={2}>
                            <Box sx={{ textAlign: 'center' }}>CON</Box>
                        </Grid>
                        <Grid item xs={2}>
                            <Box sx={{ textAlign: 'center' }}>INT</Box>
                        </Grid>
                        <Grid item xs={2}>
                            <Box sx={{ textAlign: 'center' }}>WIS</Box>
                        </Grid>
                        <Grid item xs={2}>
                            <Box sx={{ textAlign: 'center' }}>CHA</Box>
                        </Grid>
                    </Grid>
                    <Grid sx={{ paddingTop: 1 }} container spacing={2}>
                        <Grid item xs={2}>
                            <Box sx={{ textAlign: 'center' }}>
                                <TextField size="small" label="Strength" value={monsterInfo.strength} variant="outlined" onChange={x => setStrength(x.target.value)} />
                            </Box>
                        </Grid>
                        <Grid item xs={2}>
                            <Box sx={{ textAlign: 'center' }}>
                                <TextField size="small" label="Dexterity" value={monsterInfo.dexterity} variant="outlined" onChange={x => setDexterity(x.target.value)} />
                            </Box>
                        </Grid>
                        <Grid item xs={2}>
                            <Box sx={{ textAlign: 'center' }}>
                                <TextField size="small" label="Constution" value={monsterInfo.constitution} variant="outlined" onChange={x => setConstitution(x.target.value)} />
                            </Box>
                        </Grid>
                        <Grid item xs={2}>
                            <Box sx={{ textAlign: 'center' }}>
                                <TextField size="small" label="Intelligence" value={monsterInfo.intelligence} variant="outlined" onChange={x => setIntelligence(x.target.value)} />
                            </Box>
                        </Grid>
                        <Grid item xs={2}>
                            <Box sx={{ textAlign: 'center' }}>
                                <TextField size="small" label="Wisdom" value={monsterInfo.wisdom} variant="outlined" onChange={x => setWisdom(x.target.value)} />
                            </Box>
                        </Grid>
                        <Grid item xs={2}>
                            <Box sx={{ textAlign: 'center' }}>
                                <TextField size="small" label="Charisma" value={monsterInfo.charisma} variant="outlined" onChange={x => setCharisma(x.target.value)} />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
                <Box sx={{ margin: '10px 0' }}>
                    <Grid sx={{ paddingTop: 1 }} container spacing={2}>
                        <Grid item xs={6}>
                            <TextField fullWidth size="small" label="HP" value={monsterInfo.hit_points} variant="outlined" onChange={x => setHp(x.target.value)} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth size="small" helperText="Example: 4d6+2" label="HP Roll" value={hpRoll} variant="outlined" onChange={x => handleSetHpRoll(x.target.value)} />
                        </Grid>
                    </Grid>
                </Box>
                <Box sx={{ margin: '10px 0' }}>
                    <TextField sx={{ width: 300 }} size="small" label="Proficiency Bonus" value={monsterInfo.proficiency_bonus} variant="outlined" onChange={x => setProficiencyBonus(x.target.value)} />
                </Box>
                <Box sx={{ margin: '10px 0' }}>
                    <CustomProficiencies currentProficiencies={monsterInfo.proficiencies} saveProficiencies={setProficiencies}  />              
                </Box>
                <Box sx={{ margin: '10px 0' }}>
                    <div className="bold-label">Actions</div>
                    <CustomActions currentActions={monsterInfo.actions} updateActions={setActions} />
                </Box>
                <Box sx={{ margin: '10px 0' }}>
                    <div className="bold-label">Legendary Actions</div>
                    <CustomActions currentActions={monsterInfo.legendary_actions} updateActions={setLedgendaryActions} />
                </Box>
                <Box sx={{ margin: '10px 0' }}>
                    <div className="bold-label">Special Abilities</div>
                    <CustomAbilities currentAbilities={monsterInfo.special_abilities} updateAbilities={setSpecialAbilities} />
                </Box>
                <Box sx={{ margin: '10px 0' }}>
                    <div className="bold-label">Reactions</div>
                    <CustomActions currentActions={monsterInfo.reactions} updateActions={setReactions} />
                </Box>
                <Box sx={{ margin: '10px 0' }}>
                    <div className="bold-label">Bonus Actions</div>
                    <CustomActions currentActions={monsterInfo.bonus_actions} updateActions={setBonusActions} />
                </Box>
                <Box sx={{ margin: '10px 0' }}>
                    <Button fullWidth variant="contained" aria-label="add" onClick={handleSubmit}>
                        Add
                    </Button>
                </Box>
            </Box>
        </>
    )
}
