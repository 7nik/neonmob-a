/* eslint-disable max-classes-per-file */
import type { Readable, Writable } from "svelte/store";
import type NM from "$lib/utils/NM Types";
import type { ID } from "$lib/utils/NM Types";
import type { PublicInterface } from "$lib/utils/NMA Types";

import { get, readable, writable } from "svelte/store";
import io from "socket.io-client";
import { browser } from "$app/environment";
import { page } from "$app/stores";
import { markNotificationsRead } from "./NM";
import { makeUrl } from "./utils";

/*
 * The neonmob.com uses socket.io 1.3.5
 * socket.io 1.x seems to cause a build for Node
 * socket.io 2.x seems to be compatible with the NM WS server
 * socket.io 3.x connects but transfers almost nothing
 */

// cannot import lazyCurrentUser because it causes locking circular dependency
type Socket = typeof io.Socket;
const socketCache: Record<string, Socket> = {};

// know namespaces for io
type Namespace =
    "completed" |
    "conversation" |
    "messages" |
    "notifications" |
    "recent" |
    "suggestion" |
    "trade_offers" |
    "trades" |
    "user" |
    `/${string}`;

/**
 * Get a web-socket
 * @param namespace the endpoint to connect the socket
 * @returns a new or cached socket
 */
function getSocket (namespace: Namespace): Socket {
    if (!browser) {
        throw new Error("Opening WS on server");
    }
    if (!namespace.startsWith("/")) namespace = `/${namespace}`;
    if (!(namespace in socketCache)) {
        socketCache[namespace] = io(
            namespace,
            {
                transports: ["websocket"],
                path: makeUrl("napi", "/socket.io/"),
                timeout: 3300,
            },
        );
        socketCache[namespace].on("disconnect", () => {
            delete socketCache[namespace];
        });
    }
    return socketCache[namespace];
}

type LiveListListenerType<T, EV extends string> =
    EV extends "init" ? (items: T[], total: number) => void
    : EV extends "load" ? (items: T[]) => void
    : EV extends "add" | "remove" ? (item: T) => void
    : (data: any) => void;

type LiveListIdType<N extends Namespace> =
    N extends "completed" ? null
    : N extends "conversation" ? ID<"conversation">
    : N extends "messages" ? ID<"user">
    : N extends "notifications" ? ID<"user">
    : N extends "recent" ? null
    : N extends "suggestion" ? null
    : N extends "trade_offers" ? null
    : N extends "trades" ? ID<"user">
    : N extends "user" ? ID<"user"> // but passed as number instead of {id} object
    : number;

// cache for LiveList
// eslint-disable-next-line no-use-before-define, @typescript-eslint/no-explicit-any
const llCache = new Map<string, LiveList<any, any>>();

/**
 * A class to load a list of data and listen for its changes
 */
