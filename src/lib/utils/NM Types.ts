/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-namespace */

// eslint-disable-next-line no-unused-vars
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

export type fullURL = `https://${string}` | `//${string}`;
export type absoluteURL = `/${string}`;
export type queryURL = `?${string}`;
export type timestamp = string;

// eslint-disable-next-line max-len
export type rarityName = "Common" | "Uncommon" | "Rare" | "Very Rare" | "Extra Rare" | "Chase" | "Variant" | "Legendary";
export type rarityNameLow = Lowercase<rarityName>;
// eslint-disable-next-line max-len
export type rarityCss = "common" | "uncommon" | "rare" | "veryRare" | "extraRare" | "chase" | "variant" | "legendary";
export type rarityNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

// eslint-disable-next-line max-len
export type difficultyName = "Beginner" | "Piece of Cake" | "Very Easy" | "Easy" | "Moderate" | "Hard" | "Very Hard" | "Near Impossible" | "Quest!";
export type difficultyCss = `difficulty-${difficultyNumber}`;
export type difficultyNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type ID<N extends Lowercase<string>> = number & { name?: N };

/**
 * Pro status:
 * 0 - non-pro,
 * 1 - pro,
 * 2 - ex-pro.
 */
export type ProStatus = 0 | 1 | 2;

/**
 * Sett version:
 * 1 - old limited,
 * 2 - unlimited,
 * 3 - new limited.
 */
export type SettVersion = 1 | 2 | 3;
/**
 * Sett type:
 * 0 - normal,
 * 1 - promo-only,
 * 2 - reward,
 * 3 - amateur.
 */
export type SettType = 0 | 1 | 2 | 3;

// declare global {
//     var NM: {
//         ajaxError: Function,
//         ajaxGlobalError: Function,
//         cache: Function,
//         error: Function,
//         extractPartials: Function,
//         forms: Record<string, Function>,
//         logged_in: boolean,
//         modules: Record<string, Function>,
//         render: Function,
//         settings: {
//             cdn_base_url: string,
//         },
//         you: {
//             attributes: CurrentUser,
//             callbacks: {
//                 save: Function[],
//             },
//             changes: Record<string, unknown>,
//             errors: object,
//             uid: string,
//         }
//     };
// }

declare namespace NM {

    type Activity<Type extends string, Data extends object> = {
        /**
         * x time ago
         */
        created: string,
        detail_url: fullURL,
        type: Type,
    } & Data;

    type ActivityAny =
        ActivityBadge
        | ActivityPack
        | ActivitySett
        | ActivitySubmission
        | ActivityTrade;

    type ActivityBadge = Activity<"badge-earned", {
        description: string,
        image_url: fullURL,
        name: string,
        // presented if it's a series milestone
        sett_id?: ID<"sett">,
        sett_name?: string,
        user: {
            avatar_url: fullURL,
            full_name: string,
            id: ID<"user">,
            profile_url: absoluteURL,
        },
    }>;

    type ActivityPack = Activity<"pack-opened", {
        num_prints: number,
        rarest_piece: {
            id: ID<"card">,
            name: string,
            rarity: rarityCss,
            asset_type: "image"|"video", // for what ???
            width: number,
            height: number,
            owned_image_url: fullURL,
            not_owned_image_url: fullURL,
        },
        user: ActivityBadge["user"],
    }>;

    type ActivitySett = Activity<"sett-published", {
        background_image_url: fullURL, // large_blur
        cover_image_url: fullURL, // large
        height: number,
        width: number,
        name: string,
        preview_pieces_urls: fullURL[],
        user: ActivityBadge["user"],
    }>;

    type ActivitySubmission = Activity<"submission-created", {
        caption: string,
        image_url: fullURL,
        media_type: "image"|"video", // for what ???
        user: ActivityBadge["user"],
    }>;

    type ActivityTrade = Activity<"trade-completed", {
        bidder: ActivityBadge["user"] & {
            amt_items: 1|2|3|4|5,
            rarest_piece: ActivityPack["rarest_piece"],
        },
        responder: ActivityTrade["bidder"],
    }>;

