'use client'

import { useContext, useEffect, useState } from "react";
import { Box, Button, TextField, Switch, FormControl, FormControlLabel } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import storage from "../common/sessionStorage";
import { OBSERVER_NAME } from "../_apis/character";

export default function PlayerPage() {
	const [playerName, setPlayerName] = useState('');
	const [isObserver, setIsObserver] = useState(false);

	const name = storage().getItem("player-name")!;

	useEffect(() => {
		const exitingPlayerName = name;
		if (exitingPlayerName) {
			setPlayerName(exitingPlayerName);
		}
	})

	const router = useRouter();

	const searchParams = useSearchParams();
	const sessionId = searchParams.get('sessionId');
	if(sessionId){
		storage().setItem("session", sessionId);
	}

	function handleIsObserver(event: React.ChangeEvent<HTMLInputElement>) {
		const newValue = event.target.checked;
		setIsObserver(newValue);
		if (newValue) {
			setPlayerName(OBSERVER_NAME);
		} else {
			setPlayerName('');
		}
	}

	function handleJoinSubmit(e: any) {
		storage().setItem("player-name", playerName);
		router.push('/session/player');
	}

	return (
		<Box sx={{ textAlign: 'center' }}>
			<FormControl component="fieldset" variant="standard">
				<FormControlLabel
					control={
						<Switch checked={isObserver} onChange={handleIsObserver} inputProps={{ 'aria-label': 'controlled' }} />
					}
					label="Observer"
				/>
			</FormControl>
			<TextField size="small" label="Name" disabled={isObserver} value={playerName} variant="outlined" onChange={x => setPlayerName(x.target.value)} />
			<Button variant="contained" aria-label="join session" onClick={handleJoinSubmit}>
				Join Session
			</Button>
		</Box>
	)
}