class LiveList<T, N extends Namespace> {
    #socket: Socket;
    #namespace: string;
    #id: number | null;
    #comparator?: (a:T, b:T) => number;
    #list: T[] = [];
    #loading = writable(true);
    #totalCount = 0;
    #store: Writable<T[]> = writable<T[]>([], () => () => {
        // stop listening when everybody unsubscribes
        // this.stopListening();
        console.log("all unsubscribed", this.#namespace);
    });

    #onLoadInitial: LiveListListenerType<T, "init">[] = [];
    #onLoad: LiveListListenerType<T, "load">[] = [];
    #onAdd: LiveListListenerType<T, "add">[] = [];
    #onRemove: LiveListListenerType<T, "remove">[] = [];

    #preAddedItem: T[] = [];

    /**
     * @param namespace - the source endpoint of the list
     * @param id - identification for joining the namespace
     */
    constructor (
        namespace: N,
        id: LiveListIdType<N>|null = null,
        comparator?: (a:T, b:T) => number,
    ) {
        this.#namespace = namespace.replace("/", "");
        this.#id = id;
        this.#comparator = comparator;
        this.#socket = getSocket(namespace);

        if (llCache.has(this.#namespace)) {
            // return cached object instead of the created one
            // eslint-disable-next-line no-constructor-return
            return llCache.get(this.#namespace)!;
        }
        llCache.set(this.#namespace, this);

        this.#socket.on("reconnect", () => {
            this.#socket.emit("rejoin", { id: this.#id });
        });

        this.#socket.on("loadInitial", (data: { results: T[], count?: number }) => {
            this.#loading.set(false);
            const items = data.results.concat(this.#preAddedItem);
            const total = (data.count ?? data.results.length) + this.#preAddedItem.length;
            this.#totalCount = total; // will be added back in #addItems()
            this.#addItems(items);
            for (const cb of this.#onLoadInitial) cb(items, total);
        });

        this.#socket.on("load", (items: T[]) => {
            this.#loading.set(false);
            this.#addItems(items);
            for (const cb of this.#onLoad) cb(items);
        });

        this.#socket.on("addItem", (item: T) => {
            this.#addItem(item);
            for (const cb of this.#onAdd) cb(item);
        });

        this.#socket.on("removeItem", (item: T & {id:any}) => {
            this.#removeItem(item.id);
            for (const cb of this.#onRemove) cb(item);
        });

        this.#socket.on("serverError", (data: any) => {
            console.error("Error in socket", {
                namespace: this.#namespace,
                joinId: this.#id,
                ...data,
            });
        });

        this.#socket.emit("join", { id: this.#id });
    }

    /**
     * Add an item to the list
     * @param item - the item to add
     */
    #addItem (item: T) {
        this.#totalCount += 1 - this.#filterList((item as T&{id:any}).id);
        this.#setItems([...this.#list, item]);
    }

    /**
     * Add items to the list
     * @param items - items to add
     */
    #addItems (items: T[]) {
        if (items.length > 0) {
            // do not change this.#totalCount because this method
            // is for adding items included in this number
            this.#setItems(items.concat(this.#list));
        }
    }

    /**
     * Remove items with given ID without triggering updates,
     * if the ID is falsy, nothing will be removed
     * @param id - item's ID to remove
     * @returns number of removed items
     */
    #filterList (id: string|number) {
        if (!id) return 0;
        const newList = (this.#list as (T & {id:any})[])
            .filter((item) => item.id !== id);
        const removed = this.#list.length - newList.length;
        this.#list = newList;
        return removed;
    }

    /**
     * Remove from the list items with the given id
     * @param id - item's ID to remove
     */
    #removeItem (id: string|number) {
        this.#totalCount -= this.#filterList(id);
        this.#setItems(this.#list);
    }

    /**
     * Set new value of `list` and triggers update of the `store`
     * @param items
     */
    #setItems (items: T[]) {
        this.#list = items;
        if (this.#comparator) this.#list.sort(this.#comparator);
        this.#store.set(this.#list);
    }

    /**
     * Whether the initial data is still loading
     */
    get loading (): Readable<boolean> {
        return {
            subscribe: this.#loading.subscribe,
        };
    }

    /**
     * Get the used socket, if available
     */
    get socket () {
        return this.#socket;
    }

    /**
     * Get the data as a store,
     * runs `stopListening` when run out of the subscribers
     */
    get store (): Readable<T[]> {
        return {
            subscribe: this.#store.subscribe,
        };
    }

    /**
     * Total count of the items
     */
    get total () {
        return this.#totalCount;
    }

    /**
     * Add an item locally and trigger the listeners
     * @param item - the item to add
     */
    forceAddItem (item: T) {
        for (const cb of this.#socket.listeners("addItem")) cb(item);
    }

    /**
     * Request loading next items
     */
    loadMore () {
        this.#loading.set(true);
        this.send("requestLoad", {
            id: this.#id,
            lastItem: this.#list[0],
        });
    }

    /**
     * Mark a certain item or all the items as read
     * @param id - optional, ID of the item to mark read
     */
    markRead (id?: string) {
        // TODO sync across all the tabs
        const list = this.#list as (T & {id:string, read:boolean})[];
        if (id) {
            const item = list.find((it) => it.id === id);
            if (!item) return;
            markNotificationsRead([item.id], this.#namespace);
            this.#addItem({ ...item, read: true });
        } else {
            const ids = list.filter(({ read }) => !read).map((it) => it.id);
            if (ids.length === 0) return;
            markNotificationsRead(ids, this.#namespace);
            this.#setItems(list.map((item) => (
                item.read ? item : { ...item, read: true }
            )));
        }
    }

    /**
     * Add listener to an event
     * @param eventName - "init", "load", "add", "remove", or any additional event name
     * @param listener - the event handler
     */
    on<E extends string> (eventName: E, listener: LiveListListenerType<T, E>) {
        switch (eventName) {
            case "init": this.#onLoadInitial.push(listener as (x:T[], l:number)=>void); break;
            case "load": this.#onLoad.push(listener as (x:T[])=>void); break;
            case "add": this.#onAdd.push(listener as (x:T)=>void); break;
            case "remove": this.#onRemove.push(listener as (x:T)=>void); break;
            default:
                this.#socket.on(eventName, listener as (...x:any[])=>void);
                break;
        }
        return this;
    }

    /**
     * Send en event to the server
     * @param eventName - the event name
     * @param data - the event's data
     */
    send (eventName: string, ...data: unknown[]) {
        this.#socket.emit(eventName, ...data);
    }

    /**
     * Send request for adding the item
     * @param item - the item to add
     */
    sendAddItem<S> (item: S extends {id:unknown} ? never : S&Omit<T, "id">) {
        this.send("requestAddItem", {
            id: this.#id,
            item,
        });
        this.#addItem(item as unknown as T);
    }

    /**
     * Send request for removing the item
     * @param item - the item to remove
     */
    sendRemoveItem (item: T & {id:any}) {
        this.send("requestRemoveItem", {
            id: this.#id,
            item,
        });
        this.#removeItem(item.id);
    }

    /**
     * Stop listen for the data changes.
     * You cannot resume the listening
     */
    stopListening () {
        this.#socket.emit("leave", { id: this.#id });
        this.#socket.removeAllListeners();
        llCache.delete(this.#namespace);
    }
}

