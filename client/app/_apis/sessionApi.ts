import { JoinSessionRequest, PlayerInput } from "./playerInput";

const baseUrl = 'http://localhost:8000';
const apiBaseUrl = `${baseUrl}/sessions`;

export async function getSessions(): Promise<any[]> {
  const res = await fetch(apiBaseUrl, {
    headers:{
      'Content-Type': 'application/json',
    } 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
}

export async function createSession() {
  const res = await fetch(`${apiBaseUrl}/`, {
    method: 'POST',
    headers:{
      'Content-Type': 'application/json',
    } 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
}

export async function joinSession(id: string, request: JoinSessionRequest) {
  const res = await fetch(`${apiBaseUrl}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(request),
    headers:{
      'Content-Type': 'application/json',
    } 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
} 

export async function endSession(id: string) {
  const res = await fetch(`${apiBaseUrl}/${id}`, {
    method: 'POST',
    headers:{
      'Content-Type': 'application/json',
    } 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
}

export async function getAllSessionInput(id: string): Promise<PlayerInput[]> {
  const res = await fetch(`${apiBaseUrl}/${id}/player-input`, {
    headers:{
      'Content-Type': 'application/json',
    } 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
}

export async function addSessionInput(id: string, input: PlayerInput) {
  const res = await fetch(`${apiBaseUrl}/${id}/player-input`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers:{
      'Content-Type': 'application/json',
    } 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
}

export async function deleteSession(id:string) {
  const res = await fetch(`${apiBaseUrl}/${id}`, {
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