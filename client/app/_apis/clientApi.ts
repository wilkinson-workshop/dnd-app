
const baseUrl = 'http://localhost:8000';
const apiBaseUrl = `${baseUrl}/clients`;

export async function createClient(): Promise<string>{
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