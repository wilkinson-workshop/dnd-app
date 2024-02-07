import type { Identifier, XYCoord } from 'dnd-core'
import type { FC } from 'react'
import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { ItemTypes } from './item-types'
import { Character } from '@/app/_apis/character'
import { CharacterHp } from './character-hp'
import { CharacterConditions } from './character-conditions'
import { Box, Grid, IconButton, styled } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit';

const style = {
  border: '1px solid lightgray',
  //padding: '0.5rem 1rem',
  cursor: 'move',
}

export interface CardProps {
  character: Character,
  index: number,
  moveCard: (dragIndex: number, hoverIndex: number) => void,
  updateCharacter: (character: Character) => void,
  updateCharacterButton: (character: Character) => void,
  deleteCharacter: (character: Character) => void
}

interface DragItem {
  index: number
  id: string
  type: string
}

export const Card: FC<CardProps> = ({ character, index, moveCard, updateCharacter, updateCharacterButton, deleteCharacter }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { character, index }
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const Item = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),  
  })); 
  

  const opacity = isDragging ? 0 : 1
  drag(drop(ref))
  return (
    <div ref={ref} style={{ ...style, opacity }} data-handler-id={handlerId}>
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={1}>
            <Item>{character.initiative }</Item>
          </Grid>
          <Grid item xs={2}>
            <Item>{character.name}</Item>
          </Grid>
          <Grid item xs={3}>
            <Item><CharacterHp character={character}/></Item>
          </Grid>
          <Grid item xs={4}>
            <Item><CharacterConditions character={character} updateCharacter={updateCharacter}/></Item>
          </Grid>
          <Grid item xs={2}>
            <Item style={{"textAlign": "right"}}>
              <IconButton aria-label="edit" onClick={() => updateCharacterButton(character)}>
                <EditIcon />
              </IconButton>       
              <IconButton aria-label="delete" onClick={() => deleteCharacter(character)}>
                  <DeleteIcon />
              </IconButton>
            </Item> 
          </Grid>
        </Grid>
      </Box>
    </div>
  )
}