import { FC, useState } from "react";

export interface UpdateHpProps{id: string, currentHp: number, onUpdateClick: any}

export const UpdateHp:FC<UpdateHpProps> = ({id, currentHp, onUpdateClick}) => {
    const [hp, setHp] = useState(currentHp);

    return <form onSubmit={e => {
                e.preventDefault();
                onUpdateClick(id, hp)
            }}>
                <input type="number" value={hp} onChange={x => setHp(Number.parseInt(x.target.value))}></input>
                <button type="submit">Update</button>
            </form>
}