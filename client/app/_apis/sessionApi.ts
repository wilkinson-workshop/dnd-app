import { JoinSessionRequest, PlayerInput, RequestPlayerInput, PlayerSecret } from "./playerInput";

const baseUrl = process.env.NEXT_PUBLIC_API_BASEURL;
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

export async function getAllSessionInput(sessionId: string): Promise<PlayerInput[]> {
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

export async function sharePlayerSecret(sessionId: string, input: PlayerSecret) {
  const res = await fetch(`${apiBaseUrl}/${sessionId}/secret`, {
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