    type ActivityStoryPack = {
        /**
         * Total number of opened cards
         */
        row_count: number,
        user: {
            id: ID<"user">,
            username: string,
            full_name: string,
            avatar_url: fullURL,
            profile_url: fullURL,
        },
        sett: {
            id: ID<"sett">,
            name: string,
            detail_url: fullURL,
        },
        // array but always contains only one items
        packs: {
            pack_id: number,
            acquired: string, // X time ago
            sizing: "normal"|"bonus"|"special",
            share_url: fullURL,
            rarest_piece: {
                asset_type: "image"|"video",
                large_image: Image,
                large_video?: Video,
                name: string,
                piece_id: ID<"card">,
                rarity: rarityCss,
            },
            // excluding the rarest
            pieces: {
                asset_type: "image"|"video",
                small_image: Image,
                small_video?: Video,
                name: string,
                piece_id: ID<"card">,
                rarity: rarityCss,
            }[],
        }[],
    }

    type ActivityStoryTrade = {
        completed: string, // X time ago
        share_url: fullURL,
        bidder: {
            // it includes "item_type":"piece" but I think it can be ignored
            rarest_piece: ActivityStoryPack["packs"][number]["rarest_piece"],
            amt_items: number,
            items: ActivityStoryPack["packs"][number]["pieces"],
            user: ActivityStoryPack["user"],
        },
        responder: ActivityStoryTrade["bidder"],
    }

    type BadgeRarity = {
        name: string,
        badge: number,
        achieved: boolean,
        rarity: rarityCss | "all_core_pieces",
        metrics: {
            total: number,
            owned: number,
            name: rarityNameLow | "Total",
            css_class: rarityCss | "all_core_pieces"
        },
        is_special: boolean,
        rewards: number,
    }

    type BadgeEarned = {
        id: string | null,
        user_badge_id: number,
        badge: number,
        name: string,
        description: string,
        image_url: fullURL,
        noun: string,
        public_url: fullURL,
        sett: {
            id: number,
            name: string,
            public_url: absoluteURL,
            status: number
        },
        verb_phrase: string,
        type: string,
        achieved: boolean,
        rank_details: {
            rank: number,
            completion_order: number,
            duration: string,
            completion_time: string
        },
        metrics: null,
        carats: number,
        rarity: string,
        carats_multiplier: number
    }

    type BadgeNotification = Notification<{
        type: "badge-obtained",
    }, "badge", "hit">

    type Card = {
        id: ID<"card">,
        name: string,
        is_replica: boolean,
        version: SettVersion,
        asset_type: "image" | "video",
        rarity: {
            name: rarityNameLow,
            class: rarityCss,
            value: rarityNumber,
            carats: number
        },
        piece_assets: {
            image: {
                small: Image,
                "small-gray": Image,
                medium: Image,
                "medium-gray": Image
            },
            video?: {
                medium: Video
            }
        },
        own_count: number,
        favorite: boolean,
    }

    type CardName =  {
        id: ID<"card">,
        name: string,
        rarity: {
            name: rarityName,
            class: rarityCss,
            rarity: rarityNumber,
            carats: number,
        },
        api_url: absoluteURL,
        public_url: fullURL,
    }

    type Category = {
        collect_url: absoluteURL, // HTML
        description: string,
        id: ID<"category">,
        legacy_setts_url: absoluteURL, // old api
        name: string,
        name_slug: string,
        setts_url: absoluteURL,
    }

    type ComingSoonNotification = Notification<{
        noun: "Series-remainder",
        type: "Series-remainder",
        name_slug: string,
    }, "coming-soon", "coming-soon">

    type ConversationInfo = MessageNotification["object"];

    type Creator = {
        banner_url: fullURL | "",
        creator_bio: string,
        deviant_art_url: fullURL | "",
        behance_url: fullURL | "",
        instagram_url: fullURL | "",
        facebook_url: fullURL | "",
        dribbble_url: fullURL | "",
        etsy_url: fullURL | "",
        twitter_url: fullURL | "",
        tumblr_url: fullURL | "",
        /**
         * whether creator page is the default one
         */
        default_profile: boolean,
        url: absoluteURL, // api
        name: string,
        tier_url: absoluteURL,
        tier: string,
        username: string,
        paypal_email_address: string | null,
    }

