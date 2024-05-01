import { PlayerInput, RequestPlayerInput, PlayerMessage, SessionInput } from "./playerInput";
import { Session } from "./session";

const baseUrl = process.env.NEXT_PUBLIC_API_BASEURL;
const apiBaseUrl = `${baseUrl}/sessions`;

export async function getSessions(): Promise<Session[]> {
  const res = await fetch(`${apiBaseUrl}/`, {
    headers:{
      'Content-Type': 'application/json',
    } 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
}

export async function getSingleSession(sessionId: string): Promise<Session[]> {
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

export async function createSession(newSession: Session): Promise<string> {
  const res = await fetch(`${apiBaseUrl}/`, {
    method: 'POST',
    body: JSON.stringify(newSession),
    headers:{
      'Content-Type': 'application/json',
    } 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
}

export async function updateInitiativeTop(sessionId: string, characterId: string | null): Promise<string> {
  const res = await fetch(`${apiBaseUrl}/${sessionId}/initiative-order`, {
    method: 'POST',
    body: JSON.stringify({creature_uuid: characterId}),
    headers:{
      'Content-Type': 'application/json',
    } 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
}

export async function endSession(sessionId: string) {
  const res = await fetch(`${apiBaseUrl}/${sessionId}`, {
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

export async function getAllSessionInput(sessionId: string): Promise<SessionInput[]> {
  const res = await fetch(`${apiBaseUrl}/${sessionId}/player-input`, {
    headers:{
      'Content-Type': 'application/json',
    } 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
}

export async function addSessionInput(sessionId: string, input: PlayerInput) {
  const res = await fetch(`${apiBaseUrl}/${sessionId}/player-input`, {
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

export async function clearSessionInput(sessionId: string): Promise<any> {
  const res = await fetch(`${apiBaseUrl}/${sessionId}/player-input`, {
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

export async function requestPlayerInput(sessionId: string, input: RequestPlayerInput) {
  const res = await fetch(`${apiBaseUrl}/${sessionId}/request-player-input`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers:{
      'Content-Type': 'application/json',
    } 
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch data: ${await res.text()}`)
  }
  
  return res.json()
}

export async function sendPlayerMessageApi(sessionId: string, input: PlayerMessage) {
  const res = await fetch(`${apiBaseUrl}/${sessionId}/message`, {
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

export async function deleteSession(sessionId:string) {
  const res = await fetch(`${apiBaseUrl}/${sessionId}`, {
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
