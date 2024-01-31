'use client'

import { useEffect, useState } from 'react';
import QRCode from "react-qr-code";
import { endSession, getAllSessionInput } from "@/app/_apis/sessionApi";
import { PlayerInput } from "@/app/_apis/playerInput";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Container } from "./character-container";
import { Box, Button } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import { useRouter } from "next/navigation";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { CharacterType } from '@/app/_apis/character';
import { EventType } from '@/app/_apis/eventType';
import { PlayerInputList } from './player-input-list';
import { RequestPlayerInput } from './request-player-input';
import { SendPlayerSecret } from './send-player-secret';

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

const DmDashboardPage = ({ params }: { params: { sessionid: string } }) => {
  const [inputs, setInputs] = useState<PlayerInput[]>([]);
  const [open, setOpen] = useState(false);

  const playerJoinUrl = `${baseUrl}${params.sessionid}`;
  const router = useRouter();

  const { sendMessage, sendJsonMessage, readyState, lastMessage, lastJsonMessage } = 
  useWebSocket<{event_type: EventType, event_body: string}>(`ws://localhost:8000/sessions/${params.sessionid}/ws`, 
  {queryParams: {
    role: CharacterType.DungeonMaster,
    name: 'DM'
  }});

  useEffect(() => {
    if (lastJsonMessage !== null) {
      switch(lastJsonMessage.event_type){
        case EventType.ReceiveRoll: {
          handleGetPlayerInput();
          return;
        }
      }
    }
  }, [lastJsonMessage]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  function handleGetPlayerInput(){
    getAllSessionInput(params.sessionid)
    .then(pi => 
      setInputs(pi))
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
      <Box sx={{margin: '20px 0'}}>
        <SendPlayerSecret sessionId={params.sessionid} />
        <RequestPlayerInput sessionId={params.sessionid} />
        {inputs.length > 0 ? <PlayerInputList playerInputs={inputs}  /> : '' }  
      </Box>    
    </div>
  )
}

export default DmDashboardPage;