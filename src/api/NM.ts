import type { absoluteURL, ID } from "$lib/utils/NM Types";
import type NM from "$lib/utils/NM Types";

import { ArrayPaginator, PagePaginator } from "./paginator";
import {
    get, post, del, merge, type GetParams, makeUrl,
} from "./utils";
// xx

/**
 * Accepts a trade
 * @param id - the trade ID
 * @returns the accepted trade
 */
export function acceptTrade (id: ID<"trade">) {
    return post<NM.Trade>("api", `/trades/${id}/accept/`);
}

/**
 * Add the user to the friend list
 * @param id - user to add
 */
export function addFriend (id: ID<"user">) {
    return post<NM.UserFriend>("api", "/friend/", { id });
}

/**
 * Add the user to the blocked list
 * @param id - user to add
 */
export function blockUser (id: ID<"user">) {
    return post<NM.UserFriend>("api", "/block_user/", { id });
}

/**
 * Proposes a trade
 * @param you - your ID
 * @param yourOffer - prints ID you offer
 * @param partner - partner's ID
 * @param partnerOffer - prints ID you ask
 * @param parentTrade - parent trade ID, in case of modifying or countering
 * @returns a created trade (not really) or error message
 */
export function createTrade (
    you: number,
    yourOffer: number[],
    partner: number,
    partnerOffer: number[],
    parentTrade?: number | null,
) {
    return post<NM.TradeResult>("api", "/trades/propose/", {
        bidder: you,
        bidder_offer: { prints: yourOffer },
        responder: partner,
        responder_offer: { prints: partnerOffer },
        parent_id: parentTrade ?? null,
    });
}

/**
 * Decline a trade
 * @param id - the trade ID
 * @returns the declined trade
 */
export function declineTrade (id: ID<"trade">) {
    return post<NM.Trade>("api", `/trades/${id}/decline/`);
}

/**
 * Get info about a certain card
 * @param ownerId - the card owner ID
 * @param cardId - the card ID
 * @returns
 */
export async function findPrint (ownerId: ID<"user">, cardId: ID<"card">) {
    const data = await get<NM.Paginated<NM.PrintInTrade>>("api", "/search/prints/", {
        user_id: ownerId,
        piece_id: cardId,
    });
    return data.results[0];
}

/**
 * Search for prints
 * @param ownerId - the print owner
 * @param options - the filters
 * @returns paginated results
 */
export function findPrints (ownerId: ID<"user">, options: {
    cardId: ID<"card"> | null, // to get exact card
    cardName: string | null, // partial name of a card
    sharedWith: ID<"user"> | null,
    notOwnedBy: ID<"user"> | null,
    wishlistedBy: ID<"user"> | null,
    settId: ID<"sett"> | null,
    duplicatesOnly: boolean,
    common: boolean,
    uncommon: boolean,
    rare: boolean,
    veryRare: boolean,
    extraRare: boolean,
    chase: boolean,
    variant: boolean,
    legendary: boolean,
}) {
    const query: GetParams = {};
    query.user_id = ownerId;
    for (const key of (Object.keys(options) as (keyof typeof options)[])) {
        const val = options[key];
        if (val === null) continue;
        switch (key) {
            case "cardId": query.piece_id = val; break;
            case "cardName": query.search = val; break;
            case "sharedWith": query.incomplete_by = val; break;
            case "notOwnedBy": query.not_owned_by = val; break;
            case "wishlistedBy": query.wish_list_by = val; break;
            case "duplicatesOnly": query.duplicates_only = val; break;
            case "settId": query.sett = val; break;
            default: query[key] = options[key]; break;
        }
    }

    return new PagePaginator<NM.PrintInTrade>(makeUrl("api", "/search/prints/", query));
}

/**
 * Search for series
 * @param category - the category slug name to search in, or `""`
 * @param orderType - the sorting method
 * @param descending - sort to descending or ascending order
 * @param options - the filters
 * @returns paginated results
 */
