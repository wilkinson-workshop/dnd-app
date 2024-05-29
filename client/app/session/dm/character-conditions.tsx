'use client'

import { FC } from "react";
import { Character } from "../../_apis/character";
import { ConditionItem } from "./condition-item";
import { Box } from "@mui/material";

export interface CharacterConditionsProps {
    character: Character,
    updateCharacter: any
}

export const CharacterConditions: FC<CharacterConditionsProps> = ({character, updateCharacter }) => {
    function onConditionDelete(conditionId: string){
        const conditionToDelete = character.conditions.findIndex(x => x == conditionId);
        character.conditions.splice(conditionToDelete,1);
        updateCharacter(character);
    }
    
    return (
        <>
            {character.conditions.length > 0 ?
            character.conditions.map((condition)=> (
                <ConditionItem key={condition} conditionId={condition} onDeleteCondition={(conditionId: string) => onConditionDelete(conditionId)}  />
            )):<Box sx={{display:"inline-block", padding: "5px"}}>None</Box>}
        </>
    )
}