    type CurrentUser = Omit<NM.User, "name"|"first_name"|"last_name"> & {
        timezone_offset: number,
        original_timezone_offset: number,
        email: string,
        /* series id - number of used freebies */
        todays_freebies_count: Record<ID<"sett">, number>,
        referral_code: string,
        num_pieces_to_redeem: number,
        has_rewards: boolean,
        /**
         * credits
         */
        balance: number,
        carats: number,
        /**
         * currently available freebies?
         */
        num_daily_freebies: number,
        /**
         * used freebies today
         */
        pack_freebies_today: number,
        /**
         * currently available freebies
         */
        num_freebies_left: number,
        /**
         * the maximal number of freebies
         */
        get_freebie_limit: number,
        connected_accounts: {},
        is_creator: boolean,
        pro_status: ProStatus,
        pro_badge: "svg-pro-icon" | null,
        pro_subscription_enabled: boolean,
        is_staff: boolean, // staff != ambassador
        /**
         * EX - how getting next level
         */
        points: number,
        level: UserLevel,
        is_verified: boolean,
        vacation_mode: boolean,
        permissions: Record<string, boolean>,
        accessible_features: ("trade"|"favorite"|"friends"|"display_case")[],
        new_user_nav_variant: boolean,
        carats_per_free_pack: number
    }

    type DisplayCard = {
        id: ID<"card">,
        owner_id: ID<"user">,
        selection_mode: "user-selected"|"randomly-chosen",
        sett_id: ID<"sett">,
        sett_url: absoluteURL,
        asset_type: "image"|"video",
        is_replica: boolean,
        version: SettVersion,
        piece_assets: {
            image: {
                large: Image,
            },
            video?: {
                large: Video,
            }
        }
    }

    type FriendNotification = Notification<{
        noun: "friend",
        type: "friend",
    }, "friend", "added"/* more verbs? */>

    type Error = {
        detail: string,
    }

    type Image = {
        width: number,
        height: number,
        url: fullURL
    }

    /**
     * A message in a conversation
     */
    type Message = {
        id: ID<"message">, // msg id
        user_id: number,
        comment: string,
        created: timestamp,
        modified: timestamp,
        attachment?: Pick<Trade, "id"|"bidder_offer"|"responder_offer"|"state"> & {
            type: "trade",
            active: boolean,
            bidder_id: number,
            responder_id: number,
            url: queryURL,
        },
    }

    /**
     * A conversation preview (the last message)
     * The message is in `actor.actor_action`
     */
    type MessageNotification = Notification<{
        notification_type: "messages",
        noun: "Conversation",
        type: "conversation",
        users: UserCollocutor[],
    }, "comment", "commented on">

    type Milestone = {
        name: string,
        sett: Pick<Sett, "id"|"name"|"creator"|"difficulty"|"public_url"|"sett_assets">,
        reward: number,
        css_class: rarityCss,
        image: fullURL,
        owned: number,
        total: number,
        discontinue_date?: timestamp,
        completed_date?: timestamp,
    };

    type Notification<Data extends object, Verb extends string, Phrase extends string> = {
        id: string, // event id
        read: boolean,
        verb: Verb,
        verb_phrase: Phrase,
        actor: {
            action_data?: string|null,
            avatar: { small: fullURL, large: fullURL },
            first_name: string,
            id: ID<"user">,
            name: string,
            time: timestamp,
            username: string,
        },
        object: Omit<{
            id: number,
            notification_type: string|null,
            noun: string,
            type: string,
            images: fullURL[],
            images_class?: string | null,
            url?: absoluteURL,
            users: UserMinimal[],
        }, keyof Data> & Data,
    }

    /**
     * for /api/pieces/ - Cards section on the profile page
     */
    type OwnedCard = Omit<Card, "rarity"> & {
        description: string,
        is_limited_sett: boolean,
        num_prints_total: number | "unlimited",
        piece_assets: {
            image: {
                "large-promo": Image,
                "xlarge-gray": Image,
                xlarge: Image,
                "large-gray": Image,
                large: Image,
                "medium-gray": Image,
                medium: Image,
                "small-gray": Image,
                small: Image,
                original: Image
            },
            video?: {
                medium: Video,
                large: Video,
                original: Video
            }
        },
        public_url: fullURL,
        rarity: {
            name: rarityName,
            class: rarityCss,
            rarity: rarityNumber,
            /**
             * discard reward
             */
            carats: number,
        },
        sett_id: ID<"sett">,
        sett_name: string,
    }

