'use client'

import { useEffect, useReducer, useState } from 'react';
import { getAllSessionInput, updateInitiativeTop } from "@/app/_apis/sessionApi";
import { PlayerInput } from "@/app/_apis/playerInput";
import { Container } from "./character-container";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Character, CharacterType, EMPTY_GUID, FieldType, LogicType, OperatorType } from '@/app/_apis/character';
import { EventType, SubscriptionEventType, WebsocketEvent } from '@/app/_apis/eventType';
import { PlayerInputList } from './player-input-list';
import { RequestPlayerInput } from './request-player-input';
import { getCharacters } from '@/app/_apis/characterApi';
import { getAllConditions } from '@/app/_apis/dnd5eApi';
import { APIReference } from '@/app/_apis/dnd5eTypings';
import { getClientId, setClientId, setName } from '@/app/_apis/sessionStorage';
import { WebsocketContext } from '../../common/websocket-context';
import { CreatureGroups } from './groups/groups';
import { SessionContext } from '../../common/session-context';
import { ConditionsContext } from '../../common/conditions-context';
import { Footer } from '@/app/common/footer';
import { TopNav } from '@/app/common/top-nav';

const baseUrl = process.env.NEXT_PUBLIC_CLIENT_BASEURL;

const DmDashboardPage = ({ params }: { params: { sessionid: string } }) => {

	const [inputs, setInputs] = useState<PlayerInput[]>([]);
	const [playerOptions, setPlayerOptions] = useState<Character[]>([]);
	const [groupIsVisible, setGroupIsVisible] = useState(false);
	const [conditions, conditionsDispatch] = useReducer(setInitialConditions, []);

	const router = useRouter();

	const { sendMessage, sendJsonMessage, readyState, lastMessage, lastJsonMessage } =
		useWebSocket<WebsocketEvent>(`${process.env.NEXT_PUBLIC_WEBSOCKET_BASEURL}/sessions/${params.sessionid}/ws`);

	function setInitialConditions(conditions: any[], updated: APIReference[]) {
		return updated;
	}

	useEffect(() => {
		loadPlayerOptions();
		getConditionOptions();
	}, []);

	function getConditionOptions() {
		getAllConditions()
			.then(c =>
				conditionsDispatch(c.results));
	}

	useEffect(() => {
		if (lastJsonMessage !== null) {
			switch (lastJsonMessage.event_type) {
				case EventType.ReceiveRoll: {
					handleGetPlayerInput();
					return;
				}
				case EventType.ReceiveOrderUpdate: {
					loadPlayerOptions();
					return;
				}
				case EventType.EndSession: {
					endSessionEvent();
					return;
				}
				case EventType.JoinSession: {
					setName("DM");
					sendJsonMessage({
						event_type: SubscriptionEventType.JoinSession,
						event_body: {
							session_uuid: params.sessionid,
							role: CharacterType.DungeonMaster,
							name: 'DM',
							client_uuid: getClientId()
						}
					});
				}
				case EventType.ReceiveClientId: {
					const body: any = lastJsonMessage.event_body;
					setClientId(body["client_uuid"]);

				}
			}
		}
	}, [lastJsonMessage]);

	//event handler in case there are more then one DM and one ends the session.
	function endSessionEvent() {
		router.push(baseUrl!);
	}

	function loadPlayerOptions() {
		getCharacters(params.sessionid, { filters: [{ field: FieldType.Role, operator: OperatorType.Equals, value: CharacterType.Player }], logic: LogicType.And })
			.then(c => {
				const withAll: Character[] = [];
				if (c && c.length) {
					withAll.push({
						creature_id: EMPTY_GUID,
						name: "All Players",
						initiative: 0,
						hit_points: [],
						role: CharacterType.Player,
						conditions: [],
						monster: ''
					});
					withAll.push(...c)
				}
				setPlayerOptions(withAll);
			});
	}

	function handleGetPlayerInput() {
		getAllSessionInput(params.sessionid)
			.then(si =>
				setInputs(si.map(si => si.event_body)))
	}
 
	function handleResetInitiative() {
		updateInitiativeTop(params.sessionid, null)
			.then();
	}

	return (<>
		<WebsocketContext.Provider value={lastJsonMessage}>
			<ConditionsContext.Provider value={conditions}>
				<SessionContext.Provider value={params.sessionid}>
					<TopNav isDM={true} />
					<Box sx={{position: 'fixed', left: 0, right: 0, bottom: '60px', top: '70px', overflow: 'auto'}}>
						{groupIsVisible ? (<CreatureGroups backToDashboard={() => setGroupIsVisible(false)} />) :
							(<Box>
								<Box>
									<Button variant="contained" aria-label="end session" onClick={() => setGroupIsVisible(true)}>
										Groups
									</Button>
									<RequestPlayerInput recipientOptions={playerOptions} />
									<PlayerInputList playerInputs={inputs} />
									<Button variant="contained" aria-label="end session" onClick={handleResetInitiative}>
										Reset Order
									</Button>
								</Box>
								<Container />
							</Box>)
						}
					</Box>
					<Footer />
				</SessionContext.Provider>
			</ConditionsContext.Provider>
		</WebsocketContext.Provider>
	</>
	)
}

export default DmDashboardPage;