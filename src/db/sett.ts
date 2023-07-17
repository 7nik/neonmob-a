import type NM from "$lib/utils/NM Types";
import type { ID } from "$lib/utils/NM Types";
import type { RawCategory, RawSett } from "./utils";

import { getSettCategories } from "./category";
import { db } from "./db.server";
import {
    convertCategory,
    convertSett,
    getPageParams,
    paginate,
    SELECT_CATEGORY,
    SELECT_SETT,
} from "./utils";

const stmtGetSett = db.prepare<number>(`${SELECT_SETT}
    FROM sett JOIN user ON sett.creator_id = user.id
    WHERE sett.id = ?
`).expand();
const stmtGetSettCategories = db.prepare<number>(`
    ${SELECT_CATEGORY}
    FROM category JOIN sett_category ON sett_category.sett_id = category.id
    WHERE sett_category.sett_id = ?
`);

export function getSett (id: ID<"sett">, host: string): NM.Sett|null {
    const raw: RawSett = stmtGetSett.get(id);
    if (!raw) return null;
    const rawCategories: RawCategory[] = stmtGetSettCategories.all(raw.sett.id);
    return convertSett(raw, host, rawCategories.map(convertCategory));
}

const FEATURED_SETTS = db.prepare("SELECT value FROM env WHERE name = 'featured_setts'")
    .pluck().get()?.slice(1, -1) as string ?? "";

db.function("getLeft", (version:number, soldOut: number, discontinueDate: string) => (version === 2
    ? 100 - soldOut
    : (new Date(discontinueDate).getTime() - Date.now()) / 86_400_000
));

export function findSetts ({
    category, creator, limited, unlimited, freebies, credits, order, descending, url,
}: {
    category: string,
    creator?: ID<"user">
    limited?: boolean,
    unlimited?: boolean,
    freebies?: boolean,
    credits?: boolean,
    order: string,
    descending: boolean,
    url: URL,
}): NM.Paginated<NM.Sett> {
    const filters: string[] = [];
    if (category === "featured") {
        // const ids = FEATURED_SETTS.map((id) => `sett.id = ${id}`).join(" OR ");
        filters.push(`sett.id IN (${FEATURED_SETTS})`);
    } else if (category === "created") {
        filters.push(`sett.creator_id = ${creator}`);
    } else if (category) {
        filters.push(`category.slug = '${category}'`);
    }
    if (limited) {
        filters.push(`sett.version <> 2`);
    }
    if (unlimited) {
        filters.push(`sett.version = 2`);
    }
    if (freebies) {
        filters.push(`sett.discontinued ISNULL AND sett.freebie_discontinued ISNULL`);
    }
    if (credits) {
        filters.push(`sett.discontinued ISNULL AND sett.packs_sold_out < 100`);
    }

    let orderBy: string;
    switch (order) {
        case "alphabetical":
            orderBy = "sett.slug";
            break;
        case "discontinue_date":
            orderBy = "sett.discontinue_date";
            break;
        case "difficulty":
            orderBy = "sett.difficulty";
            break;
        case "percent_sold":
            orderBy = "getLeft(sett.version, sett.packs_sold_out, sett.discontinue_date)";
            break;
        default:
            orderBy = "sett.released";
    }

    const { pageSize, pageOffset } = getPageParams(url);
    const joinExtra = category && category !== "created" && category !== "featured"
        ? `JOIN sett_category ON sett.id = sett_category.sett_id
            JOIN category ON sett_category.category_id = category.id`
        : "";
    const whereClause = filters.length === 0
        ? ""
        : `WHERE ${filters.join(" AND ")}`;

    // we can use parameters only for values but not keywords and column names
    // though, we can still use bind parameters and
    // cache queries with the same structure
    const rawSetts: (RawSett & { $:{ total:number } })[] = db.prepare(`
        ${SELECT_SETT}, count(*) OVER () AS total
        FROM sett JOIN user ON sett.creator_id = user.id ${joinExtra}
        ${whereClause}
        ORDER BY ${orderBy} ${descending ? "ASC" : "DESC"}
        LIMIT ${pageSize} OFFSET ${pageOffset}
    `).expand().all();

    if (rawSetts.length === 0) {
        return paginate([], url, 0);
    }

    const categories = getSettCategories(rawSetts.map(({ sett }) => sett.id));

    const setts = rawSetts.map((raw) => convertSett(raw, url.host, categories[raw.sett.id]));

    return paginate(setts, url, rawSetts[0]?.$.total);
}
