'use client'

import { FC, useState } from "react";
import { ConditionType, Character } from "../../_apis/character";
import { UpdateConditions } from "./update-conditions";
import Condition from "./condition-item";
import { Box, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import Stack from '@mui/material/Stack';

export interface CharacterConditionsProps {character: Character, updateCharacter: any}

export const CharacterConditions: FC<CharacterConditionsProps> = ({character, updateCharacter }) => {
    const [edit, onEdit] = useState(false);

    function updatedNpc(conditions: ConditionType[]): Character{
        let updateCharacter = {...character}
        updateCharacter.conditions = conditions;
        return updateCharacter;
    }

    function onConditionDelete(id: any, condition: ConditionType){
        const conditionToDelete = character.conditions.findIndex(x => x == condition);
        character.conditions.splice(conditionToDelete,1);
        updateCharacter(character);
    }
    
    if(edit){
        return <UpdateConditions id={character.creature_id} currentConditions={character.conditions} onUpdateConClick={(id: string, conditions: ConditionType[]) =>{
            onEdit(false);
            updateCharacter(updatedNpc(conditions))}
        } />
    } else {
        return (
            <>
                {character.conditions.length > 0 ?
                character.conditions.map((condition)=> (
                    <Condition key={condition} id={character.creature_id} condition={condition} onDeleteCondition={(id: string, condition: ConditionType) => onConditionDelete(id, condition)}  />
                )):<Box sx={{display:"inline-block", padding: "5px"}}>No Conditions</Box>}
                <IconButton aria-label="edit" onClick={x => onEdit(true)}>
                    <EditIcon />
                </IconButton>
            </>
        )
    }
}