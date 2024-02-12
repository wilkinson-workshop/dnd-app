'use client'

import { addSessionInput} from "@/app/_apis/sessionApi";
import { useEffect, useState } from "react";
import { getCharacters, getCharactersPlayer } from "@/app/_apis/characterApi";
import { Character, CharacterType, EMPTY_GUID, FieldType, HpBoundaryOptions, LogicType, OperatorType } from "@/app/_apis/character";
import { Box, Grid, styled } from "@mui/material";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { EventType } from "@/app/_apis/eventType";
import { RequestPlayerInput } from "@/app/_apis/playerInput";
import { SendPlayerSecret } from "../dm/send-player-secret";
import { getAllConditions, getAllSkills } from "@/app/_apis/dnd5eApi";
import { ConditionItem } from "./condition-item";
import { SkillRequest } from "./skill-request";
import { Secrets } from "./secrets";
import { APIReference } from "@/app/_apis/dnd5eTypings";
import { getClientId, setClientId } from "@/app/_apis/sessionStorage";

const baseUrl = process.env.NEXT_PUBLIC_CLIENT_BASEURL;
const showDeveloperUI = process.env.NEXT_PUBLIC_DEVELOPER_UI;

export default function PlayerPage({ params }: { params: { sessionid: string, playerName: string } }) {
  
  const [initiativeOrder, setInitiativeOrder] = useState<Character[]>([]);
  const [isGetDiceRoll, setIsGetDiceRoll] = useState(false);
  const [isShowSecret, setIsShowSecret] = useState(false);
  const [secret, setSecret] = useState('');
  const [requestRollBody, setRequestRollBody] = useState<RequestPlayerInput>({client_uuids: [], reason: '', dice_type: 20});
  const [playerOptions, setPlayerOptions] = useState<Character[]>([]);
  const [conditionOptions, setConditionOptions] = useState<APIReference[]>([]);
  const [skills, setSkills] = useState<APIReference[]>([]);

  const playerJoinUrl = `${baseUrl}/${params.sessionid}`;

  let query = {
    role: CharacterType.Player, 
    name: params.playerName
  };
  let fullQuery: any;

  if(getClientId()){
    fullQuery = {...query, existing_client_uuid: getClientId()};
  }
  else {
    fullQuery = query;
  }


  const { sendMessage, sendJsonMessage, readyState, lastJsonMessage } = 
  useWebSocket<{event_type: EventType, event_body: any | string}>(`${process.env.NEXT_PUBLIC_WEBSOCKET_BASEURL}/sessions/${params.sessionid}/ws`, 
  {queryParams: fullQuery});

  useEffect(() => {
    getLatestInitiativeOrder();
    getConditionOptions();
    loadPlayerOptions();
    getSkillOptions();
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
        case EventType.ReceiveClientId: {
          const body: any = lastJsonMessage.event_body;
          setClientId(body["client_uuid"])
        }
      }
    }
  }, [lastJsonMessage]);

  function handleInputSubmit(rollValue: number){
    setIsGetDiceRoll(false); 
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

  function getSkillOptions(){
      getAllSkills()
      .then(s => {
          const skills = [{index: 'initiative', name:'Initiative', url: ''}, ...s.results];
          setSkills(skills);
      });
  }

  function loadPlayerOptions(){
    getCharacters(params.sessionid, {filters: [{field: FieldType.Role, operator: OperatorType.Equals, value: CharacterType.Player}], logic: LogicType.And})
    .then(c => {
      const withAll: Character[] = [{creature_id: EMPTY_GUID, name: "All", initiative: 0, hit_points: [], role: CharacterType.Player, conditions: [], monster: ''}];
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

  const Item = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),  
  })); 
  
  return (
    <>
        { showDeveloperUI ?
        (<a href={playerJoinUrl} target='_blank'>
          Player Join
        </a>) : ''}
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
      {isGetDiceRoll ? <SkillRequest skillName={requestRollBody.reason} diceType={requestRollBody.dice_type} skillOptions={skills} sendValue={handleInputSubmit} /> : ''}
      {isShowSecret ? <Secrets secret={secret} setIsShowSecret={setIsShowSecret} /> : ''}
    </>               
  )    
}
