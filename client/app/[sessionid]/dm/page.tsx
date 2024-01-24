'use client'

import { useState } from "react";
import QRCode from "react-qr-code";
import { endSession, getAllSessionInput } from "@/app/_apis/sessionApi";
import { PlayerInput } from "@/app/_apis/playerInput";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Container } from "./character-container";
import { Button } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import { useRouter } from "next/navigation";

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
        {/* <Button variant="contained" aria-label="load input" onClick={handleGetPlayerInput}>
          Get Player Input 
        </Button> */}
      </div>         
    </div>
  )
}
