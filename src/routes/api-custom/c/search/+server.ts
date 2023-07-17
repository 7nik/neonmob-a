import type { RawSett } from "$db/utils";
import type NM from "$lib/utils/NM Types";
import type {
    absoluteURL,
    ID,
    rarityCss,
    rarityName,
    rarityNumber,
} from "$lib/utils/NM Types";

import { json } from "@sveltejs/kit";
import { getSettCategories } from "$db/category";
import { RARITY, db } from "$db/db.server";
import {
    SELECT_SETT,
    convertAvatar,
    convertAssets,
    getFullName,
    convertSett,
} from "$db/utils";

// FIXME improve performance?

const stmtFindCards = db.prepare<[string]>(`
    SELECT card.id, card.name, card.slug, card.asset, card.rarity,
        sett.id, sett.name, sett.slug,
        user.id, user.first_name, user.last_name, user.username
    FROM card JOIN sett ON card.sett_id = sett.id JOIN user ON sett.creator_id = user.id
    WHERE instr(lower(card.name), ?)
    ORDER BY card.slug, sett.slug
    LIMIT 200
`).expand();
type RawCard = {
    card: {
        id: ID<"card">,
        name: string,
        slug: string,
        asset: string,
        rarity: rarityNumber,
    },
    sett: {
        id: ID<"sett">,
        name: string,
        slug: string,
    },
    user: {
        id: ID<"user">,
        first_name: string,
        last_name: string,
        username: string,
    },
};

const stmtFindSetts = db.prepare<[string]>(`
    ${SELECT_SETT}
    FROM sett JOIN user ON sett.creator_id = user.id
    WHERE instr(lower(sett.name), ?)
    ORDER BY sett.slug
    LIMIT 200
`).expand();

const stmtFindUsers = db.prepare<[string, string]>(`
    SELECT id, first_name, last_name, username, avatar_small, avatar_large
    FROM user
    WHERE instr(lower(format('%s %s', user.first_name, user.last_name)), ?)
        OR instr(lower(username), ?)
    ORDER BY lower(first_name), lower(last_name)
    LIMIT 200
`);
type RawUser = {
    id: ID<"user">,
    first_name: string,
    last_name: string,
    username: string,
    avatar_small: string,
    avatar_large: string,
};

export type FoundCard = {
    id: ID<"card">,
    name: string,
    name_slug: string,
    piece_assets: { image: { small: NM.Image } },
    rarity: {
        name: rarityName,
        class: rarityCss,
    }
    public_url: absoluteURL,
    sett: {
        id: ID<"sett">,
        name: string,
        name_slug: string,
        link: absoluteURL,
    },
    creator: {
        id: ID<"user">,
        link: absoluteURL,
        name: string,
        username: string,
    },
};

export type FoundUser = {
    id: ID<"user">,
    name: string,
    username: string,
    link: absoluteURL,
    avatar: NM.User["avatar"],
}

export const GET = ({ url }) => {
    const query = url.searchParams.get("search")?.trim().toLowerCase();
    if (!query) return json({ cards: [], sett: [], users: [] });

    const rawCards: RawCard[] = stmtFindCards.all(query);
    const cards: FoundCard[] = rawCards.map(({ card, sett, user }) => ({
        id: card.id,
        name: card.name,
        name_slug: card.slug,
        piece_assets: convertAssets(card.asset, ["small"]),
        rarity: {
            name: RARITY[card.rarity].name,
            class: RARITY[card.rarity].class,
        },
        public_url: `/series/${sett.slug}/${card.slug}/`,
        sett: {
            id: sett.id,
            name: sett.name,
            name_slug: sett.slug,
            link: `/series/${sett.slug}/`,
        },
        creator: {
            id: user.id,
            link: `/creator/${user.username}`,
            name: getFullName(user),
            username: user.username,
        },
    }));

    const rawSetts: RawSett[] = stmtFindSetts.all(query);
    const categories = getSettCategories(rawSetts.map(({ sett }) => sett.id));
    const setts = rawSetts.map((raw) => convertSett(raw, url.host, categories[raw.sett.id]));

    const rawUsers: RawUser[] = stmtFindUsers.all(query, query);
    const users: FoundUser[] = rawUsers.map((user) => ({
        id: user.id,
        name: getFullName(user),
        username: user.username,
        // FIXME point to the collector profile
        link: `/creator/${user.username}/`,
        avatar: convertAvatar(user),
    }));

    return json({ cards, setts, users });
};
