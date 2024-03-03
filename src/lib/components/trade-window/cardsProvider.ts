import type NM from "$lib/utils/NM Types";
import type { ID, rarityCss } from "$lib/utils/NM Types";

import { get } from "svelte/store";
import {
    findPrints,
    getFavoriteCards,
    liveListProvider,
    StaticPaginator,
    ProxyPaginator,
} from "$api";
import { getCachedTrade } from "$lib/services/cache";
import OwnedCards from "$lib/services/OwnedCards";

type SearchParams = Parameters<typeof findPrints>[1] & {
    favoritedBy: number | null,
    tradingCards: boolean,
};

/**
 * Filter and paginate over the list of card ids
 * @param ownerId - the card owner
 * @param filters - the card filters
 * @param cardIds - the cards to iterate
 * @returns paginator
 */
function filterCards (ownerId: ID<"user">, filters: SearchParams, cardIds: Promise<ID<"card">[]>) {
    return new ProxyPaginator(new StaticPaginator(cardIds, 10), async (cardId) => {
        const found = await findPrints(ownerId, { ...filters, cardId }).waitLoading();
        const [card] = found.items;
        // the server always returns the asked card but
        // if user doesn't own the card, it doesn't have `print_num` and `print_id`
        if (card && card.print_num) return card;
        return null;
    });
}

export default (ownerId: ID<"user">, filters: SearchParams) => {
    if (filters.favoritedBy) {
        // const tradingCardIds = getAllTradingCardIds();
        // TODO switch to liked cards on profile page
        return filterCards(ownerId, filters, getFavoriteCards(filters.favoritedBy)
            .then(async (cards) => {
                cards = cards.filter((card) => filters.notOwnedBy !== ownerId
                    && filters.wishlistedBy !== filters.favoritedBy
                    && satisfiesRarity(filters, card.rarity.class)
                    && (!filters.settId || filters.settId === card.sett.id)
                    && (!filters.cardName || card.name.toLowerCase().includes(filters.cardName)));
                // && (!filters.tradingCards || tradingCardIds.includes(card.id)))
                let ids = cards.map((card) => card.id);
                if (filters.tradingCards) {
                    const tradingCards = await getTradingCards();
                    const tids = new Set(tradingCards.map((card) => card.id));
                    ids = ids.filter((id) => tids.has(id));
                }
                ids = await filterByOwnedCount(ownerId, filters, ids);
                return ids;
            }));
    }
    if (filters.tradingCards) {
        return filterCards(ownerId, filters, getTradingCards()
            .then(async (cards) => {
                cards = cards.filter((card) => satisfiesRarity(filters, card.rarity.class)
                    && (!filters.settId || filters.settId === card.sett_id)
                    && (!filters.cardName || card.name.toLowerCase().includes(filters.cardName)));
                cards = await filterByShared(ownerId, filters, cards);
                let ids = cards.map((card) => card.id);
                ids = await filterByOwnedCount(ownerId, filters, ids);
                ids = await filterByWishlist(ownerId, filters, ids);
                return ids;
            }));
    }
    return findPrints(ownerId, filters);
};

async function getTradingCards () {
    const tradeIds = get(liveListProvider("trades").store).map(({ object }) => object.id);
    const trades = await Promise.all(tradeIds.map((id) => getCachedTrade(id)));
    const prints: NM.PrintInTrade[] = [];
    for (const trade of trades) {
        const allPrints = trade.bidder_offer.prints.concat(trade.responder_offer.prints);
        for (const print of allPrints) {
            if (prints.every((p) => p.id !== print.id)) {
                prints.push(print);
            }
        }
    }

    return prints;
}

function satisfiesRarity (filters: SearchParams, rarity: rarityCss) {
    // if no search by rarity
    if (!filters.common
        && !filters.uncommon
        && !filters.rare
        && !filters.veryRare
        && !filters.extraRare
        && !filters.chase
        && !filters.variant
        && !filters.legendary
    ) {
        return true;
    }
    return filters[rarity];
}

async function filterByOwnedCount (
    ownerId: ID<"user">,
    filters: SearchParams,
    cardIds: ID<"card">[],
) {
    if (cardIds.length === 0) return cardIds;
    const owned = new OwnedCards(ownerId);
    await owned.waitLoading();
    cardIds = cardIds.filter((id) => owned.getPrintCount(id) > (filters.duplicatesOnly ? 1 : 0));
    if (filters.notOwnedBy) {
        const owned2 = new OwnedCards(filters.notOwnedBy);
        await owned2.waitLoading();
        cardIds = cardIds.filter((id) => owned2.getPrintCount(id) === 0);
    }
    return cardIds;
}

async function filterByWishlist (
    ownerId: ID<"user">,
    filters: SearchParams,
    cardIds: ID<"card">[],
) {
    if (!filters.wishlistedBy || cardIds.length === 0) return cardIds;
    // this endpoint seems to be more reliable than NMApi.card.wishlistedCards
    const wishlist = findPrints(ownerId, filters);
    await wishlist.waitLoading();
    return cardIds.filter((id) => wishlist.items.find((p) => id === p.id));
}

async function filterByShared (
    ownerId: ID<"user">,
    filters: SearchParams,
    cards: NM.PrintInTrade[],
) {
    if (filters.settId || !filters.sharedWith || cards.length === 0) return cards;
    const coll1 = new OwnedCards(ownerId);
    const coll2 = new OwnedCards(filters.sharedWith);
    await Promise.all([coll1.waitLoading(), coll2.waitLoading()]);
    const setts = new Set(coll1.listCollections().map(({ id }) => id));
    const shared = new Set<ID<"sett">>();
    for (const { id } of coll2.listCollections()) {
        if (setts.has(id)) shared.add(id);
    }
    return cards.filter(({ sett_id: sid }) => shared.has(sid));
}
