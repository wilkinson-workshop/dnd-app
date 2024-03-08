import { FC, useState } from "react";
import { IconButton, TextField } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save'

export interface UpdateInitiativeProps{id: string, currentInitiative: number, onUpdateClick: any}

export const UpdateInitiative:FC<UpdateInitiativeProps> = ({id, currentInitiative, onUpdateClick}) => {
    const [initiative, setInitiative] = useState(currentInitiative);

    return <>
            <TextField size="small" label="Initiative" value={initiative} variant="outlined" onChange={x => setInitiative(Number.parseInt(x.target.value? x.target.value : '0'))} />
            <IconButton aria-label="save" onClick={_ => onUpdateClick(id, initiative)}>
                <SaveIcon />
            </IconButton>
        </>
}