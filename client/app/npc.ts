export interface Npc {
    id: number,
    name: string,
    hp: number,
    conditions: ConditionType[]
}

export enum ConditionType {
    BardicInspiration,
    Stunned,
    Burned,
    Poisoned,
    KnockedOut,
    KnockedProne,
    Charmed,
    Asleep,
    Petrified,
    Scared,
} 