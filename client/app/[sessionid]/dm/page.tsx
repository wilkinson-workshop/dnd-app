'use client'

import { useState, useCallback, useEffect } from 'react';
import QRCode from "react-qr-code";
import { endSession, getAllSessionInput } from "@/app/_apis/sessionApi";
import { PlayerInput } from "@/app/_apis/playerInput";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Container } from "./character-container";
import { Button } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import { useRouter } from "next/navigation";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { CharacterType } from '@/app/_apis/character';
import { EventType } from '@/app/_apis/eventType';

const baseUrl = 'http://localhost:3000/';

export interface SimpleDialogProps {
  open: boolean;
  url: string;
  onClose: () => void;
}

function SimpleDialog(props: SimpleDialogProps) {
  const { onClose, url, open } = props;

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <QRCode value={url}/>
    </Dialog>
  );
}


export default function DmDashboardPage({ params }: { params: { sessionid: string } }) {
  const [inputs, setInputs] = useState<PlayerInput[]>([]);
  const [open, setOpen] = useState(false);
  const playerJoinUrl = `${baseUrl}${params.sessionid}`;
  const router = useRouter();
  
  const { sendMessage, sendJsonMessage, readyState, lastMessage } = useWebSocket('ws://localhost:8000/ws', {queryParams: {type: CharacterType.DungeonMaster}});

  const handleClickSendMessage = useCallback(() => sendJsonMessage({event_type: EventType.RequestInitiative, event_body: {name: 'test', value: 10}}), []);

  useEffect(() => {
    if (lastMessage !== null) {
      //this is the websocket
      switch(lastMessage.data){
        case EventType.ReceiveInitiative: {
          handleGetPlayerInput();
        }
      }
    }
  }, [lastMessage]);


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  function handleGetPlayerInput(){
    getAllSessionInput(params.sessionid)
    .then(pi => setInputs(pi))
  }

  function handleEndSession(){
    endSession(params.sessionid)
    .then(_ => {
      endSession('');;
      router.push(baseUrl);
    });
  }

  return (
    <div>
      <div>
        <SimpleDialog
          open={open}
          url={playerJoinUrl}
          onClose={handleClose}
        />     
        <Button variant="contained" aria-label="show qr" onClick={handleClickOpen}>
          Show Session QR
        </Button>
        <Button variant="contained" aria-label="end session" onClick={handleEndSession}>
          End Session
        </Button>
      </div> 
      <DndProvider backend={HTML5Backend}>
        <Container sessionId={params.sessionid} />
      </DndProvider>
      {inputs.map(input => (
        <div key={input.clientId + "" + Math.random().toPrecision(1)}>
          Name: {input.name} - Value: {input.input}
        </div>
      ))}  
      <div>
        <button onClick={handleClickSendMessage}>
          Request Initiative
        </button>
        {/* <Button variant="contained" aria-label="load input" onClick={handleGetPlayerInput}>
          Get Player Input 
        </Button> */}
      </div>         
    </div>
  )
}
