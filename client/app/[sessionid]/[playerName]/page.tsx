'use client'

import { addSessionInput, getSingleSession } from "@/app/_apis/sessionApi";
import { useEffect, useState } from "react";
import { getCharacters, getCharactersPlayer } from "@/app/_apis/characterApi";
import { Character, CharacterType, EMPTY_GUID, FieldType, HpBoundaryOptions, LogicType, OperatorType } from "@/app/_apis/character";
import { Box, Grid, styled, Alert, AlertTitle } from "@mui/material";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { EventType, SubscriptionEventType } from "@/app/_apis/eventType";
import { PlayerMessage, RequestPlayerInput } from "@/app/_apis/playerInput";
import { SendPlayerMessage } from "../chat/send-player-message";
import { getAllConditions, getAllSkills } from "@/app/_apis/dnd5eApi";
import { ConditionItem } from "./condition-item";
import { SkillRequest } from "./skill-request";
import { APIReference } from "@/app/_apis/dnd5eTypings";
import { getClientId, setClientId, setName } from "@/app/_apis/sessionStorage";
import { Session } from "@/app/_apis/session";
import { ChatBox } from "../chat/chat-box";
import { useRouter } from "next/navigation";
import { AlertInfo, Alerts } from "../alert/alerts";


const baseUrl = process.env.NEXT_PUBLIC_CLIENT_BASEURL;
const showDeveloperUI = process.env.NEXT_PUBLIC_DEVELOPER_UI;

