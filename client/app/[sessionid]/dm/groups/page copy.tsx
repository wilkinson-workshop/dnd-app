'use client'

import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { Character } from "@/app/_apis/character";
import { addMultipleCharacter } from "@/app/_apis/characterApi";
import { CreateGroup } from "./create-group";
import { SessionGroup } from "@/app/_apis/sesssionGroup";
import { createGroup, getGroups } from "@/app/_apis/sessionGroupApi";
import { EditGroup } from "./edit-group";

export interface CreatureGroupsProps {
    params: { sessionid: string }
}

const CreatureGroups: FC<CreatureGroupsProps> = ({ params }) => {
    const [edit, setEdit] = useState(false);
    const [group, setGroup] = useState<SessionGroup | null>(null);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [groupOptions, setGroupOptions] = useState<SessionGroup[]>([]);

    useEffect(() => {
        getAllGroups();
    }, []);

    function getAllGroups() {
        getGroups(params.sessionid)
            .then(groups => {
                setGroupOptions(groups);
            });
    }

    function handleCreateGroup(newSession: SessionGroup) {
        createGroup(params.sessionid, newSession)
            .then(group => {
                const fullGroup = { name: newSession.group_name, uuid: group, characters: [] };

                let newSessionOtions = groupOptions.slice();
                newSessionOtions.push(fullGroup);
                setGroupOptions(newSessionOtions);

                setSelectedGroup(fullGroup.uuid);
                setGroup(fullGroup);
            });
    }

    function handleChangeGroup(event: SelectChangeEvent<typeof selectedGroup>) {
        const {
            target: { value },
        } = event;

        const selectedSession = groupOptions.find(s => s.group_uuid == value);
        setSelectedGroup(selectedSession!.group_uuid);
        setGroup(selectedSession!);
    }

    function handleAddMultipleCharacters(characters: Character[]) {
        addMultipleCharacter(params.sessionid, { characters })
            .then();
    }

    function handleAddCreaters(characters: Character[]) {
        const currentGroup = group;
        currentGroup!.characters.push(...characters);
        setGroup(currentGroup);
    }

    return (
        <>
            <Box>
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
                <Button disabled={group == null} variant="contained" aria-label="add to initiative" onClick={() => handleAddMultipleCharacters(group!.characters)}>
                    Add to Battle
                </Button>
                <Button disabled={group == null} variant="contained" aria-label="add to initiative" onClick={() => setEdit(!edit)}>
                    {edit ? 'No Edit' : 'Edit'}
                </Button>
                <CreateGroup onAddClick={handleCreateGroup} />
                {edit ? (<EditGroup addCreatures={handleAddCreaters} />) : ''}
                {!edit ? (<Box>
                    {group?.characters.map(c => (<Box key={c.name + c.hit_points}>{c.name}</Box>))}
                </Box>) : ''}
            </Box>
        </>
    );
}