    type Pack = {
        id: ID<"pack">,
        default_pack_size: number,
        bonus_type: string,
        bonus_pieces: number,
        prints: Print & {
            is_new: boolean,
            creator_twitter_username: null | string,
            discarded: boolean,
            favorite: boolean,
        }[],
        profile_collection_url: string,
        badges: [],
        rewards: {
            total_carats: number,
            level_ups?: [],
        },
    }

    type PackTier = {
        name: string,
        /**
         * number of cards
         */
        pack_size: number,
        price: number,
        /**
         * #color of bg
         */
        tint: string,
        /**
         * packs aren't sold out yet
         */
        is_available: boolean,
        is_pro_tier?: boolean,
        visibility_of_pro_tiers?: "all"
        /**
         * does user have enough currency
         */
        can_user_open: true,
        /**
         * total packs according to the distribution, -1 for infinity
         */
        count: number | -1,
        /**
         * packs left according to the distribution, -1 for infinity
         */
        available: number | -1,
        sold_out: boolean,
        currency: "freebie" | "credit" | "carat",
        distribution: "replenishing" | "fixed" | "constant",
        partials: {
            name: rarityNameLow,
            css_class: rarityCss,
            guaranteed: boolean,
            percent: string,
            /**
             * number of cards of this rarity
             */
            total: number,
        }[],
        any_guaranteed: boolean,
        freebies_remaining?: number,
        freebies_discontinued?: timestamp | null,
        open_pack_url: absoluteURL,
        art_override?: boolean,
        banner?: {
            active: boolean,
        },
        cdn_cover_image?: fullURL | null,
    }

    type Paginated<T> = {
        count: number,
        next: fullURL | null,
        previous: fullURL | null,
        results: T[],
    }

    type Print = Omit<OwnedCard, "own_count"|"favorite"> & {
        sett_name_slug: string,
        /**
         * Global print id
         */
        print_id: ID<"print">,
        /**
         * In-series print number
         */
        print_num: number,
        prints_part_of_trade: {
            print_id: ID<"print">,
            bidder_trades: number,
            responder_trades: number
        }[]
    }

    /**
     * [cardId, cardAmount]
     */
    type PrintCount = [ID<"card">, number]

    type PrintInTrade = Omit<Print,
        "sett_name_slug"|"public_url"|"is_replica"|"version"|"prints_part_of_trade"
    > & {
        /**
         * Available only when part of Trade type
         */
        own_counts?: {
            bidder: number,
            responder: number
        }
    }

    /**
     * Series completion reward
     */
    type Reward = {
        sett: Pick<Sett, "id" | "name" | "creator" | "difficulty" | "public_url" | "sett_assets">,
        rank: number,
        completion_order: number,
        duration: string,
        completion_time: string,
        carats: number,
        difficulty_bonus: number,
        pro_bonus: number,
        total: number
    }

