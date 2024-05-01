import { Box, Button, IconButton, TextField } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { FC, useEffect, useState } from "react";
import { SpecialAbility, Spellcasting, Usage } from "@/app/_apis/dnd5eTypings";
import { CustomAbilityItem } from "./custom-ability-item";

export interface CustomAbilityProps{
    currentAbilities: SpecialAbility[]
    updateAbilities: (abilities: SpecialAbility[]) => void
}

export const CustomAbilities: FC<CustomAbilityProps> = ({currentAbilities, updateAbilities}) => {
    const [abilities, setAbilities] = useState<SpecialAbility[]>(currentAbilities);

    useEffect(() => {
        setAbilities(currentAbilities);
    }, [currentAbilities]);

    function addAbility(){
        let newAbilities = abilities.slice();
        newAbilities.push({name: '', desc: '', usage: undefined, spellcasting: undefined});

        setAbilities(newAbilities);
    }

    function handleSubmitAbilities(ability: SpecialAbility, index: number){
        let newAbilities = abilities.slice();
        if(ability.name == '' || ability.desc == ''){           
            newAbilities.splice(index, 1);
            setAbilities(newAbilities);
        } else {
            newAbilities[index] = ability;
            setAbilities(newAbilities);            
        }
        updateAbilities(newAbilities)
    }

    return (
    <>
        {abilities.map((a,i) => (<CustomAbilityItem key={i} currentAbility={a} saveAbility={(ability) => handleSubmitAbilities(ability, i)} />))}
        <Button variant="contained" endIcon={<AddIcon />} onClick={addAbility}>
            Add Ability
        </Button>
    </>
    );
}