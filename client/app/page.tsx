
'use client'

import { ConditionType, Npc } from "./npc"
import AddNpcButton from "./add-npc-button";
import { useState } from "react";
import NpcHp from "./npc-hp";
import NpcConditions from "./npc-conditions";

export default function HomePage() {
  const start: Npc[] = [{id: 1, name: "Character1", hp: 100, conditions:[ConditionType.BardicInspiration, ConditionType.Asleep]}]


  const [npcs, setNpcs] = useState(start);  
  const [id, setId] = useState(1);

  function handleAddCharacter(npc: Npc){
    const nextId = id+1;
    let newStart = npcs.slice();
    newStart.push(npc);
    setNpcs(newStart);
    setId(nextId);
  }

  function onDelete(npcId: number){
    let newStart = npcs.slice();
    const npcToDelete = newStart.findIndex(x => x.id == npcId);
    newStart.splice(npcToDelete,1);
    setNpcs(newStart);
  }

  function onHpUpdate(npcId: number, newHp: number){
    if(newHp == 0){
      onDelete(npcId);
    } else {
      let newStart = npcs.slice();
      const npcToUpdate = newStart.findIndex(x => x.id == npcId);
      newStart[npcToUpdate].hp = newHp;
      setNpcs(newStart);
    }
  }

  function onConditionUpdate(npcId: number, newConditions: ConditionType[]){
    let newStart = npcs.slice();
    const npcToUpdate = newStart.findIndex(x => x.id == npcId);
    newStart[npcToUpdate].conditions = newConditions;
    setNpcs(newStart);
  }

  function onConditionDelete(npcId:number, condition:ConditionType){
    let newStart = npcs.slice();
    const npcToUpdate = newStart.find(x => x.id == npcId);
    const conditionToDelete = npcToUpdate!.conditions.findIndex(x => x == condition);
    npcToUpdate?.conditions.splice(conditionToDelete,1);
    setNpcs(newStart);
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
