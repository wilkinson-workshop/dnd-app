import update from 'immutability-helper'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { Card } from './character-card'
import { Character, EMPTY_GUID, LogicType } from '@/app/_apis/character'
import { addCharacter, deleteCharacter, getCharacters, saveCharacter } from '@/app/_apis/characterApi'
import { AddCharacter } from './add-edit-character';

const style = {
    minHeight: '30px',
    border: '#ebebeb solid 1px',
    margin: '10px 0'
}

export interface ContainerState {
  cards: Character[]
}

export interface ContainerProps{
  sessionId: string, 
  reload: boolean,
  reloadDone: () => void
}

export const Container: FC<ContainerProps> = ({sessionId, reload, reloadDone}) => {

  const [cards, setCards] = useState<Character[] | null>(null);
  const [characterEdit, setCharacterEdit] = useState<Character | null>(null);

  if(cards == null  || reload){
    reloadDone();
    reloadList();    
  }

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setCards((prevCards: Character[] | null) =>
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards![dragIndex] as Character],
        ],
      }),
    )
  }, [])

  function onDelete(character: Character){
    deleteCharacter(sessionId, character.creature_id)
    .then(_ => reloadList());
  }

  function updateCharacter(character: Character){
      saveCharacter(sessionId, character)
      .then(_ => reloadList());
  }

  function reloadList(){
    getCharacters(sessionId, {filters: [], logic: LogicType.Or})
    .then(c => {
      setCharacterEdit(null);
      setCards(c);
    });
  }

  function handleAddCharacter(character: Character){
    if(character.creature_id == EMPTY_GUID){
      addCharacter(sessionId, character)
      .then(_ => reloadList());
    } else {
      saveCharacter(sessionId, character)
      .then(_ => reloadList());
    }
  }

  const renderCard = useCallback(
    (card: Character, index: number) => {
      return (
        <Card
          key={card.creature_id}
          index={index}
          character={card}
          moveCard={moveCard}
          updateCharacter={updateCharacter}
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
        cards.map((card, i) => renderCard(card, i)):
        (
          <div style={{display:"inline-block", padding: "5px"}}>Please add Characters</div>
        )        
      }
      </div>        
      <AddCharacter existingCharacter={characterEdit} onAddClick={handleAddCharacter} onCancelClick={() => setCharacterEdit(null)} />         
    </>
  )
}