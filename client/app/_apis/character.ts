export interface Character {
    creature_id: string,
    name: string,
    initiative: number,
    hit_points: number[],
    conditions: ConditionType[]
}

export enum CharacterType{
    NonPlayer = 'non_player',
    Player = 'player',
    DungeonMaster = 'dungeon_master'
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

export const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

export interface ConditionTypeItem {id: number, name: string}

export const ConditionOptions: ConditionTypeItem[] = [
    {id: 0, name: "Bardic Inspiration"},
    {id: 1, name: "Stunned"},
    {id: 2, name: "Burned"},
    {id: 3, name: "Poisoned"},
    {id: 4, name: "Knocked Out"},
    {id: 5, name: "Knocked Prone"},
    {id: 6, name: "Charmed"},
    {id: 7, name: "Asleep"},
    {id: 8, name: "Petrified"},
    {id: 9, name: "Scared"}
];

export interface RootFilter {
    filters: Filter[],
    logic: LogicType
}

export interface Filter {
    field: FieldType,
    operator: OperatorType,
    value: any,
}

export enum LogicType {
    And = 'and',
    Or = 'or'
}

export enum FieldType {
    Initiative = 'initiative',
    Name = 'name',
    Role = "role",
    HP = "hit_points",
    Conditions = "conditions"
}

export enum OperatorType {
    Equals = 'eq',
    NotEquals = 'neq',
    LessThen = 'lt',
    LessThenOrEquals = 'lte',
    GreaterThen = 'gt',
    GreaterThenOrEqual = 'gte',
    Contains = 'contains',
    DoesNotContain = 'not_contains',
    StartsWith = 'startswith'
}

