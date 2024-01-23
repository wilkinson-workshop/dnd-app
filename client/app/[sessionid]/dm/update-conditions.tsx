import { FC, useState } from "react";
import { ConditionOptions, ConditionType } from "../../_apis/character";

import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { IconButton } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save'

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

export interface UpdateConditionProps {id: string, currentConditions: ConditionType[], onUpdateConClick: any}

export const UpdateConditions:FC<UpdateConditionProps> = ({id, currentConditions, onUpdateConClick}) => {
    const [conditions, setConditions] = useState(currentConditions);

    const handleChange = (event: SelectChangeEvent<typeof conditions>) => {  
      const {  
        target: { value },  
      } = event;  
      setConditions(  
        // On autofill we get a stringified value.  
        typeof value === 'string' ? [ConditionType.Asleep] : value,  
      );  
    };   
  
    return (  
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
        <IconButton aria-label="save" onClick={_ => onUpdateConClick(id, conditions)}>
            <SaveIcon />
        </IconButton>
      </div>  
    );
}