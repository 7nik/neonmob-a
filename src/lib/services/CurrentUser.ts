/* eslint-disable class-methods-use-this */
// eslint-disable-next-line max-classes-per-file
import type NM from "$lib/utils/NM Types";
import type { ID } from "$lib/utils/NM Types";
import type { Readable } from "svelte/store";
import type { Progress } from "./OwnedCollections";

import { get, writable, derived } from "svelte/store";
import { browser } from "$app/environment";
import { page } from "$app/stores";
import { getCurrentUserData, getFreebieBalance, getUserData } from "$api";
import { timeTil } from "$lib/utils/date";
import storefy from "$lib/utils/storefy";
import OwnedCards from "./OwnedCards";
import { EMPTY_PROGRESS } from "./OwnedCollections";

/**
 * Type without private props
 */
type PublicInterface<T> = {
    [P in keyof T]: T[P];
}
class MockUserCards implements PublicInterface<OwnedCards> {
    #data = writable<OwnedCards|null>(null);

    setSource (data: OwnedCards) {
        this.#data.set(data);
    }

    get isLoading (): boolean {
        return false;
    }

    waitLoading (): Promise<void> {
        return Promise.resolve();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    addPrints (_cards: NM.CardMinimal[]): void {}
    getPrintCount(cardId: number): number;
    getPrintCount(cardId: number, asStore: true): Readable<number>;
    getPrintCount (cardId: number, asStore?: boolean): number | Readable<number> {
        if (!asStore) return 1;
        return derived(this.#data, (data, set) => {
            if (data) {
                data.getPrintCount(cardId, true).subscribe(set);
            }
        }, 1);
    }

    hasPrint(cardId: number): boolean;
    hasPrint(cardId: number, asStore: true): Readable<boolean>;
    hasPrint (cardId: number, asStore?: boolean): boolean | Readable<boolean> {
        if (!asStore) return true;
        return derived(this.#data, (data, set) => {
            if (data) {
                data.hasPrint(cardId, true).subscribe(set);
            }
        }, true);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    removePrints (_cards: NM.CardMinimal[] | [NM.CardMinimal, number][]): void {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    updateCollection (_cards: NM.CardMinimal[], _change: 1 | -1): void {}
    listCollections (): NM.SettMetrics[] {
        return [];
    }

    getProgress(settId: ID<"sett">): Progress;
    getProgress(settId: ID<"sett">, asStore: true): Readable<Progress>;
    getProgress (settId: ID<"sett">, asStore?: boolean): Progress | Readable<Progress> {
        if (!asStore) return EMPTY_PROGRESS;
        return derived(this.#data, (data, set) => {
            if (data) {
                data.getProgress(settId, true).subscribe(set);
            }
        }, EMPTY_PROGRESS);
    }
}

class CurrentUser {
    carats = 0;
    credits = 0;
    isAuthenticated = false;
    isProUser = false;
    isVerified = false;
    freebieLimit = 0;
    freebieNext = null as number | null;
    freebieUsed = {} as Record<ID<"sett">, number>;
    freebies = 0;
    level = {} as NM.UserLevel;
    referralCode = "";
    referralUrl = "";
    timeToMidnight = "";
    timeToNextFreebie = "";
    user = {
        id: 0,
        first_name: "You",
        name: "You",
        username: "you",
        avatar: {} as NM.User["avatar"],
        link: "/",
        pro_badge: null,
        pro_status: 0,
        twitter_username: null,
        url: "/", // api endpoint
        bio: "",
        last_name: "",
        links: {} as NM.User["links"],
        trader_score: 7,
    } as NM.UserFriend & NM.User;

    wealth: PublicInterface<OwnedCards> = new MockUserCards();

