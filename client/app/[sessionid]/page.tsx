'use client'

import { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { useRouter } from "next/navigation";

export default function PlayerPage({ params }: { params: { sessionid: string }}) {
  const [playerName, setPlayerName] = useState('');

  const router = useRouter();
  function handleJoinSubmit(e: any){
    router.push(`/${params.sessionid}/${playerName}`);
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
