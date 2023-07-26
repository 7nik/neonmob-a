import type NM from "$lib/utils/NM Types";
import type { ID } from "$lib/utils/NM Types";

import { get } from "svelte/store";
import { browser } from "$app/environment";
import { page } from "$app/stores";
import { getCurrentUserData, getFreebieBalance } from "$api";
import { timeTil } from "$lib/utils/date";
import storefy from "$lib/utils/storefy";

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

    /**
     * Loads the authenticated user data
     */
    async loadUser (f = fetch) {
        const rawUser = await getCurrentUserData(f);
        this.carats = rawUser.carats;
        this.credits = rawUser.credits_balance;
        this.isAuthenticated = true;
        this.isProUser = Boolean(rawUser.pro_status);
        this.isVerified = rawUser.is_verified;
        this.freebieLimit = rawUser.get_freebie_limit;
        this.freebieUsed = rawUser.todays_freebies_count;
        this.level = rawUser.level;
        this.referralCode = rawUser.referral_code;
        this.referralUrl = rawUser.links.referral_url;
        this.user = {
            id: rawUser.id,
            first_name: rawUser.first_name,
            name: rawUser.name,
            username: rawUser.username,
            avatar: rawUser.avatar,
            link: rawUser.links.profile,
            pro_badge: rawUser.pro_badge,
            pro_status: rawUser?.pro_status,
            twitter_username: null,
            url: "/", // api endpoint
            bio: rawUser.bio,
            last_name: rawUser.last_name,
            links: rawUser.links,
            trader_score: rawUser.trader_score,
        };
        // to trigger re-running this method
        this.isCurrentUser = this.isCurrentUser;

        await this.refreshFreebies(f);
    }

    /**
     * Mark the current user as signed out
     */
    resetUser () {
        this.isAuthenticated = false;
        this.isProUser = false;
        this.user = {
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

        this.isCurrentUser = this.isCurrentUser;

        fetch("/signout?noredirect"); // erase the session cookie
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
