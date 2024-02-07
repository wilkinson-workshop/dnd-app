const apiBaseUrl = 'https://www.dnd5eapi.co/api/'

export interface GetAllSchema {
    count: number,
    results: GetSchema[]
}

export interface GetSchema {
    index:string,    
    name: string,    
    url: string,    
    desc: string | null    
}    

export async function getAllConditions(): Promise<GetAllSchema> {
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

  export async function getCondition(condition: string): Promise<GetSchema> {
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