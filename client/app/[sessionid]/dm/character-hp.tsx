'use client'

import { FC, useState } from "react";
import { UpdateHp } from "./update-hp";
import { Character } from "../../_apis/character";

export interface CharacterHpProps{character: Character, updateCharacter: any}

export const CharacterHp:FC<CharacterHpProps> = ({character, updateCharacter}) => {
    const [edit, onEdit] = useState(false);

    function instaKill(){
        onEdit(false);
        updateCharacter(updatedNpc(0));
    }

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
            <button type="button" onClick={x => onEdit(true)} >Edit</button>
            <button type="button" onClick={instaKill} >InstaKill</button>
            </>
        )
    }
}