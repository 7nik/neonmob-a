import type NM from "$lib/utils/NM Types";
import type { ID } from "$lib/utils/NM Types";
import type NMA from "$lib/utils/NMA Types";

import { get } from "./utils";

/**
 * Resolves slugs for a card
 * @param settSlug - the card's sett slug name
 * @param cardSlug - the card slug name
 * @returns the card's data or null
 */
export function resolveCard (
    settSlug:string,
    cardSlug:string,
    f = fetch,
): Promise<{
    cardId: ID<"card">|null,
    print: NM.Unmerged.Prints|null,
    owner: NM.Unmerged.UserLong|null,
}> {
    return get("nma", "/resolve/card", { settSlug, cardSlug }, f);
}

/**
 * Resolves slugs for a print
 * @param settSlug - the card's sett slug name
 * @param cardSlug - the card slug name
 * @param printId - the print ID
 * @returns the print's data or null
 */
export function resolvePrint (
    settSlug:string,
    cardSlug:string,
    printId:string,
    f = fetch,
): Promise<{
    cardId: ID<"card">|null,
    print: NM.Unmerged.Prints|null,
    owner: NM.Unmerged.UserLong|null,
}> {
    return get("nma", "/resolve/card", { settSlug, cardSlug, printId }, f);
}

/**
 * Resolves username for a creator
 * @param username - the user's username
 * @returns the user ID and creator ID or null
 */
export function resolveCreator (
    username:string,
    f = fetch,
): Promise<[ID<"user">, ID<"creator">]|null> {
    return get("nma", "/resolve/creator", { username }, f);
}

/**
 * Resolves slug name for a sett
 * @param slug - the sett slug name
 * @returns the sett ID or null
 */
export function resolveSett (slug:string, f = fetch): Promise<ID<"sett">|null> {
    return get("nma", "/resolve/sett", { slug }, f);
}

/**
 * Resolves username for a user
 * @param username - the user's username
 * @returns the user ID or null
 */
export function resolveUser (username:string, f = fetch): Promise<ID<"user">|null> {
    return get("nma", "/resolve/user", { username }, f);
}

/**
 * Searches for items that include the provided text
 * @param query - text to search
 * @returns the matched cards, setts and users
 */
export function searchItems (query: string): Promise<NMA.SearchResults> {
    return get("nma", "/search", { search: query });
}
