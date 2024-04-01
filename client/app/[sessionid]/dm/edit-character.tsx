import { FC, FormEvent, useContext, useEffect, useState } from "react";
import { Character, CharacterType, HpBoundaryOptions } from "../../_apis/character";
import { Box, Button, TextField, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { HpAdjust } from "./hp-adjust";
import { AlertInfo, Alerts } from "../alert/alerts";
import Dialog from '@mui/material/Dialog';
import CloseIcon from '@mui/icons-material/Close';
import { CharacterHp } from "./character-hp";
import { ConditionsContext } from "../../common/conditions-context";


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

export interface EditCharacterProps {
    existingCharacter: Character | null,
    onSaveClick: (character: Character) => void
    onCancelClick: () => void
}

export const EditCharacter: FC<EditCharacterProps> = ({ existingCharacter, onSaveClick, onCancelClick }) => {
    const [edit, onEdit] = useState(false);
    const [currentHp, setCurrentHp] = useState(1);
    const [maxHp, setMaxHp] = useState(1)
    const [initiative, setInitiative] = useState('1');
    const [name, setName] = useState('Creature');
    const [conditions, setConditions] = useState<string[]>([]);
    const [alert, setAlert] = useState<AlertInfo | null>(null);

    const conditionOptions = useContext(ConditionsContext);

    const isPlayer = existingCharacter ? existingCharacter.role == CharacterType.Player : false;

    useEffect(() => {
        if (existingCharacter != null) {
            setCurrentHp(existingCharacter.hit_points[0]);
            setMaxHp(existingCharacter.hit_points[1])
            setInitiative(existingCharacter.initiative.toString());
            setName(existingCharacter.name);
            setConditions(existingCharacter.conditions);
            onEdit(true);
        }
    }, [existingCharacter]);

    function handleSubmit(): void {
        if (currentHp > maxHp) {
            console.log("Can't set HP more then the max")
            return;
        }

        const newInit = Number.parseFloat(initiative ? initiative : '0')

        if (existingCharacter) {
            onSaveClick({
                creature_id: existingCharacter.creature_id,
                initiative: newInit,
                name: name,
                hit_points: [currentHp, maxHp],
                conditions: conditions,
                role: existingCharacter.role,
                monster: existingCharacter.monster
            });
            onEdit(false);
            resetForm();
        }
    }

    function handleCancel(): void {
        onEdit(false);
        resetForm();
        onCancelClick();
    }

    function resetForm() {
        setInitiative('1');
        setCurrentHp(1);
        setMaxHp(1);
        setName('Creature');
        setConditions([]);
        setAlert(null);
    }

    const handleConditionsChange = (event: SelectChangeEvent<typeof conditions>) => {
        const {
            target: { value },
        } = event;
        setConditions(
            // On autofill we get a stringified value.  
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    function updateExistingCurrentHp(newHp: number) {
        if (newHp < 0) {
            setCurrentHp(0);
            return;
        }

        if (newHp > maxHp) {
            setCurrentHp(maxHp);
            return;
        }

        setCurrentHp(newHp);
        return;
    }

    const hpEdit = () => {
        if (isPlayer) {
            return (
                <Select
                    labelId="label"
                    id="select"
                    value={currentHp}
                    label="HP"
                    onChange={(x) => setCurrentHp(Number.parseInt(x.target.value.toString()))}
                >
                    {HpBoundaryOptions.map(o => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}

                </Select>
            )
        } else {
            return (
            <>
                <CharacterHp character={{...existingCharacter!, hit_points: [currentHp, maxHp]}} />
                <HpAdjust hp={currentHp} updateHp={x => updateExistingCurrentHp(x)} />
            </>);
        }
    }

    return (
        <>
            {edit ?
                (<Dialog onClose={handleCancel} open={edit}>
                    <DialogTitle sx={{ m: 0, p: 2 }}>
                        {`Edit ${existingCharacter!.name}`}
                    </DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={handleCancel}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <DialogContent sx={{pt:0}}>
                        <Alerts info={alert} />
                        <Box>
                            <Box sx={{ margin: '10px 0' }}>
                                <TextField sx={{ width: 100 }} size="small" label="Initiative" value={initiative} variant="outlined" onChange={x => setInitiative(x.target.value)} />
                            </Box>
                            <Box sx={{ margin: '10px 0' }}>
                                <TextField disabled={existingCharacter?.role == CharacterType.Player} sx={{ width: 300 }} size="small" label="Name" value={name} variant="outlined" onChange={x => setName(x.target.value)} />
                            </Box>
                            <Box sx={{ margin: '10px 0' }}>
                                {hpEdit()}
                            </Box>
                            <Box sx={{ margin: '10px 0' }}>
                                <FormControl sx={{ width: 300 }}>
                                    <InputLabel id="label">Conditions</InputLabel>
                                    <Select
                                        labelId="label"
                                        id="name"
                                        multiple
                                        value={conditions}
                                        onChange={handleConditionsChange}
                                        input={<OutlinedInput size="small" label="Conditions" />}
                                        MenuProps={MenuProps}
                                    >
                                        {conditionOptions.map(c =>
                                            <MenuItem
                                                key={c.index}
                                                value={c.index}
                                            >
                                                {c.name}
                                            </MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" aria-label="add" onClick={handleSubmit}>
                            Save
                        </Button>
                        <Button variant="contained" aria-label="cancel" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>) : ''}
        </>)
}