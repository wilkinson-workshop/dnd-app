'use client'

import { useState, useCallback, useEffect } from 'react';
import QRCode from "react-qr-code";
import { endSession, getAllSessionInput, requestPlayerInput } from "@/app/_apis/sessionApi";
import { DiceTypes, PlayerInput } from "@/app/_apis/playerInput";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Container } from "./character-container";
import { Autocomplete, Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import { useRouter } from "next/navigation";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { CharacterType } from '@/app/_apis/character';
import { EventType } from '@/app/_apis/eventType';
import { PlayerInputList } from './player-input-list';
import { RequestPlayerInput } from './request-player-input';

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

const recipients = ['All'];//This should contain individual player characters too.
const rollOptions = ['Initiative']

export default function DmDashboardPage({ params }: { params: { sessionid: string } }) {
  const [inputs, setInputs] = useState<PlayerInput[]>([]);
  const [open, setOpen] = useState(false);
  const [requestDiceType, setRequestDiceType] = useState(20);
  const [recipient, setRecipient] = useState(recipients[0]);
  const [reason, setReason] = useState('');

  const playerJoinUrl = `${baseUrl}${params.sessionid}`;
  const router = useRouter();
  
  const { sendMessage, sendJsonMessage, readyState, lastMessage } = useWebSocket(`ws://localhost:8000/sessions/${params.sessionid}/ws`, {queryParams: {role: CharacterType.DungeonMaster}});

  function handleClickRequestRoll() {
    requestPlayerInput(params.sessionid, {
      dice_type: requestDiceType, 
      recipient: recipient, 
      reason: reason
    }).then();
  }

  useEffect(() => {
    if (lastMessage !== null) {
      //this is the websocket
      switch(lastMessage.data){
        case EventType.DmReceiveRoll: {
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

  function handleChangeDiceType(event: SelectChangeEvent<typeof requestDiceType>){
    const {  
      target: { value },  
    } = event;
    setRequestDiceType(Number.parseInt(value as string));
  }

  function handleChangeRecipient(event: SelectChangeEvent<typeof recipient>){
    const {  
      target: { value },  
    } = event;
    setRecipient(value);
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
      <RequestPlayerInput sessionId={params.sessionid} />
      {inputs.length > 0 ? <PlayerInputList playerInputs={inputs}  /> : '' }      
    </div>
  )
}
