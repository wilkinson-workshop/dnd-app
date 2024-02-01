'use client'

import { FC, useState } from "react";
import { UpdateInitiative } from "./update-initiative";
import { Character } from "../../_apis/character";
import { Box, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';

export interface CharacterInitiativeProps{character: Character, updateCharacter: any}

export const CharacterInitiative:FC<CharacterInitiativeProps> = ({character, updateCharacter}) => {
    const [edit, onEdit] = useState(false);

    function updatedNpc(initiative: number): Character{
        let updatedCharacter = {...character}
        updatedCharacter.initiative = initiative;
        return updatedCharacter;
    }

    if(edit){
        return <UpdateInitiative id={character.creature_id} currentInitiative={character.initiative} onUpdateClick={(id: string, initiative:number) => {
            onEdit(false);
            updateCharacter(updatedNpc(initiative));
        }} />
    } else {
        return (
            <>    
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    {character.initiative}
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