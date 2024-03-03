import type { rarityName, rarityCss, rarityNameLow } from "$lib/utils/NM Types";

// eslint-disable-next-line max-len
export const DIFFICULTY = ["Beginner", "Piece of Cake", "Very Easy", "Easy", "Moderate", "Hard", "Very Hard", "Near Impossible", "Quest!"] as const;
export const RARITY: {
    name: rarityName,
    nameLow: rarityNameLow,
    class: rarityCss,
    carats: number,
}[] = [
    {
        name: "Common",
        nameLow: "common",
        class: "common",
        carats: 100,
    }, {
        name: "Uncommon",
        nameLow: "uncommon",
        class: "uncommon",
        carats: 200,
    }, {
        name: "Rare",
        nameLow: "rare",
        class: "rare",
        carats: 300,
    }, {
        name: "Very Rare",
        nameLow: "very rare",
        class: "veryRare",
        carats: 400,
    }, {
        name: "Extra Rare",
        nameLow: "extra rare",
        class: "extraRare",
        carats: 500,
    }, {
        name: "Chase",
        nameLow: "chase",
        class: "chase",
        carats: 1000,
    }, {
        name: "Variant",
        nameLow: "variant",
        class: "variant",
        carats: 1000,
    }, {
        name: "Legendary",
        nameLow: "legendary",
        class: "legendary",
        carats: 1000,
    },
];

export default {
    defaultImageUrl: "/img/diamond_avatar.png",
    defaultAvatarUrl: "/img/default_avatar.png",
    // defaultAvatarUrl: "/img/avatar/default.png",
    animationAssets: "https://d1ld1je540hac5.cloudfront.net/assets/animations",
    "social_network.conversation": 189,
    "submissions.settconcept": 191,
    "art.sett": 13,
    SEGMENT_ANONYMOUS_TRACKING: false,
    SETT_STATUS_OPTIONS: {
        editing: 0,
        submitted: 1,
        published: 2,
    },
    PRO_USER_CHOICES: {
        normal: 0,
        pro: 1,
        cancelled: 2,
    },
    SUBSCRIPTION_STATUS: {
        UPCOMING: 0,
        ACTIVE: 1,
        CANCELLED: 2,
        ON_DUE: 3,
        EXPIRED: 4,
        ABORTED: 5,
        DISABLED: 6,
        RENEWING: 7,
        ON_HOLD: 11,
    },
    SUBSCRIPTION_BUNDLE_WEB: "Web",
    MAX_PREVIEW_PIECES: 4,
    SETT_TYPE_VALUES: {
        normal: 0,
        "promo-only": 1,
        reward: 2,
        amateur: 3,
    },
    VERSION_TYPES: {
        unlimited: 2,
        limited: 3,
    },
    PAYMENT_PROCESSORS: {
        gratis: "gratis",
        stripe: "stripe",
        paypal: "paypal",
    },
    WELCOME_SETT_ID: 99,
    GRAB_BAG_SETT_ID: 308,
    STANDARD_POLICIES: [
        {
            max_piece_count: 9, free_pack_size: 1, paid_pack_size: 1, max_daily_freebies: 1, tiers: { beginner: 4, intermediate: 6, advanced: 8 },
        },
        {
            max_piece_count: 12, free_pack_size: 1, paid_pack_size: 2, max_daily_freebies: 1, tiers: { beginner: 6, intermediate: 8, advanced: 10 },
        },
        {
            max_piece_count: 20, free_pack_size: 1, paid_pack_size: 2, max_daily_freebies: 2, tiers: { beginner: 6, intermediate: 8, advanced: 10 },
        },
        {
            max_piece_count: 40, free_pack_size: 2, paid_pack_size: 3, max_daily_freebies: 2, tiers: { beginner: 8, intermediate: 10, advanced: 12 },
        },
        {
            max_piece_count: 80, free_pack_size: 2, paid_pack_size: 3, max_daily_freebies: 2, tiers: { beginner: 8, intermediate: 10, advanced: 12 },
        },
        {
            max_piece_count: 100, free_pack_size: 2, paid_pack_size: 4, max_daily_freebies: 3, tiers: { beginner: 10, intermediate: 12, advanced: 14 },
        },
        {
            max_piece_count: 200, free_pack_size: 2, paid_pack_size: 4, max_daily_freebies: 3, tiers: { beginner: 10, intermediate: 12, advanced: 14 },
        },
        {
            max_piece_count: null, free_pack_size: 2, paid_pack_size: 4, max_daily_freebies: 3, tiers: { beginner: 10, intermediate: 12, advanced: 14 },
        },
    ],
    SETT_SIZES: {
        smallest: 9,
        smaller: 12,
        small: 20,
        medium_small: 40,
        medium_large: 80,
        large: 100,
        larger: 200,
        largest: 201,
    },
    SETT_FILTERS: {
        created: 0,
        "in-progress": 1,
        submitted: 2,
        published: 3,
    },
    SETT_LEDGER_TYPES: {
        piece_added: "piece_added",
        sett_created: "sett_created",
        modified: "modified",
    },
    TRADE_EXPIRE_HOURS: 48,
    SETT_VERSION_UNLIMITED: 2,
    SETT_VERSION_LIMITED: 3,
    BONUS_PACK_FREQUENCY: 0.14,
} as const;
