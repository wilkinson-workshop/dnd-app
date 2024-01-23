import { ConditionOptions, ConditionType } from "../../_apis/character"
import Chip from '@mui/material/Chip';

export default function Condition({id, condition, onDeleteCondition}: {id: string, condition:ConditionType, onDeleteCondition:any}) {
    const conditionName = ConditionOptions.filter(x => x.id == condition)[0].name;
    const conditionClass = conditionName.toLocaleLowerCase().replace(/\s/, '-');

    return <Chip color="info" size="small"  label={conditionName} onDelete={() => onDeleteCondition(id, condition)} />

    return <div className={`condition ${conditionClass}`}>{conditionName} 
        <button type="button" onClick={() => onDeleteCondition(id, condition)}>X</button>
    </div>;
}