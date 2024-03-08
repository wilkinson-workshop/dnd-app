import { Character } from "./character";

export interface SessionGroup {
    group_name: string,
    group_uuid: string,
    characters: Character[]
}