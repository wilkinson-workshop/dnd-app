import { GetAllItem, INIT_DESC, getSkil } from "@/app/_apis/dnd5eApi";
import { DescriptionTooltip } from "@/app/description-tooltip";
import { Box, Button, TextField, Link } from "@mui/material";
import { FC, useEffect, useState } from "react";

export interface SkillRequestProps {
    skillName: string,
    diceType: number,
    skillOptions: GetAllItem[],
    sendValue: (rollValue: number) => void
}

export const SkillRequest: FC<SkillRequestProps> = ({skillName, diceType, skillOptions, sendValue}) => {
    const [rollValue, setRollValue] = useState(0);
    const [description, setDescription] = useState<string[]>([]);

    useEffect(()=> {
        setDescription([]);
    }, [skillName])

    function handleInputSubmit(){
        sendValue(rollValue);
        setRollValue(0);
    }

    function getDescription(skillId: string){
        if(skillId == 'initiative'){
            setDescription([INIT_DESC]);
            return;
        }
        
        getSkil(skillId)
        .then(c => setDescription(c.desc));
    }
    
    let index = skillOptions.find(x => x.name == skillName)!.index;

    return (        
    <Box>
       <Box sx={{mb:2}}>
            {`The DM has requested input for a ${diceType} sided dice for `} 
            <DescriptionTooltip title={description.join('\n')}>
                <Link href="#" onClick={() => getDescription(index)}>{skillName}</Link>
            </DescriptionTooltip>
       </Box>
      <TextField hiddenLabel size="small" label="Roll" value={rollValue} variant="outlined" onChange={x => setRollValue(Number.parseInt(x.target.value? x.target.value : '0'))} />
      <Button variant="contained" aria-label="send dice roll" onClick={handleInputSubmit}>
        Send
      </Button>          
    </Box>
  );
}