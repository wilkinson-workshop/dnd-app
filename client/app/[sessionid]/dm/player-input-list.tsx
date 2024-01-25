import { PlayerInput } from "@/app/_apis/playerInput"
import { Button } from "@mui/material"
import { FC } from "react"

export interface PlayerInputListProps{playerInputs: PlayerInput[]}

export const PlayerInputList: FC<PlayerInputListProps> = ({playerInputs}) => {

    function handleClickClearResults(){
        
    }

    return (
        <div>
        {playerInputs.map(input => (
            <div key={input.clientId + "" + Math.random().toPrecision(1)}>
                Name: {input.name} - Value: {input.input}
            </div>
            ))} 
            <Button variant="contained" aria-label="end session" onClick={handleClickClearResults}>
                Clear Results
            </Button>
        </div>
    )
}