    type Sett = {
        id: ID<"sett">,
        name: string,
        name_slug: string,
        creator: Omit<UserFriend, "url">,
        description: string,
        percent_sold_out: number,
        free_packs_claimed_percent: number,
        sett_assets: {
            small: Image,
            medium: Image,
            large: Image,
            "large-blur": Image,
            original: Image
        },
        released: timestamp,
        published: timestamp,
        /**
         * Number of daily freebies available for the current user.
         * Different roles may have various number
         */
        daily_freebies: number,
        permalink: absoluteURL,
        links: {
            self: absoluteURL,
            pieces: absoluteURL,
            permalink: absoluteURL,
            piece_names: absoluteURL,
            "api-pack": absoluteURL
        },
        /**
         * Probably price of the Paid pack for old limited series where
         * were only to tiers: Free and Paid.
         * Now moved to `/api/pack-tiers/?sett_id=`
         */
        price: number|null,
        preview_0: fullURL|null,
        preview_1: fullURL|null,
        preview_2: fullURL|null,
        preview_3: fullURL|null,
        sett_type: SettType,
        core_stats: {
            rarity: 0|1|2|3|4,
            name: "common"|"uncommon"|"rare"|"very rare"|"extra rare",
            class_name: "common"|"uncommon"|"rare"|"veryRare"|"extraRare",
            total: number,
            owned: number,
            total_prints?: number
        }[]
        special_stats: {
            rarity: 5|6|7,
            name: "chase"|"variant"|"legendary",
            class_name: "chase"|"variant"|"legendary",
            total: number,
            owned: number,
            total_prints?: number
        }[]
        /**
         * Moved to `/api/pack-tiers/?sett_id=`
         */
        free_packs_available: boolean,
        /**
         * Moved to `/api/pack-tiers/?sett_id=`
         */
        packs_available: boolean,
        total_print_count: number | -1,
        /**
         * Seems to be shortening for check via `.version`
         * Is used only in the header of series page
         */
        edition_size: "limited" | "unlimited",
        discontinued: null | timestamp,
        discontinue_date: timestamp,
        /**
         * Moved to `/api/pack-tiers/?sett_id=`
         */
        prints_per_free_pack: number,
        /**
         * Moved to `/api/pack-tiers/?sett_id=`
         */
        prints_per_paid_pack: number,
        freebies_discontinued: null | timestamp,
        /**
         * Most setts are exclusive.
         * Seems it was used in the header of series page.
         * Maybe something internal
         */
        exclusivity: 0|1,
        /**
         * Dunno, seems it was used in the header of series page
         */
        limited_release: boolean,
        public_url: fullURL,
        categories: Category[],
        version: SettVersion,
        favorite: boolean,
        /**
         * Not used
         */
        base_completed: boolean,
        difficulty: {
            id: Exclude<difficultyNumber, 0> | 9,
            name: difficultyName,
            class_name: difficultyCss,
            level: difficultyNumber
        },
        replica_parent: null|number,
        notify: boolean
    }

    type SettMetrics = Pick<Sett,
        "id"|"name"|"name_slug"|"version"|"preview_0"|"preview_1"|"replica_parent"
    >& {
        name_slug_regexed: string,
        status: "published",
        core_piece_count: number,
        chase_piece_count: number,
        variant_piece_count: number,
        legendary_piece_count: number,
        background_image: fullURL,
        cover_image: fullURL,
        /**
         * timestamp
         */
        pack_last_acquired: number,
        links: {
            permalink: fullURL
        },
        creator: {
            user_id: ID<"user">,
            username: string,
            name: string,
        },
        sett_assets: {
            medium: {
                url: fullURL
            }
        },
        owned_metrics: {
            owned_core_piece_count: number,
            owned_chase_piece_count: number,
            owned_variant_piece_count: number,
            owned_legendary_piece_count: number
        }
    }

    type SettMilestones = {
        rank: number | null,
        completion_order: number | null,
        completion_time: string,
        milestones: {
            base: { name: string, image: fullURL },
            core: { name: string, image: fullURL }[],
            special: { name: string, image: fullURL }[],
        },
        sett: Pick<Sett, "creator"|"difficulty"|"id"|"name"|"public_url"|"sett_assets">,
    }

    type Submission = {
        id: ID<"submission">,
        caption: string,
        detail_url: fullURL,
        comment_count: number,
        enable_comments: boolean,
        likes: {
            total: number,
            url: null,
            liked: boolean,
        },
        user: Omit<UserFriend, "url">,
        sett: null | {
            id: ID<"sett">,
            name: string,
            public_url: absoluteURL,
            /**
             * 0 - editing, 1 - submitted, 2 - published
             */
            status: 0|1|2,
        },

        created: timestamp,
        approved: timestamp | null,
        disqualified: timestamp | null,
        last_liked: timestamp | null,

        /**
         * 0 - image, 1 - video
         */
        media_type: 0|1,
        media_type_string: "image"|"video",
        mime_type: string,
        /* medium size */
        image_url: fullURL,
        large_blur: fullURL,
        large_url: fullURL,
        medium_url: fullURL,
        original_url: fullURL,

        /* poster for video */
        poster: fullURL | null,
        /* medium sized video */
        sources: Video["sources"] | null,
        webm_medium_video_url: fullURL | null,
        /* large sized video */
        hires_sources: Video["sources"] | null,
        webm_large_video_url: fullURL | null,

        // apis
        approve_url: absoluteURL,
        comment_admin_url: absoluteURL,
        disqualify_url: absoluteURL,
        flag_url: absoluteURL,
        /* api endpoint */
        url: absoluteURL,
    }