export function findSetts (
    category: string,
    orderType: string,
    descending: boolean,
    options: Partial<{
        favorite: boolean,
        /**
         * 0 - all
         * 1 - limited
         * 2 - unlimited
         */
        settType: 0|1|2,
        /**
         * 0 - all
         * 1 - owned
         * 2 - unowned
         */
        owned: 0|1|2,
        freebieSett: boolean,
        creditSett: boolean,
        pageSize: number,
    }>,
    f = fetch,
) {
    const nmOptions = {
        category,
        [orderType]: descending ? "desc" : "asc",
        favorite: options.favorite,
        limited: options.settType === 1,
        unlimited: options.settType === 2,
        owned: options.owned === 1,
        unowned: options.owned === 2,
        freebies: options.freebieSett,
        credits: options.creditSett,
        page_size: options.pageSize,
    };
    const query: GetParams = { page_size: 9 };
    for (const [key, value] of Object.entries(nmOptions)) {
        // skip falsy values
        if (key && value) query[key] = value;
    }
    // FIXME non-legacy endpoint doesn't return collection stats
    // return new PagePaginator<NM.Sett>(makeUrl("api", "/setts/legacy_list/", query), f);
    return new PagePaginator<NM.Sett>(makeUrl("api", "/setts/", query), f);
}

/**
 * Get creator's activity feed
 * @param id - the user ID
 * @param amount - number of items per page
 * @param page - page number starting from 1
 */
export function getActivityFeed<T extends "creator" | "sett" | "user"> (
    category: T,
    id: ID<T>,
    amount = 50,
    page = 1,
    f = fetch,
) {
    return new ArrayPaginator<NM.ActivityAny>(makeUrl(
        "napi",
        `/activityfeed/${category.toLowerCase()}/${id}/`,
        { amount, page },
    ), f);
}

/**
 * Get creator's activity feed
 * @param id - the user ID
 * @param amount - number of items per page
 * @param page - page number starting from 1
 */
export function getActivityItem<T extends "pack-opened" | "trade"> (
    category: T,
    id: ID<T>,
    f = fetch,
) {
    return get<T extends "trade" ? NM.ActivityStoryTrade : NM.ActivityStoryPack>(
        "napi",
        `/activityfeed/story/${category.toLowerCase()}/${id}/`,
        {},
        f,
    );
}

/**
 * Get users blocked by the current user
 * @returns array of blocked users
 */
export function getBlockedUsers () {
    return get<NM.UserFriend[]>("api", "/block_user/");
}

/**
 * Get info about conversation with a user
 * @param id - the user to conversation
 */
export function getConversationInfo (id: ID<"user">) {
    return post<NM.ConversationInfo>("api", "/conversations/", { recipient: id });
}

/**
 * Get the creator
 * @param id - the creator's id
 * @returns paginated array of matched results
 */
export function getCreator (id: ID<"creator">, f = fetch) {
    return get<NM.Creator>("api", `/creator/profile/${id}/`, {}, f);
}

/**
 * Get series created by the user
 * @param id - the series creator
 * @param pageSize - number of series per page, default - 9
 */
export function getCreatorSetts (id: ID<"user">, pageSize = 9, f = fetch) {
    return new PagePaginator<NM.Sett>(makeUrl("api", `/setts/`, {
        category: "created",
        page_size: pageSize,
        user_id: id,
    }), f);
}

/**
 * Get series submissions by the user
 * @param id - the series creator
 */
export function getCreatorSubmissions (id: ID<"user">, f = fetch) {
    return new PagePaginator<NM.Submission>(makeUrl("api", `/submissions/`, {
        creator: id,
        page_size: 6,
    }), f);
}

/**
 * Get the data of the authenticated user
 */
export function getCurrentUserData (f = fetch) {
    return get<NM.UserAccount>("api", "/user/current/", {}, f);
}

/**
 * Get the creator
 * @param id - the creator's id
 * @returns paginated array of matched results
 */
export function getDisplayCards (id: ID<"user">) {
    return get<NM.DisplayCard[]>("napi", `/user/${id}/display-case/`);
}

