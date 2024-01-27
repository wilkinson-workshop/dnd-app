import { CharacterType } from "./character"

export interface PlayerInput {
    input: number,
    clientId: string,
    name: string
}

export const DiceTypes = [4,6,8,10,12,20,100];

export interface JoinSessionRequest {
    clientId: string,
    name: string,
    type: CharacterType
}

export interface PlayerSecret {
    recipients: string[],
    secret: string
}

export interface RequestPlayerInput {
    diceType: number, 
    recipients: string[], 
    reason: string
}