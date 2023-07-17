/* eslint-disable unicorn/numeric-separators-style */
import type NM from "$lib/utils/NM Types";
import type { Writable } from "svelte/store";

import { writable } from "svelte/store";

// import { getInitValue } from "./init";

// const user = await getInitValue("user");
const userRaw: NM.CurrentUser = {
    id: 227240,
    timezone_offset: -180,
    original_timezone_offset: -120,
    email: "kfiiranet@gmail.com",
    todays_freebies_count: {},
    referral_code: "yHDVn",
    num_pieces_to_redeem: 0,
    has_rewards: false,
    balance: 0,
    carats: 9280115,
    num_daily_freebies: 1,
    pack_freebies_today: 25,
    num_freebies_left: 1,
    get_freebie_limit: 12,
    connected_accounts: {},
    is_creator: false,
    pro_status: 1,
    pro_badge: "svg-pro-icon",
    pro_subscription_enabled: true,
    is_staff: false,
    avatar: {
        // eslint-disable-next-line max-len
        small: "//d1ld1je540hac5.cloudfront.net/profile/avatars/e9/024d000a0011e8a86bd34f0b1dd3a3/small.jpg",
        // eslint-disable-next-line max-len
        large: "//d1ld1je540hac5.cloudfront.net/profile/avatars/e9/024d000a0011e8a86bd34f0b1dd3a3/large.jpg",
    },
    points: 52004,
    level: {
        name: "Maniac",
        title: 20,
        level: 60,
        copy: "Your growing collection and experience have leveled you up!",
        next_level_points: 2300,
        points_required: 53750,
        icon_type: 3,
        icon_color: "#E82C8E",
        web_icon_selector: "icon-im-8-point-star-3",
        app_icon_selector: "8-point-star-3",
        gradient_color: "#E89300",
        current_progress: 24,
        previous_level_name: "Maniac",
    },
    username: "7nik",
    links: {
        self: "/data/user_info.json/?user_id=227240",
        print_counts: "https://napi.neonmob.com/user/227240/print-counts",
        display_case: "https://napi.neonmob.com/user/227240/display-case",
        display_case_save: "/api/users/227240/display-case/",
        collected_setts_names_only: "https://napi.neonmob.com/user/227240/owned-setts-metrics",
        referral_url: "/r/yHDVn",
        profile: "/7nik",
        signup_sett_url: "/api/setts/16426/",
    },
    is_verified: true,
    vacation_mode: false,
    permissions: {
        "art.change_sett": true,
        "art.add_amateur_sett": true,
    },
    accessible_features: [],
    new_user_nav_variant: false,
    // eslint-disable-next-line max-len
    bio: "Counter my trades if you want something another :)\nAll dupes are for trading or swapping.\nI prefer to get a card I have than a card from a series I do not collect.\n\nLooking for all the cards I miss in the following series:\nCodex Fungi\nCUPCAKES\nDark Forest Tour\nDFT: The Secret Pond\nEnchanted Weapons\nFruigetable Fairies\nGIRLS\nQueens #1 by Althéa Pray\nRed Lips\nSleep tight\nThe Creatives\nThis Thing\nVincent & Alice \n\nand especially for the following last cards I need:\nNanobot V00 Prototype 2015 12 15 8 17 5 from Nanobot\nSolarisa from The Gumpies\nUnfolding II from The Feminine Divine - Series I\nSwing of Dreams from Pretty Floral Fantasy\n \nI collect all the series I've started.\n\nIf you want to trade with me, just use filters on series\" and \"cards which I don't have\". Do it fairly and then, very likely, I will accept the trade. Note that I do not accept offers with cards from series I do not collect. But occasionally, I accept offers with cards I already have. In general, I'm ok about swapping singles from unfinished series.",
    trader_score: 13,
    carats_per_free_pack: 10000,
};

class CurrentUser {
    private user: NM.CurrentUser | null;
    private store: Writable<Omit<CurrentUser, "subscribe">> = writable(this);
    private gonnaUpdate = false;

    constructor (user: NM.CurrentUser | null) {
        this.user = user;
    }

    private update () {
        if (!this.user) return;
        if (this.gonnaUpdate) return;
        this.gonnaUpdate = true;
        setTimeout(() => {
            this.store.set(this);
            this.gonnaUpdate = false;
        }, 10);
    }

    get subscribe () {
        return this.store.subscribe;
    }

    /**
     * Is the user limited in the available features
     */
    get areFeaturesGated () {
        if (!this.user) return false;
        return this.user.accessible_features.length > 0;
    }

    /**
     * Whether the user able to use the named feature
     * @param feature - name of the feature
     */
    canDo (feature: NM.CurrentUser["accessible_features"][number]) {
        if (!this.user) return false;
        // if no limitations
        if (this.user.accessible_features.length === 0) return true;
        return this.user.accessible_features.includes(feature);
    }

    /**
     * Number of carats the user has
     */
    get carats () { return this.user?.carats ?? 0; }
    set carats (value: number) {
        if (!this.user) return;
        this.user.carats = value;
        this.update();
    }

    /**
     * Number of credits the user has
     */
    get credits () { return this.user?.balance ?? 0; }
    set credits (value: number) {
        if (!this.user) return;
        this.user.balance = value;
        this.update();
    }

    get id () { return this.user?.id ?? 0; }

    /**
     * Are the current user and the passed one the same
     * @param user - the user to check
     */
    is (user: Pick<NM.User, "id">) { return this.user?.id === user.id; }

    /**
     * The user is logged in
     */
    get isAuthenticated () { return this.user !== null; }

    /**
     * The user has Pro subscription
     */
    get isProUser () { return Boolean(this.user?.pro_status); }

    /**
     * The user has verified his email
     */
    get isVerified () { return this.user?.is_verified === true; }

    /**
     * Number of freebies the user has
     */
    get freebies () { return this.user?.num_freebies_left ?? 0; }

    /**
     * Maximum number of accumulated freebies the user can has
     */
    get freebieLimit () { return this.user?.get_freebie_limit ?? 0; }

    /**
     * Number of freebies the user spent on the particular series
     * @param _settId - the target series
     * @returns number of freebies used today
     */
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    freebiesUsed (_settId: number) {
        return 0;
    }

    /**
     * Whether the user can perform the action
     */
    hasPermission (permission: string) {
        return this.user?.permissions[permission] === true;
    }

    /**
     * The user level's data
     */
    get level () { return this.user!.level; }
    set level (level: NM.UserLevel) {
        if (!this.user) return;
        this.user.level = level;
        this.update();
    }

    get referralCode () {
        return this.user?.referral_code ?? "";
    }

    get referralUrl () {
        return this.user?.links.referral_url ?? "/";
    }

    get you () {
        return {
            id: this.user?.id ?? 0,
            first_name: "You",
            name: "You",
            username: "you",
            avatar: this.user?.avatar,
            link: this.user?.links.profile,
            pro_badge: this.user?.pro_badge,
            pro_status: this.user?.pro_status,
            twitter_username: null,
            url: "/",
            bio: this.user?.bio ?? "",
            last_name: "",
            links: this.user?.links ?? {},
            trader_score: this.user?.trader_score ?? 7,
        } as NM.UserFriend & NM.User;
    }

    get username () {
        return this.user?.username ?? "";
    }
}

// export default new CurrentUser(userRaw);
export default new CurrentUser(null);
