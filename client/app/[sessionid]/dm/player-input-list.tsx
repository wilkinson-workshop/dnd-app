import { PlayerInput } from "@/app/_apis/playerInput"
import { clearSessionInput } from "@/app/_apis/sessionApi"
import { Box, Button, Grid, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material"
import { FC, useContext, useEffect, useState } from "react"
import Dialog from '@mui/material/Dialog';
import CloseIcon from '@mui/icons-material/Close';
import { SessionContext } from "./session-context";

export interface PlayerInputListProps {
    playerInputs: PlayerInput[],
}

export const PlayerInputList: FC<PlayerInputListProps> = ({ playerInputs }) => {
    const [open, setOpen] = useState(false);
    const [inputs, setInputs] = useState<PlayerInput[]>([]);

    let sessionId = useContext(SessionContext);

    useEffect(() => {
        setInputs(playerInputs);
    }, [playerInputs])

    function handleClearPlayerInput() {
        clearSessionInput(sessionId)
            .then(_ => {
                setInputs([]);
                setOpen(false);
            })
    }

    return (
        <>
            {open ?
                (<Dialog onClose={_ => setOpen(false)} open={open}>
                    <DialogTitle sx={{ m: 0, p: 2 }}>
                        Player Input
                    </DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={_ => setOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <DialogContent>
                        <Box sx={{ minWidth: '400px' }}>
                            {inputs.map(input => (
                                <Box key={input.client_uuid + input.reason}>
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
                            ))}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" aria-label="end session" onClick={handleClearPlayerInput}>
                            Clear Results
                        </Button>
                    </DialogActions>
                </Dialog>) : (<>
                    {inputs.length > 0 ? (
                        <Button variant="contained" onClick={_ => setOpen(true)}>
                            {`View Player Input (${inputs.length})`}
                        </Button>
                    ) : ''}
                </>)}
        </>
    )
}
