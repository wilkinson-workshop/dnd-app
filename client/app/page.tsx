'use client'

import Link from "next/link";
import { createSession, getSessions, joinSession } from "./_apis/sessionApi";
import { useState } from "react";
import { createClient } from "./_apis/clientApi";
import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { CharacterType } from "./_apis/character";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [session, setSession] = useState<string>('');
  const [sessions, setSessions] = useState<string[]>([]);
  const [client, setClient] = useState<string>('');  
  const [hasClient, setHasClient] = useState(false);

  const router = useRouter();

  if(!hasClient){
    setHasClient(true);//assumes success no retry logic
    createClient()
    .then(c => {
      setClient(c);
    });
    getAllSessions();

  }

  function getAllSessions(){
    getSessions()
    .then(sessions => {
      setSessions(sessions.map(s => s[0]))
    });
  }

  function joinActiveSession(){
    joinSession(session, {clientId: client, name: 'DM', type: CharacterType.DuneonMaster})
    .then(_=> router.push(`/${session}/dm`));
  }


  function handleCreateSession(){
    createSession()
    .then(session => {
      setSession(session);
      joinActiveSession();
    });
  }

  function handleChangeSession(event: SelectChangeEvent<typeof session>){
    const {  
      target: { value },  
    } = event; 
    setSession(value);
  }

  return ( 
    <div>
        <FormControl fullWidth>
          <InputLabel id="session">Session</InputLabel>
          <Select
            labelId="session"
            id="demo-simple-select"
            value={session}
            label="Session"
            onChange={handleChangeSession}
          >
            {sessions.map(s =>  
            <MenuItem key={s} value={s}>{s}</MenuItem>
            )}
          </Select>
      </FormControl>
      <Button variant="contained" aria-label="create session" onClick={joinActiveSession}>
        Join
      </Button>

      <Button variant="contained" aria-label="create session" onClick={handleCreateSession}>
        Create Session
      </Button>
    </div>
    );
}
