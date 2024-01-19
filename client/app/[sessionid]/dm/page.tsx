'use client'

import { ConditionType, Npc } from "../../_apis/npc"
import AddNpcButton from "./add-npc-button";
import { useState } from "react";
import NpcHp from "./npc-hp";
import NpcConditions from "./npc-conditions";
import { addCharacter, deleteCharacter, getCharacters, saveCharacter } from "../../_apis/characterApi";
import { getAllSessionInput } from "@/app/_apis/sessionApi";
import { PlayerInput } from "@/app/_apis/playerInput";

export default function DmDashboardPage({ params }: { params: { sessionid: string } }) {
  const [npcs, setNpcs] = useState<Npc[]>([]);
  const [inputs, setInputs] = useState<PlayerInput[]>([]);
  const [didPageInit, setPageInit] = useState(false);

  if(!didPageInit){
    setPageInit(true);//assumes success no retry logic
    getCharacters(params.sessionid).then(c => {
      setNpcs(c);
    });
  }

  function handleAddCharacter(npc: Npc){
    addCharacter(params.sessionid, npc)
    .then(_=> {
      return getCharacters(params.sessionid);
    }).then(c => {
      setNpcs(c);
    });
  }

  function onDelete(npcId: string){
    deleteCharacter(params.sessionid, npcId)
    .then(_=> {
      return getCharacters(params.sessionid);
    }).then(c => {
      setNpcs(c);
    });
  }

  function onHpUpdate(npcId: string, newHp: number){
    if(newHp == 0){
      onDelete(npcId);
    } else {
      const npcToUpdate = npcs.findIndex(x => x.id == npcId);
      npcs[npcToUpdate].hp = newHp;

      saveCharacter(params.sessionid, npcs[npcToUpdate])
      .then(_=> {
        return getCharacters(params.sessionid);
      }).then(c => {
        setNpcs(c);
      });
    }
  }

  function onConditionUpdate(npcId: string, newConditions: ConditionType[]){
    const npcToUpdate = npcs.findIndex(x => x.id == npcId);
    npcs[npcToUpdate].conditions = newConditions;

    saveCharacter(params.sessionid, npcs[npcToUpdate])
    .then(_=> {
      return getCharacters(params.sessionid);
    }).then(c => {
      setNpcs(c);
    });
  }

  function onConditionDelete(npcId:string, condition:ConditionType){
    const npcToUpdate = npcs.find(x => x.id == npcId);
    const conditionToDelete = npcToUpdate!.conditions.findIndex(x => x == condition);
    npcToUpdate!.conditions.splice(conditionToDelete,1);

    saveCharacter(params.sessionid, npcToUpdate!)
    .then(_=> {
      return getCharacters(params.sessionid);
    }).then(c => {
      setNpcs(c);
    });
  }

  function handleGetPlayerInput(){
    getAllSessionInput(params.sessionid)
    .then(pi => setInputs(pi))
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>HP</th>
            <th>Conditions</th>
          </tr>
        </thead>
        <tbody>
        {npcs.map((npc) => (
          <tr key={npc.id}>
            <td>{npc.name}</td>
            <td><NpcHp npc={npc} onUpdateClick={onHpUpdate} /></td>
            <td><NpcConditions npc={npc} onConditionUpdate={onConditionUpdate} onConditionDelete={onConditionDelete} /></td>
          </tr>
        ))}
        </tbody>
      </table>
      {inputs.map(input => (
        <div key={input.clientId + "" + Math.random().toPrecision(1)}>
          Name: {input.name} - Value: {input.input}
        </div>
      ))}

      <AddNpcButton onAddClick={handleAddCharacter} /> 
      <button type="button" onClick={handleGetPlayerInput} >Get Player Input</button>     
    </div>
  )
}
