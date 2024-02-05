import { Box, Button } from "@mui/material";
import { FC, useState } from "react";

export interface HpAdjustProps{
    hp: number,
    updateHp: (newHp: number) => void
}

export const HpAdjust: FC<HpAdjustProps> = ({hp,  updateHp}) => {
    const quickEdit = {
        minWidth: 0
    };

    return (
    <>
        <Button sx={quickEdit} aria-label="subtract" size="small" variant="contained" onClick={() => updateHp(hp - 5)}>
            - 5
        </Button>
        <Button sx={quickEdit} aria-label="subtract" size="small" variant="contained" onClick={() => updateHp(hp - 1)}>
            - 1
        </Button>
        <Box sx={{display: "inline-block", px: 1 }}>{hp}</Box>
        <Button sx={quickEdit} aria-label="add" size="small" variant="contained" onClick={() => updateHp(hp + 1)}>
            + 1
        </Button>
        <Button sx={quickEdit} aria-label="add" size="small" variant="contained" onClick={() => updateHp(hp + 5)}>
            + 5
        </Button>
    </>
    );
}