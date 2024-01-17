import { useState } from "react";
import { ConditionType } from "./npc";

export default function UpdateConditions({id, currentConditions, onUpdateConClick}: {id: number, currentConditions: ConditionType[], onUpdateConClick: any}) {
    const [conditions, setConditions] = useState(currentConditions);

    return <form onSubmit={e => {
        let newStart = conditions.slice();

        e.preventDefault();
        onUpdateConClick(id, newStart)
    }}>
        <select 
            name="conditions"
            multiple={true}
            value={conditions.map(x => x.toString())}
            onChange={e => {
                const options = [...e.target.selectedOptions];
                const values  = options.map(x => (Number).parseInt(x.value));
                setConditions(values)
            }}>
            <option value={ConditionType.BardicInspiration}>BardicInspiration</option>
            <option value={ConditionType.Stunned}>Stunned</option>
            <option value={ConditionType.Burned}>Burned</option>
            <option value={ConditionType.Poisoned}>Poisoned</option>
            <option value={ConditionType.KnockedOut}>KnockedOut</option>
            <option value={ConditionType.KnockedProne}>KnockedProne</option>
            <option value={ConditionType.Charmed}>Charmed</option>
            <option value={ConditionType.Asleep}>Asleep</option>
            <option value={ConditionType.Petrified}>Petrified</option>
            <option value={ConditionType.Scared}>Scared</option>
        </select>
        <button type="submit">Update</button>
        </form>
}