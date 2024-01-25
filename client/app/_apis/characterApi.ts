import { Character } from "./character";

const baseUrl = 'http://localhost:8000';
const apiBaseUrl = `${baseUrl}/characters`;

export async function getCharacters(sessionId: string) {
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

export async function getInitiativeOrder(sessionId: string) {
  const res = await fetch(`${apiBaseUrl}/${sessionId}/initiative`, {
    headers:{
      'Content-Type': 'application/json',
    } 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
} 

export async function saveCharacter(sessionId: string, character:Character) {
  const res = await fetch(`${apiBaseUrl}/${sessionId}/${character.label}`, {
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

export async function addCharacter(sessionId: string, character:Character) {
  const res = await fetch(`${apiBaseUrl}/${sessionId}`, {
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

export async function deleteCharacter(sessionId: string, id:string) {
  const res = await fetch(`${apiBaseUrl}/${sessionId}/${id}`, {
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