/* eslint-disable class-methods-use-this, @typescript-eslint/no-empty-function */
class EmptyList<T, N extends Namespace> implements PublicInterface<LiveList<T, N>> {
    #store = readable<T[]>([]);

    get loading (): Readable<boolean> {
        return readable(false);
    }

    get socket (): Socket {
        throw new Error("Dont use it, baka.");
    }

    get store (): Readable<T[]> {
        return this.#store;
    }

    get total (): number {
        return 0;
    }

    forceAddItem (_item: T): void {}

    loadMore (): void {}

    markRead (_id?: string): void {}

    on<E extends string> (_eventName: E, _listener: LiveListListenerType<T, E>): LiveList<T, N> {
        return this as unknown as LiveList<T, N>;
    }

    send (_eventName: string, ..._data: unknown[]): void {}

    sendAddItem<S> (_item: S extends { id: unknown; } ? never : S & Omit<T, "id">): void {}

    sendRemoveItem (_item: T & { id: any; }): void {}

    stopListening (): void {}
}

/**
 * A general date comparator for object sorting
 * @param getter - extracts the date string from the passed object
 * @param reverse - use reverse sorting, default - no
 */
function timeComparator<T> (getter: (x:T) => string, reverse = false) {
    return (a:T, b:T) => (
        new Date(getter(b)).getTime() - new Date(getter(a)).getTime()
    ) * (reverse ? -1 : 1);
}

