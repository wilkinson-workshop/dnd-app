import { CharacterType } from "./character"

export interface PlayerInput {
    input: number,
    clientId: string,
    name: string
}

export interface JoinSessionRequest {
    clientId: string,
    name: string,
    type: CharacterType
}