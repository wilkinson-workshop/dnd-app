import { FC, useState } from "react";
import { Action } from "@/app/_apis/dnd5eTypings";
import { Box, Button, IconButton, TextField } from "@mui/material";

export interface CustomActionItemProps {
    currentAction: Action,
    saveAction: (action: Action) => void
}

export const CustomActionItem: FC<CustomActionItemProps> = ({ currentAction, saveAction }) => {
    const [isEdit, setIsEdit] = useState(true);
    const [action, setAction] = useState(currentAction)

    function updateName(name: string) {
        setAction(a => { return { ...a, name: name } });
    }

    function updateDesc(desc: string) {
        setAction(a => { return { ...a, desc: desc } });
    }

    function handleSave() {
        setIsEdit(false);        
        saveAction(action);
    }

    return (
        <>
            {isEdit ?
                (<Box sx={{ margin: '10px 0' }}>
                    <TextField sx={{ width: 300 }} size="small" label="Name" value={action.name} variant="outlined" onChange={x => updateName(x.target.value)} />
                    <TextField multiline sx={{ width: 300 }} size="small" label="Description" value={action.desc} variant="outlined" onChange={x => updateDesc(x.target.value)} />
                    <Box>
                        <Button variant="contained" onClick={handleSave}>
                            Save
                        </Button>
                    </Box>
                </Box>) : (
                    <Box sx={{ marginBottom: 1, paddingBottom: 1, borderBottom: '1px solid lightgrey' }} >
                        <Box className="bold-label">{action.name}</Box>
                        <Box sx={{ whiteSpace: 'pre-wrap' }}>{action.desc}</Box>
                    </Box>
                )}
        </>
    )
}