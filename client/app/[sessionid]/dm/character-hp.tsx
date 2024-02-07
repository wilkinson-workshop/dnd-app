'use client'

import { FC, useState } from "react";
import { Character, CharacterType } from "../../_apis/character";
import { Box, IconButton } from "@mui/material";
import LinearWithValueLabel from "./progress-label";
import { HpBoundaryOptions } from "../../_apis/character";

export interface CharacterHpProps{character: Character}

export const CharacterHp:FC<CharacterHpProps> = ({character}) => {
    function calculateHP(): string {
        const hpPercent = character.hit_points[0];
        if(hpPercent == 0)
          return HpBoundaryOptions.find(x => x.id == 0)!.name;
        else if(hpPercent < 10 && hpPercent > 0)
          return HpBoundaryOptions.find(x => x.id == 9)!.name;
        else if (hpPercent < 50)
          return HpBoundaryOptions.find(x => x.id == 49)!.name;
        else
          return HpBoundaryOptions.find(x => x.id == 100)!.name;
      }


    return (
        <>    
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                {character.role == CharacterType.Player ? 
                calculateHP() : 
                <LinearWithValueLabel value={character.hit_points[0]} maxValue={character.hit_points[1]}/>
                }
            </Box>
        </Box>
        </>
    )
}