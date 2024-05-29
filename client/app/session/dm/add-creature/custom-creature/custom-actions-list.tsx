import { Box, Button, IconButton, TextField } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { FC, useEffect, useState } from "react";
import { Action } from "@/app/_apis/dnd5eTypings";
import { CustomActionItem } from "./custom-action-item";

export interface CustomActionsProps{
    currentActions: Action[]
    updateActions: (actions: Action[]) => void
}

export const CustomActions: FC<CustomActionsProps> = ({currentActions, updateActions}) => {
    const [actions, setActions] = useState<Action[]>(currentActions);

    useEffect(() => {
        setActions(currentActions);
    }, [currentActions]);

    function addAction(){
        let newActions = actions.slice();
        newActions.push({name: '', desc: ''});

        setActions(newActions);
    }

    function handleSubmitActions(action: Action, index: number){
        let newActions = actions.slice();
        if(action.name == '' || action.desc == ''){
            newActions.splice(index, 1);
            setActions(newActions);
        } else {
            newActions[index] = action;
            setActions(newActions);            
        }
        updateActions(newActions);
    }

    return (
    <>
        {actions.map((a,i) => (<CustomActionItem key={i} currentAction={a} saveAction={(action) => handleSubmitActions(action, i)} />))}
        <Button variant="contained" endIcon={<AddIcon />} onClick={addAction}>
            Add Action
        </Button>
    </>
    );
}