'use client'

import { createSession, getSessions } from "./_apis/sessionApi";
import { useEffect, useState } from "react";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useRouter } from "next/navigation";
import { Session } from "./_apis/session";
import { EMPTY_GUID } from "./_apis/character";

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionOptions, setSessionOptions] = useState<Session[]>([]);

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
    createSession({session_name:"test", session_description:"description", session_uuid:EMPTY_GUID})
    .then(session => {
      const fullSession = {session_name: session, session_uuid: session, session_description: session};

      let newSessionOtions = sessionOptions.slice();
      newSessionOtions.push(fullSession);
      setSessionOptions(newSessionOtions);

      joinActiveSession(fullSession.session_uuid);
      setSession(fullSession);
    });
  }

  function handleChangeSession(event: SelectChangeEvent<typeof session>){
    const {  
      target: { value },  
    } = event;

    const selectedSession = sessionOptions.find(s => s.session_uuid == value);
    setSession(selectedSession!);
  }

  return ( 
    <div>
        <FormControl fullWidth>
          <InputLabel id="session">Session</InputLabel>
          <Select
            labelId="session"
            value={session}
            renderValue={(selected) => selected?.session_name} 
            label="Session"
            onChange={handleChangeSession}
          >
            {sessionOptions.map(s =>  
            <MenuItem key={s.session_uuid} value={s.session_uuid}>{s.session_name}</MenuItem>
            )}
          </Select>
      </FormControl>      
      <Button disabled={session==null} variant="contained" aria-label="create session" onClick={() => joinActiveSession(session!.session_uuid)}>
        Join
      </Button>
      <Button variant="contained" aria-label="create session" onClick={handleCreateSession}>
        Create Session
      </Button>
      <Box>
        {session?.session_description}
      </Box>
    </div>
    );
}
