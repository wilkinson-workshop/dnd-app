'use client'

import Link from "next/link";
import { createSession, endSession, getSessions, joinSession } from "./_apis/sessionApi";
import { useState } from "react";
import QRCode from "react-qr-code";
import { createClient } from "./_apis/clientApi";
import { Button } from "@mui/material";
import { CharacterType } from "./_apis/character";

const baseUrl = 'http://localhost:8000';

export default function HomePage() {
  const [session, setSession] = useState<string>('');
  const [sessions, setSessions] = useState<string[]>([]);
  const [client, setClient] = useState<string>('');  
  const [hasClient, setHasClient] = useState(false);

  if(!hasClient){
    setHasClient(true);//assumes success no retry logic
    createClient()
    .then(c => {
      setClient(c);
    });
  }

  function listSessions(){
    getSessions()
    .then(sessions => {
      setSessions(sessions)
    });
  }

  function handleCreateSession(){
    createSession()
    .then(session => {
      setSession(session);
      joinSession(session, {clientId: client, name: 'DM', type: CharacterType.DuneonMaster});
    });
  }

  if(session != ''){
    return (
      <div>
        <QRCode value={`${baseUrl}/${session}`} />
        <div>
          <Link href={`/${session}/dm`}>View Session Dashboard</Link>
        </div>       
      </div>
    )
  } else {
    return ( 
    <div>
      <Button variant="contained" aria-label="create session" onClick={handleCreateSession}>
        Create Session
      </Button>
    </div>
    )
  }
}
