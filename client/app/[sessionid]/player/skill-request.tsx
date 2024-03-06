import { INIT_DESC, getSkill } from "@/app/_apis/dnd5eApi";
import { APIReference } from "@/app/_apis/dnd5eTypings";
import { DescriptionTooltip } from "@/app/description-tooltip";
import { Box, Button, TextField, Link, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { FC, useEffect, useState } from "react";
import Dialog from '@mui/material/Dialog';

export interface SkillRequestProps {
    isOpen: boolean,
    skillName: string,
    diceType: number,
    skillOptions: APIReference[],
    sendValue: (rollValue: number) => void
}

export const SkillRequest: FC<SkillRequestProps> = ({ isOpen, skillName, diceType, skillOptions, sendValue }) => {
    const [open, setOpen] = useState(false);
    const [rollValue, setRollValue] = useState(0);
    const [description, setDescription] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setOpen(true);
        }
    }, [isOpen]);

    useEffect(() => {
        setDescription([]);
    }, [skillName])

    function handleInputSubmit() {
        sendValue(rollValue);
        setRollValue(0);
        setOpen(false);
    }

    function getDescription(skillId: string) {
        if (skillId == 'initiative') {
            setDescription([INIT_DESC]);
            return;
        }

        getSkill(skillId)
            .then(c => setDescription(c.desc));
    }

    let index = skillOptions.find(x => x.name == skillName)?.index;

    return (
        <>
            {open ?
                (<Dialog open={open}>
                    <DialogTitle sx={{ m: 0, p: 2 }}>
                        Input Requested
                    </DialogTitle>
                    <DialogContent>
                        <Box>
                            <Box sx={{ mb: 2 }}>
                                {`The DM has requested input for a ${diceType} sided dice for `}
                                <DescriptionTooltip title={description.join('\n')}>
                                    <Link href="#" onClick={() => getDescription(index? index: '')}>{skillName}</Link>
                                </DescriptionTooltip>
                            </Box>
                            <TextField hiddenLabel size="small" label="Roll" value={rollValue} variant="outlined" onChange={x => setRollValue(Number.parseInt(x.target.value ? x.target.value : '0'))} />

                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" aria-label="send dice roll" onClick={handleInputSubmit}>
                            Send
                        </Button>
                    </DialogActions>
                </Dialog>) : ''}
        </>
    );
}