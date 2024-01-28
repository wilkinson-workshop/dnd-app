'use client'

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
      setSessions(sessions.map(s => s))
    });
  }

  function joinActiveSession(selectedSession:string){
    joinSession(selectedSession, {client_uuid: client, name: 'DM', role: CharacterType.DungeonMaster})
    .then(_=> {
      router.push(`/${selectedSession}/dm`);
    });
  }

  function handleCreateSession(){
    createSession()
    .then(session => {     
      joinActiveSession(session);
      setSession(session);
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
            value={''}
            label="Session"
            onChange={handleChangeSession}
          >
            {sessions.map(s =>  
            <MenuItem key={s} value={s}>{s}</MenuItem>
            )}
          </Select>
      </FormControl>
      <Button variant="contained" aria-label="create session" onClick={() => joinActiveSession(session)}>
        Join
      </Button>

      <Button variant="contained" aria-label="create session" onClick={handleCreateSession}>
        Create Session
      </Button>
    </div>
    );
}