    type Trade = {
        id: ID<"trade">,
        bidder: User,
        responder: User,
        bidder_offer: {
            prints: PrintInTrade[],
            packs: never[],
        },
        responder_offer: {
            prints: PrintInTrade[],
            packs: never[],
        },
        parent_id: ID<"trade"> | null,
        completed: timestamp | null,
        created: timestamp,
        // eslint-disable-next-line max-len
        state: "proposed" | "modified" | "countered" | "accepted" | "auto-withdrew" | "auto-declined" | "declined" | "expired",
        expire_date: timestamp,
        badges: BadgeEarned[],
        completed_on: timestamp | null,
        timestamp: timestamp, // time of creation?
        rewards?: Reward[],
        total_carats?: number,
        level_ups?: UserLevelUp[],
    }

    /**
     * Return at trade creating
     */
    type TradeResult = {
        id: ID<"trade">,
        bidder: User,
        responder: User,
        bidder_items: {
            id: number, // ID of proposed item???
            created: timestamp,
            modified: null,
            owner: number,
            pack: null,
            prnt: number,
            trade: number,
        }[],
        responder_items: {
            id: number, // ID of proposed item???
            created: timestamp,
            modified: null,
            owner: number,
            pack: null,
            prnt: number,
            trade: number,
        }[],
        completed: null | timestamp,
        completed_action: null | string, // ??
        completed_by: null | number, // ??
        created: timestamp,
        is_bot_trade: boolean,
        level_ups: UserLevelUp[],
        modified: null,
        parent: null,
    }

    type TradeNotification = Notification<{
        type: "trade-event",
        noun: "trade",
        expires_on: timestamp,
        completed: timestamp | null,
        url: queryURL,
    }, "traded", Trade["state"]>

    type Video = {
        width: number,
        height: number,
        sources: {
            mime_type: "video/webm" | "video/mp4" | "image/gif",
            url: fullURL
        }[]
    }

    type User = {
        id: ID<"user">,
        name: string,
        first_name: string,
        last_name: string,
        username: string,
        avatar: {
            small: fullURL,
            large: fullURL
        },
        links: {
            self: absoluteURL,
            print_counts: fullURL,
            display_case: fullURL,
            display_case_save: absoluteURL,
            collected_setts_names_only: fullURL,
            referral_url: absoluteURL,
            profile: absoluteURL,
            signup_sett_url?: absoluteURL,
        },
        bio: string,
        trader_score: number
    }

    type UserCollocutor = Omit<NM.User, "last_name"> & {
        pro_badge: string|null,
        pro_status: ProStatus,
    }

    /**
     * /data/user_info.json/?user_id=$USER_ID$
     */
    type UserData = NM.User & Pick<NM.CurrentUser,
        "timezone_offset"|"original_timezone_offset"|"pro_status"|"pro_badge"|
        "vacation_mode"|"is_creator"|"is_staff"|"is_verified"|"connected_accounts"
    > & {
        link: absoluteURL,
        tranche: "alpha"| "beta", // ???
        is_ambassador: boolean,
        is_newbie: boolean,
        total_freebie: number,
        new_freebie_time: timestamp,
        twitter_username: string|null,
        num_prints: number,
        num_favorites: number,
        // credits_balance: number,
    }

    type UserDifficultyStat = {
        completed: number,
        icon: string,
        name: string,
        stats: UserStatItem[],
    }

    /**
     * /api/users/$USER_ID$/
     */
    type UserInfo = Omit<UserData, "timezone_offset"|"tranche"|"total_freebie"|
            "new_freebie_time"|"twitter_username">
        & Pick<CurrentUser, "points"|"level">
        & {
            has_released_sett: boolean,
            new_user_nav_variant: boolean,
            streaks: {
                best_streak: number,
                current_streak: number,
            },
            previous_trader_score: number,
    }

    type UserFriend = Pick<User, "id"|"username"|"name"|"first_name"|"avatar" > & {
        link: absoluteURL,
        twitter_username: null | string,
        pro_status: ProStatus,
        pro_badge: null | string,
        /**
         * api endpoint
         */
        url: absoluteURL,
    }

    type UserMinimal = Pick<User, "id"|"name"|"first_name"|"username">

