'use client'

import { FC, useState } from "react";
import { Character } from "../../_apis/character";
import { Box, IconButton } from "@mui/material";
import LinearWithValueLabel from "./progress-label";

export interface CharacterHpProps{character: Character}

export const CharacterHp:FC<CharacterHpProps> = ({character}) => {
    return (
        <>    
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <LinearWithValueLabel value={character.hit_points[0]} maxValue={character.hit_points[1]}/>
            </Box>
        </Box>
        </>
    )
}