/**
 * Subclass of Map which deletes after a some time.
 * The deletion deletion gets re-delayed when the value is requested via `get` method.
 */
export default class TemporalMap<K = any, V = any> extends Map<K, V> {
    #delay = 5 * 60 * 1000;
    #timers = new Map<K, NodeJS.Timer>();

    constructor (delay?: number);
    constructor (values?: readonly (readonly [K, V])[] | null, delay?: number);
    constructor (values?: Iterable<readonly [K, V]> | null, delay?: number);
    /**
     * Creates a TemporalMap
     * @param values - optional initial values of the map
     * @param delay - delay of deletion in ms, default - 5 minutes
     */
    constructor (
        values?: readonly (readonly [K, V])[] | Iterable<readonly [K, V]> | number | null,
        delay?: number,
    ) {
        [values, delay] = (typeof values === "number")
            ? [null, values]
            : [values, delay!];
        super(values);
        if (delay) this.#delay = delay;
    }

    /**
     * (Re-)schedules deletion of the specified value
     * @param key - the value's key
     */
    #scheduleDeletion (key: K) {
        if (this.#timers.has(key)) {
            clearTimeout(this.#timers.get(key));
        }
        const timer = setTimeout(() => {
            this.delete(key);
            this.#timers.delete(key);
        }, this.#delay);
        this.#timers.set(key, timer);
    }

    /**
     * Retrieves a value by the key and re-delays its deletion
     * @param key - the value's key
     */
    get (key: K) {
        this.#scheduleDeletion(key);
        return super.get(key);
    }

    /**
     * Adds or overwrites key-value to the Map.
     * After the specified delay, the element will be deleted.
     * @param key - the value's key
     * @param value - the value to set
     */
    set (key: K, value: V): this {
        this.#scheduleDeletion(key);
        return super.set(key, value);
    }
}
