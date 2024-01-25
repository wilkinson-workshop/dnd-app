'use client'

import { FC, useState } from "react";
import { UpdateHp } from "./update-hp";
import { Character } from "../../_apis/character";
import { Box, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import LinearWithValueLabel from "./progress-label";

export interface CharacterHpProps{character: Character, updateCharacter: any}

export const CharacterHp:FC<CharacterHpProps> = ({character, updateCharacter}) => {
    const [edit, onEdit] = useState(false);

    function updatedNpc(currentHp: number): Character{
        let updatedCharacter = {...character}
        updatedCharacter.hp = [currentHp, updatedCharacter.hp[1]];
        return updatedCharacter;
    }

    if(edit){
        return <UpdateHp id={character.label} currentHp={character.hp[0]} onUpdateClick={(id: string, currentHp:number) => {
            onEdit(false);
            updateCharacter(updatedNpc(currentHp));
        }} />
    } else {
        return (
            <>    
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearWithValueLabel value={character.hp[0]} maxValue={character.hp[1]}/>
                </Box>
                <Box sx={{ minWidth: 35 }}>
                    <IconButton aria-label="edit" onClick={x => onEdit(true)}>
                        <EditIcon />
                    </IconButton>
                </Box>
            </Box>
            </>
        )
    }
}