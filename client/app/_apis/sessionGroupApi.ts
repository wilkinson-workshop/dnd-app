import { Character, MultipleCharacters } from "./character";
import { SessionGroup } from "./sesssionGroup";

const baseUrl = process.env.NEXT_PUBLIC_API_BASEURL;
const apiBaseUrl = `${baseUrl}/groups`;

export async function getGroups(sessionId: string): Promise<SessionGroup[]> {
  const res = await fetch(`${apiBaseUrl}/${sessionId}`, {
    headers:{
      'Content-Type': 'application/json',
    } 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
}

export async function getGroupCharacters(sessionId: string, groupId: string): Promise<Character[]> {
  const res = await fetch(`${apiBaseUrl}/${sessionId}/${groupId}`, {
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

export async function createGroup(sessionId: string, newGroup: SessionGroup): Promise<string> {
  const res = await fetch(`${apiBaseUrl}/${sessionId}`, {
    method: 'POST',
    body: JSON.stringify(newGroup),
    headers:{
      'Content-Type': 'application/json',
    } 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
}

export async function deleteGroup(sessionId: string, groupId: string) {
  const res = await fetch(`${apiBaseUrl}/${sessionId}/${groupId}`, {
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

export async function saveGroupCharacter(sessionId: string, groupId: string, character:Character) {
  const res = await fetch(`${apiBaseUrl}/${sessionId}/${groupId}/${character.creature_id}`, {
    method: 'PATCH',
    body: JSON.stringify(character),
    headers:{
      'Content-Type': 'application/json',
    } 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
} 

export async function addGroupCharacter(sessionId: string, groupId: string, character:Character) {
  const res = await fetch(`${apiBaseUrl}/${sessionId}/${groupId}`, {
    method: 'POST',
    body: JSON.stringify(character),
    headers:{
      'Content-Type': 'application/json',
    } 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
} 

export async function addGroupMultipleCharacter(sessionId: string, groupId: string, characters:MultipleCharacters) {
  const res = await fetch(`${apiBaseUrl}/${sessionId}/${groupId}/multiple`, {
    method: 'POST',
    body: JSON.stringify(characters),
    headers:{
      'Content-Type': 'application/json',
    } 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
} 

export async function deleteGroupCharacter(sessionId: string, groupId: string, id:string) {
  const res = await fetch(`${apiBaseUrl}/${sessionId}/${groupId}/${id}`, {
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