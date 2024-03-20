import { APIReference, Monster } from "./dnd5eTypings";

const baseUrl = process.env.NEXT_PUBLIC_API_BASEURL;
const apiBaseUrl = `${baseUrl}/monsters`;

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

    let customMonsters:Monster[] = await res.json()

    return customMonsters.map<APIReference>(m => { return { name: m.name, index: m.index, url: '' }; });
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