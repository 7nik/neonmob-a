import type NM from "$lib/utils/NM Types";
import type { ID, rarityNumber, SettVersion } from "$lib/utils/NM Types";

import { db, RARITY } from "./db.server";
import { convertAssets, getFullName } from "./utils";

const stmtGetCards = db.prepare<number>(`
    SELECT card.id, card.name, sett.replica, sett.version, card.asset, card.rarity
    FROM card card JOIN sett ON card.sett_id = sett.id
    WHERE card.sett_id = ?
    ORDER BY card.position ASC
`).raw();
type RawCard = [ID<"card">, string, number|null, SettVersion, string, rarityNumber];

export function getCards (sid: ID<"sett">): NM.Card[] {
    const rawCards: RawCard[] = stmtGetCards.all(sid);
    return rawCards.map(([id, name, replica, version, assets, rarNumber]) => ({
        id,
        name,
        version,
        is_replica: replica !== null,
        asset_type: assets.includes(`"v":`) ? "video" : "image",
        rarity: {
            carats: RARITY[rarNumber].carats,
            class: RARITY[rarNumber].class,
            name: RARITY[rarNumber].nameLow,
            value: rarNumber,
        },
        piece_assets: convertAssets(assets, ["small", "medium"]),
        own_count: 0,
        favorite: false,
    }));
}

const stmtGetCardNames = db.prepare<number>(`
    SELECT card.id, card.name, card.slug, card.rarity, sett.slug
    FROM card card JOIN sett ON card.sett_id = sett.id
    WHERE card.sett_id = ?
`).raw();
type RawCardName = [ID<"card">, string, string, rarityNumber, string];

export function getCardNames (sid: ID<"sett">, host: string): NM.CardName[] {
    const rawCards: RawCardName[] = stmtGetCardNames.all(sid);
    return rawCards.map(([id, name, cardSlug, rarNumber, settSlug]) => ({
        id,
        name,
        rarity: {
            carats: RARITY[rarNumber].carats,
            class: RARITY[rarNumber].class,
            name: RARITY[rarNumber].name,
            rarity: rarNumber,
        },
        api_url: `/`,
        public_url: `//${host}/${settSlug}/${cardSlug}/`,
    }));
}

const stmtGetPrint = db.prepare<number>(`
    SELECT card.id, card.name, card.slug, card.description, card.total_prints, asset, rarity,
    sett.id, sett.name, sett.slug, discontinued, released, sett_type, replica, version,
    user.id, first_name, last_name, username
    FROM card card JOIN sett ON card.sett_id = sett.id JOIN user ON sett.creator_id = user.id
    WHERE card.id = ?
`).expand();
type RawPrint = {
    card: {
        id: ID<"card">,
        name: string,
        slug: string,
        description: string,
        total_prints: number|-1,
        asset: string,
        rarity: rarityNumber,
    },
    sett: {
        id: ID<"sett">,
        name: string,
        slug: string,
        discontinued: string|null,
        released: string,
        sett_type: NM.Sett["sett_type"],
        replica: number|null,
        version: NM.Sett["version"],
    },
    user: {
        id: ID<"user">,
        first_name: string,
        last_name: string,
        username: string,
    },
};

export function getPrint (id: ID<"card">, host: string): NM.Unmerged.Prints|null {
    const raw: RawPrint = stmtGetPrint.get(id);
    if (!raw) return null;
    return {
        absolute_url: `/series/${raw.sett.slug}/${raw.card.slug}/`, // FIXME: add print ID
        asset_type: raw.card.asset.includes(`"v":`) ? "video" : "image",
        description: raw.card.description,
        favorite: false,
        id: raw.card.id,
        is_replica: raw.sett.replica !== null,
        name: raw.card.name,
        num_prints_total: raw.card.total_prints < 0 ? "unlimited" : raw.card.total_prints,
        // eslint-disable-next-line max-len
        piece_assets: convertAssets(raw.card.asset, ["small", "medium", "large", "large-promo", "xlarge", "original"]),
        prints: [],
        prints_part_of_trade: [],
        public_url: `//${host}/series/${raw.sett.slug}/${raw.card.slug}/`, // FIXME: add print ID
        rarity: {
            carats: RARITY[raw.card.rarity].carats,
            class: RARITY[raw.card.rarity].class,
            name: RARITY[raw.card.rarity].name,
            image: "//", // unused link to the rarity's image
        },
        set: {
            creator: {
                id: raw.user.id,
                link: `//${host}/creator/${raw.user.username}`,
                name: getFullName(raw.user),
                twitter_username: null,
            },
            discontinued: raw.sett.discontinued,
            id: raw.sett.id,
            links: {
                "api-pack": `//`,
                permalink: `/series/${raw.sett.slug}/`,
                piece_names: `//`,
                pieces: `//`,
                self: `//`,
            },
            name: raw.sett.name,
            price: null,
            released: raw.sett.released,
            sett_type: raw.sett.sett_type,
        },
        version: raw.sett.version,
    };
}
