export interface Character {
    creature_id: string,
    name: string,
    initiative: number,
    hit_points: [number, number],
    role: CharacterType,
    conditions: string[],
    monster: string | null
}

export interface MultipleCharacters {
    characters: Character[]
}

export enum CharacterType{
    NonPlayer = 'non_player',
    Player = 'player',
    DungeonMaster = 'dungeon_master',
    Observer = 'observer'
}

export const OBSERVER_NAME = 'Observer';

export const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

export interface KeyValueItem {id: number, name: string}

export const HpBoundaryOptions: KeyValueItem[] = [
    {id: 0, name: "Knocked Out"},
    {id: 9, name: "Looks weakened"},
    {id: 49, name: "Starting to wear out"},
    {id: 100, name: "Seems very alive"}
]

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

