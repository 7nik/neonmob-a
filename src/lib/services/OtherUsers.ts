import type { Readable, Unsubscriber } from "svelte/store";
import type NM from "$lib/utils/NM Types";
import type { ID } from "$lib/utils/NM Types";

import { derived, readable, writable } from "svelte/store";
import { browser } from "$app/environment";
import {
    addFriend,
    blockUser,
    getBlockedUsers,
    getFriends,
    getUserStatus,
    isUserBlocked,
    removeFriend,
    unblockUser,
} from "$api";

/**
 * The list of friends and blocked users
 */
export default class OtherUsers implements Readable<NM.UserFriend[]> {
    #friends = writable<NM.UserFriend[]>([]);
    #blocked = writable<NM.UserFriend[]>([]);
    #loading: Promise<any>|null = null;

    get subscribe () { return this.#friends.subscribe; }

    /**
     * Load the data
     */
    load (f = fetch) {
        if (this.#loading) return;
        this.#loading = Promise.all([
            getFriends(f).loadAll(f).then((list) => this.#friends.set(list)),
            getBlockedUsers(f).then((list) => this.#blocked.set(list)),
        ]).catch((err) => console.error(err));
    }

    /**
     * Wait until the data gets loaded if it's loading
     */
    async waitLoading () {
        if (this.#loading) {
            await this.#loading;
        }
        return this;
    }

    /**
     * Whether the user is in the friend list
     */
    isFriend (userId: ID<"user">) {
        return derived(this.#friends, (list) => list.some(({ id }) => id === userId));
    }

    /**
     * Add user to the friend list
     */
    async startFriendship (userId: ID<"user">) {
        const friend = await addFriend(userId);
        this.#friends.update((list) => [...list, friend]);
    }

    /**
     * Remove user from the friend list
     */
    async endFriendship (userId: ID<"user">) {
        await removeFriend(userId);
        this.#friends.update((list) => list.filter(({ id }) => id !== userId));
    }

    /**
     * Get live number of online friends
     */
    getOnlineNumber () {
        return readable(0, (setNumber) => {
            if (!browser) {
                setNumber(0);
                return;
            }

            function countOnline (statuses: boolean[]) {
                return statuses.reduce((total, online) => total + Number(online), 0);
            }

            let stopStatuses: Unsubscriber;
            const stopFriends = this.#friends.subscribe((list) => {
                stopStatuses = derived(
                    list.map(({ id }) => getUserStatus(id)),
                    countOnline,
                ).subscribe(setNumber);
            });

            // eslint-disable-next-line consistent-return
            return () => {
                stopStatuses();
                stopFriends();
            };
        });
    }

    /**
     * Whether the user is blocked or the current user is blocked by this user
     * @returns whether blocked and who has blocked
     */
    isBlocked (userId: ID<"user">) {
        return derived(this.#blocked, (blocked, set) => {
            if (blocked.some(({ id }) => id === userId)) {
                set({
                    isBlocked: true,
                    isBlockedByUser: true,
                });
            } else {
                isUserBlocked(userId).then((data) => {
                    set({
                        isBlocked: data.is_blocked,
                        isBlockedByUser: data.user_initiated,
                    });
                });
            }
        }, {
            isBlocked: false,
            isBlockedByUser: false,
        });
    }

    /**
     * Block the user
     */
    async blockUser (userId: ID<"user">) {
        this.endFriendship(userId);
        const user = await blockUser(userId);
        this.#blocked.update((list) => [...list, user]);
    }

    /**
     * Unblock the user
     */
    async unblockUser (userId: ID<"user">) {
        await unblockUser(userId);
        this.#blocked.update((list) => list.filter(({ id }) => id !== userId));
    }
}
