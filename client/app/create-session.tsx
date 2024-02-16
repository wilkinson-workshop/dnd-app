'use client'

import { FC, useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { Session } from "./_apis/session";
import { EMPTY_GUID } from "./_apis/character";

export interface CharacterConditionsProps {
    onAddClick: (session: Session) => void
}

export const CreateSession: FC<CharacterConditionsProps> = ({onAddClick}) => {
    const [edit, onEdit] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    function handleSubmit(): void {
        onEdit(false);
        onAddClick({
            session_name: name, 
            session_description: description,
            session_uuid: EMPTY_GUID
        });
        resetForm();
    }

    function handleCancel(): void {
        onEdit(false);
        resetForm();
    }

    function resetForm(){
        setName('');
        setDescription('');
    }

    if(edit){ return (
        <>
            <Box>
                <Box sx={{margin: '10px 0'}}>
                    <TextField sx={{ width: 300 }} size="small" label="Name" value={name} variant="outlined" onChange={x => setName(x.target.value)} />
                </Box>
                <Box sx={{margin: '10px 0'}}>
                    <TextField sx={{ width: 300 }} size="small" multiline label="Description" value={description} variant="outlined" onChange={x => setDescription(x.target.value)} />
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