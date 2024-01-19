import { ChangeEvent, useState } from "react";
import { ConditionOptions, ConditionType } from "../../_apis/npc";

export default function UpdateConditions({id, currentConditions, onUpdateConClick}: {id: string, currentConditions: ConditionType[], onUpdateConClick: any}) {
    const [conditions, setConditions] = useState(currentConditions);

    const handleChange = (e: any) => {
        const options = [...e.target.selectedOptions];
        const values  = options.map(x => (Number).parseInt(x.value));
        setConditions(values)
        return;
    };

    return <form onSubmit={e => {
        let newStart = conditions.slice();

        e.preventDefault();
        onUpdateConClick(id, newStart)
    }}>
            <select 
                name="conditions"
                multiple={true}
                value={conditions.map(x => x.toString())}
                onChange={handleChange}>
                    {ConditionOptions.map(c =>
                        <option value={c.id}>{c.name}</option>
                    )}
            </select>
            <button type="submit">Update</button>
        </form>
}