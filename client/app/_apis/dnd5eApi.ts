import { GetAll, Condition, Skill, Monster } from "./dnd5eTypings";

 export const INIT_DESC = 'When determining turn order for battle you roll Dexterity (Initiative).';

const apiBaseUrl = 'https://www.dnd5eapi.co/api/'

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

  export async function getCondition(condition: string): Promise<Condition> {
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

  export async function getSkil(skill: string): Promise<Skill> {
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


  export async function getAllMonsters(): Promise<GetAll> {
    const res = await fetch(`${apiBaseUrl}/monsters`, {
      headers:{
        'Content-Type': 'application/json',
      }
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
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }
    
    return res.json()
  }