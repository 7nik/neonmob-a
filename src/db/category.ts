import type NM from "$lib/utils/NM Types";
import type { ID } from "$lib/utils/NM Types";
import { db } from "./db.server";
import { SELECT_CATEGORY, type RawCategory } from "./utils";
import { convertCategory, getPageParams, paginate } from "./utils";

const stmtGetCategory = db.prepare<string>(`
    ${SELECT_CATEGORY}
    FROM category
    WHERE category.slug = ?
`);

export function getCategory (slug: string) {
    const raw: RawCategory = stmtGetCategory.get(slug);
    if (!raw) return null;
    return convertCategory(raw);
}

const stmtGetSettsCategories = db.prepare<string>(`
    ${SELECT_CATEGORY}, json_group_array(sett_id) AS sett_ids
    FROM category JOIN sett_category ON sett_category.category_id = category.id
    WHERE sett_category.sett_id IN (SELECT value FROM json_each(?))
`);
type RawSettCategories = RawCategory & { sett_ids: string };

export function getSettCategories (ids: ID<"sett">[]) {
    const raws: RawSettCategories[] = stmtGetSettsCategories.all(JSON.stringify(ids));
    const map: Record<ID<"sett">, NM.Category[]> = {};
    for (const id of ids) map[id] = [];
    for (const raw of raws) {
        const category = convertCategory(raw);
        JSON.parse(raw.sett_ids).map((id:number) => map[id].push(category));
    }
    return map;
}


const stmtGetCategories = db.prepare<[number, number]>(`
    ${SELECT_CATEGORY}, count(*) OVER () AS total
    FROM category
    LIMIT ? OFFSET ?
`);

export function getAllCategories (url: URL) {
    const { pageSize, pageOffset } = getPageParams(url);
    const raw: (RawCategory & {total:number})[] = stmtGetCategories.all(pageSize, pageOffset);
    return paginate(raw.map(convertCategory), url, raw[0]?.total);
}
