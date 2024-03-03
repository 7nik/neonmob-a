/**
 * Subclass of Map which deletes the values with a delay,
 * and cancels deletion if the value is requested again via `get` method.
 */
export default class LazyMap<K = any, V = any> extends Map<K, V> {
    #timeout = 1000;
    #removing = new Map<K, NodeJS.Timer>();

    constructor (timeout?: number);
    constructor (values?: readonly (readonly [K, V])[] | null, timeout?: number);
    constructor (values?: Iterable<readonly [K, V]> | null, timeout?: number);
    /**
     * Creates a LazyMap
     * @param values - optional initial values of the map
     * @param timeout - delay of deletion in ms, default - 1 second
     */
    constructor (
        values?: readonly (readonly [K, V])[] | Iterable<readonly [K, V]> | number | null,
        timeout?: number,
    ) {
        [values, timeout] = (typeof values === "number")
            ? [null, values]
            : [values, timeout!];
        super(values);
        if (timeout) this.#timeout = timeout;
    }

    /**
     * Schedules deletion of the value
     * @param key - the value's key
     * @param force - optional, if true, will be deleted without delay
     * @returns whether the values is/will be deleted
     */
    delete (key: K, force = false): boolean {
        if (!this.has(key)) return false;
        if (force) {
            this.delete(key);
            if (this.#removing.has(key)) {
                clearTimeout(this.#removing.get(key));
                this.#removing.delete(key);
            }
            return true;
        }
        if (this.#removing.has(key)) return true;
        this.#removing.set(key, setTimeout(() => {
            super.delete(key);
            this.#removing.delete(key);
        }, this.#timeout));
        return true;
    }

    /**
     * Schedule deletion of all the values
     * @param force - optional, if true, will be cleared without delay
     */
    clear (force = false): void {
        if (force === true) {
            super.clear();
        } else {
            for (const key of this.keys()) {
                this.delete(key, force);
            }
        }
    }

    /**
     * Retrieves a value by the key and cancels its deletion
     * @param key - the value's key
     */
    get (key: K) {
        if (this.#removing.has(key)) {
            clearTimeout(this.#removing.get(key));
            this.#removing.delete(key);
        }
        return super.get(key);
    }
}
