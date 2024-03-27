import type { FC } from 'react'
import { memo, useContext, useEffect, useState } from 'react'
import { Character, CharacterType } from '@/app/_apis/character'
import { CharacterHp } from './character-hp'
import { CharacterConditions } from './character-conditions'
import { Box, Button, Grid, IconButton, styled } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import { getMonster } from '@/app/_apis/dnd5eApi';
import { CUSTOM_MONSTER, getCustomMonster } from '@/app/_apis/customMonsterApi';
import { ArmorAC, ArmorClass, ConditionAC, Monster, SpellAC } from '@/app/_apis/dnd5eTypings'
import { MonsterInfoDialog } from './monster-dialog'
import { ResponseDialog, ResponseDialogInfo } from '@/app/common/response-dialog'
import { SessionContext } from '../../common/session-context'

const style = {
	border: '1px solid lightgray',
}

export interface CardProps {
	character: Character,
	index: number,
	markDone: () => void,
	updateCharacter: (character: Character) => void,
	updateCharacterButton: (character: Character) => void,
	deleteCharacter: (character: Character) => void
}

export const Card: FC<CardProps> = memo(function Card({ character, index, markDone, updateCharacter, updateCharacterButton, deleteCharacter }) {
	const [monsterInfo, setMonsterInfo] = useState<Monster>(CUSTOM_MONSTER);
	const [isMonsterInfoOpen, setIsMonsterInfoOpen] = useState(false);
	const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
	const [responseDialogInfo, setResponseDialogInfo] = useState<ResponseDialogInfo>({title: 'Delete', message: []});

	let sessionId = useContext(SessionContext);

	useEffect(() => {
		getMonsterInfo(character.monster!)
	}, [])

	function handleDelete(){
		//extra caution deleting PC or creatures with hp left
		if (character.hit_points[0] != 0 || character.role == CharacterType.Player) {
			let message = [`Are you sure you want to delete ${character.name}? `];
			if(character.hit_points[0] != 0){
				message.push(`${character.name} still has hp left.`);
			}

			if(character.role == CharacterType.Player){
				message.push(`${character.name} is a player character.`);
			}

			setResponseDialogInfo({title: responseDialogInfo.title, message: message});

			setIsResponseDialogOpen(true);
		} else {
			deleteCharacter(character);	
		}			
	}

	function getMonsterInfo(monsterId: string) {
		let getApi: Promise<Monster>;
		if(monsterId.startsWith('custom')){
			getApi = getCustomMonster(sessionId, monsterId)
		} else {
			getApi = getMonster(monsterId)
		}

		getApi
		.then(m => {
			setMonsterInfo(m);
		});
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

	function showAC(ac: ArmorClass): string {
		switch (ac.type) {
			case 'armor': {
				const armor = ac as ArmorAC
				if (armor.armor) {
					return `${armor.value}`;
				} else {
					return `${armor.value}`
				}
			}
			case 'spell': {
				const spell = ac as SpellAC
				return `${spell.value}`;
			}
			case 'condition': {
				const con = ac as ConditionAC
				return `${con.value}`;
			}
			default: return `${ac.value}`
		}
	}

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
			<div style={{ ...style }}>
				<Box>
					<Grid container spacing={2}>
						<Grid item xs={1} sm={1}>
							<Box className="item">{character.initiative}</Box>
						</Grid>
						<Grid item xs={1} sm={1}>
							<Box className="item">{showAC(monsterInfo.armor_class[0])}</Box>
						</Grid>
						<Grid item xs={5} sm={3}>
							<Box className="item">
								{character.name}
								{
									character.role == CharacterType.NonPlayer ?
										(<IconButton aria-label="delete" onClick={() => setIsMonsterInfoOpen(true)}>
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
						<Grid item xs={8} sm={2}>
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