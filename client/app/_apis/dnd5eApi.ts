import { GetAll, Condition, Skill, Monster, APIReference } from "./dnd5eTypings";

 export const INIT_DESC = 'When determining turn order for battle you roll Dexterity (Initiative).';

const baseUrl = 'https://www.dnd5eapi.co';

const apiBaseUrl = `${baseUrl}/api`;

export const CUSTOM_MONSTER_OPTION: APIReference = {
  index: 'custom',
  name: 'Custom',
  url: ''
};

export const CUSTOM_MONSTER: Monster = {
  index: "custom",
  name: "Custom",
  size: "Medium",
  type: "beast",
  alignment: "unaligned",
  armor_class: [
    {
      type: "natural",
      desc: '',
      value: 12
    }
  ],
  hit_points: 19,
  hit_dice: "3d10",
  hit_points_roll: "3d10+3",
  speed: {
    walk: "20 ft.",
  },
  strength: 15,
  dexterity: 10,
  constitution: 13,
  intelligence: 2,
  wisdom: 10,
  charisma: 5,
  proficiencies: [],
  damage_vulnerabilities: [],
  damage_resistances: [],
  damage_immunities: [],
  condition_immunities: [],
  senses: {
    passive_perception: 10
  },
  languages: "",
  challenge_rating: 0.5,
  proficiency_bonus: 2,
  xp: 100,
  special_abilities: [],
  actions: [],
  //image:,
  url: "",
  legendary_actions: [],
  desc: [],
  subtype: "",
  forms: [],
  reactions: []
}


export async function getAllConditions(): Promise<GetAll> {
    const res = await fetch(`${apiBaseUrl}/conditions`, {
      headers:{
        'Content-Type': 'application/json',
      }, 
      cache: 'force-cache'
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }
    
    return res.json()
  } 

  export async function getCondition(condition: string): Promise<Condition> {
    const res = await fetch(`${apiBaseUrl}/conditions/${condition}`, {
      headers:{
        'Content-Type': 'application/json',
      }, 
      cache: 'force-cache'
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }
    
    return res.json()
  } 

  export async function getAllSkills(): Promise<GetAll> {
    const res = await fetch(`${apiBaseUrl}/skills`, {
      headers:{
        'Content-Type': 'application/json',
      }, 
      cache: 'force-cache'
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }
    
    return res.json()
  } 

  export async function getSkill(skill: string): Promise<Skill> {
    const res = await fetch(`${apiBaseUrl}/skills/${skill}`, {
      headers:{
        'Content-Type': 'application/json',
      }, 
      cache: 'force-cache'
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }
    
    return res.json()
  } 

  export async function getMonsterSpellApi(url: string): Promise<{desc: string[]}> {
    const res = await fetch(`${baseUrl}${url}`, {
      headers:{
        'Content-Type': 'application/json',
      }, 
      cache: 'force-cache'
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }
    
    return res.json()
  } 


  export async function getAllMonsters(ratings: string[]): Promise<GetAll> {
    const ratingsQueryString = ratings.map(r => `challenge_rating=${r}`);
    const query = ratings.length == 0 ? '' : `?${ratingsQueryString.join('&')}`;

    const res = await fetch(`${apiBaseUrl}/monsters${query}`, {
      headers:{
        'Content-Type': 'application/json',
      }, 
      cache: 'force-cache'
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }
    
    return res.json()
  } 

  export async function getMonster(monster: string): Promise<Monster> {
    const res = await fetch(`${apiBaseUrl}/monsters/${monster}`, {
      headers:{
        'Content-Type': 'application/json',
      }, 
      cache: 'force-cache'
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }
    
    return res.json()
  }