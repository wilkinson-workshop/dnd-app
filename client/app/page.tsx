
'use client'

import { ConditionType, Npc } from "./npc"
import AddNpcButton from "./add-npc-button";
import { useState } from "react";
import NpcHp from "./npc-hp";
import NpcConditions from "./npc-conditions";
import { addCharacter, deleteCharacter, getCharacters, saveCharacter } from "./_apis/characterApi";

export default function HomePage() {
  const [npcs, setNpcs] = useState<Npc[]>([]);
  const [isApi, setApi] = useState(false);

  if(!isApi){
    setApi(true);
    getCharacters().then(c => {
      setNpcs(c);
    });
  }

  function handleAddCharacter(npc: Npc){
    addCharacter(npc)
    .then(_=> {
      return getCharacters();
    }).then(c => {
      setNpcs(c);
    });
  }

  function onDelete(npcId: string){
    deleteCharacter(npcId)
    .then(_=> {
      return getCharacters();
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

      saveCharacter(npcs[npcToUpdate])
      .then(_=> {
        return getCharacters();
      }).then(c => {
        setNpcs(c);
      });
    }
  }

  function onConditionUpdate(npcId: string, newConditions: ConditionType[]){
    const npcToUpdate = npcs.findIndex(x => x.id == npcId);
    npcs[npcToUpdate].conditions = newConditions;

    saveCharacter(npcs[npcToUpdate])
    .then(_=> {
      return getCharacters();
    }).then(c => {
      setNpcs(c);
    });
  }

  function onConditionDelete(npcId:string, condition:ConditionType){
    const npcToUpdate = npcs.find(x => x.id == npcId);
    const conditionToDelete = npcToUpdate!.conditions.findIndex(x => x == condition);
    npcToUpdate!.conditions.splice(conditionToDelete,1);

    saveCharacter(npcToUpdate!)
    .then(_=> {
      return getCharacters();
    }).then(c => {
      setNpcs(c);
    });
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
      <AddNpcButton onAddClick={handleAddCharacter} />      
    </div>
  )
}
