//https://www.dnd5eapi.co/docs/#get-/api/monsters/-index-

export interface GetAll {
    count: number,
    results: APIReference[]
}

export interface APIReference {
    index: string,
    name: string,
    url: string,
}

export interface DC {
    dc_type: APIReference,
    dc_value: number,
    success_type: "none" | "half" | "other"
}

export interface Damage {
    damage_type: APIReference,
    damage_dice: string
}

export interface Choice {
    desc: string //Description of the choice to be made.
    choose: number //Number of items to pick from the list.
    type: string //Type of the resources to choose from.
    from: OptionSet //Option Set
}

export interface OptionSet {
    option_set_type: 'options_array' | 'equipment_category' | 'reference_list'
}

export interface ArrayOptionsSet extends OptionSet {
    option_set_type: 'options_array',
    options: OptionsArrayOption[]
}

export interface OptionsArrayOption {
    option_type: string,
    //additional properties based on option type
}

export interface itemOptionType extends OptionsArrayOption {
    //option_type:'item'?,
    item: APIReference
}

export interface actionOptionType extends OptionsArrayOption, ActionType {
    option_type: 'action',
}

export interface multipleOptionType extends OptionsArrayOption {
    option_type: 'multiple',
    items:  OptionsArrayOption[]
}

export interface choiceOptionType extends OptionsArrayOption {
    //option_type: 'choice'?,
    choice:  Choice
}

export interface stringOptionType extends OptionsArrayOption {
    //option_type: 'string'?,
    string:  string
}

export interface alignmentsOptionType extends OptionsArrayOption {
    //option_type: 'alignments'?,
    desc: string,
    alignments: APIReference[]
}

export interface countOptionType extends OptionsArrayOption {
    //option_type: 'count'?,
    count: number,
    of: APIReference
}

export interface abiltyMinOptionType extends OptionsArrayOption {
    //option_type: 'abilitymin'?,
    minimus_score: number,
    ability_score: APIReference
}

export interface abiltyBonusOptionType extends OptionsArrayOption {
    //option_type: 'abilitybonus'?,
    bonus: number,
    ability_score: APIReference
}

export interface damageDcOptionType extends OptionsArrayOption {
    //option_type: 'damagedc'?,
    name: string,
    dc: DC,
    damage: Damage[]
}

export interface damageOptionType extends OptionsArrayOption, Damage {
    //option_type: 'damage'?,
    notes: string
}


export interface EquipmentCategoryOptionsSet extends OptionSet {
    option_set_type: 'equipment_category',
    equipment_category: APIReference
}

export interface ReferenceListOptionsSet extends OptionSet {
    option_set_type: 'reference_list',
    reference_list: string
}

export interface Condition {
    index: string,
    name: string,
    url: string,
    desc: string[]
}

export interface Skill {
    index: string,
    name: string,
    desc: string[],
    ability_score: APIReference,
    url: string
}

export interface ArmorClass {
    type: 'dex' | 'natural' | 'armor' | 'spell' | 'condition'
    value: number,
    desc: string
}

export interface ArmorAC extends ArmorClass {
    type: 'armor',
    value: number,
    desc: string,
    armor: APIReference[]
}

export interface SpellAC extends ArmorClass {
    type: 'spell',
    value: number,
    desc: string,
    spell: APIReference
}

export interface ConditionAC extends ArmorClass {
    type: 'condition',
    value: number,
    desc: string,
    condition: APIReference
}

export interface Speed {
    walk?: string //All creatures have a walking speed, simply called the monster’s speed. Creatures that have no form of ground-based locomotion have a walking speed of 0 feet.        
    burrow?: string //A monster that has a burrowing speed can use that speed to move through sand, earth, mud, or ice. A monster can’t burrow through solid rock unless it has a special trait that allows it to do so.        
    climb?: string //A monster that has a climbing speed can use all or part of its movement to move on vertical surfaces. The monster doesn’t need to spend extra movement to climb.        
    fly?: string //A monster that has a flying speed can use all or part of its movement to fly.       
    swim?: string  //A monster that has a swimming speed doesn’t need to spend extra movement to swim.        
}

export interface Senses {
    passive_perception?: number //The monster's passive perception (wisdom) score.        
    blindsight?: string  //A monster with blindsight can perceive its surroundings without relying on sight, within a specific radius.        
    darkvision?: string  //A monster with darkvision can see in the dark within a specific radius.        
    tremorsense?: string //A monster with tremorsense can detect and pinpoint the origin of vibrations within a specific radius, provided that the monster and the source of the vibrations are in contact with the same ground or substance.        
    truesight?: string  //A monster with truesight can, out to a specific range, see in normal and magical darkness, see invisible creatures and objects, automatically detect visual illusions and succeed on saving throws against them, and perceive the original form of a shapechanger or a creature that is transformed by magic. Furthermore, the monster can see into the Ethereal Plane within the same range.
}

