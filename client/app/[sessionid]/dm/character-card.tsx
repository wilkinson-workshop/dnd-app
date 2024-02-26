import type { Identifier, XYCoord } from 'dnd-core'
import type { FC, VoidFunctionComponent } from 'react'
import { memo, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { ItemTypes } from './item-types'
import { Character, CharacterType } from '@/app/_apis/character'
import { CharacterHp } from './character-hp'
import { CharacterConditions } from './character-conditions'
import { Box, Button, Grid, IconButton, styled } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import DoneIcon from '@mui/icons-material/Done';
import { getMonster } from '@/app/_apis/dnd5eApi'
import { Monster } from '@/app/_apis/dnd5eTypings'
import { MonsterInfoDialog } from './monster-dialog'
import { ResponseDialog, ResponseDialogInfo } from '@/app/common/response-dialog'
import { Gradient, GradientTwoTone } from '@mui/icons-material'

const style = {
	border: '1px solid lightgray',
	cursor: 'move',
}

export interface CardProps {
	character: Character,
	index: number,
	moveCard: (dragIndex: number, hoverIndex: number) => void,
	dropCard: (index: number, character: Character) => void,
	markDone: () => void,
	updateCharacter: (character: Character) => void,
	updateCharacterButton: (character: Character) => void,
	deleteCharacter: (character: Character) => void
}

interface DragItem {
	index: number
	character: Character
}

export const Card: FC<CardProps> = memo(function Card({ character, index, moveCard, dropCard, markDone, updateCharacter, updateCharacterButton, deleteCharacter }) {
	const [monsterInfo, setMonsterInfo] = useState<Monster | null>(null);
	const [isMonsterInfoOpen, setIsMonsterInfoOpen] = useState(false);
	const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
	const responseDialogInfo: ResponseDialogInfo = {title: 'Delete', message: 'Are you sure you want to delete this Creature?'};

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
		drop(item: DragItem, monitor) {
			dropCard(item.index, item.character);
		}
	});

	const [{ isDragging }, drag] = useDrag({
		type: ItemTypes.CARD,
		item: () => {
			return { character, index }
		},
		collect: (monitor: any) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	function handleDelete(){
		//extra caution deleting PC or creatures with hp left
		if (character.hit_points[0] != 0 || character.role == CharacterType.Player) {
			setIsResponseDialogOpen(true);
		} else {
			deleteCharacter(character);	
		}			
	}

	function getMonsterInfo(monsterId: string) {
		if (monsterInfo) {
			setIsMonsterInfoOpen(true);
		} else {
			getMonster(monsterId)
				.then(m => {
					setMonsterInfo(m);
					setIsMonsterInfoOpen(true);
				});
		}
	}

	const handleMonsterDialogClose = () => {
		setIsMonsterInfoOpen(false);
	};

	const handleResponseDialogClose = (isYes: boolean) => {
		setIsResponseDialogOpen(false);
		if(isYes){
			deleteCharacter(character);
		}
	}

	const opacity = isDragging ? 0 : 1
	drag(drop(ref))
	return (
		<>
			<MonsterInfoDialog
				open={isMonsterInfoOpen}
				monsterInfo={monsterInfo!}
				onClose={handleMonsterDialogClose}
			/>
			<ResponseDialog
				open={isResponseDialogOpen}
				info={responseDialogInfo}
				onClose={handleResponseDialogClose}
			/>
			<div ref={ref} style={{ ...style, opacity }} data-handler-id={handlerId}>
				<Box>
					<Grid container spacing={2}>
						<Grid item xs={1} sm={1}>
							<Box className="item">{character.initiative}</Box>
						</Grid>
						<Grid item xs={5} sm={3}>
							<Box className="item">
								{character.name}
								{
									character.role == CharacterType.NonPlayer ?
										(<IconButton aria-label="delete" onClick={() => getMonsterInfo(character.monster!)}>
											<InfoIcon />
										</IconButton>) : ''
								}
							</Box>
						</Grid>
						<Grid item xs={6} sm={3}>
							<Box className="item">
								<CharacterHp character={character} />
							</Box>
						</Grid>
						<Grid item xs={8} sm={3}>
							<Box className="item">
								<CharacterConditions character={character} updateCharacter={updateCharacter} />
							</Box>
						</Grid>
						<Grid item xs={4} sm={2}>
							<Box className="item" style={{ "textAlign": "right" }}>
								<IconButton aria-label="edit" onClick={() => updateCharacterButton(character)}>
									<EditIcon />
								</IconButton>
								<IconButton aria-label="delete" onClick={handleDelete}>
									<DeleteIcon />
								</IconButton>
							</Box>
						</Grid>
					</Grid>
				</Box>
				{index == 0 ? 
				(<Box>
					<Button fullWidth aria-label="done" variant='contained' color='primary' onClick={() => markDone()}>
						Next Character
					</Button>
				</Box>): ''}
			</div>
		</>);
})