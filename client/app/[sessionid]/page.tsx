'use client'

import { addSessionInput, joinSession } from "../_apis/sessionApi";
import { FormEvent, useState } from "react";
import { createClient } from "../_apis/clientApi";
import { getInitiativeOrder } from "../_apis/characterApi";

export interface InitiativeOrder {id: string, name: string}

export default function PlayerPage({ params }: { params: { sessionid: string } }) {
  const [client, setClient] = useState<string>('');
  const [initiative, setInitiative] = useState(0);
  const [hasClient, setHasClient] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [initiativeOrder, setInitiativeOrder] = useState<InitiativeOrder[]>([])

  if(!hasClient){
    setHasClient(true);//assumes success no retry logic
    createClient()
    .then((c: string) => {
      setClient(c);      
    });    
  }

  function handleInputSubmit(e: FormEvent){
    e.preventDefault();    
    addSessionInput(params.sessionid, {input: initiative, clientId: client, name: playerName})
    .then();
  }

  function getLatestInitiativeOrder(){
    getInitiativeOrder(params.sessionid)
    .then(i => setInitiativeOrder(i));
  }

  function handleJoinSubmit(e: FormEvent){
    e.preventDefault();    
    joinSession(params.sessionid, {clientId: client, name: playerName, type:'player'})
    .then(_ => setHasJoined(true))

    //this could be trigered by event from dm when turn order updates.
    getLatestInitiativeOrder();
  }

  if(hasJoined){
    return (
        <>
        <div>
            <form onSubmit={handleInputSubmit}>
                <label>
                    Initiative: 
                    <input type="number" min="1" max="20" onChange={x => setInitiative(Number.parseInt(x.target.value))}></input>
                </label>
                <button type="submit">Send</button>
            </form>            
        </div>
        <div>
        <button type="button" onClick={getLatestInitiativeOrder}>Show Initiative Order</button>
        {initiativeOrder.map(order => (
          <div key={order.id}>
            {order.name}
          </div>
        ))}
        </div>
      </>               
    )
  } else {
    return (
        <div>
            <form onSubmit={handleJoinSubmit}>
                <label>
                    Player Name: 
                    <input type="text" onChange={x => setPlayerName(x.target.value)}></input>
                </label>        
                <button type="submit">Join Session</button>
            </form>            
        </div>
    )
  }

    
}
