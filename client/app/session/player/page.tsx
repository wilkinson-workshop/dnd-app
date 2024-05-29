'use client'

import { addSessionInput, getSingleSession } from "@/app/_apis/sessionApi";
import { useContext, useEffect, useState } from "react";
import { getCharactersPlayer } from "@/app/_apis/characterApi";
import { Character, CharacterType, EMPTY_GUID, HpBoundaryOptions, OBSERVER_NAME } from "@/app/_apis/character";
import { Box, Grid } from "@mui/material";
import useWebSocket from 'react-use-websocket';
import { EventType, SubscriptionEventType, WebsocketEvent } from "@/app/_apis/eventType";
import { RequestPlayerInput } from "@/app/_apis/playerInput";
import { getAllConditions, getAllSkills } from "@/app/_apis/dnd5eApi";
import { ConditionItem } from "./condition-item";
import { SkillRequest } from "./skill-request";
import { APIReference } from "@/app/_apis/dnd5eTypings";
import storage from "@/app/common/sessionStorage";
import { useRouter } from "next/navigation";
import { AlertInfo, Alerts } from "../../common/alerts";
import { WebsocketContext } from '../../common/websocket-context';
import { Footer } from "@/app/common/footer";
import { TopNav } from "@/app/common/top-nav";
import { SessionContext } from "@/app/common/session-context";

export default function PlayerPage() {

	const [initiativeOrder, setInitiativeOrder] = useState<Character[]>([]);
	const [isGetDiceRoll, setIsGetDiceRoll] = useState(false);
	const [requestRollBody, setRequestRollBody] = useState<RequestPlayerInput>({ client_uuids: [], reason: '', dice_type: 20 });
	const [conditionOptions, setConditionOptions] = useState<APIReference[]>([]);
	const [skills, setSkills] = useState<APIReference[]>([]);
	const [alert, setAlert] = useState<AlertInfo | null>(null);

	const router = useRouter();
	const sessionId = storage().getItem("session")!;
	const clientId  = storage().getItem("clientId")!;
	const name = storage().getItem("player-name")!;

	const { sendMessage, sendJsonMessage, readyState, lastJsonMessage } =
		useWebSocket<WebsocketEvent>(`${process.env.NEXT_PUBLIC_WEBSOCKET_BASEURL}/sessions/${sessionId}/ws`);

	useEffect(() => {
		getLatestInitiativeOrder();
		getConditionOptions();
		getSkillOptions();		
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
					return;
				}
				case EventType.EndSession: {
					endSession();
					return;
				}
				case EventType.JoinSession: {
					if (!name) {
						router.push('/session');
						return;
					}

					sendJsonMessage({
						event_type: SubscriptionEventType.JoinSession,
						event_body: {
							session_uuid: sessionId,
							role: name == OBSERVER_NAME ? CharacterType.Observer : CharacterType.Player,
							name: name,
							client_uuid: EMPTY_GUID
						}
					});
				}
				case EventType.ReceiveClientId: {
					const body: any = lastJsonMessage.event_body;
					storage().setItem("clientId", body["client_uuid"]);
				}
			}
		}
	}, [lastJsonMessage]);

	function endSession() {
		setAlert({ type: 'info', message: 'The current session has ended.' });
		setTimeout(() => { router.push('/session') }, 5000);
	}

	function handleInputSubmit(rollValue: number) {
		setIsGetDiceRoll(false);
		addSessionInput(sessionId, {
			value: rollValue,
			client_uuid: clientId,
			reason: requestRollBody.reason,
			name: name
		})
			.then();
	}

	function getLatestInitiativeOrder() {
		getCharactersPlayer(sessionId)
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
			<SessionContext.Provider value={sessionId}>
				<WebsocketContext.Provider value={lastJsonMessage}>
					<TopNav isDM={false} />
					<Box sx={{ position: 'fixed', left: 0, right: 0, bottom: '60px', top: '64px', overflow: 'auto' }}>
						<Alerts info={alert} />
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
													<ConditionItem key={c} conditionId={c} conditionOptions={conditionOptions} />)}
												</Box>
											</Grid>
										</Grid>
									</Box>
								</div>
							))}
						</Box>
						<SkillRequest isOpen={isGetDiceRoll} skillName={requestRollBody.reason} diceType={requestRollBody.dice_type} skillOptions={skills} sendValue={handleInputSubmit} />
					</Box>
					<Footer />
				</WebsocketContext.Provider>
			</SessionContext.Provider>
		</>
	)
}
