import { useEffect, useState } from "react";
import { ConditionType, Npc } from "./npc";
import UpdateConditions from "./update-conditions";
import Condition from "./condition";

export default function NpcConditions({npc, onConditionUpdate, onConditionDelete}: {npc: Npc, onConditionUpdate: any, onConditionDelete: any}) {
    const [edit, onEdit] = useState(false);
    if(edit){
        return <UpdateConditions id={npc.id} currentConditions={npc.conditions} onUpdateConClick={(id: number,conditions: ConditionType[]) =>{
            onEdit(false);
            onConditionUpdate(id, conditions)}
        } />
    } else {
        return (
            <>
            {npc.conditions.map((condition)=> (
            <Condition key={condition} id={npc.id} condition={condition} onDeleteCondition={onConditionDelete}  />
          ))}
            <button type="button" onClick={x => onEdit(true)} >Edit</button>
            </>
        )
    }
}