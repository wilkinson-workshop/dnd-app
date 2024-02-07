import { FC, useContext, useState } from "react";
import Chip from '@mui/material/Chip';
import { GetSchema, getCondition } from "@/app/_apis/dnd5eApi";
import { Tooltip } from "@mui/material";

export interface ConditionItemProps {
    conditionId: string,
    conditionOptions: GetSchema[]
}

export const ConditionItem: FC<ConditionItemProps> = ({conditionId, conditionOptions}) => {
    const [description, setDescription] = useState('');

    function getDescription(){
        getCondition(conditionId)
        .then(c => setDescription(c.desc!));
    }

    let name = conditionOptions.find(x => x.index == conditionId)?.name;

    return (<>
    <Tooltip disableFocusListener title={description}>
        <Chip color="info" size="small" clickable onClick={getDescription} label={name} />
    </Tooltip>
    </>);
}