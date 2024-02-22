'use client'

import { useEffect, useReducer, useState } from 'react';
import { clearSessionInput, endSession, getAllSessionInput } from "@/app/_apis/sessionApi";
import { PlayerInput } from "@/app/_apis/playerInput";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Container } from "./character-container";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Character, CharacterType, EMPTY_GUID, FieldType, LogicType, OperatorType } from '@/app/_apis/character';
import { EventType, SubscriptionEventType } from '@/app/_apis/eventType';
import { PlayerInputList } from './player-input-list';
import { RequestPlayerInput } from './request-player-input';
import { SendPlayerMessage } from '../chat/send-player-message';
import { getCharacters } from '@/app/_apis/characterApi';
import { createContext } from 'react';
import { getAllConditions } from '@/app/_apis/dnd5eApi';
import { APIReference } from '@/app/_apis/dnd5eTypings';
import { getClientId, setClientId, setName } from '@/app/_apis/sessionStorage';

const baseUrl = process.env.NEXT_PUBLIC_CLIENT_BASEURL;
const showDeveloperUI = process.env.NEXT_PUBLIC_DEVELOPER_UI;

export const ConditionsContext = createContext<APIReference[]>([]);

const DmDashboardPage = ({ params }: { params: { sessionid: string } }) => {
  const [inputs, setInputs] = useState<PlayerInput[]>([]);
  const [isLoadCharacter, setIsLoadCharacter] = useState(false);
  const [playerOptions, setPlayerOptions] = useState<Character[]>([]);

  const [conditions, conditionsDispatch] = useReducer(setInitialConditions, []);

  const playerJoinUrl = `${baseUrl}/${params.sessionid}`;
  const router = useRouter();

  const { sendMessage, sendJsonMessage, readyState, lastMessage, lastJsonMessage } = 
  useWebSocket<{event_type: EventType, event_body: string}>(`${process.env.NEXT_PUBLIC_WEBSOCKET_BASEURL}/sessions/${params.sessionid}/ws`);

  function setInitialConditions(conditions: any[], updated: APIReference[]){
    return updated;
  }

  useEffect(() => {
    loadPlayerOptions();
    getConditionOptions();
  }, []);

  function getConditionOptions(){
    getAllConditions()
    .then(c => 
      conditionsDispatch(c.results));
  }

  useEffect(() => {
    if (lastJsonMessage !== null) {
      switch(lastJsonMessage.event_type){
        case EventType.ReceiveRoll: {
          handleGetPlayerInput();
          return;
        }
        case EventType.ReceiveOrderUpdate: {
          setIsLoadCharacter(true);
          loadPlayerOptions();
          return;
        }
        case EventType.EndSession: {
          endSessionEvent();
          return;
        }
        case EventType.ReceiveClientId: {
          const body: any = lastJsonMessage.event_body;
          setClientId(body["client_uuid"]);
          setName("DM");
          sendJsonMessage({
            event_type: SubscriptionEventType.JoinSession, 
            event_body: {
              session_uuid: params.sessionid,
              role: CharacterType.DungeonMaster,
              name: 'DM',
              client_uuid: getClientId()}
            });
        }
      }
    }
  }, [lastJsonMessage]);

  //event handler in case there are more then one DM and one ends the session.
  function endSessionEvent(){
    router.push(baseUrl!);
  }

  function loadPlayerOptions(){
    getCharacters(params.sessionid, {filters: [{field: FieldType.Role, operator: OperatorType.Equals, value: CharacterType.Player}], logic: LogicType.And})
    .then(c => {
      const withAll: Character[] = [{creature_id: EMPTY_GUID, name: "All Players", initiative: 0, hit_points: [], role: CharacterType.Player, conditions: [], monster: ''}];
      withAll.push(...c)
      setPlayerOptions(withAll);
    });
  }

  function handleGetPlayerInput(){
    getAllSessionInput(params.sessionid)
    .then(si => 
      setInputs(si.map(si => si.event_body)))
  }

  function handleClearPlayerInput(){
    clearSessionInput(params.sessionid)
    .then(_ => 
      setInputs([]))
  }

  function handleEndSession(){
    endSession(params.sessionid)
    .then(_ => {
      endSession('');;
      router.push(baseUrl!);
    });
  }

  return (
    <div>
      <div>
        <Button variant="contained" aria-label="end session" onClick={handleEndSession}>
          End Session
        </Button>
        <a href={`${playerJoinUrl}/qr`} target='_blank'>
          Show QR code
        </a>
        { showDeveloperUI ?
        (<a href={playerJoinUrl} target='_blank'>
          Player Join
        </a>) : ''}
      </div> 
      <ConditionsContext.Provider value={conditions}>
        <DndProvider backend={HTML5Backend}>
          <Container sessionId={params.sessionid} reload={isLoadCharacter} reloadDone={() => setIsLoadCharacter(false)} />
        </DndProvider>
      </ConditionsContext.Provider>
      <Box sx={{margin: '20px 0'}}>
        <SendPlayerMessage sessionId={params.sessionid} recipientOptions={playerOptions} />
        <RequestPlayerInput sessionId={params.sessionid} recipientOptions={playerOptions} />
        {inputs.length > 0 ? <PlayerInputList playerInputs={inputs} handleClickClearResults={handleClearPlayerInput} /> : '' }  
      </Box>    
    </div>
  )
}

export default DmDashboardPage;