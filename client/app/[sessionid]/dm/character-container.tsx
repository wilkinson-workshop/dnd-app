import type { FC } from 'react'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Card } from './character-card'
import { Character, LogicType } from '@/app/_apis/character'
import { deleteCharacter, getCharacters, saveCharacter } from '@/app/_apis/characterApi'
import { EditCharacter } from './edit-character';
import { updateInitiativeTop } from '@/app/_apis/sessionApi'
import { AddCharacterDialog } from './add-character-dialog'
import { WebsocketContext } from './websocket-context'
import { EventType } from '@/app/_apis/eventType'

const style = {
	minHeight: '30px',
	border: '#ebebeb solid 1px',
	margin: '10px 0'
}

export interface ContainerProps {
	sessionId: string,
}

export const Container: FC<ContainerProps> = ({ sessionId }) => {
	const [cards, setCards] = useState<Character[]>([]);
	const [characterEdit, setCharacterEdit] = useState<Character | null>(null);

	let lastJsonMessage = useContext(WebsocketContext);

	const cardsRef = useRef<Character[]>([]);

	cardsRef.current = cards;

	useEffect(() => {
		reloadList();
	},[]);

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

	function markDone(){
		updateCurrentInOrder(cardsRef.current[1]);
	}

	function updateCurrentInOrder(character: Character){
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
			<AddCharacterDialog sessionId={sessionId} />
			<div style={style}>{cards && cards.length > 0 ?
				cards.map((card, i) => renderCard(card, i)) :
				(
					<div style={{ display: "inline-block", padding: "5px" }}>Please add Characters</div>
				)
			}
			</div>
			<EditCharacter existingCharacter={characterEdit} onSaveClick={updateCharacter} onCancelClick={() => setCharacterEdit(null)} />
		</>
	)
}