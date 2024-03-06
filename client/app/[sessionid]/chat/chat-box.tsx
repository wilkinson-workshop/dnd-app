import { Box, Button, TextField, FormControl, InputLabel, Select, SelectChangeEvent, MenuItem, Paper, IconButton } from "@mui/material";
import { FC, useEffect, useRef, useState } from "react";
import { sendPlayerMessageApi } from "@/app/_apis/sessionApi";
import { getName } from "@/app/_apis/sessionStorage";
import { PlayerMessage } from "@/app/_apis/playerInput";
import { Character } from "@/app/_apis/character";
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from "@mui/icons-material/Chat";

export interface ThreadOptions {
    ids: string,
    names: string
}

export interface ChatBoxProps {
    sessionId: string,
    recipientOptions: Character[],
    secretInfo: PlayerMessage,
}

export const ChatBox: FC<ChatBoxProps> = ({ sessionId, recipientOptions, secretInfo }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState('');
    const messages = useRef<PlayerMessage[]>([]);
    const [threadMessages, setThreadMessages] = useState<PlayerMessage[]>([]);
    const [threads, setThreads] = useState<ThreadOptions[]>([]);
    const [currentThread, setCurrentThread] = useState<string>('');

    //handle new messages incoming
    useEffect(() => {
        if(secretInfo){
            messages.current.push(secretInfo);
            const threadIds = secretInfo.client_uuids.join(',');
            setIsVisible(true);

            //add message thread
            if (!threads.find(x => x.ids == threadIds)) {
                setThreads([...threads, { ids: threadIds, names: returnNamesFromIds(secretInfo.client_uuids).join(',') }]);
            }

            switchThreads(threadIds);
        }
    }, [secretInfo]);

    function handleClickSendMessage() {
        sendPlayerMessageApi(sessionId, {
            sender: getName(),
            message: message,
            client_uuids: currentThread.split(',')
        }).then();
        setMessage('');
    }

    function switchThreads(currentThread: string) {
        const filteredMessages: PlayerMessage[] = [];

        for (let m of messages.current) {
            const threadName = m.client_uuids.join(',');
            if (threadName == currentThread) {
                filteredMessages.push(m);
            }
        }

        setThreadMessages(filteredMessages);
        setCurrentThread(currentThread);
    }

    function returnNamesFromIds(ids: string[]): string[] {
        return recipientOptions
            .filter(x => ids.includes(x.creature_id))
            .map(o => o.name);
    }

    function handleThreadChange(event: SelectChangeEvent) {
        const threadName = event.target.value as string
        switchThreads(threadName);
    }

    return (
    <>
        {isVisible ?(
        <Paper sx={{ maxHeigh: 400, width: 400, position: 'fixed', bottom: 60, right: 0 }}>
            <Box>
                <IconButton sx={{float: 'right'}} aria-label="add comment" onClick={_ => setIsVisible(false)}>
                    <CloseIcon />
                </IconButton>
                <Box>
                    <FormControl fullWidth>
                        <InputLabel id="threads-label">Conversation</InputLabel>
                        <Select
                            labelId="threads-label"
                            id="threads-select"
                            value={currentThread}
                            label="Conversation"
                            onChange={handleThreadChange}
                        >
                            {threads.map(t => <MenuItem key={t.ids} value={t.ids}>{t.names}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <Box sx={{ overflowY: 'auto', maxHeight: 500, border: 1, borderColor: 'lightgrey' }}>
                        {threadMessages.map((m, i) => {
                            return m.sender == getName() ?
                                (<div key={i} className="message-line self">
                                    <div className="message self">
                                        {m.message}
                                    </div>

                                </div>) :
                                (<div key={i} className="message-line">
                                    <div className="sender">
                                        {m.sender}
                                    </div>
                                    <div className="message other">
                                        {m.message}
                                    </div>
                                </div>)
                        }
                        )}
                    </Box>
                </Box>
                <Box sx={{ padding: 1 }}>
                    <Box sx={{ display: 'inline-block' }}>
                        <TextField multiline sx={{ width: '300px' }} value={message} onChange={e => setMessage(e.target.value)} label="Message" size="small" variant="outlined" />
                        <Button variant="contained" aria-label="Send" onClick={handleClickSendMessage}>
                            Send
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Paper>):(
            <Box sx={{ margin: '10px 0', float: "right"}}>
                <IconButton aria-label="add comment" onClick={_ => setIsVisible(true)}>
                    <ChatIcon />
                </IconButton>
            </Box>
        )}
    </>);
}