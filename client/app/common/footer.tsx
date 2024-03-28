import { FC, useContext, useEffect, useState } from "react";

import { WebsocketContext } from "./websocket-context";
import { SessionContext } from "./session-context";
import { Paper } from "@mui/material";
import { ChatBox } from "../[sessionid]/chat/chat-box";
import { SendPlayerMessage } from "../[sessionid]/chat/send-player-message";
import { PlayerMessage } from "../_apis/playerInput";
import { EventType } from "../_apis/eventType";
import { Character, CharacterType, EMPTY_GUID, FieldType, LogicType, OperatorType } from "../_apis/character";
import { getCharacters } from "../_apis/characterApi";

export interface FooterProps {
}

export const Footer: FC<FooterProps> = ({ }) => {
    const [secretBody, setSecret] = useState<PlayerMessage | null>(null);
    const [playerOptions, setPlayerOptions] = useState<Character[]>([]);

    let lastJsonMessage = useContext(WebsocketContext);
    let sessionId = useContext(SessionContext);

    useEffect(() => {
		loadPlayerOptions();
	}, []);


    useEffect(() => {
		if (lastJsonMessage !== null) {
			switch (lastJsonMessage.event_type) {
                case EventType.ReceiveOrderUpdate: {
					loadPlayerOptions();
					return;
				}
				case EventType.ReceiveMessage: {
					setSecret(lastJsonMessage.event_body);
					return;
				}
			}
		}
	}, [lastJsonMessage]);

    
	function loadPlayerOptions() {
		getCharacters(sessionId, {
			filters: [{
				field: FieldType.Role,
				operator: OperatorType.Equals,
				value: CharacterType.Player
			}],
			logic: LogicType.And
		})
			.then(c => {
				const withAll: Character[] = [];
				if (c && c.length) {
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

    return (<>
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
            <SendPlayerMessage recipientOptions={playerOptions} />
            <ChatBox recipientOptions={playerOptions} secretInfo={secretBody!} />
        </Paper>
    </>);
}