    type UserLevel = {
        name: string,
        title: number,
        level: number,
        copy: string,
        next_level_points: number,
        points_required: number,
        icon_type: number,
        icon_color: string, // #color
        web_icon_selector: string,
        app_icon_selector: string,
        gradient_color: string, // #color
        /**
         * 0-99
         */
        current_progress: number,
        previous_level_name: string
    }

    type UserLevelUp = UserLevel & {
        carats: number,
        pro_bonus: number,
        total_carats: number,
        new_features: {
            title: string,
            description: string,
            "icon-class": string,
            "bg-class": string,
        }[],
        levelup_tip: XOR<{}, {
            tip: string,
            iconClasses: Record<string, string>,
        }>,
    }

    type UserRarityStat = {
        count: number,
        css_class: rarityCss | "all_core_pieces",
        image_url: fullURL,
        name: string,
    }

    type UserRarityStats = {
        base: UserRarityStat & { total: number },
        core: UserRarityStat[],
        special: UserRarityStat[],
    }

    type UserStatItem = {
        app_icon_selector: string,
        name: string,
        /**
         * number has comma-separated powers
         */
        value: string,
        web_icon_selector: string,
    };

    type UserStats = [
        { name: string, stats: UserStatItem[] },
        { name: string, stats: UserStatItem[] },
        { name: string, stats: UserStatItem[] },
        { name: string, stats: UserStatItem[] },
        { fav_pieces_count: number, fav_setts_count: number },
    ];

    namespace Unmerged {
        type Container<Data extends object> = {
            deferreds: {},
            payload: Data,
            // some of payload's fields are kept in the refs
            refs: Record<string, object>,
        }

        type Card = {
            id: ID<"card">,
            name: string,
            name_slug: string,
            description: string,
            rarity: Rarity,
            asset_type: "image" | "video",
            piece_assets: OwnedCard["piece_assets"],
            public_url: fullURL,
            num_prints_total: number | "unlimited",
            set: Sett,
            odds: {/* no matter */},
            tags: {},
            variant_parent_id: null,
        }

        type FavoriteCards = {
            results: {
                id: ID<"card">,
                name: string,
                favorite: boolean,
                is_replica: boolean,
                piece_assets: OwnedCard["piece_assets"],
                rarity: OwnedCard["rarity"],
                sett: Pick<NM.Sett, "id"|"name"|"difficulty"|"links"|"sett_assets"> & {
                    creator: UserMinimal,
                },
                version: SettVersion,
            }[],
            target: UserLong,
            viewer: UserLong,
        }

        type FavoriteSetts = {
            results: (Pick<NM.Sett, "id"|"name"|"difficulty"|"favorite"|"links"|"sett_assets" > & {
                creator: UserMinimal,
            })[],
            target: UserLong,
            viewer: UserLong,
        }

        type Prints = Omit<Card, "name_slug"|"odds"|"tags"|"variant_parent_id"> & {
            absolute_url: absoluteURL,
            favorite: boolean,
            is_replica: boolean,
            version: SettVersion,
            prints_part_of_trade: {
                print_id: ID<"print">,
                bidder_trades: number,
                responder_trades: number
            }[]
            prints: {
                id: ID<"print">,
                print_num: number,
                public_url: fullURL,
            }[],
        }

        type Rarity = {
            carats: number,
            class: rarityCss,
            image: fullURL,
            name: rarityName,
        }

        // eslint-disable-next-line no-shadow
        type Sett = {
            creator: UserShort,
            discontinued: timestamp | null,
            id: ID<"sett">,
            links: NM.Sett["links"],
            name: string,
            price: number | null,
            released: timestamp,
            sett_type: SettType
        }

        type UserLong = User & {
            timezone_offset: number,
            link: absoluteURL,
            vacation_mode: boolean,
            is_ambassador: boolean,
            is_creator: boolean,
            is_newbie: boolean,
            is_active: boolean,
            pro_status: ProStatus,
            is_staff: boolean,
            twitter_username: null | string,
            connected_accounts: Record<
                string,
                {provider:string, name:string|null, username:string|null}
            >,
            is_verified: boolean,
            num_prints: number,
            num_favorites: number,
            tranche: string,
        }

        type UserShort = {
            id: ID<"user">,
            link: absoluteURL,
            name: string,
            twitter_username: string | null,
        }
    }
}

export default NM;
