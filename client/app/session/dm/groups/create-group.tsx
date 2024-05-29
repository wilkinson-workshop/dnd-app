'use client'

import { FC, useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { EMPTY_GUID } from "@/app/_apis/character";
import { SessionGroup } from "@/app/_apis/sesssionGroup";

export interface CreateGroupProps {
    onAddClick: (session: SessionGroup) => void
}

export const CreateGroup: FC<CreateGroupProps> = ({onAddClick}) => {
    const [edit, onEdit] = useState(false);
    const [name, setName] = useState('');

    function handleSubmit(): void {
        onEdit(false);
        onAddClick({
            group_name: name,
            characters: [],
            group_uuid: EMPTY_GUID
        });
        resetForm();
    }

    function handleCancel(): void {
        onEdit(false);
        resetForm();
    }

    function resetForm(){
        setName('');
    }

    if(edit){ return (
        <>
            <Box>
                <Box sx={{margin: '10px 0'}}>
                    <TextField sx={{ width: 300 }} size="small" label="Name" value={name} variant="outlined" onChange={x => setName(x.target.value)} />
                </Box>
                <Box sx={{margin: '10px 0'}}>
                    <Button variant="contained" aria-label="add" onClick={handleSubmit}>
                        Save
                    </Button>
                    <Button variant="contained" aria-label="cancel" onClick={handleCancel}>
                        Cancel
                    </Button>    
                </Box>
            </Box>
        </>
        )
    } else {
        return (
            <>
                <Button variant="contained" onClick={_ => onEdit(true)}>
                    Create
                </Button>
            </>
        )
    }  
}