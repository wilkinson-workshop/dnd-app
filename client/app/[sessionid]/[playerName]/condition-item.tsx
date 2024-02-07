import { FC, useState } from "react";
import Chip from '@mui/material/Chip';
import { GetAllItem, getCondition } from "@/app/_apis/dnd5eApi";
import { DescriptionTooltip } from "@/app/description-tooltip";

export interface ConditionItemProps {
    conditionId: string,
    conditionOptions: GetAllItem[]
}

export const ConditionItem: FC<ConditionItemProps> = ({conditionId, conditionOptions}) => {
    const [description, setDescription] = useState<string[]>([]);

    function getDescription(){
        getCondition(conditionId)
        .then(c => setDescription(c.desc));
    }

    let name = conditionOptions.find(x => x.index == conditionId)?.name;

    return (<>
    <DescriptionTooltip title={description.join('\n')}>
        <Chip color="info" size="small" clickable onClick={getDescription} label={name} />
    </DescriptionTooltip>
    </>);
}