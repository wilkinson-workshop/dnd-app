 export const INIT_DESC = 'When determining turn order for battle you roll Dexterity (Initiative).';

const apiBaseUrl = 'https://www.dnd5eapi.co/api/'

export interface GetAll {
    count: number,
    results: GetAllItem[]
}

export interface GetAllItem {
  index:string,    
  name: string,    
  url: string,
}    

export interface GetCondition {
    index:string,    
    name: string,    
    url: string,    
    desc: string[]    
}  

export interface GetSkill {
  index: string,
  name: string,
  desc: string[],
  ability_score: {
    index: string,
    name: string,
    url: string
  },
  url: string
}

export async function getAllConditions(): Promise<GetAll> {
    const res = await fetch(`${apiBaseUrl}/conditions`, {
      headers:{
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }
    
    return res.json()
  } 

  export async function getCondition(condition: string): Promise<GetCondition> {
    const res = await fetch(`${apiBaseUrl}/conditions/${condition}`, {
      headers:{
        'Content-Type': 'application/json',
      }
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
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }
    
    return res.json()
  } 

  export async function getSkil(skill: string): Promise<GetSkill> {
    const res = await fetch(`${apiBaseUrl}/skills/${skill}`, {
      headers:{
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }
    
    return res.json()
  } 