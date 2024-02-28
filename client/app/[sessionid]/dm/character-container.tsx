import update from 'immutability-helper'
import type { FC } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Card } from './character-card'
import { Character, CharacterType, EMPTY_GUID, LogicType } from '@/app/_apis/character'
import { addCharacter, addMultipleCharacter, deleteCharacter, getCharacters, saveCharacter } from '@/app/_apis/characterApi'
import { AddCharacter } from './add-edit-character';
import { AddRandomCharacter } from './add-random-character'
import { updateInitiativeTop } from '@/app/_apis/sessionApi'

const style = {
	minHeight: '30px',
	border: '#ebebeb solid 1px',
	margin: '10px 0'
}

export interface ContainerState {
	cards: Character[]
}

export interface ContainerProps {
	sessionId: string,
	reload: boolean,
	reloadDone: () => void
}

export const Container: FC<ContainerProps> = ({ sessionId, reload, reloadDone }) => {

	const [cards, setCards] = useState<Character[]>([]);
	const [characterEdit, setCharacterEdit] = useState<Character | null>(null);

	const cardsRef = useRef<Character[]>([]);

	cardsRef.current = cards;

	useEffect(() => {
		reloadList();
	},[]);

	useEffect(() => {
		if(reload){
			reloadList();
			reloadDone();
		}
	}, [reload])


	const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
		setCards((prevCards: Character[]) =>
			update(prevCards, {
				$splice: [
					[dragIndex, 1],
					[hoverIndex, 0, prevCards![dragIndex] as Character],
				],
			}),
		)
	}, [setCards])

	function dropCard(index: number, character: Character) {
		return; //for now

		//check to make sure character was moved to the end of the order.
		if(cardsRef.current.length -1 == index){
			updateCurrentInOrder(cardsRef.current[1]);
		}
	}

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

	function handleAddCharacter(character: Character) {
		if (character.creature_id == EMPTY_GUID) {
			addCharacter(sessionId, character)
				.then(_ => reloadList());
		} else {
			saveCharacter(sessionId, character)
				.then(_ => reloadList());
		}
	}

	function handleAddMultipleCharacters(characters: Character[]) {
		addMultipleCharacter(sessionId, { characters })
			.then(_ => reloadList());
	}

	const renderCard = useCallback(
		(card: Character, index: number) => {
			return (
				<Card
					key={card.creature_id}
					index={index}
					character={card}
					moveCard={moveCard}
					dropCard={dropCard}
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
			<div style={style}>{cards && cards.length > 0 ?
				cards.map((card, i) => renderCard(card, i)) :
				(
					<div style={{ display: "inline-block", padding: "5px" }}>Please add Characters</div>
				)
			}
			</div>
			<AddCharacter existingCharacter={characterEdit} onAddClick={handleAddCharacter} onCancelClick={() => setCharacterEdit(null)} />
			<AddRandomCharacter onAddClick={handleAddMultipleCharacters} onCancelClick={() => setCharacterEdit(null)} />
		</>
	)
}