import { Box, Button, IconButton, TextField } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { FC, useState } from "react";
import { Action } from "@/app/_apis/dnd5eTypings";

export interface CustomActionsProps{
    currentActions: Action[]
    updateActions: (actions: Action[]) => void
}

export const CustomActions: FC<CustomActionsProps> = ({currentActions, updateActions}) => {
    const [actions, setActions] = useState<Action[]>(currentActions);

    function addAction(){
        let newActions = actions.slice();
        newActions.push({name: '', desc: ''});

        setActions(newActions);
    }

    function updateName(name: string, index: number){
        let newActions = actions.slice();
        newActions[index].name = name;
        setActions(newActions);
    }

    function updateDesc(desc: string, index: number){
        let newActions = actions.slice();
        newActions[index].desc = desc;
        setActions(newActions);
    }

    function handleSubmitActions(){
        //delete any empty actions added.


        updateActions(actions);
    }

    return (
    <>
        {actions.map((a,i) => (                
                <Box key={i} sx={{ margin: '10px 0' }}>
                    <TextField sx={{ width: 300 }} size="small" label="Name" value={a.name} variant="outlined" onChange={x => updateName(x.target.value, i)} />
                    <TextField multiline sx={{ width: 300 }} size="small" label="Description" value={a.desc} variant="outlined" onChange={x => updateDesc(x.target.value, i)} />
                </Box>))}

        <Button variant="contained" endIcon={<AddIcon />} onClick={addAction}>
            Add Action
        </Button>
        <Button variant="contained" onClick={handleSubmitActions}>
            Done
        </Button>
    </>
    );
}