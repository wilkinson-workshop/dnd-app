import { CharacterType } from "./character"

export interface PlayerInput {
    value: number,
    name: string
}

export const DiceTypes = [4,6,8,10,12,20,100];

export interface JoinSessionRequest {
    client_uuid: string,
    name: string,
    role: CharacterType
}

export interface PlayerSecret {
    recipients: string[],
    secret: string
}

export interface RequestPlayerInput {
    dice_type: number, 
    recipients: string[], 
    reason: string
}