import type { FC } from 'react'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Card } from './character-card'
import { Character, LogicType } from '@/app/_apis/character'
import { deleteCharacter, getCharacters, saveCharacter } from '@/app/_apis/characterApi'
import { EditCharacter } from './edit-character';
import { updateInitiativeTop } from '@/app/_apis/sessionApi'
import { AddCharacterDialog } from './add-creature/add-character-dialog'
import { WebsocketContext } from '../../common/websocket-context'
import { EventType } from '@/app/_apis/eventType'
import { Box, Grid } from '@mui/material'
import { SessionContext } from '@/app/common/session-context'

export interface ContainerProps {}

export const Container: FC<ContainerProps> = ({ }) => {
	const [cards, setCards] = useState<Character[]>([]);
	const [characterEdit, setCharacterEdit] = useState<Character | null>(null);

	let lastJsonMessage = useContext(WebsocketContext);
	let sessionId = useContext(SessionContext);

	const cardsRef = useRef<Character[]>([]);

	cardsRef.current = cards;

	useEffect(() => {
		reloadList();
	}, []);

	useEffect(() => {
		if (lastJsonMessage !== null) {
			switch (lastJsonMessage.event_type) {
				case EventType.ReceiveOrderUpdate: {
					reloadList();
					return;
				}
			}
		}
	}, [lastJsonMessage]);

	function markDone() {
		updateCurrentInOrder(cardsRef.current[1]);
	}

	function updateCurrentInOrder(character: Character) {
		updateInitiativeTop(sessionId, character.creature_id)
			.then(_ => reloadList());
	}

	function onDelete(character: Character) {
		deleteCharacter(sessionId, character.creature_id)
			.then(_ => reloadList());
	}

	function updateCharacter(character: Character) {
		saveCharacter(sessionId, character)
			.then(_ => reloadList());
	}

	function reloadList() {
		getCharacters(sessionId, { filters: [], logic: LogicType.Or })
			.then(c => {
				setCharacterEdit(null);
				setCards(c);
			});
	}

	const renderCard = useCallback(
		(card: Character, index: number) => {
			return (
				<Card
					key={card.creature_id}
					index={index}
					character={card}
					updateCharacter={updateCharacter}
					markDone={markDone}
					updateCharacterButton={(c: Character) => setCharacterEdit(c)}
					deleteCharacter={onDelete}
				/>
			)
		},
		[],
	)

	return (
		<>
			<AddCharacterDialog />
			<Box sx={{ minHeight: '30px', m: '10px 0' }}>
				<Box sx={{ fontSize: "14px" }}>
					<Grid container spacing={2}>
						<Grid item xs={1} sm={1}>
							<Box className="item">
								Initiative
							</Box>
						</Grid>
						<Grid item xs={1} sm={1}>
							<Box className="item">
								AC
							</Box>
						</Grid>
						<Grid item xs={5} sm={3}>
							<Box className="item">
								Name
							</Box>
						</Grid>
						<Grid item xs={6} sm={3}>
							<Box className="item">
								HP
							</Box>
						</Grid>
						<Grid item xs={8} sm={2}>
							<Box className="item">
								Condtitions
							</Box>
						</Grid>
						<Grid item xs={4} sm={2}>
							<Box className="item" sx={{ textAlign: "right" }}>
								Actions
							</Box>
						</Grid>
					</Grid>
				</Box>
				{cards && cards.length > 0 ?
					cards.map((card, i) => renderCard(card, i))
					:
					(<Box sx={{ textAlign: 'center', fontSize: '20px', border: '#ebebeb solid 1px', padding: '5px' }}>No Creatures</Box>)
				}
			</Box>
			<EditCharacter existingCharacter={characterEdit} onSaveClick={updateCharacter} onCancelClick={() => setCharacterEdit(null)} />
		</>
	)
}