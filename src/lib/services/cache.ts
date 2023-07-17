import type { PojoPaginator } from "$api";
import type NM from "$lib/utils/NM Types";
import type { ID } from "$lib/utils/NM Types";

/**
 * Maps to get an object ID by the slug name
 */
export const resolve = {
    card: new Map<string, ID<"card">>(),
    creator: new Map<string, ID<"creator">>(),
    sett: new Map<string, ID<"sett">>(),
    user: new Map<string, ID<"user">>(),
};

type RecentData = {
    categories: NM.Category[] & { id?: undefined },
    categorySetts: PojoPaginator<NM.Sett> & { id: ID<"category"> }
    sett: NM.Sett,
    submission: NM.Submission,
};
let recentData: Partial<RecentData> = {};

export const getRecent = <T extends keyof RecentData>(
    type: T, id: RecentData[T]["id"],
): RecentData[T]|null => {
    if (recentData[type]?.id === id) {
        return recentData[type] ?? null;
    }
    return null;
};

export const setRecent = (data: Partial<RecentData>) => {
    recentData = data;
    if (data.sett && !resolve.sett.has(data.sett.name_slug)) {
        resolve.sett.set(data.sett.name_slug, data.sett.id);
    }
};
