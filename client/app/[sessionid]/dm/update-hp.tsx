import { FC, useState } from "react";
import { IconButton, TextField } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save'

export interface UpdateHpProps{id: string, currentHp: number, onUpdateClick: any}

export const UpdateHp:FC<UpdateHpProps> = ({id, currentHp, onUpdateClick}) => {
    const [hp, setHp] = useState(currentHp);

    return <>
            <TextField size="small" label="HP" value={hp} variant="outlined" onChange={x => setHp(Number.parseInt(x.target.value? x.target.value : '0'))} />
            <IconButton aria-label="save" onClick={_ => onUpdateClick(id, hp)}>
                <SaveIcon />
            </IconButton>
        </>
}