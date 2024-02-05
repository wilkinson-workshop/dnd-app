'use client'

import { FC, useState } from "react";
import { Character } from "../../_apis/character";
import { Box, IconButton } from "@mui/material";
import LinearWithValueLabel from "./progress-label";

export interface CharacterHpProps{character: Character, updateCharacter: any}

export const CharacterHp:FC<CharacterHpProps> = ({character, updateCharacter}) => {

    function updatedNpc(currentHp: number): Character{
        let updatedCharacter = {...character}
        updatedCharacter.hit_points = [currentHp, updatedCharacter.hit_points[1]];
        return updatedCharacter;
    }

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