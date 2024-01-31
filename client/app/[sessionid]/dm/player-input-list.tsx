import { PlayerInput } from "@/app/_apis/playerInput"
import { Button } from "@mui/material"
import { FC } from "react"

export interface PlayerInputListProps{playerInputs: PlayerInput[]}

export const PlayerInputList: FC<PlayerInputListProps> = ({playerInputs}) => {

    function handleClickClearResults(){
        //do something on the parent to clear results...
    }

    return (
        <div>
        {playerInputs.map(input => (
            <div key={input.name }>
                Name: {input.name} - Value: {input.value}
            </div>
            ))} 
            <Button variant="contained" aria-label="end session" onClick={handleClickClearResults}>
                Clear Results
            </Button>
        </div>
    )
}