// known comparators for various namespaces
const comparators = {
    completed: undefined, // milestones
    conversation: timeComparator((x: NM.Message) => x.created, true),
    messages: timeComparator((x:NM.MessageNotification) => x.actor.time),
    notifications: timeComparator((x:NM.Notification<any, string, string>) => x.actor.time),
    recent: undefined, // milestones
    suggestion: undefined, // milestones
    // the trades are completed - doesn't seem to be used anymore
    trade_offers: timeComparator((x:NM.TradeNotification) => x.object.completed!),
    trades: timeComparator((x:NM.TradeNotification) => x.actor.time),
    user: undefined, // nothing to sort
} as Record<Namespace, (<T>(a:T, b:T)=>number) | undefined>;

// known LiveList subtypes for various namespaces
type LiveListType<N extends Namespace> =
    N extends "completed" ? LiveList<NM.Milestone, N>
    : N extends "conversation" ? LiveList<NM.Message, N>
    : N extends "messages" ? LiveList<NM.MessageNotification, N>
    : N extends "notifications" ? LiveList<NM.Notification<any, string, string>, N>
    : N extends "recent" ? LiveList<NM.Milestone, N>
    : N extends "suggestion" ? LiveList<NM.Milestone, N>
    : N extends "trade_offers" ? LiveList<NM.TradeNotification, N>
    : N extends "trades" ? LiveList<NM.TradeNotification, N>
    : N extends "user" ? never // LiveList cannot be used on this namespace
    : LiveList<unknown, N>;

/**
 * Get a LiveList for the given namespace
 * @param namespace - the namespace of the live list
 * @param id - optional ID
 */
function liveListProvider<
    N extends Exclude<Namespace, `/${string}`|"user">
> (namespace: N, id: LiveListIdType<N>|null = null) {
    if (!llCache.has(namespace)) {
        if (!id && ["messages", "notifications", "trade_offers", "trades"].includes(namespace)) {
            id = Number(get(page).data.currentUser.id) as LiveListIdType<N>;
        }
        llCache.set(namespace, browser
            ? new LiveList(namespace, id, comparators[namespace])
            : new EmptyList() as unknown as LiveListType<N>);
    }
    return llCache.get(namespace) as LiveListType<N>;
}

const connectedUsers = new Map<ID<"user">, Writable<boolean>>();
const goingOffline = new Map<ID<"user">, any>();
let socketUser: Socket|null = null;

function initSocketUser () {
    if (socketUser) return;
    if (!browser) {
        console.warn("Reading user status on server");
        return;
    }
    socketUser = getSocket("user");
    socketUser.on("requestStatus", () => socketUser!.emit("sendStatusConnected"));
    socketUser.on(
        "updateStatus",
        (user: { id:ID<"user">, connected:boolean, initialConnection?: boolean }) => {
            const isOnline = connectedUsers.get(user.id);
            if (!isOnline) {
                console.warn("Updating status of non-watched user", user.id);
                return;
            }
            // user can re-connect, so set offline status with delay
            if (user.connected) {
                if (goingOffline.has(user.id)) {
                    clearTimeout(goingOffline.get(user.id));
                    goingOffline.delete(user.id);
                }
                if (!get(isOnline)) {
                    isOnline.set(true);
                }
            } else if (get(isOnline) && !goingOffline.has(user.id)) {
                goingOffline.set(user.id, setTimeout(() => {
                    goingOffline.delete(user.id);
                    isOnline.set(false);
                }, 10_500));
            }
        },
    );
}

/**
 * Returns a store which displays whether a user is online or offline
 * @param userId the user to watch
 * @returns a boolean store
 */
function getUserStatus (userId: ID<"user">): Readable<boolean> {
    if (!socketUser) {
        if (get(page).data.currentUser.isAuthenticated()) {
            initSocketUser();
        }
        if (!socketUser) return readable(false);
    }
    if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, writable(false, () => {
            socketUser!.emit("join", userId);
            return () => {
                socketUser!.emit("leave", userId);
                connectedUsers.delete(userId);
            };
        }));
    }
    return {
        subscribe: connectedUsers.get(userId)!.subscribe,
    };
}

export {
    getUserStatus,
    liveListProvider,
};
