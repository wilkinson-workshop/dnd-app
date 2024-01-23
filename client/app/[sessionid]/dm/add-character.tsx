import { FC, FormEvent, useState } from "react";
import { Character, CharacterType, ConditionOptions, ConditionType } from "../../_apis/character";
import { Button, Grid, IconButton, TextField } from "@mui/material";
import AddIcon from '@mui/icons-material/Add'
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';


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

export interface AddCharacterProps{
    onAddClick: (character: Character) => void
}

export const AddCharacter:FC<AddCharacterProps> = ({onAddClick}) => {
    const [edit, onEdit] = useState(false);
    const [hp, setHp] = useState(1);
    const [initiative, setInitiative] = useState(1);
    const [name, setName] = useState('Character');
    const [conditions, setConditions] = useState<ConditionType[]>([]);

    function handleSubmit(): void {
        onEdit(false);
        onAddClick({
            id: '', //use database for this.
            initiative: initiative,
            name: name, 
            hp: hp, 
            conditions:conditions,
            type: CharacterType.NonPlayer
          });
          setHp(1);
          setName('Character')
          setConditions([]);
        }

        const handleChange = (event: SelectChangeEvent<typeof conditions>) => {  
            const {  
              target: { value },  
            } = event;  
            setConditions(  
              // On autofill we get a stringified value.  
              typeof value === 'string' ? [ConditionType.Asleep] : value,  
            );  
          }; 

      if(edit){ return (
        <>
            <div>
                <TextField size="small" label="Initiative" value={initiative} variant="outlined" onChange={x => setInitiative(Number.parseInt(x.target.value? x.target.value : '0'))} />
            </div>
            <div>
                <TextField size="small" label="Name" value={name} variant="outlined" onChange={x => setName(x.target.value)} />
            </div>
            <div>
                <TextField size="small" label="HP" value={hp} variant="outlined" onChange={x => setHp(Number.parseInt(x.target.value? x.target.value : '0'))} />
            </div>
            <div>
                <FormControl sx={{ m: 1, width: 300 }}>  
                    <InputLabel id="label">Conditions</InputLabel>  
                    <Select  
                        labelId="label"  
                        id="name"  
                        multiple  
                        value={conditions}  
                        onChange={handleChange}  
                        input={<OutlinedInput size="small" label="Conditions" />}  
                        MenuProps={MenuProps}  
                    >  
                        {ConditionOptions.map(c =>  
                        <MenuItem  
                            key={c.id}  
                            value={c.id} 
                        >  
                            {c.name}  
                        </MenuItem>  
                        )}  
                    </Select>  
                </FormControl> 
            </div>
            <div>
                <Button variant="contained" aria-label="add" onClick={handleSubmit}>
                    Add
                </Button>
                <Button variant="contained" aria-label="cancel" onClick={_ => onEdit(false)}>
                    Cancel
                </Button>

            </div>
        </>
        )
      } else {
          return (
            <>
                <IconButton aria-label="save" onClick={_ => onEdit(true)}>
                    <AddIcon />
                </IconButton>
            </>
          )
      }    
}