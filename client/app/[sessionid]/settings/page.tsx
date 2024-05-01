'use client'

import { useEffect, useReducer, useState } from 'react';
import { Box, Button, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { Character, CharacterType, EMPTY_GUID, FieldType, LogicType, OperatorType } from '@/app/_apis/character';
import { EventType, SubscriptionEventType, WebsocketEvent } from '@/app/_apis/eventType';
import { deleteCharacter, getCharacters } from '@/app/_apis/characterApi';
import { getAllConditions } from '@/app/_apis/dnd5eApi';
import { APIReference, Monster } from '@/app/_apis/dnd5eTypings';
import { getClientId, setClientId, setName } from '@/app/_apis/sessionStorage';
import { TopNav } from '@/app/common/top-nav';
import { SessionContext } from '@/app/common/session-context';
import { updateInitiativeTop } from '@/app/_apis/sessionApi';
import { deleteGroup, getGroupCharacters, getGroups } from '@/app/_apis/sessionGroupApi';
import { SessionGroup } from '@/app/_apis/sesssionGroup';
import { deleteCustomMonster, getCustomMonster, getCustomMonsters } from '@/app/_apis/customMonsterApi';

const baseUrl = process.env.NEXT_PUBLIC_CLIENT_BASEURL;

const SettingsPage = ({ params }: { params: { sessionid: string } }) => {
	const [cards, setCards] = useState<Character[]>([]);
	const [creatureId, setCreatureId] = useState('');
	const [selectedGroup, setSelectedGroup] = useState<string>('');
	const [groupOptions, setGroupOptions] = useState<SessionGroup[]>([]);
	const [groupCharacters, setGroupCharacters] = useState<Character[]>([]);
	const [customCreatureOptions, setCustomCreatureOptions] = useState<APIReference[]>([]);
	const [selectedCustom, setSelectedCustom] = useState('');
	const [monsterInfo, setMonsterInfo] = useState<Monster | null>(null);

	const router = useRouter();

	useEffect(() => {
		reloadList();
		getAllGroups();
		getMonsterOptions();
	}, []);

	function onDelete() {
		if (!creatureId) {
			return;
		}

		deleteCharacter(params.sessionid, creatureId)
			.then(_ => reloadList());
	}

	function updateCurrentInOrder() {
		updateInitiativeTop(params.sessionid, creatureId)
			.then(_ => reloadList());
	}

	function reloadList() {
		getCharacters(params.sessionid, { filters: [], logic: LogicType.Or })
			.then(c => {
				setCards(c);
			});
	}

	function getAllGroups() {
		getGroups(params.sessionid)
			.then(groups => {
				setGroupOptions(groups);
			});
	}

	function reloadGroupList() {
		getGroupCharacters(params.sessionid, selectedGroup)
			.then(c => {
				setGroupCharacters(c);
			});
	}

	function handleDeleteGroup() {
		deleteGroup(params.sessionid, selectedGroup)
			.then(_ => {
				getAllGroups();
			});
	}

	function getMonsterOptions() {
		getCustomMonsters(params.sessionid)
			.then(m => {
				setCustomCreatureOptions(m);
			});
	}

	function getMonsterInfo() {
		getCustomMonster(params.sessionid, selectedCustom)
			.then(m => {
				setMonsterInfo(m);
			});
	}

	function handleDeleteCustom() {
		deleteCustomMonster(params.sessionid, selectedCustom)
			.then(_ => {
				getMonsterOptions();
				setMonsterInfo(null);
			});
	}


	return (<>
		<SessionContext.Provider value={params.sessionid}>
			<TopNav isDM={true} />
			<Box sx={{ position: 'fixed', left: 0, right: 0, bottom: '60px', top: '70px', overflow: 'auto' }}>
				<h2>{params.sessionid}</h2>
				<h2>Creatures</h2>
				<Box>
					<Box sx={{ margin: '10px 0' }}>
						<TextField sx={{ width: 300 }} size="small" label="creature_id" value={creatureId} variant="outlined" onChange={x => setCreatureId(x.target.value)} />
						<Button disabled={creatureId == ''} variant="contained" aria-label="add" onClick={updateCurrentInOrder}>
							Set Current
						</Button>
						<Button disabled={creatureId == ''} variant="contained" aria-label="add" onClick={onDelete}>
							Delete
						</Button>
					</Box>
					{cards.map((card, i) => (<Box key={card.creature_id}><pre>{JSON.stringify(card, undefined, 2)}</pre></Box>))}
				</Box>
				<h2>Custom Creatures</h2>
				<Box>
					<TextField sx={{ width: 300 }} size="small" label="index" value={selectedCustom} variant="outlined" onChange={x => setSelectedCustom(x.target.value)} />
					<Button disabled={selectedCustom == ''} variant="contained" aria-label="custom" onClick={getMonsterInfo}>
						Load Custom
					</Button>
					<Button disabled={selectedCustom == ''} variant="contained" aria-label="add" onClick={handleDeleteCustom}>
						Delete
					</Button>
					{customCreatureOptions.map(g => (<Box key={g.index}><pre>{JSON.stringify(g, undefined, 2)}</pre></Box>))}
					{monsterInfo != null ? (<Box><pre>{JSON.stringify(monsterInfo, undefined, 2)}</pre></Box>) : ''}
				</Box>
				<h2>Groups</h2>
				<Box>
					<TextField sx={{ width: 300 }} size="small" label="group_uuid" value={selectedGroup} variant="outlined" onChange={x => setSelectedGroup(x.target.value)} />
					<Button disabled={selectedGroup == ''} variant="contained" aria-label="group list" onClick={reloadGroupList}>
						Load Group
					</Button>
					<Button disabled={selectedGroup == ''} variant="contained" aria-label="group" onClick={handleDeleteGroup}>
						Delete
					</Button>
					{groupOptions.map(g => (<Box key={g.group_uuid}><pre>{JSON.stringify(g, undefined, 2)}</pre></Box>))}
					{groupCharacters.map((card, i) => (<Box key={card.creature_id}><pre>{JSON.stringify(card, undefined, 2)}</pre></Box>))}
				</Box>
			</Box>
		</SessionContext.Provider>
	</>
	)
}

export default SettingsPage;