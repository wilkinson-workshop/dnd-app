'use client'

import { useEffect, useState } from "react";
import UpdateHpButton from "./update-hp-button";
import { Npc } from "../../_apis/npc";

export default function NpcHp({npc, onUpdateClick}: {npc: Npc, onUpdateClick: any}) {
    const [edit, onEdit] = useState(false);

    function instaKill(){
        onEdit(false);
        onUpdateClick(npc.id, 0);
    }

    if(edit){
        return <UpdateHpButton id={npc.id} currentHp={npc.hp} onUpdateClick={(id: string, hp:number) => {
            onEdit(false);
            onUpdateClick(id, hp);
        }} />
    } else {
        return (
            <>
            <span>{npc.hp}</span>
            <button type="button" onClick={x => onEdit(true)} >Edit</button>
            <button type="button" onClick={instaKill} >InstaKill</button>
            </>
        )
    }
}