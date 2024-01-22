'use client'

import { FC, useState } from "react";
import { ConditionType, Character } from "../../_apis/character";
import { UpdateConditions } from "./update-conditions";
import Condition from "./condition-item";

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
        return <UpdateConditions id={character.id} currentConditions={character.conditions} onUpdateConClick={(id: string, conditions: ConditionType[]) =>{
            onEdit(false);
            updateCharacter(updatedNpc(conditions))}
        } />
    } else {
        return (
            <>
                {character.conditions.map((condition)=> (
                    <Condition key={condition} id={character.id} condition={condition} onDeleteCondition={(id: string, condition: ConditionType) => onConditionDelete(id, condition)}  />
                ))}
                <button type="button" onClick={x => onEdit(true)} >Edit</button>
            </>
        )
    }
}