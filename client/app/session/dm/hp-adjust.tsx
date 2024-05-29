import { Box, Button, IconButton, TextField } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { FC, useState } from "react";

export interface HpAdjustProps{
    hp: number,
    updateHp: (newHp: number) => void
}

export const HpAdjust: FC<HpAdjustProps> = ({hp,  updateHp}) => {
    const [hpChange, setHpChange] = useState(1);

    const quickEdit = {
        minWidth: 0
    };

    return (
    <>
        <TextField sx={{maxWidth: 60}} size="small" value={hp} variant="outlined" onChange={x => updateHp(Number.parseInt(x.target.value? x.target.value : '0'))} />
        <IconButton sx={quickEdit} onClick={() => updateHp(hp - hpChange)}>
            <RemoveIcon />
        </IconButton>
        <TextField sx={{maxWidth: 60}} size="small" value={hpChange} variant="outlined" onChange={x => setHpChange(Number.parseInt(x.target.value? x.target.value : '0'))} />
        <IconButton sx={quickEdit} onClick={() => updateHp(hp + hpChange)}>
            <AddIcon/>
        </IconButton>
        <Button variant="contained" onClick={() => updateHp(0)}>
            Knock Out
        </Button>
    </>
    );
}