/**
 * Get series favorited by a user
 * @param id - the user ID
 * @returns array of favorited series
 */
export async function getFavoriteCards (id: ID<"user">) {
    const data = await get<NM.Unmerged.Container<NM.Unmerged.FavoriteCards>>(
        "api",
        `/users/${id}/favorites/`,
    );
    return merge(data).results;
}

/**
 * Get series favorited by a user
 * @param id - the user ID
 * @returns array of favorited series
 */
export async function getFavoriteSetts (id: ID<"user">) {
    const data = await get<NM.Unmerged.Container<NM.Unmerged.FavoriteSetts>>(
        "api",
        `/users/${id}/favorites/setts/`,
    );
    return merge(data).results;
}

/**
 * Get the current number of freebies and time of next freebie
 * @returns freebies count and time to next freebie
 */
export async function getFreebieBalance (f = fetch) {
    const data = await get<NM.Unmerged.Container<{
        freebies: number,
        seconds: number | null,
    }>>("api", "/num-freebies-left", {}, f);
    return merge(data);
}

/**
 * Get the current user's friends
 * @returns paginated array of friends
 */
export function getFriends () {
    return new PagePaginator<NM.UserFriend>(makeUrl("api", "/friend/"));
}

/**
 * Get the prints the user owns
 * @param userId - the card owner
 * @param cardId - the card ID
 * @returns short info about the card and the collected prints
 */
export async function getOwnedPrints (
    userId: ID<"user">,
    cardId: ID<"card">,
    f = fetch,
) {
    const data = await get<NM.Unmerged.Container<NM.Unmerged.Prints>>(
        "api",
        `/users/${userId}/piece/${cardId}/detail/`,
        {},
        f,
    );
    return merge(data);
}

/**
 * Get short info about number of collected cards in each series
 * @param id - the user ID
 * @returns - info about collected cards in each user's collection
 */
export function getOwnedSettsMetrics (id: ID<"user">, f = fetch) {
    return get<NM.SettMetrics[]>("napi", `/user/${id}/owned-setts-metrics`, {}, f);
}

/**
 * Get the series' pack tiers
 * @param id - series ID
 */
export function getPackTiers (id: ID<"sett">) {
    return get<NM.PackTier[]>("api", `/pack-tiers/?sett_id=${id}`);
}

/**
 * Get the number of copies of each card the user owns
 * @param id - the owner ID
 * @returns array of cardID - number of copies
 */
export function getPrintCounts (id: ID<"user">, f = fetch) {
    return get<NM.PrintCount[]>("napi", `/user/${id}/print-counts`, {}, f);
}

/**
 * Get the series info
 * @param id - series ID
 */
export async function getSett (id: ID<"sett">, ownerId: ID<"user">|null = null, f = fetch) {
    const sett = await get<NM.Sett>(
        "api",
        `/setts/${id}/`,
        ownerId ? { user_id: ownerId } : {},
        f,
    );
    if (ownerId) sett.ownerId = ownerId;
    return sett;
}

/**
 * Get all cards of the series
 * @param userId - the cards owner
 * @param settId - the series
 * @returns short card data
 */
export function getSettCards (userId: ID<"user">, settId: ID<"sett">, f = fetch) {
    return get<NM.Card[]>("napi", `/user/${userId}/sett/${settId}`, {}, f);
}

/**
 * Get names of all cards of the series
 * @param id - the series
 * @returns short card data
 */
export function getSettCardNames (id: ID<"sett">, f = fetch) {
    return get<NM.CardName[]>("api", `/sets/${id}/piece-names/`, {}, f);
}

/**
 * Get categories of series
 * @param pageSize - number of series per page, default - 9
 * @returns short card data
 */
export function getSettCategories (pageSize = 9, f = fetch) {
    return new PagePaginator<NM.Category>(makeUrl("api", `/categories/`, {
        page_size: pageSize,
    }), f);
}

/**
 * Get recommended series based on the series
 * @param userId - the user ID
 * @param settId - the series ID
 * @returns recommended series
 */
