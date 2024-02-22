import { ArmorAC, ArmorClass, ConditionAC, Monster, Senses, Speed, SpellAC } from '@/app/_apis/dnd5eTypings';
import { Box, Button, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Skeleton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import { FC } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const apiBaseUrl = 'https://www.dnd5eapi.co';

export interface MonsterInfoDialogProps {
	open: boolean,
	monsterInfo: Monster,
	onClose: () => void
}

export const MonsterInfoDialog: FC<MonsterInfoDialogProps> = ({ open, monsterInfo, onClose }) => {
	const handleClose = () => {
		onClose();
	}

	function showAC(ac: ArmorClass): string {
		switch(ac.type){
			case 'armor': {
				const armor = ac as ArmorAC				
				return `${armor.armor[0].name}: ${armor.value}`;
			}
			case 'armor': {
				const spell = ac as SpellAC				
				return `${spell.spell.name}: ${spell.value}`;
			}
			case 'armor': {
				const con = ac as ConditionAC				
				return `${con.condition.name}: ${con.value}`;
			}
			default: return  `${ac.type}: ${ac.value}`
		}
	}

	function showSpeed(speed: Speed): string {
		let speedArray = []
		let key: keyof typeof speed;
		for(key in speed){
			speedArray.push(`${key}: ${speed[key]}`);
		}
		return speedArray.join(', ');
	}

	function showSenses(senses: Senses): string {
		let sensesArray = []
		let key: keyof typeof senses;
		for(key in senses){
			sensesArray.push(`${key.replace('_', ' ')}: ${senses[key]}`);
		}
		return sensesArray.join(', ');
	}

	return (
		<>
			{(monsterInfo == null) ? '' : (
				<Dialog onClose={handleClose} open={open}>
					<DialogTitle sx={{ m: 0, p: 2 }}>
						{monsterInfo.name}
					</DialogTitle>
					<IconButton
						aria-label="close"
						onClick={handleClose}
						sx={{
							position: 'absolute',
							right: 8,
							top: 8,
							color: (theme) => theme.palette.grey[500],
						}}
					>
						<CloseIcon />
					</IconButton>
					<DialogContent>
						<Grid container spacing={1}>
							<Grid item xs={5}>
								{monsterInfo.image ?
									(<img
										src={`${apiBaseUrl}${monsterInfo.image}`}
										height={200}
										width={200}
										alt={monsterInfo.index}
										loading="lazy"
									/>) : 
									<img
										src='/No_image_available.png'
										height={200}
										width={200}
									/>}
							</Grid>
							<Grid item xs={7}>
								<Box><span className="bold-label">Size:</span> {monsterInfo.size}</Box>
								<Box><span className="bold-label">Type:</span> {monsterInfo.type}</Box>
								<Box><span className="bold-label">Alignment:</span> {monsterInfo.alignment}</Box>
								<Box><span className="bold-label">Languages:</span> {monsterInfo.languages}</Box>
								<Box><span className="bold-label">Speed:</span> {showSpeed(monsterInfo.speed)}</Box>
								<Box><span className="bold-label">Senses:</span> {showSenses(monsterInfo.senses)}</Box>
							</Grid>
						</Grid>
						<Box>{monsterInfo.desc}</Box>
						<Grid container spacing={2}>
							<Grid item xs={4}>
								<Box><span className="bold-label">Strength:</span> {monsterInfo.strength}</Box>
								<Box><span className="bold-label">Dexterity:</span> {monsterInfo.dexterity}</Box>
							</Grid>
							<Grid item xs={4}>
								<Box><span className="bold-label">Constution:</span> {monsterInfo.constitution}</Box>
								<Box><span className="bold-label">Intelligence:</span> {monsterInfo.intelligence}</Box>
							</Grid>
							<Grid item xs={4}>
								<Box><span className="bold-label">Wisdom:</span> {monsterInfo.wisdom}</Box>
								<Box><span className="bold-label">Charisma:</span> {monsterInfo.charisma}</Box>
							</Grid>
						</Grid>
						<Box><span className="bold-label">Damage Vulnerabilities:</span> {monsterInfo.damage_vulnerabilities.join(', ')}</Box>
						<Box><span className="bold-label">Damage Resistances:</span> {monsterInfo.damage_resistances.join(', ')}</Box>
						<Box><span className="bold-label">Damage Immunities:</span> {monsterInfo.damage_immunities.join(', ')}</Box>
						<Box><span className="bold-label">Condition Immunities:</span> {monsterInfo.condition_immunities.map(ci => ci.name).join(', ')}</Box>
						<Box><span className="bold-label">Armor Class:</span> {showAC(monsterInfo.armor_class[0])}</Box>
						<Box><span className="bold-label">Proficiency Bonus:</span> {monsterInfo.proficiency_bonus}</Box>
						<Box><span className="bold-label">Proficiencies:</span> {monsterInfo.proficiencies.map(p => `${p.proficiency.name}: ${p.value}`).join(', ')}</Box>
						<Accordion>
							<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
							aria-controls="actions-content"
							id="actions-header"
							>
							<span className="bold-label">Actions</span>
							</AccordionSummary>
							<AccordionDetails>
								<pre>{JSON.stringify(monsterInfo.actions, undefined, 1)}</pre>
							</AccordionDetails>
						</Accordion>
						<Accordion>
							<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
							aria-controls="legendary-actions-content"
							id="legendary-actions-header"
							>
							<span className="bold-label">Legendary Actions</span>
							</AccordionSummary>
							<AccordionDetails>
								<pre>{JSON.stringify(monsterInfo.legendary_actions, undefined, 1)}</pre>
							</AccordionDetails>
						</Accordion>
						<Accordion>
							<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
							aria-controls="special-abilities-content"
							id="special-abilitie-header"
							>
							<span className="bold-label">Special Abilities</span>
							</AccordionSummary>
							<AccordionDetails>
								<pre>{JSON.stringify(monsterInfo.special_abilities, undefined, 1)}</pre>
							</AccordionDetails>
						</Accordion>
					</DialogContent>
				</Dialog>)}
		</>
	);
}