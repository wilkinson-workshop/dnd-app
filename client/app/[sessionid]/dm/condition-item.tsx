import { FC, useContext, useState } from "react";
import Chip from '@mui/material/Chip';
import { getCondition } from "@/app/_apis/dnd5eApi";
import { DescriptionTooltip } from "@/app/description-tooltip";
import { ConditionsContext } from "../../common/conditions-context";

export interface ConditionItemProps {
    conditionId: string,
    onDeleteCondition: (condition: string) => void
}

export const ConditionItem: FC<ConditionItemProps> = ({conditionId, onDeleteCondition}) => {
    const conditionOptions = useContext(ConditionsContext);
    const [description, setDescription] = useState<string[]>([]);

    function getDescription(){
        getCondition(conditionId)
        .then(c => setDescription(c.desc));
    }

    let name = conditionOptions.find(x => x.index == conditionId)?.name;

    return (<>
    <DescriptionTooltip title={description.join('\n')}>
        <Chip color="info" size="small" clickable onClick={getDescription} label={name} onDelete={() => onDeleteCondition(conditionId)} />
    </DescriptionTooltip>
    </>);
}