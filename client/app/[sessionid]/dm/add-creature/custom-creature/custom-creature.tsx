import { FC, useCallback, useContext, useEffect, useState } from "react";
import { Autocomplete, Box, TextField } from "@mui/material";
import { APIReference, Monster } from "@/app/_apis/dnd5eTypings";
import { SessionContext } from "@/app/common/session-context";
import { getCustomMonster, getCustomMonsters, CUSTOM_MONSTER, CUSTOM_MONSTER_OPTION } from "@/app/_apis/customMonsterApi";
import { AddCustomCharacter } from "./add-custom_character";

export interface CustomCreatureProps {
    onAddClick: (monster: Monster) => void
}

export const CustomCreature: FC<CustomCreatureProps> = ({ onAddClick }) => {
    const [monster, setMonster] = useState(CUSTOM_MONSTER_OPTION)
    const [monsterInfo, setMonsterInfo] = useState<Monster>(CUSTOM_MONSTER);
    const [monsterOptions, setMonsterOptions] = useState<APIReference[]>([]);

    const sessionId = useContext(SessionContext);

    useEffect(() => {
        getMonsterOptions();
    }, []);

    useEffect(() => {
        getMonsterInfo(monster.index);
    }, [monster]);

    function getMonsterOptions() {
        getCustomMonsters(sessionId)
            .then(m => {
                setMonsterOptions([...m, CUSTOM_MONSTER_OPTION]);
            });
    }

    function getMonsterInfo(monsterId: string) {
        if (monsterId == CUSTOM_MONSTER_OPTION.index) {
            setMonsterInfo(CUSTOM_MONSTER)
        } else {
            getCustomMonster(sessionId, monsterId)
                .then(m => {
                    setMonsterInfo(m);
                });
        }
    }

    function handleSubmit(updateMonsterInfo: Monster): void {
        onAddClick(updateMonsterInfo);
    }

    const renderCustomCreature = useCallback(
        (monsterInfo: Monster) => {
            return (<AddCustomCharacter currentMonsterInfo={monsterInfo} onAddClick={handleSubmit} />)
        }, 
        []
    );

    return (
        <>
            <Box sx={{ width: '100%' }}>
                <Box>
                    <Autocomplete
                        id="monster"
                        autoSelect
                        value={monster}
                        getOptionLabel={x => x.name}
                        getOptionKey={X => X.index}
                        sx={{ width: 300 }}
                        onChange={(e, v) => {
                            setMonster(v!);
                        }}
                        options={monsterOptions}
                        renderInput={(params) => <TextField {...params} label="Monster" size="small" variant="outlined" />}
                    />
                </Box>
                {renderCustomCreature(monsterInfo)}
            </Box>
        </>
    );
}
