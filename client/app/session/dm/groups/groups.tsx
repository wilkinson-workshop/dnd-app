'use client'

import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { FC, useCallback, useEffect, useState, useContext } from "react";
import { Character } from "@/app/_apis/character";
import { addMultipleCharacter } from "@/app/_apis/characterApi";
import { CreateGroup } from "./create-group";
import { SessionGroup } from "@/app/_apis/sesssionGroup";
import { createGroup, deleteGroup, deleteGroupCharacter, getGroupCharacters, getGroups, saveGroupCharacter } from "@/app/_apis/sessionGroupApi";
import { Card } from "../character-card";
import { EditCharacter } from "../edit-character";
import { AddGroupCharacterDialog } from "./add-group-character-dialog";
import { AlertInfo, Alerts } from "../../../common/alerts";
import { EventType, SubscriptionEventType } from "@/app/_apis/eventType";
import { WebsocketContext } from "../../../common/websocket-context";
import { SessionContext } from "../../../common/session-context";

const style = {
    minHeight: '30px',
    border: '#ebebeb solid 1px',
    margin: '10px 0'
}

export interface CreatureGroupsProps {
    backToDashboard: () => void
}

export const CreatureGroups: FC<CreatureGroupsProps> = ({ backToDashboard }) => {
    const [selectedGroup, setSelectedGroup] = useState<string>('');
    const [characters, setCharacters] = useState<Character[]>([]);
    const [groupOptions, setGroupOptions] = useState<SessionGroup[]>([]);
    const [characterEdit, setCharacterEdit] = useState<Character | null>(null);
    const [alert, setAlert] = useState<AlertInfo | null>(null);

    let lastJsonMessage = useContext(WebsocketContext);
    let sessionId = useContext(SessionContext);

    useEffect(() => {
        getAllGroups();
    }, []);

    useEffect(() => {
		if (lastJsonMessage !== null) {
			switch (lastJsonMessage.event_type) {
				case EventType.ReceiveOrderUpdate: {
                    reloadList(selectedGroup);
					return;
				}
			}
		}
	}, [lastJsonMessage]);



    function getAllGroups() {
        getGroups(sessionId)
            .then(groups => {
                setGroupOptions(groups);
            });
    }

    function handleCreateGroup(newGroup: SessionGroup) {
        createGroup(sessionId, newGroup)
            .then(groupId => {
                const fullGroup = { group_name: newGroup.group_name, group_uuid: groupId, characters: [] };

                let newGroupOptions = groupOptions.slice();
                newGroupOptions.push(fullGroup);
                setGroupOptions(newGroupOptions);
                setSelectedGroup(groupId);
                reloadList(groupId)
            });
    }

    function handleDeleteGroup(groupId: string){
        setSelectedGroup('');
        deleteGroup(sessionId, groupId)
        .then(_ => {
            getAllGroups();
        });
    }    

    function handleChangeGroup(event: SelectChangeEvent<string>) {
        const {
            target: { value },
        } = event;

        const selectedGroupL = groupOptions.find(s => s.group_uuid == value);
        setSelectedGroup(value);
        reloadList(value);
    }

    function addGroupToInitiative(characters: Character[]) {
        addMultipleCharacter(sessionId, { characters })
            .then(_ => {
                setAlert({ type: 'success', message: `${characters.length} creatures added to initiative! Its safe to delete the group now.` });
                //should we delete the group after applying it? 
                //handleDeleteGroup(group!.group_uuid);  
            });
    }

    function onDelete(character: Character, groupId: string) {
        deleteGroupCharacter(sessionId, groupId, character.creature_id)
            .then(_ => reloadList(groupId));
    }

    function updateCharacter(character: Character, groupId: string) {
        saveGroupCharacter(sessionId, groupId, character)
            .then(_ => reloadList(groupId));
    }

    function reloadList(groupId: string) {
        if(groupId == '')
            return;
        getGroupCharacters(sessionId, groupId)
            .then(c => {
                setCharacterEdit(null);
                setCharacters(c);
            });
    }

    const renderCard = useCallback(
        (card: Character, index: number, groupId: string) => {
            return (
                <Card
                    key={card.creature_id}
                    index={1}
                    character={card}
                    updateCharacter={(character) => updateCharacter(character, groupId)}
                    markDone={() => { }}
                    updateCharacterButton={(c: Character) => setCharacterEdit(c)}
                    deleteCharacter={(character) => onDelete(character, groupId)}
                />
            )
        },
        [],
    );

    function handleBackToDashboard(){ 
        backToDashboard();
    }

    return (
        <>
            <Box>
                <Alerts info={alert} />
                <Box>
                    <Button variant="contained" aria-label="back" onClick={handleBackToDashboard}>
                        Back to Dashboard
                    </Button>
                </Box>
                <FormControl fullWidth>
                    <InputLabel id="group">Group</InputLabel>
                    <Select
                        labelId="group"
                        value={selectedGroup}
                        renderValue={(selected) => {
                            return groupOptions.find(s => s.group_uuid == selected)?.group_name
                        }}
                        label="Group"
                        onChange={handleChangeGroup}
                    >
                        {groupOptions.map(s =>
                            <MenuItem key={s.group_uuid} value={s.group_uuid}>{s.group_name}</MenuItem>
                        )}
                    </Select>
                </FormControl>
                <Button disabled={selectedGroup == ''} variant="contained" aria-label="add to initiative" onClick={() => addGroupToInitiative(characters)}>
                    Add to Battle
                </Button>
                <Button disabled={selectedGroup == ''} variant="contained" aria-label="delete" onClick={() => handleDeleteGroup(selectedGroup)}>
                    Delete
                </Button>
                <CreateGroup onAddClick={handleCreateGroup} />
                {selectedGroup != '' ? (<Box>
                    <AddGroupCharacterDialog groupId={selectedGroup} closeDialog={() => reloadList(selectedGroup)} />
                    <div style={style}>{
                    characters.length > 0 ?
                        characters.map((card, i) => renderCard(card, i, selectedGroup)) :
                        (
                            <div style={{ display: "inline-block", padding: "5px" }}>Please add Characters</div>
                        )
                    }
                    </div>
                    <EditCharacter existingCharacter={characterEdit} onSaveClick={(character) => updateCharacter(character, selectedGroup)} onCancelClick={() => setCharacterEdit(null)} />
                </Box>) : ''}
            </Box>

        </>
    );
}
