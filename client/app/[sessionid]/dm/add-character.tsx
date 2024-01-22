import { FormEvent, useState } from "react";
import { ConditionOptions, ConditionType } from "../../_apis/character";

export default function AddCharacter({onAddClick}: {onAddClick: any}) {
    const [edit, onEdit] = useState(false);
    const [hp, setHp] = useState(1);
    const [initiative, setInitiative] = useState(1);
    const [name, setName] = useState('Character');
    const [conditions, setConditions] = useState<ConditionType[]>([]);

    function handleSubmit(e: FormEvent): void {
        e.preventDefault();
        onEdit(false);
        onAddClick({
            id: '', //use database for this.
            initiative: initiative,
            name: name, 
            hp: hp, 
            conditions:conditions
          });
          setHp(1);
          setName('Character')
          setConditions([]);
        }

      if(edit){ return (
        <form onSubmit={handleSubmit}>
                        <div>
                <label>
                    Initiative:
                    <input type="number" value={initiative} onChange={x => setInitiative(Number.parseInt(x.target.value))}></input>
                </label>                
            </div>
            <div>
                <label>
                    Name:
                    <input type="text" value={name} onChange={x => setName(x.target.value)}></input>
                </label>                
            </div>
            <div>
                <label>
                    HP:
                    <input type="number" value={hp} onChange={x => setHp(Number.parseInt(x.target.value))}></input>
                </label>                
            </div>
            <div>
                <label>
                    Starting Conditions:
                    <select 
                        name="conditions"
                        multiple={true}
                        value={conditions.map(x => x.toString())}
                        onChange={e => {
                            const options = [...e.target.selectedOptions];
                            const values  = options.map(x => (Number).parseInt(x.value));
                            setConditions(values)
                        }}>
                        {ConditionOptions.map(c =>
                            <option key={c.id} value={c.id}>{c.name}</option>
                        )}
                    </select>
                </label>                
            </div>
            <button type="button" onClick={x => onEdit(false)} >Cancel</button>
            <button type="submit">Add</button>
        </form>
        )
      } else {
          return (
            <>
                <button type="button" onClick={x => onEdit(true)} >Add Character</button>
            </>
          )
      }    
}