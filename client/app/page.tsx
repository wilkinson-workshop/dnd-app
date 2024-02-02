'use client'

import { createSession, getSessions } from "./_apis/sessionApi";
import { useEffect, useState } from "react";
import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [session, setSession] = useState<string>('');
  const [sessionOptions, setSessionOptions] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    getAllSessions();
  }, []);    

  function getAllSessions(){
    getSessions()
    .then(sessions => {
      setSessionOptions(sessions);
    });
  }

  function joinActiveSession(selectedSession:string){
    router.push(`/${selectedSession}/dm`);
  }

  function handleCreateSession(){
    createSession()
    .then(session => {
      let newSessionOtions = sessionOptions.slice();
      newSessionOtions.push(session);

      setSessionOptions(newSessionOtions);
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
            value={session}
            label="Session"
            onChange={handleChangeSession}
          >
            {sessionOptions.map(s =>  
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
