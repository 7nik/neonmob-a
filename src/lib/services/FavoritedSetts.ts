import { getFavoriteSetts } from "$api";
import type { ID } from "$lib/utils/NM Types";

class FavoritedSetts {
    #promise: Promise<void> | null;
    #setts;

    constructor (userId: number) {
        this.#setts = new Set();
        this.#promise = getFavoriteSetts(userId).then((setts) => {
            this.#setts = new Set(setts.map((s) => s.id));
            this.#promise = null;
        });
    }

    /**
     * Method to wait for finishing the loading
     * @returns Promise of completing the data loading
     */
    waitLoading () {
        return this.#promise ?? Promise.resolve();
    }

    /**
     * Check whether the user has favorited the sett
     * @param settId - the sett's ID
     */
    has (settId: ID<"sett">) {
        return this.#setts.has(settId);
    }
}

export default FavoritedSetts;
