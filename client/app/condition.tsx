import { ConditionType } from "./npc"

export default function Condition({id, condition, onDeleteCondition}: {id: number, condition:ConditionType, onDeleteCondition:any}) {
    switch(condition){
        case ConditionType.BardicInspiration: 
            return <div className="condition inspired">Inspired 
                <button type="button" onClick={() => onDeleteCondition(id, condition)}>X</button>
            </div>;
        case ConditionType.Stunned: 
            return<div className="condition stunned">Stunned
                <button type="button" onClick={() => onDeleteCondition(id, condition)}>X</button>
            </div>;
        case ConditionType.Burned: 
            return <div className="condition burned">Burned
                <button type="button" onClick={() => onDeleteCondition(id, condition)}>X</button>
            </div>;
        case ConditionType.Poisoned: 
            return<div className="condition poisoned">Poisoned
                <button type="button" onClick={() => onDeleteCondition(id, condition)}>X</button>
            </div>;
        case ConditionType.KnockedOut: 
            return <div className="condition knocked-out">Knocked Out
             <button type="button" onClick={() => onDeleteCondition(id, condition)}>X</button>
            </div>;
        case ConditionType.KnockedProne: 
            return<div className="condition knocked-prone">Knocked Prone
                <button type="button" onClick={() => onDeleteCondition(id, condition)}>X</button>
            </div>;
        case ConditionType.Charmed: 
            return <div className="condition charmed">Charmed
                <button type="button" onClick={() => onDeleteCondition(id, condition)}>X</button>
            </div>;
        case ConditionType.Asleep: 
            return<div className="condition asleep">Asleep
                <button type="button" onClick={() => onDeleteCondition(id, condition)}>X</button>
            </div>;
        case ConditionType.Petrified: 
            return <div className="condition petrified">Petrified
             <button type="button" onClick={() => onDeleteCondition(id, condition)}>X</button>
            </div>;
        case ConditionType.Scared: 
            return <div className="condition scared">Scared
                <button type="button" onClick={() => onDeleteCondition(id, condition)}>X</button>
            </div>;
    }
}