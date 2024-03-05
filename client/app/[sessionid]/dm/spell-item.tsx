import { FC, useState } from "react";
import { getMonsterSpellApi } from "@/app/_apis/dnd5eApi";
import { DescriptionTooltip } from "@/app/description-tooltip";
import { SpecialAbilitySpell } from "@/app/_apis/dnd5eTypings";
import { Link } from "@mui/material";

export interface SpellItemProps {
    spell: SpecialAbilitySpell
}

export const SpellItem: FC<SpellItemProps> = ({spell}) => {
    const [description, setDescription] = useState<string[]>([]);

	function getMonsterSpell(url: string){      
        getMonsterSpellApi(url)
        .then(c => setDescription(c.desc));
    }

    return (<>
    <DescriptionTooltip title={description.join('\n')}>
        <Link href="#" onClick={() => getMonsterSpell(spell.url)}>{spell.name}</Link>
    </DescriptionTooltip>
    </>);
}