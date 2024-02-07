'use client'

import { addSessionInput} from "@/app/_apis/sessionApi";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { getCharacters, getCharactersPlayer } from "@/app/_apis/characterApi";
import { Character, CharacterType, EMPTY_GUID, FieldType, HpBoundaryOptions, LogicType, OperatorType } from "@/app/_apis/character";
import { Box, Button, Grid, IconButton, TextField, styled } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { EventType } from "@/app/_apis/eventType";
import { RequestPlayerInput } from "@/app/_apis/playerInput";
import { SendPlayerSecret } from "../dm/send-player-secret";
import { GetSchema, getAllConditions, getCondition } from "@/app/_apis/dnd5eApi";
import { ConditionItem } from "./condition-item";

const baseUrl = process.env.NEXT_PUBLIC_CLIENT_BASEURL;

export default function PlayerPage({ params }: { params: { sessionid: string, playerName: string } }) {
  const [rollValue, setRollValue] = useState(0);
  const [initiativeOrder, setInitiativeOrder] = useState<Character[]>([]);
  const [isGetDiceRoll, setIsGetDiceRoll] = useState(false);
  const [isShowSecret, setIsShowSecret] = useState(false);
  const [secret, setSecret] = useState('');
  const [requestRollBody, setRequestRollBody] = useState<RequestPlayerInput>({client_uuids: [], reason: '', dice_type: 20});
  const [playerOptions, setPlayerOptions] = useState<Character[]>([]);
  const [conditionOptions, setConditionOptions] = useState<GetSchema[]>([]);

  const playerJoinUrl = `${baseUrl}/${params.sessionid}`;

  const { sendMessage, sendJsonMessage, readyState, lastJsonMessage } = 
  useWebSocket<{event_type: EventType, event_body: any | string}>(`${process.env.NEXT_PUBLIC_WEBSOCKET_BASEURL}/sessions/${params.sessionid}/ws`, 
  {queryParams: {
    role: CharacterType.Player,
    name: params.playerName
  }});

  useEffect(() => {
    getLatestInitiativeOrder();
    getConditionOptions();
    loadPlayerOptions();
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
          loadPlayerOptions();
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

  function getConditionOptions(){
    getAllConditions()
    .then(c => setConditionOptions(c.results));
  }

  function loadPlayerOptions(){
    getCharacters(params.sessionid, {filters: [{field: FieldType.Role, operator: OperatorType.Equals, value: CharacterType.Player}], logic: LogicType.And})
    .then(c => {
      const withAll: Character[] = [{creature_id: EMPTY_GUID, name: "All", initiative: 0, hit_points: [], role: CharacterType.Player, conditions: []}];
      withAll.push(...c)
      setPlayerOptions(withAll);
    });
  }

  function calculateHP(character: Character): string {
    const hpPercent = (character.hit_points[0]/character.hit_points[1]) * 100;
    if(hpPercent == 0)
      return HpBoundaryOptions.find(x => x.id == 0)!.name;
    else if(hpPercent < 10 && hpPercent > 0)
      return HpBoundaryOptions.find(x => x.id == 9)!.name;
    else if (hpPercent < 50)
      return HpBoundaryOptions.find(x => x.id == 49)!.name;
    else
      return HpBoundaryOptions.find(x => x.id == 100)!.name;
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

  const Item = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),  
  })); 
  
  return (
    <>
      <a href={playerJoinUrl} target='_blank'>
        Player Join
      </a>
      {isGetDiceRoll ? getRollForm : ''}
      {isShowSecret ? showSecretView : ''}
      <Box>
        <h2>Initiative Order</h2>
        {initiativeOrder.map(order => (
          <div key={order.creature_id}  style={{border: '1px solid lightgray'  }}>
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Item>{order.name}</Item>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Item>{calculateHP(order)}</Item>
                  </Grid>
                  <Grid item xs={6} sm={5}>
                    <Item>{order.conditions.map(c => 
                      <ConditionItem conditionId={c} conditionOptions={conditionOptions} />)}
                    </Item>
                  </Grid>
                </Grid>
              </Box>
            </div>
        ))}
      </Box>
      <SendPlayerSecret sessionId={params.sessionid} recipientOptions={playerOptions} />

    </>               
  )    
}
