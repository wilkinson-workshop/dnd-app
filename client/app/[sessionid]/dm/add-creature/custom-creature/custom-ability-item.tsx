import { FC, useEffect, useState } from "react";
import { SpecialAbility } from "@/app/_apis/dnd5eTypings";
import { Box, Button, TextField } from "@mui/material";

export interface CustomAbilityItemProps {
    currentAbility: SpecialAbility,
    saveAbility: (action: SpecialAbility) => void
}

export const CustomAbilityItem: FC<CustomAbilityItemProps> = ({ currentAbility, saveAbility }) => {
    const [isEdit, setIsEdit] = useState(true);
    const [ability, setAbility] = useState(currentAbility)

    useEffect(() => {
        setAbility(currentAbility);
        if(currentAbility.name != ''){
            setIsEdit(false)
        }
    }, [currentAbility]);

    function updateName(name: string) {
        setAbility(a => { return { ...a, name: name } });
    }

    function updateDesc(desc: string) {
        setAbility(a => { return { ...a, desc: desc } });
    }

    function handleSave() {
        setIsEdit(false);        
        saveAbility(ability);
    }

    return (
        <>
            {isEdit ?
                (<Box sx={{ margin: '10px 0' }}>
                    <TextField sx={{ width: 300 }} size="small" label="Name" value={ability.name} variant="outlined" onChange={x => updateName(x.target.value)} />
                    <TextField multiline sx={{ width: 300 }} size="small" label="Description" value={ability.desc} variant="outlined" onChange={x => updateDesc(x.target.value)} />
                    <Box>
                        <Button variant="contained" onClick={handleSave}>
                            Save
                        </Button>
                    </Box>
                </Box>) : (
                    <Box sx={{ marginBottom: 1, paddingBottom: 1, borderBottom: '1px solid lightgrey' }} >
                        <Box className="bold-label">{ability.name}</Box>
                        <Box sx={{ whiteSpace: 'pre-wrap' }}>{ability.desc}</Box>
                    </Box>
                )}
        </>
    )
}