'use client'

import { addSessionInput} from "@/app/_apis/sessionApi";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { getCharactersPlayer } from "@/app/_apis/characterApi";
import { Character, CharacterType, ConditionOptions, ConditionType, EMPTY_GUID } from "@/app/_apis/character";
import { Box, Button, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { EventType } from "@/app/_apis/eventType";
import { RequestPlayerInput } from "@/app/_apis/playerInput";

const baseUrl = process.env.NEXT_PUBLIC_CLIENT_BASEURL;

export default function PlayerPage({ params }: { params: { sessionid: string, playerName: string } }) {
  const [rollValue, setRollValue] = useState(0);
  const [initiativeOrder, setInitiativeOrder] = useState<Character[]>([]);
  const [isGetDiceRoll, setIsGetDiceRoll] = useState(false);
  const [isShowSecret, setIsShowSecret] = useState(false);
  const [secret, setSecret] = useState('');
  const [requestRollBody, setRequestRollBody] = useState<RequestPlayerInput>({client_uuids: [], reason: '', dice_type: 20});

  const playerJoinUrl = `${baseUrl}/${params.sessionid}`;

  const { sendMessage, sendJsonMessage, readyState, lastJsonMessage } = 
  useWebSocket<{event_type: EventType, event_body: any | string}>(`${process.env.NEXT_PUBLIC_WEBSOCKET_BASEURL}/sessions/${params.sessionid}/ws`, 
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
          setRequestRollBody(lastJsonMessage.event_body);
          setIsGetDiceRoll(true);
          return;
        }
        case EventType.ReceiveOrderUpdate: {
          getLatestInitiativeOrder();
          return;
        }
        case EventType.ReceiveSecret: {
          setSecret(lastJsonMessage.event_body.secret);
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
    addSessionInput(params.sessionid, {value: rollValue, body: requestRollBody})
    .then();
  }

  function getLatestInitiativeOrder(){
    getCharactersPlayer(params.sessionid)
    .then(i => setInitiativeOrder(i));
  }

  function calculateStatus(character: Character): string {
    const hpPercent = (character.hit_points[0]/character.hit_points[1]) * 100;

    const hpStatus = hpPercent < 10 ? 'Looks weakened' : 'Seems very alive';

    const conditionStatus = character.conditions.map(c => ConditionOptions.find(x => x.id == c)?.name).join(', ');

    return `${hpStatus}, ${conditionStatus}`;
  }

  const getRollForm = (        
    <Box>
      <div>{`The DM has requested input for a ${requestRollBody.dice_type} sided dice for ${requestRollBody.reason}`}</div>
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
        <a href={playerJoinUrl} target='_blank'>
          Player Join
        </a>
        <h2>Initiative Order</h2>
        {initiativeOrder.map(order => (
          <Box key={order.creature_id}>
            {order.name} - {calculateStatus(order)}
          </Box>
        ))}
      </Box>
    </>               
  )    
}
