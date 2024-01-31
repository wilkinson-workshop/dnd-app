'use client'

import { addSessionInput} from "@/app/_apis/sessionApi";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { getInitiativeOrder } from "@/app/_apis/characterApi";
import { CharacterType, EMPTY_GUID } from "@/app/_apis/character";
import { Box, Button, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { EventType } from "@/app/_apis/eventType";

export interface InitiativeOrder {id: string, name: string}

export default function PlayerPage({ params }: { params: { sessionid: string, playerName: string } }) {
  const [rollValue, setRollValue] = useState(0);
  const [initiativeOrder, setInitiativeOrder] = useState<InitiativeOrder[]>([]);
  const [isGetDiceRoll, setIsGetDiceRoll] = useState(false);
  const [isShowSecret, setIsShowSecret] = useState(false);
  const [secret, setSecret] = useState('');
  const [diceRollMessage, setDiceRollMessage] = useState('');

  const { sendMessage, sendJsonMessage, readyState, lastJsonMessage } = 
  useWebSocket<{event_type: EventType, event_body: any | string}>(`ws://localhost:8000/sessions/${params.sessionid}/ws`, 
  {queryParams: {
    role: CharacterType.Player,
    name: params.playerName
  }});

  useEffect(() => {
    getLatestInitiativeOrder();
  }, [])

  useEffect(() => {
    if (lastJsonMessage !== null) {

      switch(lastJsonMessage.event_type){
        case EventType.RequestRoll: {
          setDiceRollMessage(`The DM has requested input for a ${lastJsonMessage.event_body.dice_type} sided dice for ${lastJsonMessage.event_body.reason}`);
          setIsGetDiceRoll(true);
          return;
        }
        case EventType.ReceiveOrderUpdate: {
          getLatestInitiativeOrder();
          return;
        }
        case EventType.ReceiveSecret: {
          setSecret(lastJsonMessage.event_body);
          setIsShowSecret(true);
          return;
        }
      }
    }
  }, [lastJsonMessage]);

  function handleInputSubmit(e: FormEvent){
    e.preventDefault(); 
    setIsGetDiceRoll(false);  
    setRollValue(0) 
    addSessionInput(params.sessionid, {value: rollValue, name: params.playerName})
    .then();
  }

  function getLatestInitiativeOrder(){
    getInitiativeOrder(params.sessionid)
    .then(i => setInitiativeOrder(i));
  }

  const getRollForm = (        
    <Box>
      <div>{diceRollMessage}</div>
      <TextField size="small" label="Roll" value={rollValue} variant="outlined" onChange={x => setRollValue(Number.parseInt(x.target.value? x.target.value : '0'))} />
      <Button variant="contained" aria-label="send dice roll" onClick={handleInputSubmit}>
        Send
      </Button>          
    </Box>
  );

  const showSecretView = (
    <Box>
      {secret}                
      <IconButton aria-label="delete" onClick={() =>setIsShowSecret(false)}>
          <CloseIcon />
      </IconButton>
    </Box>
  )
  
  return (
    <>
      {isGetDiceRoll ? getRollForm : ''}
      {isShowSecret ? showSecretView : ''}
      <Box>
        <h2>Initiative Order</h2>
        {initiativeOrder.map(order => (
          <Box key={order.id}>
            {order.name}
          </Box>
        ))}
      </Box>
    </>               
  )    
}
