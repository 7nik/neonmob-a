import type NM from "$lib/utils/NM Types";
import type { ID } from "$lib/utils/NM Types";
import type { Unsubscriber, Readable, Writable } from "svelte/store";

import { derived, readable, writable } from "svelte/store";
import { getPrintCounts } from "$api";
import OwnedCollections from "./OwnedCollections";

type CardCounts = Record<ID<"card">, number>;

/**
 * Fetches the number of copies the user owns
 * @param userId - the cards owner ID
 * @returns cards owned by the user
 */
async function fetchCards (userId: ID<"user">, f: typeof fetch) {
    try {
        const printCounts = await getPrintCounts(userId, f);
        return Object.fromEntries(printCounts) as CardCounts;
    } catch {
        await new Promise((res) => { setTimeout(res, 1000); });
        return fetchCards(userId, f);
    }
}

class OwnedCards extends OwnedCollections {
    #cardCounts: CardCounts = {};
    #cardCountsStore: Writable<CardCounts>;
    #loading = true;
    #loadingStore;

    constructor (userId: ID<"user">, f = fetch) {
        super(userId, f);
        this.#cardCountsStore = writable({});
        fetchCards(userId, f).then((cards) => {
            this.#cardCounts = cards;
            this.#cardCountsStore.set(cards);
        });
        this.#loadingStore = derived(
            this.#cardCountsStore,
            (cards, set) => {
                if (Object.keys(cards).length > 0) {
                    if (super.isLoading) {
                        super.waitLoading().then(() => {
                            set(false);
                            this.#loading = false;
                            this.#loadingStore = readable(false);
                        });
                    } else {
                        set(false);
                        this.#loading = false;
                        this.#loadingStore = readable(false);
                    }
                }
                set(true);
            },
        );
    }

    /**
     * Trigger reactivity on #cardCountsStore
     */
    #updateCards () {
        this.#cardCountsStore.update((x) => x);
    }

    /**
     * Whether the data is still loading
     */
    get isLoading () {
        return this.#loading || super.isLoading;
    }

    /**
     * Method to wait for finishing the loading
     * @returns Promise of completing the data loading
     */
    waitLoading () {
        return this.isLoading
            ? new Promise<void>((res) => {
                let unsubscribe: Unsubscriber | null = null;
                unsubscribe = this.#loadingStore.subscribe((loading) => {
                    if (loading) return;
                    unsubscribe?.();
                    res();
                });
            })
            : Promise.resolve();
    }

    /**
     * Add one copy to the list of owned prints
     * @param cards - the card ID
     */
    addPrints (cards: NM.CardMinimal[]) {
        const addedCards: NM.CardMinimal[] = [];
        for (const card of cards) {
            if (card.id in this.#cardCounts) {
                this.#cardCounts[card.id] += 1;
            } else {
                this.#cardCounts[card.id] = 1;
                addedCards.push(card);
            }
        }
        this.#updateCards();
        this.updateCollection(addedCards, 1);
    }

    /**
     * Get the number of copies of a card the user owns
     * @param cardId - the card ID
     * @param asStore - return result as a store, default - no
     */
    getPrintCount (cardId: number): number;
    getPrintCount (cardId: number, asStore: true): Readable<number>;
    getPrintCount (cardId: number, asStore = false) {
        return asStore
            ? derived(this.#cardCountsStore, (cards) => cards[cardId] ?? 0)
            : this.#cardCounts[cardId] ?? 0;
    }

    /**
     * Whether the user owns any copy of the card
     * @param cardId - the card ID
     * @param asStore - return result as a store, default - no
     */
    hasPrint (cardId: number): boolean;
    hasPrint (cardId: number, asStore: true): Readable<boolean>;
    hasPrint (cardId: number, asStore = false) {
        return asStore
            ? derived(this.#cardCountsStore, (cards) => cards[cardId] > 0)
            : this.#cardCounts[cardId] > 0;
    }

    /**
     * Remove one or multiple copies from the list of owned prints
     * @param cards - the card ID or [card ID, number of copies to remove]
     */
    removePrints (cards: NM.CardMinimal[] | [NM.CardMinimal, number][]) {
        const removedCards: NM.CardMinimal[] = [];
        for (const row of cards) {
            const [card, count] = Array.isArray(row) ? row : [row, 1];
            if (this.#cardCounts[card.id] > 0) {
                this.#cardCounts[card.id] = Math.max(0, this.#cardCounts[card.id] - count);
                if (this.#cardCounts[card.id] === 0) {
                    removedCards.push(card);
                }
            }
        }
        this.#updateCards();
        this.updateCollection(removedCards, -1);
    }
}

export default OwnedCards;
