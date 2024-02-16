export function getClientId(){
    return sessionStorage.getItem("clientId")!;
}

export function setClientId(clientId: string){
    sessionStorage.setItem("clientId", clientId);
}