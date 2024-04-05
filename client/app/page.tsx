'use client'

import { useEffect, useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { useRouter } from "next/navigation";

import { TopNav } from "./common/top-nav";
import { getSessions, getSingleSession } from "./_apis/sessionApi";

export default function HomePage() {
  const [selectedSession, setSelectedSession] = useState('');
  const [isValid, setIsValid] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if(selectedSession.length == 36){
      getCurrentSession();
    } else {
      setIsValid(false);
    }
  }, [selectedSession]);

  function getCurrentSession() {
		getSessions()
			.then(sessions => {
				if(sessions.length > 0 && sessions.findIndex(s => s.session_uuid == selectedSession) != -1){
          setIsValid(true);
        } else {
          setIsValid(false);
        }
			});
	}

  function joinActiveSession(selectedSession: string) {
    router.push(`/${selectedSession}`);
  }

  return (<>
    <TopNav isDM={false} />
    <Box sx={{ position: 'fixed', left: 0, right: 0, bottom: '60px', top: '70px', overflow: 'auto', textAlign: 'center' }}>
      <TextField size="small" sx={{ width: 400 }} helperText="Session ID" value={selectedSession} variant="outlined" onChange={x => setSelectedSession(x.target.value)} />
      <Button disabled={!isValid} variant="contained" aria-label="create session" onClick={() => joinActiveSession(selectedSession)}>
        Continue
      </Button>
    </Box>
  </>
  );
}
