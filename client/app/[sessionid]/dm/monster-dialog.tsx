import { Action, ActionType, ArmorAC, ArmorClass, ArrayOptionsSet, Attack, Choice, ConditionAC, DC, Damage, EquipmentCategoryOptionsSet, Monster, OptionSet, OptionsArrayOption, ReferenceListOptionsSet, Senses, SpecialAbility, SpecialAbilitySpell, Speed, SpellAC, Spellcasting, Usage, abiltyBonusOptionType, abiltyMinOptionType, actionOptionType, alignmentsOptionType, choiceOptionType, countOptionType, damageDcOptionType, damageOptionType, itemOptionType, multipleOptionType, stringOptionType } from '@/app/_apis/dnd5eTypings';
import { Box, DialogContent, DialogTitle, Grid, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import { FC } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SpellItem } from './spell-item';

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
				if(armor.armor){
					return `${armor.armor.map(a => `${a.name}: ${armor.value}`).join(', ')}`;
				} else {
					return `${armor.type}: ${armor.value}`
				}
			}
			case 'spell': {
				const spell = ac as SpellAC				
				return `${spell.spell.name}: ${spell.value}`;
			}
			case 'condition': {
				const con = ac as ConditionAC				
				return `${con.condition.name}: ${con.value}`;
			}
			default: return `${ac.type}: ${ac.value}`
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

	function showDC(dc: DC): string {
		return `${dc.dc_type.name} save of ${dc.dc_value}. Effects of save: ${dc.success_type}`
	}

	function showDamage(damage: Damage): string {
		return `${damage.damage_dice} of ${damage.damage_type.name}`
	}

	function showAttack(attack: Attack): string {
		return `${attack.name}: ${showDC(attack.dc)} - ${showDamage(attack.damage)}`;
	}

	function showActionType(actionType: ActionType): string {
		return `(${actionType.type}) ${actionType.count} ${actionType.action_name}.`
	}

	function showAction(action: Action, index: number) {
		return (<Box key={index} sx={{marginTop: 1, paddingTop: 1, borderTop: '1px solid lightgrey'}}>
			<Box><span className="bold-label">Name:</span> {action.name}</Box>
			<Box sx={{whiteSpace: 'pre-wrap'}}><span className="bold-label">Description:</span> {action.desc}</Box>
			{/* 
			Description seems to have all this info already.
			{action.dc ? (<Box><span className="bold-label">DC:</span> {showDC(action.dc)}</Box>): ''}
			{action.attack_bonus ? (<Box><span className="bold-label">Attack Bonus</span> {action.attack_bonus}</Box>): ''}
			{action.damage ? 
				(<Box><span className="bold-label">Damage:</span>{action.damage.map((d, i) => (
					<Box key={i}>{d.hasOwnProperty('from') ? showActionOptions(d as Choice): showDamage(d as Damage)}</Box>
				))}</Box>)
				: ''
			}
			{action.attacks ? 
				(<Box><span className="bold-label">Attack:</span>{action.attacks.map((a, i) => (
					<Box key={i}>{showAttack(a)}</Box>
				))}</Box>)
				:''
			}
			{action.multiattack_type == 'actions' ?
				(<Box>{action.actions.map((a, i) => (
					<Box key={i}>{showActionType(a)}</Box>
				))}</Box>)
				:''
			}
			{action.multiattack_type == 'action_options' ?
				showActionOptions(action.action_options)
				:''
			}
			{action.options ? 
				showActionOptions(action.options)
				:''
			}
			{
				action.usage ? showUsage(action.usage) : ''
			} */}
		</Box>);
	}

	function showActionOptions(choice: Choice) {
		return (<Box sx={{marginLeft: 1, whiteSpace: 'pre-wrap'}}>
			{choice.desc}
			<span className="bold-label">Choose {choice.choose} Group:</span>
			{showOptionSet(choice.from)}
		</Box>)
	}

	function showOptionSet(optionSet: OptionSet){
		switch(optionSet.option_set_type){
			case 'options_array': {
				const set = optionSet as ArrayOptionsSet;
				return set.options.map((o, i) => (<Box key={i} sx={{marginBottom: 1, border: '1px solid lightgrey',}}>{showOptionsArrayOption(o)}</Box>));			
			}
			case 'equipment_category': {
				const set = optionSet as EquipmentCategoryOptionsSet;
				return `${set.equipment_category.name}`
			}
			case 'reference_list': {
				const set = optionSet as ReferenceListOptionsSet;
				return `${set.reference_list}`
			}			
		}
	}

	function showOptionsArrayOption(set: OptionsArrayOption): any{
		switch(set.option_type){
			case 'action': {
				const type = set as actionOptionType;
				return (<Box>{showActionType(type)}</Box>);
			}
			case 'multiple': {
				const type = set as multipleOptionType;
				return (<Box>{type.items.map((i, e) => (<Box key={e}>{showOptionsArrayOption(i)}</Box>))}</Box>)
			}
			//Adult silver Dragon
			case 'breath': {
				const type = set as damageDcOptionType;
				const damage = type.damage ? type.damage.map(d => showDamage(d)) : '';
				return `${type.name} ${showDC(type.dc)} ${damage}`;
			}
			// case 'item': {//unknown option type value
			// 	const type = set as itemOptionType;
			// 	return type.item.name;
			// }
			// case 'choice': { //unknown option type value
			// 	const type = set as choiceOptionType;
			// 	return showActionOptions(type.choice);
			// }
			// case 'string': {
			// 	const type = set as stringOptionType;
			// 	return type.string;
			// }
			// case 'alignments': {
			// 	const type = set as alignmentsOptionType;
			// 	return (<Box sx={{whiteSpace: 'pre-wrap'}}>
			// 		{type.desc}
			// 		{type.alignments.map(a => a.name).join(',')}
			// 	</Box>);
			// }
			// case 'count': {
			// 	const type = set as countOptionType;
			// 	return `${type.count} ${type.of.name}`;
			// }
			// case 'abilitymin': {
			// 	const type = set as abiltyMinOptionType;
			// 	return `${type.ability_score.name} Minimum: ${type.minimus_score}`;
			// }
			// case 'abilitybonus': {
			// 	const type = set as abiltyBonusOptionType;
			// 	return `${type.ability_score.name} Bonus: ${type.bonus}`;
			// }
			case 'damage': {
				const type = set as damageOptionType;
				return `${type.notes} ${showDamage({damage_type: type.damage_type, damage_dice: type.damage_dice})}`;
			}
		}
		return (<pre>{JSON.stringify(set, undefined, 1)}</pre>)
	}

	function showSpecialAbilities(ability: SpecialAbility, index: number) {
		return (<Box key={index} sx={{marginTop: 1, paddingTop: 1, borderTop: '1px solid lightgrey'}}>
			<Box><span className="bold-label">Name: </span>{ability.name}</Box>
			<Box sx={{whiteSpace: 'pre-wrap'}}><span className="bold-label">Description: </span>{ability.desc}</Box>
			{ability.dc ? (<Box><span className="bold-label">DC: </span>{showDC(ability.dc)}</Box>): ''}
			{ability.attack_bonus ? (<Box><span className="bold-label">Attack Bonus: </span>{ability.attack_bonus}</Box>): ''}
			{ability.damage && ability.damage.length > 0 ? 
				(<Box><span className="bold-label">Damage: </span>{ability.damage.map(d => showDamage(d))}</Box>)
				: ''
			}
			{ability.usage ? showUsage(ability.usage): ''}
			{ability.spellcasting ? 
				showSpellcasting(ability.spellcasting)
				:''
			}
		</Box>);
	}

	function showSlots(slots: any){
		let ret: {level: string, count: number}[] = [];
		for (var key in slots) { 
			if (slots.hasOwnProperty(key)) { 
				ret.push({level: key, count: slots[key]})
			} 
		}

		return ret.map(r => (<Box>{`${r.level}: ${r.count}`}</Box>));
	}

	function showSpells(spells: SpecialAbilitySpell[]){
		return spells.map(s => (<Box>
			{`${s.level}:`} <SpellItem spell={s} /> {s.usage ? showUsage(s.usage): ''}
		</Box>))
	}

	function showUsage(usage: Usage){
		const restType = usage.rest_types && usage.rest_types.length > 0 ?
			`Rest Type: ${usage.rest_types.join(', ')}`
			: '';

		let times = '';
		if(usage.type == 'per day'){
			times = `${usage.times ? usage.times: '1'} times`;
		}

		return (<Box>
				<span className="bold-label">Usage: </span> 
				{`${times} ${usage.type}. ${restType}`}
			</Box>)
	}

	//archmage example
	function showSpellcasting(spellcasting: Spellcasting){
		return (
		<Box><span className="bold-label">Spellcasting: </span>
			<Box sx={{marginLeft: 2}}>
				{/* 
				<Box><span className="bold-label">Level: </span>{spellcasting.level}</Box>
				<Box><span className="bold-label">Ability: </span>{spellcasting.ability.name}</Box>
				<Box><span className="bold-label">DC: </span>{spellcasting.dc}</Box>
				<Box><span className="bold-label">Modifier: </span>{spellcasting.modifier}</Box>
				<Box><span className="bold-label">Components Required: </span>{spellcasting.components_required.join(', ')}</Box>
				<Box><span className="bold-label">School: </span>{spellcasting.school}</Box>
				<Box><span className="bold-label">Slots: </span>{showSlots(spellcasting.slots)}</Box> 
				*/}
				<Box><span className="bold-label">Spells: </span>{showSpells(spellcasting.spells)}</Box>
			</Box>
		</Box>)
	}

	return (
		<>
			{(monsterInfo == null) ? '' : (
				<Dialog onClose={handleClose} open={open}>
					<DialogTitle sx={{ m: 0, paddingX: 2, paddingY:1, fontWeight: 700 }}>
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
					<DialogContent sx={{paddingTop: 1}}>
						<Grid container spacing={1}>
							<Grid item xs={12} sm={5}>
								{monsterInfo.image ?
									(<img
										src={`${apiBaseUrl}${monsterInfo.image}`}
										className='autoImage'
										alt={monsterInfo.index}
										loading="lazy"
									/>) : 
									<img className='autoImage'
										src='/No_image_available.png'
									/>}
							</Grid>
							<Grid item xs={12} sm={7}>
								<Box><span className="bold-label">Size: </span>{monsterInfo.size}</Box>
								<Box><span className="bold-label">Type: </span>{monsterInfo.type}</Box>
								<Box><span className="bold-label">Alignment: </span>{monsterInfo.alignment}</Box>
								<Box><span className="bold-label">Languages: </span>{monsterInfo.languages ? monsterInfo.languages : 'None'}</Box>
								<Box><span className="bold-label">Speed: </span>{showSpeed(monsterInfo.speed)}</Box>
								<Box><span className="bold-label">Senses: </span>{showSenses(monsterInfo.senses)}</Box>
							</Grid>
						</Grid>
						<Box sx={{whiteSpace: 'pre-wrap'}}>{monsterInfo.desc}</Box>
						<Grid sx={{paddingTop: 1}} container spacing={2}>
							<Grid item xs={4}>
								<Box><span className="bold-label">Strength: </span>{monsterInfo.strength}</Box>
								<Box><span className="bold-label">Dexterity: </span>{monsterInfo.dexterity}</Box>
							</Grid>
							<Grid item xs={4}>
								<Box><span className="bold-label">Constution: </span>{monsterInfo.constitution}</Box>
								<Box><span className="bold-label">Intelligence: </span>{monsterInfo.intelligence}</Box>
							</Grid>
							<Grid item xs={4}>
								<Box><span className="bold-label">Wisdom: </span>{monsterInfo.wisdom}</Box>
								<Box><span className="bold-label">Charisma: </span>{monsterInfo.charisma}</Box>
							</Grid>
						</Grid>						
						<Box><span className="bold-label">Damage Vulnerabilities: </span> 
							{monsterInfo.damage_vulnerabilities.length > 0 ? 
								monsterInfo.damage_vulnerabilities.join(', ')
								:'None'
							}
						</Box>
						<Box><span className="bold-label">Damage Resistances: </span> 
							{monsterInfo.damage_resistances.length > 0 ? 
								monsterInfo.damage_resistances.join(', ')
								:'None'
							}
						</Box>						
						<Box><span className="bold-label">Damage Immunities: </span> 
							{monsterInfo.damage_immunities.length > 0 ? 
								monsterInfo.damage_immunities.join(', ')
								:'None'
							}
						</Box>							
						<Box><span className="bold-label">Condition Immunities: </span> 
							{monsterInfo.condition_immunities.length > 0 ? 
								monsterInfo.condition_immunities.map(ci => ci.name).join(', ')
								:'None'
							}
						</Box>
						<Box><span className="bold-label">Armor Class: </span>{showAC(monsterInfo.armor_class[0])}</Box>
						<Box><span className="bold-label">Proficiency Bonus: </span>{monsterInfo.proficiency_bonus}</Box>
						<Box><span className="bold-label">Proficiencies: </span> 
							{monsterInfo.proficiencies.length > 0 ?
								monsterInfo.proficiencies.map((p, i) => <Box key={i}>{`${p.proficiency.name}: ${p.value}`}</Box>)
								: 'None'
							}
						</Box>
						<Accordion>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								aria-controls="actions-content"
								id="actions-header"
							>
							<span className="bold-label">Actions</span>
							</AccordionSummary>
							<AccordionDetails>
								{monsterInfo.actions.map((a, i) => showAction(a, i))}
							</AccordionDetails>
						</Accordion>
						{monsterInfo.legendary_actions && monsterInfo.legendary_actions.length > 0 ? 
						(<Accordion>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								aria-controls="legendary-actions-content"
								id="legendary-actions-header"
							>
							<span className="bold-label">Legendary Actions</span>
							</AccordionSummary>
							<AccordionDetails>
								{monsterInfo.legendary_actions.map((a, i) => showAction(a, i))}
							</AccordionDetails>
						</Accordion>): ''}
						{monsterInfo.special_abilities && monsterInfo.special_abilities.length > 0 ? 
						(<Accordion>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								aria-controls="special-abilities-content"
								id="special-abilitie-header"
							>
							<span className="bold-label">Special Abilities</span>
							</AccordionSummary>
							<AccordionDetails>
								{monsterInfo.special_abilities.map((a, i) => showSpecialAbilities(a, i))}
							</AccordionDetails>
						</Accordion>) : ''}
						{monsterInfo.reactions && monsterInfo.reactions.length > 0 ? 
						(<Accordion>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								aria-controls="reactions-content"
								id="reactions-header"
							>
							<span className="bold-label">Reactions</span>
							</AccordionSummary>
							<AccordionDetails>
								{monsterInfo.reactions.map((a, i) => showAction(a, i))}
							</AccordionDetails>
						</Accordion>) : ''}
					</DialogContent>
				</Dialog>)}
		</>
	);
}