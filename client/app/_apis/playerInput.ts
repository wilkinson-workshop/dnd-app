export interface PlayerInput {
    input: number,
    clientId: string,
    name: string
}

export interface JoinSessionRequest {
    clientId: string,
    name: string,
    type: "player" | "dm"
}