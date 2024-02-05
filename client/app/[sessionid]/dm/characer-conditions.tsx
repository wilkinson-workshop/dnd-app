'use client'

import { FC } from "react";
import { ConditionType, Character } from "../../_apis/character";
import Condition from "./condition-item";
import { Box } from "@mui/material";

export interface CharacterConditionsProps {character: Character, updateCharacter: any}

export const CharacterConditions: FC<CharacterConditionsProps> = ({character, updateCharacter }) => {


    function onConditionDelete(id: any, condition: ConditionType){
        const conditionToDelete = character.conditions.findIndex(x => x == condition);
        character.conditions.splice(conditionToDelete,1);
        updateCharacter(character);
    }
    
    return (
        <>
            {character.conditions.length > 0 ?
            character.conditions.map((condition)=> (
                <Condition key={condition} id={character.creature_id} condition={condition} onDeleteCondition={(id: string, condition: ConditionType) => onConditionDelete(id, condition)}  />
            )):<Box sx={{display:"inline-block", padding: "5px"}}>No Conditions</Box>}
        </>
    )
}