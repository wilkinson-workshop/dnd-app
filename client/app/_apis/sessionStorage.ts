export function getClientId(){
    return sessionStorage.getItem("clientId")!;
}

export function setClientId(clientId: string){
    sessionStorage.setItem("clientId", clientId);
}

export function getName(){
    return sessionStorage.getItem("player-name")!;
}

export function setName(name: string){
    sessionStorage.setItem("player-name", name);
}