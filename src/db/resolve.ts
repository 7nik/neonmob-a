import type { ID } from "$lib/utils/NM Types";

import { db } from "./db.server";

const stmtResolveUser = db.prepare<string>(
    "SELECT id FROM user WHERE user.username = ?",
).pluck();
export function resolveUser (username: string) {
    return stmtResolveUser.get(username) as ID<"user">|null ?? null;
}

const stmtResolveSett = db.prepare<string>(
    "SELECT id FROM sett WHERE sett.slug = ?",
).pluck();
export function resolveSett (slug: string) {
    return stmtResolveSett.get(slug) as ID<"sett">|null ?? null;
}

const stmtResolveCard = db.prepare<[string, string]>(`
    SELECT card.id
    FROM card JOIN sett ON card.sett_id = sett.id
    WHERE sett.slug = ? AND card.slug = ?
`).pluck();
export function resolveCard (settSlug: string, cardSlug: string) {
    return stmtResolveCard.get(settSlug, cardSlug) as ID<"card">|null ?? null;
}
