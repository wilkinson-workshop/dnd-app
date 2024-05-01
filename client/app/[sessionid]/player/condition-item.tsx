import { FC, useState } from "react";
import Chip from '@mui/material/Chip';
import { getCondition } from "@/app/_apis/dnd5eApi";
import { DescriptionTooltip } from "@/app/description-tooltip";
import { APIReference } from "@/app/_apis/dnd5eTypings";

export interface ConditionItemProps {
    conditionId: string,
    conditionOptions: APIReference[]
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