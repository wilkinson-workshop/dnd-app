import { FC, useContext, useEffect, useState } from "react";
import { Proficiency, Speed } from "@/app/_apis/dnd5eTypings";
import { Box, Button, Chip, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import { EditRoad } from "@mui/icons-material";
import { ConditionsContext } from "@/app/common/conditions-context";
import { getAllSkills } from "@/app/_apis/dnd5eApi";

export interface CustomProficienciesProps {
    currentProficiencies: Proficiency[],
    saveProficiencies: (proficiencies: Proficiency[]) => void
}

type ProficiencyType = 'Skill' | 'Saving Throw';
const attributes = [ 'STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA' ]

export const CustomProficiencies: FC<CustomProficienciesProps> = ({ currentProficiencies, saveProficiencies }) => {
    const [editType, setEditType] = useState<ProficiencyType>('Skill');
    const [skillType, setSkillType] = useState<string>('');
    const [attributeType, setAttributeType] = useState<string>('');
    const [profValue, setProfValue] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [proficiencies, setProficiencies] = useState(currentProficiencies);
    
    useEffect(() => {
        getSkillOptions();
    }, []);


    function getSkillOptions() {
        getAllSkills()
            .then(s => {
                setSkills(s.results.map(s => s.name));
            });
    }

    useEffect(() => {
        setProficiencies(currentProficiencies);
    }, [currentProficiencies]);

    function handleChaneProficiencyType(event: SelectChangeEvent<ProficiencyType>) {
        setEditType(event.target.value as ProficiencyType);
    }

    function handleSave() {
        let newProficiencies = proficiencies.slice();

        let profName = editType == "Skill" ? skillType : attributeType;       
        
        const newProf: Proficiency = {value: Number.parseInt(profValue), proficiency: {name:`${editType}:${profName}`, url: '', index: '' } };
        newProficiencies.push(newProf);
        setProficiencies(newProficiencies);

        saveProficiencies(newProficiencies);
    }

    function determineProficiencyTypeForm(editType: ProficiencyType) {
        if(editType == 'Skill'){
            return (<FormControl fullWidth>
                <InputLabel id="skill">Skill</InputLabel>
                <Select
                    labelId="skill"
                    value={skillType}
                    size="small"
                    label="Skill Type"
                    onChange={e => setSkillType(e.target.value)}
                >
                    {skills.map(s => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
                </Select>
            </FormControl>);
        } else {
            return (<FormControl fullWidth>
                <InputLabel id="attr">Attribute</InputLabel>
                <Select
                    labelId="attr"
                    value={attributeType}
                    size="small"
                    label="Attribute Type"
                    onChange={e => setAttributeType(e.target.value)}
                >
                    {attributes.map(s => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
                </Select>
            </FormControl>);
        }
    }

    function deleteProficiency(proficiency: any) {
        //do something to delete
    }

    function showProficiencies(proficiencies: Proficiency[]) {
		const SKILL = 'Skill';
		let skills: string[] = [];
		let savingThrows: string[] = [];

		for (const prof of proficiencies) {
			const name = prof.proficiency.name.split(":");
			if (name[0] == SKILL) {
				skills.push(`${name[1]} +${prof.value}`);
			} else {
				savingThrows.push(`${name[1]} +${prof.value}`);
			}
		}

		return (
			<>
				{skills.length > 0 ? (<Box>
                    <span className="bold-label">Skills: </span>{skills.map(s => 
                        (<Chip key={s} size="small" color="info" label={s} />))}
                </Box>) : ''}
				{savingThrows.length > 0 ? (<Box>
                    <span className="bold-label">Saving Throws: </span>{savingThrows.map(s => 
                        (<Chip key={s} size="small" color="info" label={s} />))}
                </Box>): ''}
			</>
		)
	}

    return (
        <>
            <Box sx={{ margin: '10px 0' }}>
                <Grid sx={{ paddingTop: 1 }} container spacing={2}>
                    <Grid item xs={3}>
                        <FormControl fullWidth>
                            <InputLabel id="profType">Proficiency Type</InputLabel>
                            <Select
                                labelId="profType"
                                value={editType}
                                size="small"
                                label="Proficience Type"
                                onChange={handleChaneProficiencyType}
                            >
                                <MenuItem value="Skill">Skill</MenuItem>
                                <MenuItem value='Saving Throw'>Saving Throw</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                        {determineProficiencyTypeForm(editType)}
                    </Grid>
                    <Grid item xs={3}>
                        <TextField size="small" label="Value" value={profValue} variant="outlined" onChange={x => setProfValue(x.target.value)} />
                    </Grid>
                    <Grid item xs={3}>
                        <Button variant="contained" onClick={handleSave}>
                            Save
                        </Button>
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ mt: 1, pt: 1 }} >
                {showProficiencies(proficiencies)}
            </Box>
        </>
    )
}