import update from 'immutability-helper'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { Card } from './character-card'
import { Character } from '@/app/_apis/character'
import { addCharacter, deleteCharacter, getCharacters, saveCharacter } from '@/app/_apis/characterApi'
import { AddCharacter } from './add-character'
import { Button } from '@mui/material'

const style = {
    minHeight: '30px',
    border: '#ebebeb solid 1px',
    margin: '10px'

}

export interface ContainerState {
  cards: Character[]
}

export interface ContainerProps{sessionId: string}

export const Container: FC<ContainerProps> = ({sessionId}) => {
  {
    const [cards, setCards] = useState<Character[]>([]);
    const [didPageInit, setPageInit] = useState(false);

    if(!didPageInit){
      setPageInit(true);//assumes success no retry logic
      getCharacters(sessionId).then(c => {
        setCards(c);
      });
    }

    const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
      setCards((prevCards: Character[]) =>
        update(prevCards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevCards[dragIndex] as Character],
          ],
        }),
      )
    }, [])

    function onDelete(npcId: string){
      deleteCharacter(sessionId, npcId)
      .then(_ => reloadList());
    }

    function updateCharacter(character: Character){
      if(character.hp == 0){
        onDelete(character.id);
      } else {
        saveCharacter(sessionId, character)
        .then(_ => reloadList());
      }
    }

    function reloadList(){
      getCharacters(sessionId)
      .then(c => {
        setCards(c);
      });
    }

    function handleAddCharacter(character: Character){
      addCharacter(sessionId, character)
      .then(_ => reloadList());
    }

    const renderCard = useCallback(
      (card: Character, index: number) => {
        return (
          <Card
            key={card.id}
            index={index}
            character={card}
            moveCard={moveCard}
            updateCharacter={updateCharacter}
          />
        )
      },
      [],
    )

    return (
      <>
        <div style={style}>{cards.length > 0 ?
          cards.map((card, i) => renderCard(card, i)):
          (
            <div style={{display:"inline-block", padding: "5px"}}>Please add Characters</div>
          )        
        }
        </div>        
        <AddCharacter onAddClick={handleAddCharacter} />
        <div>
          {/* <Button variant="contained" aria-label="load" onClick={reloadList}>
            Load Characters
          </Button> */}
        </div>
         
      </>
    )
  }
}