    /**
     * Load main part of the authenticated user data
     */
    private async loadBase (f = fetch) {
        const rawUser = await getCurrentUserData(f);
        const realWealth = new OwnedCards(rawUser.id, f);
        (this.wealth as MockUserCards).setSource(realWealth);
        this.wealth = realWealth;
        this.carats = rawUser.carats;
        this.credits = rawUser.credits_balance;
        this.isAuthenticated = true;
        this.isProUser = Boolean(rawUser.pro_status);
        this.freebieLimit = rawUser.get_freebie_limit;
        this.freebieUsed = rawUser.todays_freebies_count;
        this.level = rawUser.level;
        this.referralCode = rawUser.referral_code;
        this.referralUrl = `/join/${rawUser.referral_code}`;
        this.user = {
            id: rawUser.id,
            first_name: rawUser.first_name,
            name: `${rawUser.first_name} ${rawUser.last_name}`.trim(),
            username: rawUser.username,
            avatar: {
                large: rawUser.large_avatar_url,
                small: rawUser.small_avatar_url,
            },
            link: `/${rawUser.username}`,
            pro_badge: rawUser.pro_badge,
            pro_status: rawUser?.pro_status,
            twitter_username: null,
            url: "/", // api endpoint
            bio: rawUser.bio,
            last_name: rawUser.last_name,
            links: {} as NM.User["links"],
            trader_score: rawUser.trader_score,
        };
        // to trigger re-running this method
        this.isCurrentUser = this.isCurrentUser;

        return rawUser.id;
    }

    private async loadExtra (userId: ID<"user">, f: typeof fetch) {
        const rawExtra = await getUserData(userId, f);
        this.isVerified = rawExtra.is_verified;
        this.user.link = rawExtra.link;
        this.user.links = rawExtra.links;
        this.referralUrl = rawExtra.links.referral_url;
    }

    /**
     * Loads the authenticated user data
     */
    async loadUser (f = fetch, userId: ID<"user">|null = null) {
        await Promise.all([
            // eslint-disable-next-line consistent-return
            this.loadBase(f).then((realId) => {
                if (realId !== userId) {
                    return this.loadExtra(realId, f);
                }
            }),
            userId ? this.loadExtra(userId, f) : Promise.resolve(),
            this.refreshFreebies(f),
        ]);
        await this.wealth.waitLoading();
    }

    /**
     * Refresh the number of freebies and time to the next one
     */
    async refreshFreebies (f = fetch) {
        const data = await getFreebieBalance(f);
        this.freebies = data.freebies;
        this.freebieNext = data.seconds ? Date.now() + data.seconds * 1000 : null;
        // TODO calculate real time?
        this.timeToNextFreebie = data.freebies >= this.freebieLimit ? "" : "...";
    }

    /**
     * Are the current user and the passed one the same
     * @param userId - the user to check
     */
    isCurrentUser (userId: NM.User["id"] | Pick<NM.User, "id">) {
        return typeof userId === "number"
            ? this.user.id === userId
            : this.user.id === userId.id;
    }

    // FIXME accessible_features and permissions are only in NM.CurrentUser
    // /**
    //  * Is the user limited in the available features
    //  */
    // get areFeaturesGated () {
    //     if (!this.user) return false;
    //     return this.user.accessible_features.length > 0;
    // }

    // /**
    //  * Whether the user able to use the named feature
    //  * @param feature - name of the feature
    //  */
    // canDo (feature: NM.CurrentUser["accessible_features"][number]) {
    //     if (!this.user) return false;
    //     // if no limitations
    //     if (this.user.accessible_features.length === 0) return true;
    //     return this.user.accessible_features.includes(feature);
    // }

    // /**
    //  * Whether the user can perform the action
    //  */
    // hasPermission (permission: string) {
    //     return this.user?.permissions[permission] === true;
    // }
}

export type CurrentUserStores = ReturnType<typeof storefy<CurrentUser>>;

export default () => {
    const user = storefy(new CurrentUser());
    if (!browser) return user;

    // reset the list of the opened pack at midnight
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    let midnight = date.getTime();
    setTimeout(function reset () {
        user.freebieUsed.set({});
        // reset at the next midnight
        midnight += 86_400_000;
        setTimeout(reset, 86_400_000);
    }, midnight - Date.now());

    // TODO turn into lazy calculations
    setInterval(() => {
        user.timeToMidnight.set(timeTil(midnight));
        if (user.freebieNext()) {
            const time = timeTil(user.freebieNext);
            if (!time) user.refreshFreebies();
            user.timeToNextFreebie.set(time || "...");
        } else {
            user.timeToNextFreebie.set("");
        }
    }, 1000);

    return user;
};

/**
 * Wrapper that extracts `currentUser` from `$page` at the first demand.
 * This allows to use `currentUser` outside the Svelte files
 */
export const lazyCurrentUser = () => {
    let user: CurrentUserStores;
    return new Proxy({}, {
        get (_, prop) {
            if (!user) {
                user = get(page).data.currentUser;
            }
            return user[prop as keyof CurrentUser];
        },
    }) as Readonly<CurrentUserStores>;
};
