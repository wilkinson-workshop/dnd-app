import { useState } from "react";

export default function UpdateHpButton({id, currentHp, onUpdateClick}: {id: string, currentHp: number, onUpdateClick: any}) {
    const [hp, setHp] = useState(currentHp);

    return <form onSubmit={e => {
                e.preventDefault();
                onUpdateClick(id, hp)
            }}>
                <input type="number" value={hp} onChange={x => setHp(Number.parseInt(x.target.value))}></input>
                <button type="submit">Update</button>
            </form>
}