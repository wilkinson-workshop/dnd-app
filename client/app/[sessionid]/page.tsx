'use client'

import { useEffect, useState } from "react";
import { Box, Button, TextField, Switch, FormControl, FormControlLabel } from "@mui/material";
import { useRouter } from "next/navigation";
import { getName, setName } from "../_apis/sessionStorage";
import { OBSERVER_NAME } from "../_apis/character";

const label = { inputProps: { 'aria-label': 'Switch demo' } };

export default function PlayerPage({ params }: { params: { sessionid: string } }) {
	const [playerName, setPlayerName] = useState('');
	const [isObserver, setIsObserver] = useState(false);

	useEffect(() => {
		const exitingPlayerName = getName();
		if (exitingPlayerName) {
			setPlayerName(exitingPlayerName);
		}
	})

	const router = useRouter();

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
		setName(playerName);
		router.push(`/${params.sessionid}/player`);
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