export interface Proficiency {
    value: number
    proficiency: APIReference
}

export interface ActionType {
    action_name: string
    count: number
    type: 'melee' | 'ranged' | 'ability' | 'magic'
}

export interface Attack {
    name: string
    dc: DC
    damage: Damage
}

export interface Action {
    name: string,
    desc: string,
    // action_options: Choice,
    // actions: ActionType[],
    // options: Choice,
    // multiattack_type: string,
    // attack_bonus: number,
    // dc: DC,
    // attacks: Attack[],
    // damage: Choice[] | Damage[],
    usage?: Usage
}

export interface Monster {
    index: string //Resource index for shorthand searching.
    name: string //Name of the referenced resource.
    url: string//URL of the referenced resource.
    desc: string[] //Description of the resource.
    charisma: number //A monster's ability to charm or intimidate a player.
    constitution: number //How sturdy a monster is."
    dexterity: number //The monster's ability for swift movement or stealth
    intelligence: number //The monster's ability to outsmart a player.
    strength: number //How hard a monster can hit a player.
    wisdom: number //A monster's ability to ascertain the player's plan.
    image?: string //The image url of the monster.
    size: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan'  //The size of the monster ranging from Tiny to Gargantuan."
    type: string //The type of monster.
    subtype: string //The sub-category of a monster used for classification of monsters."
    alignment: 'chaotic neutral' | 'chaotic evil' | 'chaotic good' | 'lawful neutral' | 'lawful evil' | 'lawful good' | 'neutral' | 'neutral evil' | 'neutral good' | 'any alignment' | 'unaligned'  //A creature's general moral and personal attitudes.
    armor_class: ArmorClass[] //The difficulty for a player to successfully deal damage to a monster.
    hit_points: number //The hit points of a monster determine how much damage it is able to take before it can be defeated.
    hit_dice: string //The hit die of a monster can be used to make a version of the same monster whose hit points are determined by the roll of the die. For example: A monster with 2d6 would have its hit points determine by rolling a 6 sided die twice.
    hit_points_roll: string //The roll for determining a monster's hit points, which consists of the hit dice (e.g. 18d10) and the modifier determined by its Constitution (e.g. +36). For example, 18d10+36
    actions: Action[]//A list of actions that are available to the monster to take during combat.
    //⮕ [ Action available to a Monster in addition to the standard creature actions. ]
    legendary_actions: Action[] //A list of legendary actions that are available to the monster to take during combat.
    //⮕ [ Action available to a Monster in addition to the standard creature actions. ]
    challenge_rating: number // A monster's challenge rating is a guideline number that says when a monster becomes an appropriate challenge against the party's average level. For example. A group of 4 players with an average level of 4 would have an appropriate combat challenge against a monster with a challenge rating of 4 but a monster with a challenge rating of 8 against the same group of players would pose a significant threat.
    //Constraints: Min 0┃Max 21
    proficiency_bonus: number //A monster's proficiency bonus is the number added to ability checks, saving throws and attack rolls in which the monster is proficient, and is linked to the monster's challenge rating. This bonus has already been included in the monster's stats where applicable.
    //Constraints: Min 2┃Max 9
    condition_immunities: APIReference[] //A list of conditions that a monster is immune to.
    damage_immunities: string[] //A list of damage types that a monster will take double damage from.
    damage_resistances: string[] //A list of damage types that a monster will take half damage from.
    damage_vulnerabilities: string[] //A list of damage types that a monster will take double damage from.
    forms: APIReference[] //List of other related monster entries that are of the same form. Only applicable to Lycanthropes that have multiple forms.
    languages: string //The languages a monster is able to speak.
    proficiencies: Proficiency[] //A list of proficiencies of a monster.
    reactions: Action[] //A list of reactions that is available to the monster to take during combat.
    senses: Senses //Monsters typically have a passive perception but they might also have other senses to detect players.
    special_abilities: SpecialAbility[] //A list of the monster's special abilities.     
    speed: Speed //Speed for a monster determines how fast it can move per turn.
    xp: number //The number of experience points (XP) a monster is worth is based on its challenge rating.    
}

export interface Spellcasting {
    level: number
    ability: APIReference
    dc: number
    modifier: number
    components_required: string[]
    school: string
    slots: any
    // {
    //     //["spell level"]: number //number of spells at that level
    // }
    spells: SpecialAbilitySpell[]
}

export interface SpecialAbility {
    name: string
    desc: string
    attack_bonus?: number
    damage?: Damage[]
    dc?: DC
    spellcasting?: Spellcasting
    usage?: Usage
}

export interface Usage {
    type: 'at will' | 'per day' | 'recharge after rest' | 'recharge on roll'
    rest_types: string[]
    times: number
}

export interface SpecialAbilitySpell {
    name: string
    level: number
    url: string
    usage: Usage
}