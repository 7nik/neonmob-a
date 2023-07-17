/* eslint-disable max-classes-per-file */

import type NM from "$lib/utils/NM Types";
import type { absoluteURL, fullURL } from "$lib/utils/NM Types";
import type { MaybePromise } from "@sveltejs/kit";
import { writable, type Readable } from "svelte/store";
import { get, makeUrl, SELF } from "./utils";

export type PojoPaginator<T> = {
    type: string,
    items: T[],
    next: string | null;
    total: number;
}

type DataPage<T> = {
    items: T[],
    next: string | null,
    total: number,
}

abstract class Paginator<T> implements Readable<T[]> {
    #type: string;
    #items: T[] = [];
    #store = writable<T[]>([]);
    #next: string | null = null;
    #total = 0;
    #lock: Promise<DataPage<T>> | null = null;
    #lockStore = writable(false);

    constructor (type: string, url: string | null) {
        this.#type = type;
        this.#next = url;
    }

    protected abstract getPage (url: string, f: typeof fetch): Promise<DataPage<T>>

    /**
     * Load and return next page of items
     */
    async #getNext (f = fetch) {
        if (!this.#next || this.#lock) return [];
        const promise = this.getPage(this.#next, f);
        this.#lock = promise;
        this.#lockStore.set(true);
        try {
            const data = await promise;
            this.#items = this.#items.concat(data.items);
            this.#total = data.total;
            // this.#prev = data.previous;
            this.#next = data.next;
            this.#store.set(this.#items);
            return data.items;
        } catch (ex) {
            console.error("Paginator: failed to load data", ex);
            this.#next = null;
            return [];
        } finally {
            this.#lock = null;
            this.#lockStore.set(false);
        }
    }

    protected setData (data: MaybePromise<DataPage<T>>) {
        if (data instanceof Promise) {
            this.#total ||= Number.POSITIVE_INFINITY;
            this.#lock = data;
            this.#lockStore.set(true);
            data.then(({ items, next, total }) => {
                this.#items = items;
                this.#store.set(items);
                this.#next = next;
                this.#total = total;
                this.#lock = null;
                this.#lockStore.set(false);
            });
            return;
        }
        const { items, next, total } = data;
        this.#items = items;
        this.#store.set(items);
        this.#next = next;
        this.#total = total;
    }

    /**
     * Whether more items can be loaded
     */
    get hasMore () {
        return this.#next !== null;
    }

    get isLoading () {
        return this.#lock !== null;
    }

    get isLoadingStore () {
        return { subscribe: this.#lockStore.subscribe };
    }

    get items () {
        return this.#items;
    }

    /**
     * The claimed total number of items
     */
    get total () {
        return this.#total;
    }

    /**
     * Make the class store-compatible
     */
    get subscribe () {
        return this.#store.subscribe;
    }

    /**
     * Load and return all the items
     */
    async loadAll (f = fetch) {
        if (this.#lock) await this.#lock;
        // eslint-disable-next-line no-await-in-loop
        while (this.#next) await this.#getNext(f);
        return this.items;
    }

    /**
     * Load and return the loaded items
     */
    async loadMore (f = fetch) {
        if (this.#lock) {
            const data = await this.#lock;
            return data.items;
        }
        return this.#getNext(f);
    }

    /**
     * Just waits for finishing of the current loading
     */
    async waitLoading () {
        await this.#lock;
        return this;
    }

    /**
     * Converts object to a serializable version
     * @returns a POJO object
     */
    async toPOJO (): Promise<PojoPaginator<T>> {
        await this.waitLoading();
        return {
            type: this.#type,
            items: this.#items,
            next: this.#next,
            total: this.#total,
        };
    }

    /**
     * Creates Paginator from the serialized instance
     * @param pojo - POJO version of Paginator or promise of it
     * @returns Paginator instance
     */
    static fromPOJO<TT> (_p: Promise<PojoPaginator<TT>>): ThisType<TT> {
        throw new Error(`Unimplemented method for`);
    }
}

/**
 * A class to deal with paginated data
 */
class PagePaginator<T> extends Paginator<T> {
    static #type = "page";

    constructor (url: string, f = fetch) {
        super(PagePaginator.#type, url);
        this.loadMore(f);
    }

    // eslint-disable-next-line class-methods-use-this
    async getPage (url: fullURL, f: typeof fetch) {
        url = url.startsWith("https://www.neonmob.com/api/")
            ? makeUrl("api", url.slice(27) as absoluteURL)
            : (url.startsWith("https://node.neonmob.com/")
                ? makeUrl("napi", url.slice(24) as absoluteURL)
                : url);
        const data = await get<NM.Paginated<T>>("url", url, {}, f);
        return {
            next: data.next,
            total: data.count,
            items: data.results,
        };
    }

    static fromPOJO<TT> (p: Promise<PojoPaginator<TT>>) {
        const paginator = new PagePaginator<TT>("");
        paginator.setData(p.then((data) => {
            if (data.type !== PagePaginator.#type) {
                throw new Error(`Paginator type doesn't matches`);
            }
            return data;
        }));
        return paginator;
    }
}

/**
 * A class to deal with data paginated as a usual array
 */
class ArrayPaginator<T> extends Paginator<T> {
    static #type = "array";

    constructor (link: string, f = fetch) {
        link = link.startsWith("https://www.neonmob.com/api/")
            ? makeUrl("api", link.slice(27) as absoluteURL)
            : (link.startsWith("https://node.neonmob.com/")
                ? makeUrl("napi", link.slice(24) as absoluteURL)
                : link);
        if (link) {
            const url = new URL(link, SELF);

            if (url.searchParams.has("page")) {
                url.searchParams.set("page", "1");
            }
            if (url.searchParams.has("amount")) {
                url.searchParams.set("amount", "50");
            }
            link = url.toString();
        }
        super(ArrayPaginator.#type, link);
        this.loadMore(f);
    }

    async getPage (link: fullURL, f = fetch) {
        const array = await get<T[]>("url", link, {}, f);
        const url = new URL(link);
        if (array.length < Number(url.searchParams.get("amount"))) {
            return {
                next: null,
                total: this.items.length + array.length,
                items: array,
            };
        }
        url.searchParams.set("page", (Number(url.searchParams.get("page")) + 1).toString());
        return {
            next: url.toString(),
            total: Number.POSITIVE_INFINITY,
            items: array,
        };
    }

    static fromPOJO<TT> (p: Promise<PojoPaginator<TT>>) {
        const paginator = new ArrayPaginator<TT>("");
        paginator.setData(p.then((data) => {
            if (data.type !== ArrayPaginator.#type) {
                throw new Error(`Paginator type doesn't matches`);
            }
            return data;
        }));
        return paginator;
    }
}

/**
 * A class to present array as a paginated data
 */
class StaticPaginator<T> extends Paginator<T> {
    static #type = "static";
    private allItems: T[] = [];

    constructor (items: MaybePromise<T[]>, size: number) {
        if (Array.isArray(items)) {
            super(StaticPaginator.#type, `0,${size}`);
            this.allItems = items;
            this.loadMore();
            return;
        }
        super(StaticPaginator.#type, null);
        this.setData(items.then((array) => {
            this.allItems = array;
            return {
                items: array.slice(0, size),
                total: array.length,
                next: size >= array.length ? null : `${size},${size}`,
            };
        }));
    }

    protected override getPage (url: string) {
        const [start, amount] = url.split(",").map(Number);
        const end = start + amount;
        const total = this.allItems.length;
        return Promise.resolve({
            next: end >= total ? null : `${end},${amount}`,
            total,
            items: this.allItems.slice(start, end),
        });
    }

    static fromPOJO<TT> (p: Promise<PojoPaginator<TT>>) {
        const paginator = new StaticPaginator<TT>([], 0);
        paginator.setData(p.then((data) => {
            if (data.type !== StaticPaginator.#type) {
                throw new Error(`Paginator type doesn't matches`);
            }
            if (!data.next) return data;
            paginator.allItems = data.items;
            const start = +data.next.split(",")[0];
            return {
                ...data,
                items: data.items.slice(0, start),
            };
        }));
        return paginator;
    }
}

/**
 * A class to transform and filter a paginated data
 */
class ProxyPaginator<S, T> extends Paginator<T> {
    static #type = "proxy";
    private paginator: Paginator<S>;
    private func: (item: S) => MaybePromise<T|null>;

    constructor (paginator: Paginator<S>, func: (item: S) => MaybePromise<T|null>) {
        super(ProxyPaginator.#type, null);
        this.paginator = paginator;
        this.func = func;
        this.setData(paginator
            .waitLoading()
            .then(() => Promise.all(paginator.items.map(func)))
            .then((array) => ({
                items: array.filter((x) => x !== null) as T[],
                total: paginator.total,
                next: paginator.hasMore ? "true" : null,
            })));
    }

    protected override async getPage () {
        const origItems = await this.paginator.loadMore();
        const results = await Promise.all(origItems.map(this.func));
        const items = results.filter((x) => x !== null) as T[];
        const filtered = origItems.length - items.length;
        return {
            next: this.paginator.hasMore ? "true" : null,
            total: this.total - filtered,
            items,
        };
    }
}

/**
 * A class that loads infinitely
 */
class EndlessPaginator<T> extends Paginator<T> {
    static #type = "endless";

    constructor () {
        super(EndlessPaginator.#type, "true");
        this.loadMore();
    }

    // eslint-disable-next-line class-methods-use-this
    protected override async getPage () {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return new Promise<DataPage<T>>(() => {});
    }

    static fromPOJO<TT> () {
        return new EndlessPaginator<TT>();
    }
}

export {
    ArrayPaginator,
    PagePaginator,
    StaticPaginator,
    ProxyPaginator,
    EndlessPaginator,
};

export type { Paginator };
