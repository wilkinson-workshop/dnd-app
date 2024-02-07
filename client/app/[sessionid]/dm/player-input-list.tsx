import { PlayerInput } from "@/app/_apis/playerInput"
import { Button } from "@mui/material"
import { FC } from "react"

export interface PlayerInputListProps{playerInputs: PlayerInput[], handleClickClearResults: () => void}

export const PlayerInputList: FC<PlayerInputListProps> = ({playerInputs, handleClickClearResults}) => {
    return (
        <div>
        {playerInputs.map(input => (
            <div key={input.body.client_uuids[0]}>
                Name: {input.body.client_uuids[0]} - Value: {input.value}
            </div>
            ))} 
            <Button variant="contained" aria-label="end session" onClick={handleClickClearResults}>
                Clear Results
            </Button>
        </div>
    )
}