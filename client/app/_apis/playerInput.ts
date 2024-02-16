import { CharacterType } from "./character"
import { EventType } from "./eventType";

export interface PlayerInput {
    value: number,
    client_uuid: string,
    name: string,
    reason: string
}

export interface SessionInput {
    session_uuid: string,
    event_body: PlayerInput,
    event_type: EventType 
    
}

export const DiceTypes = [4,6,8,10,12,20,100];

export interface JoinSessionRequest {
    client_uuid: string,
    name: string,
    role: CharacterType
}

export interface PlayerSecret {
    client_uuids: string[],
    secret: string
}

export interface RequestPlayerInput {
    dice_type: number, 
    client_uuids: string[], 
    reason: string
}