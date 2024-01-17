import { useState } from "react";
import { ConditionType } from "./npc";

export default function AddNpcButton({onAddClick}: {onAddClick: any}) {
    const [edit, onEdit] = useState(false);
    const [hp, setHp] = useState(1);
    const [name, setName] = useState('Character');
    const [conditions, setConditions] = useState<ConditionType[]>([]);

    function handleSubmit(e) {
        e.preventDefault();
        onEdit(false);
        onAddClick({
            id: Math.floor(Math.random()*10000), //use database for this.
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