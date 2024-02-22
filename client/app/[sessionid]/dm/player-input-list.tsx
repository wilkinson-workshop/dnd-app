import { PlayerInput } from "@/app/_apis/playerInput"
import { Box, Button, Grid, styled } from "@mui/material"
import { FC } from "react"

export interface PlayerInputListProps { playerInputs: PlayerInput[], handleClickClearResults: () => void }

export const PlayerInputList: FC<PlayerInputListProps> = ({ playerInputs, handleClickClearResults }) => {

    return (
        <div>
            {playerInputs.map(input => (
                <div key={input.client_uuid} style={{ border: '1px solid lightgray' }}>
                    <Box>
                        <Grid container spacing={2}>
                            <Grid item xs={4} sm={4}>
                                <Box className="item">{input.name}</Box>
                            </Grid>
                            <Grid item xs={4} sm={4}>
                                <Box className="item">{input.reason}</Box>
                            </Grid>
                            <Grid item xs={4} sm={4}>
                                <Box className="item">{input.value}</Box>
                            </Grid>
                        </Grid>
                    </Box>
                </div>
            ))}
            <Button variant="contained" aria-label="end session" onClick={handleClickClearResults}>
                Clear Results
            </Button>
        </div>
    )
}