export async function getSettSuggestions (userId: ID<"user">, settId: ID<"sett">) {
    const data = await get<NM.Paginated<NM.Sett>>("api", `/users/${userId}/suggested-setts/`, {
        sett_id: settId,
    });
    return data.results;
}

/**
 * Get the submission
 * @param id - the submission ID
 */
export function getSubmission (id: ID<"submission">, f = fetch) {
    return get<NM.Submission>("api", `/submissions/${id}/`, {}, f);
}

// type SubmissionCategory = "newest" | "popular" | "liked" | "in-progress" | "published";
/**
 * Get the submission
 * @param category - the submission category/order/tab
 */
export function getSubmissions (category: string, f = fetch) {
    return new PagePaginator<NM.Submission>(makeUrl(
        "api",
        `/submissions/`,
        { order: category },
    ), f);
}

/**
 * Get the trade info
 * @param id - trade ID
 * @param [allowCache=true] - allow to use cache
 */
export async function getTrade (id: ID<"trade">) {
    // FIXME use cache for recent trades
    // if (allowCache) {
    //     const trade = cache.trades.find(id);
    //     if (trade) return structuredClone(trade);
    // }
    const trade = await get<NM.Trade>("api", `/trades/${id}/`);
    // make the prints go in descending order of rarity
    trade.bidder_offer.prints
        .reverse()
        .sort((a, b) => b.rarity.rarity - a.rarity.rarity);
    trade.responder_offer.prints
        .reverse()
        .sort((a, b) => b.rarity.rarity - a.rarity.rarity);

    // cache.trades.add(trade);
    return trade;
}

/**
 * Get the user's cards
 * @param id - the user's ID
 * @param sorting - the sorting method
 * @param desc - sort in descending order
 * @param filters - the filters
 * @returns cards owned of the user
 */
export function getUserCards (
    id: ID<"user">,
    filters: Record<string, boolean>,
    f = fetch,
) {
    const params = {
        ...filters,
        user: id,
    } as GetParams;
    return new PagePaginator<NM.OwnedCard>(makeUrl(
        "api",
        `/pieces/`,
        params,
    ), f);
}

/**
 * Get the user's collections
 * @param id - the user's ID
 * @param sorting - the sorting method
 * @param desc - sort in descending order
 * @param filters - the filters
 * @returns sett the user collects
 */
export function getUserCollections (
    id: ID<"user">,
    sorting: string,
    desc: boolean,
    filters: Record<string, boolean>,
    f = fetch,
) {
    const params = { [sorting]: desc ? "desc" : "asc" } as GetParams;
    if (filters.favorite) {
        params.favorite = "Favorites";
    }
    return new PagePaginator<NM.Sett>(makeUrl(
        "api",
        `/user/collections/${id}/`,
        params,
    ), f);
}

/**
 * Get the user's data
 * @param id - the user's ID
 * @returns data of the user
 */
export function getUserData (id: ID<"user">, f = fetch) {
    return get<NM.UserInfo>("api", `/users/${id}/`, {}, f);
}

/**
 * Get the user's core or special milestones
 * @param id - the user's ID
 * @param special - request core or special milestones
 * @returns list milestones
 */
export async function getUserMilestones (id: ID<"user">, special = false, f = fetch) {
    const data = await get<NM.Unmerged.Container<NM.BadgeEarned[]>>(
        "api",
        `/site-badges/user/${id}/`,
        special ? { special: "true" } : {},
        f,
    );
    return data.payload;
}

/**
 * Get the user's general statistics
 * @param id - the user's ID
 * @returns stats of the user
 */
export function getUserStatsBase (id: ID<"user">, f = fetch) {
    return get<NM.UserStats>("api", `/user/stats/${id}/all/`, {}, f);
}

/**
 * Get the user's statistics over series by difficulty
 * @param id - the user's ID
 * @returns list of statistics
 */
export function getUserStatsDifficulty (id: ID<"user">, f = fetch) {
    return get<NM.UserDifficultyStat[]>("api", `/difficulty/stats/${id}/`, {}, f);
}

