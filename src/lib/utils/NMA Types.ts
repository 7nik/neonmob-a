import type {
    absoluteURL,
    fullURL,
    ID,
    rarityName,
} from "./NM Types";
import type NM from "./NM Types";
import type { FoundCard, FoundUser } from "src/routes/api-custom/c/search/+server";

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace NMA {
    type Creator = NM.Creator & NM.UserCollocutor;

    type Card = Omit<NM.Unmerged.Prints, "set"|"rarity"> & {
        favorite:boolean,
        rarity: rarityName,
        set: number,
     };

     type SearchResults = {
        cards: FoundCard[],
        setts: NM.Sett[],
        users: FoundUser[],
     }
}

export default NMA;

/**
 * Old pagination, e.g. https://www.neonmob.com/api/sets/24802/pieces/
 * Also, it is Unmerged data
 */
export type OldPaginated<T> = {
    metadata: {
        resultset: {
            count: number,
            offset: number,
            limit: number,
            link: {
                next: string | null,
                previous: string | null,
            }
        },
    }
    results: T[],
}
type OldSett = Pick<
    NM.Sett,
    "id"|"name"|"name_slug"|"description"|"sett_assets"|"released"|"discontinued"
        |"price"|"links"|"preview_0"|"preview_1"|"preview_2"|"preview_3"|"sett_type"
> & {
    creator: NM.Unmerged.UserLong,
    is_legacy_sett: boolean,
};
export type OldPrint = {
    "set": OldSett,
    "id": ID<"card">,
    "name": string,
    "name_slug": string,
    "description": string,
    "rarity": NM.Unmerged.Rarity,
    "num_prints_total": number,
    "links": {
        "self": absoluteURL,
        "collection": absoluteURL,
        "permalink": absoluteURL
    },
    "public_url": fullURL,
    "odds": {
        "antecedent": number,
        "consequent": string,
        "unit": string
    },
    "asset_type": NM.Card["asset_type"],
    "piece_assets": NM.Print["piece_assets"],
    "tags": [],
    "variant_parent_id": null
}

/**
 * Type without private props
 */
export type PublicInterface<T> = {
    [P in keyof T]: T[P];
}
