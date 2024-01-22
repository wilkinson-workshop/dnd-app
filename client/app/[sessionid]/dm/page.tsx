'use client'

import { useState } from "react";
import { getAllSessionInput } from "@/app/_apis/sessionApi";
import { PlayerInput } from "@/app/_apis/playerInput";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Container } from "./character-container";

export default function DmDashboardPage({ params }: { params: { sessionid: string } }) {
  const [inputs, setInputs] = useState<PlayerInput[]>([]);

  function handleGetPlayerInput(){
    getAllSessionInput(params.sessionid)
    .then(pi => setInputs(pi))
  }

  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        <Container sessionId={params.sessionid} />
      </DndProvider>
      {inputs.map(input => (
        <div key={input.clientId + "" + Math.random().toPrecision(1)}>
          Name: {input.name} - Value: {input.input}
        </div>
      ))}  
      <div>
          <button type="button" onClick={handleGetPlayerInput} >Get Player Input</button> 
      </div>         
    </div>
  )
}
