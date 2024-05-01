import { FC, useEffect, useState } from "react";
import { Senses, Speed } from "@/app/_apis/dnd5eTypings";
import { Box, Button, Chip, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";

export interface CustomSenseProps {
    currentSense: Senses,
    saveSense: (speed: Senses) => void
}

enum senseOptions { 'passivePersception', 'blindsight', 'darkvision', 'tremorsense', 'truesight' }

export const CustomSense: FC<CustomSenseProps> = ({ currentSense, saveSense }) => {
    const [editType, setEditType] = useState<senseOptions>(senseOptions.passivePersception);
    const [sense, setSense] = useState(currentSense);

    useEffect(() => {
        setSense(currentSense);
    }, [currentSense]);

    function handleChangeSense(event: SelectChangeEvent<senseOptions>) {
        setEditType(event.target.value as senseOptions);
    }

    function updateSense(value: string, editType: senseOptions) {
        switch (editType) {
            case senseOptions.passivePersception:
                const num = Number.parseInt(value);
                setSense(a => { return { ...a, passive_perception: num } });
                break;
            case senseOptions.blindsight:
                setSense(a => { return { ...a, blindsight: value } });
                break;
            case senseOptions.darkvision:
                setSense(a => { return { ...a, darkvision: value } });
                break;
            case senseOptions.tremorsense:
                setSense(a => { return { ...a, tremorsense: value } });
                break;
            case senseOptions.truesight:
                setSense(a => { return { ...a, truesight: value } });
                break;
        }

        saveSense(sense);        
    }

    function deleteSense(editType: senseOptions) {
        switch (editType) {
            case senseOptions.passivePersception:
                setSense(a => { return { ...a, passive_perception: undefined } });
                break;
            case senseOptions.blindsight:
                setSense(a => { return { ...a, blindsight: undefined } });
                break;
            case senseOptions.darkvision:
                setSense(a => { return { ...a, darkvision: undefined } });
                break;
            case senseOptions.tremorsense:
                setSense(a => { return { ...a, tremorsense: undefined } });
                break;
            case senseOptions.truesight:
                setSense(a => { return { ...a, truesight: undefined } });
                break;
         }
        saveSense(sense);  
    }

    function determineSenseForm(editType: senseOptions) {
        if (editType == senseOptions.passivePersception) {
            return (<TextField key={editType} size="small" label="Passive Perception" value={sense.passive_perception} variant="outlined" onChange={x => updateSense(x.target.value, editType)} />);
        } else if (editType == senseOptions.blindsight) {
            return (<TextField key={editType} size="small" label="Blindsight" value={sense.blindsight} variant="outlined" onChange={x => updateSense(x.target.value, editType)} />);
        } else if (editType == senseOptions.darkvision) {
            return (<TextField key={editType} size="small" label="Darkvision" value={sense.darkvision} variant="outlined" onChange={x => updateSense(x.target.value, editType)} />);
        } else if (editType == senseOptions.tremorsense) {
            return (<TextField key={editType} size="small" label="Tremorsense" value={sense.tremorsense} variant="outlined" onChange={x => updateSense(x.target.value, editType)} />);
        } else if (editType == senseOptions.truesight) {
            return (<TextField key={editType} size="small" label="Truesight" value={sense.truesight} variant="outlined" onChange={x => updateSense(x.target.value, editType)} />);
        }
    }

    return (
        <>
            <Box sx={{ margin: '10px 0' }}>
                <Grid sx={{ paddingTop: 1 }} container spacing={2}>
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel id="senses">Senses</InputLabel>
                            <Select
                                labelId="senses"
                                value={editType}
                                size="small"
                                label="Sense Type"
                                onChange={handleChangeSense}
                            >
                                <MenuItem value={senseOptions.passivePersception}>Passive Perception</MenuItem>
                                <MenuItem value={senseOptions.blindsight}>Blindsight</MenuItem>
                                <MenuItem value={senseOptions.darkvision}>Darkvision</MenuItem>
                                <MenuItem value={senseOptions.tremorsense}>Tremorsense</MenuItem>
                                <MenuItem value={senseOptions.truesight}>TrueSight</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        {determineSenseForm(editType)}
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ mt: 1, pt: 1 }} >
                {sense.passive_perception ? (<Chip size="small" color="info" label={`Passive Perception: ${sense.passive_perception}`} onDelete={() => deleteSense(senseOptions.passivePersception)} />) : ''}
                {sense.blindsight ? (<Chip size="small" color="info" label={`Blindsight: ${sense.blindsight}`} onDelete={() => deleteSense(senseOptions.blindsight)} />) : ''}
                {sense.darkvision ? (<Chip size="small" color="info" label={`Darkvision: ${sense.darkvision}`} onDelete={() => deleteSense(senseOptions.darkvision)} />) : ''}
                {sense.tremorsense ? (<Chip size="small" color="info" label={`Tremorsense: ${sense.tremorsense}`} onDelete={() => deleteSense(senseOptions.tremorsense)} />) : ''}
                {sense.truesight ? (<Chip size="small" color="info" label={`Truesight: ${sense.truesight}`} onDelete={() => deleteSense(senseOptions.truesight)} />) : ''}
            </Box>
        </>
    )
}