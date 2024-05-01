import { FC, useEffect, useState } from "react";
import { Speed } from "@/app/_apis/dnd5eTypings";
import { Box, Button, Chip, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";

export interface CustomSpeedProps {
    currentSpeed: Speed,
    saveSpeed: (speed: Speed) => void
}

enum speedOptions { 'walk', 'fly', 'swim', 'burrow', 'climb' }

export const CustomSpeed: FC<CustomSpeedProps> = ({ currentSpeed, saveSpeed }) => {
    const [editType, setEditType] = useState<speedOptions>(speedOptions.walk);
    const [speed, setSpeed] = useState(currentSpeed);

    useEffect(() => {
        setSpeed(currentSpeed);
    }, [currentSpeed]);

    function handleChangeSpeed(event: SelectChangeEvent<speedOptions>) {
        setEditType(event.target.value as speedOptions);
    }

    function updateSpeed(value: string, editType: speedOptions) {
        switch (editType) {
            case speedOptions.walk:
                setSpeed(a => { return { ...a, walk: value } });
                break;
            case speedOptions.fly:
                setSpeed(a => { return { ...a, fly: value } });
                break;
            case speedOptions.swim:
                setSpeed(a => { return { ...a, swim: value } });
                break;
            case speedOptions.climb:
                setSpeed(a => { return { ...a, climb: value } });
                break;
            case speedOptions.burrow:
                setSpeed(a => { return { ...a, burrow: value } });
                break;
        }

        saveSpeed(speed);        
    }

    function deleteSpeed(editType: speedOptions) {
        switch (editType) {
            case speedOptions.walk:
                setSpeed(a => { return { ...a, walk: undefined } });
                break;
            case speedOptions.fly:
                setSpeed(a => { return { ...a, fly: undefined } });
                break;
            case speedOptions.swim:
                setSpeed(a => { return { ...a, swim: undefined } });
                break;
            case speedOptions.climb:
                setSpeed(a => { return { ...a, climb: undefined } });
                break;
            case speedOptions.burrow:
                setSpeed(a => { return { ...a, burrow: undefined } });
                break;
         }
        saveSpeed(speed);  
    }

    function determineSpeedForm(editType: speedOptions) {
        if (editType == speedOptions.walk) {
            return (<TextField key={editType} size="small" label="Walk" value={speed.walk} variant="outlined" onChange={x => updateSpeed(x.target.value, editType)} />);
        } else if (editType == speedOptions.fly) {
            return (<TextField key={editType} size="small" label="Fly" value={speed.fly} variant="outlined" onChange={x => updateSpeed(x.target.value, editType)} />);
        } else if (editType == speedOptions.swim) {
            return (<TextField key={editType} size="small" label="Swim" value={speed.swim} variant="outlined" onChange={x => updateSpeed(x.target.value, editType)} />);
        } else if (editType == speedOptions.climb) {
            return (<TextField key={editType} size="small" label="Climb" value={speed.climb} variant="outlined" onChange={x => updateSpeed(x.target.value, editType)} />);
        } else if (editType == speedOptions.burrow) {
            return (<TextField key={editType} size="small" label="Burrow" value={speed.burrow} variant="outlined" onChange={x => updateSpeed(x.target.value, editType)} />);
        }
    }

    return (
        <>
            <Box sx={{ margin: '10px 0' }}>
                <Grid sx={{ paddingTop: 1 }} container spacing={2}>
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel id="recipient">Speed</InputLabel>
                            <Select
                                labelId="speed"
                                value={editType}
                                size="small"
                                label="Speed Type"
                                onChange={handleChangeSpeed}
                            >
                                <MenuItem value={speedOptions.walk}>Walk</MenuItem>
                                <MenuItem value={speedOptions.fly}>Fly</MenuItem>
                                <MenuItem value={speedOptions.swim}>Swim</MenuItem>
                                <MenuItem value={speedOptions.climb}>Climb</MenuItem>
                                <MenuItem value={speedOptions.burrow}>Burrow</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        {determineSpeedForm(editType)}
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ mt: 1, pt: 1 }} >
                {speed.walk ? (<Chip size="small" color="info" label={`Walk: ${speed.walk}`} onDelete={() => deleteSpeed(speedOptions.walk)} />) : ''}
                {speed.fly ? (<Chip size="small" color="info" label={`Fly: ${speed.fly}`} onDelete={() => deleteSpeed(speedOptions.fly)} />) : ''}
                {speed.swim ? (<Chip size="small" color="info" label={`Swim: ${speed.swim}`} onDelete={() => deleteSpeed(speedOptions.swim)} />) : ''}
                {speed.climb ? (<Chip size="small" color="info" label={`Climb: ${speed.climb}`} onDelete={() => deleteSpeed(speedOptions.climb)} />) : ''}
                {speed.burrow ? (<Chip size="small" color="info" label={`Burrow: ${speed.burrow}`} onDelete={() => deleteSpeed(speedOptions.burrow)} />) : ''}
            </Box>
        </>
    )
}