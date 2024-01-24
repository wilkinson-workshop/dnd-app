'use client'

import { addSessionInput, joinSession } from "../_apis/sessionApi";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { createClient } from "../_apis/clientApi";
import { getInitiativeOrder } from "../_apis/characterApi";
import { CharacterType } from "../_apis/character";
import { Box, Button, TextField } from "@mui/material";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { EventType } from "../_apis/eventType";

export interface InitiativeOrder {id: string, name: string}

export default function PlayerPage({ params }: { params: { sessionid: string } }) {
  const [client, setClient] = useState<string>('');
  const [initiative, setInitiative] = useState(0);
  const [hasClient, setHasClient] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [initiativeOrder, setInitiativeOrder] = useState<InitiativeOrder[]>([]);
  const [isGetInitiative, setIsGetInitiative] = useState(false);

  if(!hasClient){
    setHasClient(true);//assumes success no retry logic
    createClient()
    .then((c: string) => {
      setClient(c);      
    });    
  }

  const { sendMessage, sendJsonMessage, readyState, lastMessage } = useWebSocket('ws://localhost:8000/ws', {queryParams: {type: CharacterType.Player}});

  //const handleClickSendMessage = useCallback(() => sendJsonMessage({event_type: 'testEvent', event_body: {name: 'test', value: 10}}), []);

  useEffect(() => {
    if (lastMessage !== null) {
      //this is the websocket

      switch(lastMessage.data){
        case EventType.RequestInitiative: {
          setIsGetInitiative(true);
          return;
        }
      }
    }
  }, [lastMessage, setIsGetInitiative]);

  function handleInputSubmit(e: FormEvent){
    e.preventDefault(); 
    setIsGetInitiative(false);   
    addSessionInput(params.sessionid, {input: initiative, clientId: client, name: playerName})
    .then();
  }

  function getLatestInitiativeOrder(){
    getInitiativeOrder(params.sessionid)
    .then(i => setInitiativeOrder(i));
  }

  function handleJoinSubmit(e: FormEvent){
    e.preventDefault();    
    joinSession(params.sessionid, {clientId: client, name: playerName, type: CharacterType.Player})
    .then(_ => setHasJoined(true))

    //this could be trigered by event from dm when turn order updates.
    getLatestInitiativeOrder();
  }

  const getInitForm = (        <Box>
    <TextField size="small" label="Initiative" value={initiative} variant="outlined" onChange={x => setInitiative(Number.parseInt(x.target.value))} />
    <Button variant="contained" aria-label="show initiative order" onClick={handleInputSubmit}>
      Send
    </Button>          
  </Box>);

  if(hasJoined){
    return (
      <>
        {isGetInitiative ? getInitForm : ''}
        <Box>
          {/* <Button variant="contained" aria-label="show initiative order" onClick={getLatestInitiativeOrder}>
            Show Initiative Order
          </Button> */}
          <h2>Initiative Order</h2>
          {initiativeOrder.map(order => (
            <Box key={order.id}>
              {order.name}
            </Box>
          ))}
        </Box>
      </>               
    )
  } else {
    return (
        <Box sx={{textAlign: 'center'}}>
            <TextField size="small" label="Name" value={playerName} variant="outlined" onChange={x => setPlayerName(x.target.value)} />     
            <Button variant="contained" aria-label="join session" onClick={handleJoinSubmit}>
              Join Session
            </Button>          
        </Box>
    )
  }

    
}
