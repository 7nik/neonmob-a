import type NM from "$lib/utils/NM Types";
import type { fullURL, ID } from "$lib/utils/NM Types";
import type { Unsubscriber, Readable, Writable } from "svelte/store";

import { derived, writable } from "svelte/store";
import { browser } from "$app/environment";
import { getOwnedSettsMetrics } from "$api";

type MetricsMap = Record<ID<"sett">, NM.SettMetrics>;

/**
 * Fetches the number of copies the user owns
 * @param userId - the cards owner ID
 * @returns a store with cards owned by the user
 */
async function fetchCollections (userId: ID<"user">, f: typeof fetch): Promise<MetricsMap> {
    try {
        const setts = await getOwnedSettsMetrics(userId, f);
        const map: MetricsMap = {};
        for (const sett of setts) {
            map[sett.id] = sett;
        }
        return map;
    } catch {
        if (browser) {
            await new Promise((res) => { setTimeout(res, 1000); });
            return fetchCollections(userId, f);
        }
        // do not abuse on server
        return {};
    }
}

export type Progress = {
    name: string,
    permalink: fullURL,
    core: {
        count: number,
        owned: number,
    },
    chase: {
        count: number,
        owned: number,
    },
    variant: {
        count: number,
        owned: number,
    },
    legendary: {
        count: number,
        owned: number,
    },
    total: {
        count: number,
        owned: number,
    },
}

export const EMPTY_PROGRESS: Progress = {
    name: "EMPTY_PROGRESS",
    permalink: "//",
    core: {
        count: 0,
        owned: 0,
    },
    chase: {
        count: 0,
        owned: 0,
    },
    variant: {
        count: 0,
        owned: 0,
    },
    legendary: {
        count: 0,
        owned: 0,
    },
    total: {
        count: 0,
        owned: 0,
    },
};


/**
 * Converts metrics to series progress
 */
function getProgress (metrics: NM.SettMetrics): Progress {
    const {
        name,
        links: { permalink },
        core_piece_count: coreCount,
        chase_piece_count: chaseCount,
        variant_piece_count: variantCount,
        legendary_piece_count: legendaryCount,
        owned_metrics: {
            owned_core_piece_count: coreOwned,
            owned_chase_piece_count: chaseOwned,
            owned_variant_piece_count: variantOwned,
            owned_legendary_piece_count: legendaryOwned,
        },
    } = metrics;
    return {
        name,
        permalink,
        core: {
            count: coreCount,
            owned: coreOwned,
        },
        chase: {
            count: chaseCount,
            owned: chaseOwned,
        },
        variant: {
            count: variantCount,
            owned: variantOwned,
        },
        legendary: {
            count: legendaryCount,
            owned: legendaryOwned,
        },
        total: {
            count: coreCount + chaseCount + variantCount + legendaryCount,
            owned: coreOwned + chaseOwned + variantOwned + legendaryOwned,
        },
    };
}

class UserCollections {
    #userId;
    #collections: MetricsMap = {};
    #collectionsStore: Writable<MetricsMap>;
    #loading = true;
    #loadingStore = writable(true);

    constructor (userId: ID<"user">, f = fetch) {
        this.#userId = userId;
        this.#collectionsStore = writable({});
        fetchCollections(userId, f).then((setts) => {
            this.#loading = false;
            this.#loadingStore.set(false);
            this.#collections = setts;
            this.#collectionsStore.set(setts);
        });
    }

    /**
     * Updates the collection
     * @param cards - list of added/removed rarities in series
     * @param change - the change type
     */
    updateCollection (cards: NM.CardMinimal[], change: 1|-1) {
        if (cards.length === 0) return;
        let needFullUpdate = false;
        for (const card of cards) {
            if (card.sett_id in this.#collections) {
                const metrics = this.#collections[card.sett_id];
                const category = ["Chase", "Variant", "Legendary"].includes(card.rarity.name)
                    ? card.rarity.name.toLowerCase() as "chase"|"variant"|"legendary"
                    : "core";

                metrics.owned_metrics[`owned_${category}_piece_count`] += change;
                const count = metrics.owned_metrics[`owned_${category}_piece_count`];
                if (count < 0 || count > metrics[`${category}_piece_count`]) {
                    text.warn("wrong number", metrics, card, change);
                } else {
                    needFullUpdate = true;
                }
            } else {
                needFullUpdate = true;
            }
        }
        // the user has started a new collection
        if (!needFullUpdate || this.#loading) {
            this.#collectionsStore.update((x) => x);
            return;
        }
        this.#loading = true;
        this.#loadingStore.set(true);
        fetchCollections(this.#userId, fetch).then((setts) => {
            this.#loading = false;
            this.#loadingStore.set(false);
            this.#collections = setts;
            this.#collectionsStore.set(setts);
        });
    }

    /**
     * Whether the data is still loading
     */
    get isLoading () {
        return this.#loading;
    }

    /**
     * Method to wait for finishing the loading
     * @returns Promise of completing the data loading
     */
    waitLoading () {
        return this.#loading
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
     * Get the user's collection as a list
     */
    listCollections () {
        return Object.values(this.#collections);
    }

    /**
     * Get info about collection progress
     * @param settId - series ID of the collection
     */
    getProgress (settId: ID<"sett">): Progress;
    getProgress (settId: ID<"sett">, asStore: true): Readable<Progress>;
    getProgress (settId: ID<"sett">, asStore = false): Readable<Progress> | Progress {
        const metrics = this.#collections[settId];
        if (!asStore) return metrics ? getProgress(metrics) : EMPTY_PROGRESS;
        let hash = Number.NaN;
        return derived(this.#collectionsStore, (setts, set) => {
            // the store contains an object, so to avoid useless updates
            // let use total owned number as the object hash
            const sett = setts[settId];
            if (!sett) {
                if (hash !== -1) {
                    hash = -1;
                    set(EMPTY_PROGRESS);
                }
                return;
            }
            const { owned_metrics: m } = sett;
            // 1024 for core, 512 for chase and variants and 16 for legendary
            /* eslint-disable no-bitwise */
            const newHash = m.owned_core_piece_count
                | m.owned_chase_piece_count << 10
                | m.owned_variant_piece_count << 19
                | m.owned_legendary_piece_count << 28;
            if (hash !== newHash) {
                hash = newHash;
                set(getProgress(sett));
            }
        });
    }
}

export default UserCollections;
