'use client'

import { useEffect, useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { getName, setName } from "../_apis/sessionStorage";

export default function PlayerPage({ params }: { params: { sessionid: string }}) {
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    const exitingPlayerName = getName();
    if(exitingPlayerName){
      setPlayerName(exitingPlayerName);
    }
  })

  const router = useRouter();

  function handleJoinSubmit(e: any){
    setName(playerName);
    router.push(`/${params.sessionid}/player`);
  }

  return (
      <Box sx={{textAlign: 'center'}}>
          <TextField size="small" label="Name" value={playerName} variant="outlined" onChange={x => setPlayerName(x.target.value)} />   
          <Button variant="contained" aria-label="join session" onClick={handleJoinSubmit}>
            Join Session
          </Button>          
      </Box>
  )    
}
