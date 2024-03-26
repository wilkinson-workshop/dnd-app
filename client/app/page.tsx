'use client'

import { createSession, getSessions } from "./_apis/sessionApi";
import { useEffect, useState } from "react";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useRouter } from "next/navigation";
import { Session } from "./_apis/session";
import { CreateSession } from "./create-session";

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [selectedSession, setSelectedSession] = useState('');
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

  function handleCreateSession(newSession: Session){
    createSession(newSession)
    .then(session => {
      const fullSession = {session_name: newSession.session_name, session_uuid: session, session_description: newSession.session_description};

      let newSessionOtions = sessionOptions.slice();
      newSessionOtions.push(fullSession);
      setSessionOptions(newSessionOtions);

      setSelectedSession(fullSession.session_uuid);
      setSession(fullSession);
    });
  }

  function handleChangeSession(event: SelectChangeEvent<typeof selectedSession>){
    const {  
      target: { value },  
    } = event;

    const selectedSession = sessionOptions.find(s => s.session_uuid == value);
    setSelectedSession(selectedSession!.session_uuid);
    setSession(selectedSession!);
  }

  return ( 
    <Box>
        <FormControl fullWidth>
          <InputLabel id="session">Session</InputLabel>
          <Select
            labelId="session"
            value={selectedSession}
            renderValue={(selected) => { 
              return sessionOptions.find(s => s.session_uuid == selected)?.session_name
            }} 
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
      <CreateSession onAddClick={handleCreateSession} />
      <Box>
        {session?.session_description}
      </Box>
    </Box>
    );
}
