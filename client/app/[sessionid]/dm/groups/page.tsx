'use client'

import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { FC, useCallback, useEffect, useState } from "react";
import { Character } from "@/app/_apis/character";
import { addMultipleCharacter } from "@/app/_apis/characterApi";
import { CreateGroup } from "./create-group";
import { SessionGroup } from "@/app/_apis/sesssionGroup";
import { createGroup, deleteGroup, deleteGroupCharacter, getGroupCharacters, getGroups, saveGroupCharacter } from "@/app/_apis/sessionGroupApi";
import { Card } from "../character-card";
import { EditCharacter } from "../edit-character";
import { AddGroupCharacterDialog } from "./add-group-character-dialog";
import { useRouter } from "next/navigation";
import { AlertInfo, Alerts } from "../../alert/alerts";

const style = {
    minHeight: '30px',
    border: '#ebebeb solid 1px',
    margin: '10px 0'
}

export interface CreatureGroupsProps {
    params: { sessionid: string }
}

const CreatureGroups: FC<CreatureGroupsProps> = ({ params }) => {
    const [selectedGroup, setSelectedGroup] = useState<string>('');
    const [characters, setCharacters] = useState<Character[]>([]);
    const [groupOptions, setGroupOptions] = useState<SessionGroup[]>([]);
    const [characterEdit, setCharacterEdit] = useState<Character | null>(null);
    const [alert, setAlert] = useState<AlertInfo | null>(null);

    const router = useRouter();

    useEffect(() => {
        getAllGroups();
    }, []);

    function getAllGroups() {
        getGroups(params.sessionid)
            .then(groups => {
                setGroupOptions(groups);
            });
    }

    function handleCreateGroup(newGroup: SessionGroup) {
        createGroup(params.sessionid, newGroup)
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
        deleteGroup(params.sessionid, groupId)
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
        addMultipleCharacter(params.sessionid, { characters })
            .then(_ => {
                setAlert({ type: 'success', message: `${characters.length} creatures added to initiative! Its safe to delete the group now.` });
                //should we delete the group after applying it? 
                //handleDeleteGroup(group!.group_uuid);  
            });
    }

    function onDelete(character: Character, groupId: string) {
        deleteGroupCharacter(params.sessionid, groupId, character.creature_id)
            .then(_ => reloadList(groupId));
    }

    function updateCharacter(character: Character, groupId: string) {
        saveGroupCharacter(params.sessionid, groupId, character)
            .then(_ => reloadList(groupId));
    }

    function reloadList(groupId: string) {
        getGroupCharacters(params.sessionid, groupId)
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
    )

    return (
        <>
            <Box>
                <Alerts info={alert} />
                <Box>
                    <Button variant="contained" aria-label="back" onClick={() => router.push(`/${params.sessionid}/dm`)}>
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
                    <AddGroupCharacterDialog sessionId={params.sessionid} groupId={selectedGroup} closeDialog={() => reloadList(selectedGroup)} />
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

export default CreatureGroups