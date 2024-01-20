import { ConditionOptions, ConditionType } from "../../_apis/npc"

export default function Condition({id, condition, onDeleteCondition}: {id: string, condition:ConditionType, onDeleteCondition:any}) {
    const conditionName = ConditionOptions.filter(x => x.id == condition)[0].name;
    const conditionClass = conditionName.toLocaleLowerCase().replace(/\s/, '-');

    return <div className={`condition ${conditionClass}`}>{conditionName} 
        <button type="button" onClick={() => onDeleteCondition(id, condition)}>X</button>
    </div>;
}