/**
 * Get the user's series milestones
 * @param id - the user's ID
 * @param orderType - series order method
 * @param orderDir - ordering params
 * @returns list milestones
 */
export function getUserSeriesMilestones (
    id: ID<"user">,
    orderType: string,
    orderDir: string,
    f = fetch,
) {
    return new PagePaginator<NM.SettMilestones>(makeUrl(
        "api",
        `/user/series/milestones/${id}/`,
        orderType ? { [orderType]: orderDir } : {},
    ), f);
}

/**
 * Get the user's rarity milestones
 * @param id - the user's ID
 * @returns list milestones
 */
export async function getUserRarityMilestones (id: ID<"user">, f = fetch) {
    const data = await get<NM.Unmerged.Container<NM.UserRarityStats>>(
        "api",
        `/sett-badges/user/${id}/`,
        {},
        f,
    );
    return data.payload;
}

/**
 * Get series favorited by a user
 * @param id - the user ID
 * @returns array of favorited series
 */
export async function getWishlistedCards (id: ID<"user">) {
    const data = await get<NM.Unmerged.Container<NM.Unmerged.FavoriteCards>>(
        "api",
        `/users/${id}/favorites/?wish_list=True`,
    );
    return merge(data).results;
}

/**
 * Check whether the user is in the current user's friend list
 * @param id - the user ID to check
 * @returns is the user in the friend list
 */
export async function isFriend (id: ID<"user">) {
    const data = await get<{is_friend:boolean}>("api", `/friend/${id}/`);
    return data.is_friend;
}

/**
 * Check whether the user is blocked by the current user
 * or the user has blocked the current user
 * @param id - the user ID to check
 * @returns whether blocked and who has blocked
 */
export function isUserBlocked (id: ID<"user">) {
    return get<{
        is_blocked: boolean,
        user_initiated: boolean,
    }>("api", `/block_user/${id}/`);
}

/**
 * Marks the notifications as read
 * @param ids - notifications' IDs
 * @param type - notifications type
 */
export function markNotificationsRead (ids: string[], type: string) {
    return post<NM.Unmerged.Container<object>>("api", "/notifications/", {
        ids, notification_type: type,
    });
}

/**
 * Remove the user from the friend list
 * @param id - user to remove
 */
export function removeFriend (id: ID<"user">) {
    return del<void>("api", `/friend/${id}/`);
}

/**
 * Authenticate the user
 * @param username - the user's login or email
 * @param password - the user's password
 * @returns the authentication result
 */
export function signIn (username: string, password: string, f = fetch): Promise<{
    redirect:absoluteURL
}|{
    code?: string,
    detail: string,
    field_errors?: Record<string, string>,
}> {
    return post("api", "/signin/", { username, password }, f);
}

/**
 * Search for people over all the site
 * @param query - the search query
 * @returns paginated array of matched results
 */
export async function searchUsers (query: string) {
    const data = await post<NM.Paginated<NM.UserFriend>>(
        "api",
        "/friend/search/",
        { search: query },
    );
    return data.results;
}

/**
 * Toggle the card favoritism
 * @param id - the card id
 * @returns the new state of the card favoritism
 */
export async function toggleFavoriteCard (id: ID<"card">) {
    const data = await post<NM.Unmerged.Container<{ favorited: boolean }>>(
        "api",
        `/pieces/${id}/favorite/`,
    );
    return data.payload.favorited;
}

/**
 * Remove the user from the blocked list
 * @param id - user to remove
 */
export function unblockUser (id: ID<"user">) {
    return del<void>("api", `/block_user/${id}/`);
}

/**
 * Update the cookie with CSRF token.
 * At calling on the server, returns the token
 */
export function updateCsrfToken (f = fetch) {
    return get<string>("nma", `/csrftoken`, {}, f);
}

// displayCase: `/user/${id}/display-case`
// secondsUntilFreebieReady: `/seconds-until-freebie-ready`
// numFreebieLeft: POST '/num-freebie-left`
// collection: /api/users/[USER_ID]/collections/[SET_ID]
