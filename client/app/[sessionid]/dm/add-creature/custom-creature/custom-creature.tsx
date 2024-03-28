import { ChangeEvent, FC, useCallback, useContext, useEffect, useState } from "react";
import { Box, Button, FormControl, InputLabel, Link, MenuItem, Select, TextField, styled } from "@mui/material";
import { APIReference, Monster } from "@/app/_apis/dnd5eTypings";
import { SessionContext } from "@/app/common/session-context";
import { getCustomMonster, getCustomMonsters, CUSTOM_MONSTER, CUSTOM_MONSTER_OPTION } from "@/app/_apis/customMonsterApi";
import { AddCustomCharacter } from "./add-custom_character";

export const IMPORT_MONSTER_OPTION: APIReference = { index: 'import', name: 'Import Monster', url: '' };

export interface CustomCreatureProps {
    onAddClick: (monster: Monster) => void
}

export const CustomCreature: FC<CustomCreatureProps> = ({ onAddClick }) => {
    const [isImport, setIsImport] = useState(false);
    const [monster, setMonster] = useState(CUSTOM_MONSTER_OPTION.index)
    const [monsterInfo, setMonsterInfo] = useState<Monster>(CUSTOM_MONSTER);
    const [monsterOptions, setMonsterOptions] = useState<APIReference[]>([CUSTOM_MONSTER_OPTION, IMPORT_MONSTER_OPTION]);
    const [exportUrl, setExportUrl] = useState<string | null>(null);

    const sessionId = useContext(SessionContext);

    useEffect(() => {
        getMonsterOptions();
    }, []);

    useEffect(() => {
        setExportUrl(null);
        if (monster == 'import') {
            setIsImport(true);
        } else {
            setIsImport(false);
            getMonsterInfo(monster);
        }
    }, [monster]);

    function getMonsterOptions() {
        getCustomMonsters(sessionId)
            .then(m => {
                setMonsterOptions([...m, CUSTOM_MONSTER_OPTION, IMPORT_MONSTER_OPTION]);
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

    async function handleFileImport(event: ChangeEvent<any>) {
        const file: File = event.target.files[0];
        const monsterJson: Monster = JSON.parse(await file.text());
        onAddClick(monsterJson);
    }

    function handleExportMonster(exportMonster: Monster) {
        const strMonster = JSON.stringify(exportMonster);
        var url = URL.createObjectURL(new Blob([strMonster], {type: 'text/json'}));
        setExportUrl(url);
    }

    const renderCustomCreature = useCallback(
        (monsterInfo: Monster) => {
            return (<AddCustomCharacter currentMonsterInfo={monsterInfo} onAddClick={handleSubmit} />)
        },
        []
    );

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',        
        clipPath: 'inset(50%)',        
        height: 1,        
        overflow: 'hidden',        
        position: 'absolute',        
        bottom: 0,        
        left: 0,        
        whiteSpace: 'nowrap',        
        width: 1,        
    });

    return (
        <>
            <Box sx={{ width: '100%' }}>
                <Box>
                    <FormControl fullWidth>
                        <InputLabel id="monster">Monster</InputLabel>
                        <Select
                            labelId="monster"
                            value={monster}
                            size="small"
                            label="Monster"
                            onChange={(e) => {
                                setMonster(e.target.value);
                            }}
                        >
                            {monsterOptions.map(s => (<MenuItem key={s.index} value={s.index}>{s.name}</MenuItem>))}
                        </Select>
                    </FormControl>
                </Box>
                {isImport ? '' : (<Box>                
                    <Button variant="contained"  onClick={() => handleExportMonster(monsterInfo)}>Generate Export File</Button>
                    {exportUrl ? (<Link target="_blank" download={`${monsterInfo.name.replaceAll(' ', '-')}-export.json`} href={exportUrl}>{`${monsterInfo.name.replaceAll(' ', '-')}-export.json`}</Link>) : ''}
                </Box>)}
                {isImport ? (<Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                >
                    Select File
                    <VisuallyHiddenInput onChange={handleFileImport} type="file" />
                </Button>) : renderCustomCreature(monsterInfo)}
            </Box>
        </>
    );
}