export default function PlayerPage({ params }: { params: { sessionid: string, playerName: string } }) {

	const [initiativeOrder, setInitiativeOrder] = useState<Character[]>([]);
	const [isGetDiceRoll, setIsGetDiceRoll] = useState(false);
	const [isShowSecret, setIsShowSecret] = useState(false);
	const [secretBody, setSecret] = useState<PlayerMessage | null>(null);
	const [requestRollBody, setRequestRollBody] = useState<RequestPlayerInput>({ client_uuids: [], reason: '', dice_type: 20 });
	const [playerOptions, setPlayerOptions] = useState<Character[]>([]);
	const [conditionOptions, setConditionOptions] = useState<APIReference[]>([]);
	const [skills, setSkills] = useState<APIReference[]>([]);
	const [session, setSession] = useState<Session>();
	const [alert, setAlert] = useState<AlertInfo | null>(null);

	const playerJoinUrl = `${baseUrl}/${params.sessionid}`;
	const router = useRouter();

	const { sendMessage, sendJsonMessage, readyState, lastJsonMessage } =
		useWebSocket<{ event_type: EventType, event_body: any | string }>(`${process.env.NEXT_PUBLIC_WEBSOCKET_BASEURL}/sessions/${params.sessionid}/ws`);

	useEffect(() => {
		getLatestInitiativeOrder();
		getConditionOptions();
		loadPlayerOptions();
		getSkillOptions();
		getCurrentSession();
	}, []);

	useEffect(() => {
		if (lastJsonMessage !== null) {
			switch (lastJsonMessage.event_type) {
				case EventType.RequestRoll: {
					setRequestRollBody(lastJsonMessage.event_body);
					setIsGetDiceRoll(true);
					return;
				}
				case EventType.ReceiveOrderUpdate: {
					setAlert({ type: 'info', message: 'Initiative order updates.' });

					getLatestInitiativeOrder();
					loadPlayerOptions();
					return;
				}
				case EventType.ReceiveMessage: {
					setSecret(lastJsonMessage.event_body);
					setIsShowSecret(true);
					return;
				}
				case EventType.EndSession: {
					endSession();
					return;
				}
				case EventType.ReceiveClientId: {
					const body: any = lastJsonMessage.event_body;
					if (!getClientId()) {
						setClientId(body["client_uuid"]);
						setName(decodeURI(params.playerName));
					}
					sendJsonMessage({
						event_type: SubscriptionEventType.JoinSession,
						event_body: {
							session_uuid: params.sessionid,
							role: CharacterType.Player,
							name: decodeURI(params.playerName),
							client_uuid: getClientId()
						}
					});
				}
			}
		}
	}, [lastJsonMessage]);

	function endSession() {
		setAlert({ type: 'info', message: 'The current session has ended.' });
		setTimeout(() => { router.push(`/${params.sessionid}`) }, 5000);
	}

	function getCurrentSession() {
		getSingleSession(params.sessionid)
		.then(sessions => {
			setSession(sessions[0]);
		});
	}

	function handleInputSubmit(rollValue: number) {
		setIsGetDiceRoll(false);
		addSessionInput(params.sessionid, {
			value: rollValue,
			client_uuid: getClientId(),
			reason: requestRollBody.reason,
			name: decodeURI(params.playerName)
		})
		.then();
	}

	function getLatestInitiativeOrder() {
		getCharactersPlayer(params.sessionid)
		.then(i => setInitiativeOrder(i));
	}

	function getConditionOptions() {
		getAllConditions()
		.then(c => setConditionOptions(c.results));
	}

	function getSkillOptions() {
		getAllSkills()
		.then(s => {
			const skills = [{ index: 'initiative', name: 'Initiative', url: '' }, ...s.results];
			setSkills(skills);
		});
	}

	function loadPlayerOptions() {
		getCharacters(params.sessionid, { 
			filters: [{ 
				field: FieldType.Role, 
				operator: OperatorType.Equals, 
				value: CharacterType.Player 
			}], 
			logic: LogicType.And 
		})
		.then(c => {
			const withAll: Character[] = [];
			if(c && c.length){      
				withAll.push({ 
					creature_id: EMPTY_GUID, 
					name: "All Players", 
					initiative: 0, hit_points: [], 
					role: CharacterType.Player, 
					conditions: [], 
					monster: '' 
				});
			  withAll.push(...c)
			}
			setPlayerOptions(withAll);
		});
	}

	function calculateHP(character: Character): string {
		const hpPercent = (character.hit_points[0] / character.hit_points[1]) * 100;
		if (hpPercent == 0)
			return HpBoundaryOptions.find(x => x.id == 0)!.name;
		else if (hpPercent < 10 && hpPercent > 0)
			return HpBoundaryOptions.find(x => x.id == 9)!.name;
		else if (hpPercent < 50)
			return HpBoundaryOptions.find(x => x.id == 49)!.name;
		else
			return HpBoundaryOptions.find(x => x.id == 100)!.name;
	}

	return (
		<>
			<Alerts info={alert} />
			{showDeveloperUI ?
				(<a href={playerJoinUrl} target='_blank'>
					Player Join
				</a>) : ''}
			<Box>
				<Box>
					{session?.session_name}
				</Box>
				<Box>
					{session?.session_description}
				</Box>
			</Box>
			<Box>
				<h2>Initiative Order</h2>
				{initiativeOrder.map(order => (
					<div key={order.creature_id} style={{ border: '1px solid lightgray' }}>
						<Box>
							<Grid container spacing={2}>
								<Grid item xs={12} sm={4}>
									<Box className="item">{order.name}</Box>
								</Grid>
								<Grid item xs={6} sm={3}>
									<Box className="item">{calculateHP(order)}</Box>
								</Grid>
								<Grid item xs={6} sm={5}>
									<Box className="item">{order.conditions.map(c =>
										<ConditionItem conditionId={c} conditionOptions={conditionOptions} />)}
									</Box>
								</Grid>
							</Grid>
						</Box>
					</div>
				))}
			</Box>
			<SendPlayerMessage sessionId={params.sessionid} recipientOptions={playerOptions} />
			{isGetDiceRoll ? <SkillRequest skillName={requestRollBody.reason} diceType={requestRollBody.dice_type} skillOptions={skills} sendValue={handleInputSubmit} /> : ''}
			{isShowSecret ? <ChatBox sessionId={params.sessionid} recipientOptions={playerOptions} secretInfo={secretBody!} setIsShowSecret={setIsShowSecret} /> : ''}
		</>
	)
}
