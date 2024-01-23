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

    function updatedNpc(hp: number): Character{
        let updatedCharacter = {...character}
        updatedCharacter.hp = hp;
        return updatedCharacter;
    }

    if(edit){
        return <UpdateHp id={character.id} currentHp={character.hp} onUpdateClick={(id: string, hp:number) => {
            onEdit(false);
            updateCharacter(updatedNpc(hp));
        }} />
    } else {
        return (
            <>    
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearWithValueLabel maxValue={200} value={character.hp} />
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