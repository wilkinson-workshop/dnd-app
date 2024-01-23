'use client'

import { FC, useState } from "react";
import { UpdateHp } from "./update-hp";
import { Character } from "../../_apis/character";
import { IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'

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
            <span>{character.hp}</span>
            <IconButton aria-label="edit" onClick={x => onEdit(true)}>
                <EditIcon />
            </IconButton>
            </>
        )
    }
}