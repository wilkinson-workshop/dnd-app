import { APIReference, Monster } from "./dnd5eTypings";

const baseUrl = process.env.NEXT_PUBLIC_API_BASEURL;
const apiBaseUrl = `${baseUrl}/monsters`;

export const CUSTOM_MONSTER_OPTION: APIReference = { index: 'custom', name: 'New Custom', url: ''};

export const CUSTOM_MONSTER: Monster = {
  index: "custom",
  name: "Custom",
  size: "Medium",
  type: "humanoid",
  alignment: "neutral",
  armor_class: [
    {
      type: "natural",
      desc: '',
      value: 12
    }
  ],
  hit_points: 19,
  hit_dice: "",
  hit_points_roll: "",
  speed: {
    walk: "20 ft.",
  },
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
  proficiencies: [],
  damage_vulnerabilities: [],
  damage_resistances: [],
  damage_immunities: [],
  condition_immunities: [],
  senses: {
    passive_perception: 10
  },
  languages: "",
  challenge_rating: 0,
  proficiency_bonus: 0,
  xp: 0,
  special_abilities: [],
  bonus_actions: [],
  actions: [],
  //image:,
  url: "",
  legendary_actions: [],
  desc: [],
  subtype: "",
  forms: [],
  reactions: []
}

export async function addCustomMonster(sessionId: string, monster: Monster): Promise<any> {
    const res = await fetch(`${apiBaseUrl}/${sessionId}`, {
        method: 'POST',
        body: JSON.stringify(monster),
        headers:{
          'Content-Type': 'application/json',
        } 
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch data')
      }
      
      return res.json()
}

export async function getCustomMonster(sessionId: string, monsterId: string): Promise<Monster> {
    const res = await fetch(`${apiBaseUrl}/${sessionId}/${monsterId}`, {
        method: 'GET',
        headers:{
          'Content-Type': 'application/json',
        } 
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch data')
      }
      
      return res.json()
}

export async function getCustomMonsters(sessionId: string): Promise<APIReference[]> {
    const res = await fetch(`${apiBaseUrl}/${sessionId}`, {
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }

    return res.json()
}

export async function deleteCustomMonster(sessionId: string, monsterId: string) {
  const res = await fetch(`${apiBaseUrl}/${sessionId}/${monsterId}`, {
    method: 'DELETE',
    headers:{
      'Content-Type': 'application/json',
    } 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
}