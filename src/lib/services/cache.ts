import type NM from "$lib/utils/NM Types";
import type { ID } from "$lib/utils/NM Types";

import { getTrade, liveListProvider, type PojoPaginator } from "$api";
import Collection from "$lib/utils/Collection";

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

/**
 * Get the last cached card/sett/user/creator
 * @param type - the item type to get
 * @param id - the item ID
 */
export const getRecent = <T extends keyof RecentData>(
    type: T, id: RecentData[T]["id"],
): RecentData[T]|null => {
    if (recentData[type]?.id === id) {
        return recentData[type] ?? null;
    }
    return null;
};

/**
 * Set a fresh card, sett, user and/or creator
 * @param data - items to set
 */
export const setRecent = (data: Partial<RecentData>) => {
    recentData = data;
    if (data.sett && !resolve.sett.has(data.sett.name_slug)) {
        resolve.sett.set(data.sett.name_slug, data.sett.id);
    }
};

const tradeCache = new Collection<NM.Trade>("cache:trades", 100);
/**
 * Get a trade from the cache or from the server
 * @param id - the trade id
 */
export const getCachedTrade = async (id: ID<"trade">) => {
    let trade = tradeCache.find(id);
    if (trade) return trade;

    trade = await getTrade(id);
    tradeCache.add(trade);
    return trade;
};

/**
 * Initialize syncing trade cache
 */
export const initCache = () => {
    // when a trade gets completed, updated the cached trade object if available
    liveListProvider("trades")
        .on("remove", (tradeEvent) => {
            const trade = tradeCache.find(tradeEvent.object.id);
            if (!trade) return;
            trade.completed = tradeEvent.object.completed;
            trade.completed_on = tradeEvent.object.completed;
            trade.state = tradeEvent.verb_phrase;
            for (const print of trade.bidder_offer.prints) {
                if (print.own_counts) {
                    print.own_counts.bidder -= 1;
                    print.own_counts.responder += 1;
                }
            }
            for (const print of trade.responder_offer.prints) {
                if (print.own_counts) {
                    print.own_counts.bidder += 1;
                    print.own_counts.responder -= 1;
                }
            }
            tradeCache.save();
        });
};
