import type { fullURL, ID, ProStatus } from "$lib/utils/NM Types";
import type NMA from "$lib/utils/NMA Types";

import { db } from "./db.server";
import { convertAvatar, convertBanner, getFullName } from "./utils";

const stmtGetCreator = db.prepare<number>(`
    SELECT user.id, user.first_name, user.last_name, user.username, user.bio,
        user.trader_score, user.avatar_small, user.avatar_large, user.pro_status,
        creator.default_profile, creator.bio, creator.banner, creator.deviant_art,
        creator.behance, creator.instagram, creator.facebook,creator.dribble,
        creator.etsy, creator.twitter, creator.tumbler
    FROM user JOIN creator ON user.id = creator.id
    WHERE user.id = ?
`).expand();

type RawCreator = {
    user: {
        id: ID<"user">,
        first_name: string,
        last_name: string,
        username: string,
        bio: string,
        trader_score: number,
        avatar_small: string|null,
        avatar_large: string|null,
        pro_status: ProStatus,
    },
    creator: {
        default_profile: boolean,
        bio: string,
        banner: string,
        deviant_art: string,
        behance: string,
        instagram: string,
        facebook: string,
        dribble: string,
        etsy: string,
        twitter: string,
        tumbler: string,
    },
}

export function getCreator (uid: ID<"user">): NMA.Creator|null {
    const raw: RawCreator = stmtGetCreator.get(uid);
    if (!raw) return null;
    const { user, creator } = raw;
    return {
        banner_url: convertBanner(creator.banner) ?? "",
        behance_url: creator.behance as fullURL ?? "",
        creator_bio: creator.bio,
        default_profile: creator.default_profile,
        deviant_art_url: creator.deviant_art as fullURL ?? "",
        dribbble_url: creator.dribble as fullURL ?? "",
        etsy_url: creator.etsy as fullURL ?? "",
        facebook_url: creator.facebook as fullURL ?? "",
        instagram_url: creator.instagram as fullURL ?? "",
        paypal_email_address: "",
        tier: "beta",
        tier_url: "/",
        tumblr_url: creator.tumbler as fullURL ?? "",
        twitter_url: creator.twitter as fullURL ?? "",
        url: `/creator/${user.username}`,
        // custom extension for NMA
        avatar: convertAvatar(user),
        bio: user.bio,
        first_name: user.first_name,
        id: user.id,
        links: {
            collected_setts_names_only: `//`,
            display_case: `//`,
            display_case_save: `//`,
            print_counts: `//`,
            profile: `/user/${user.username}`,
            referral_url: `//`,
            self: `//`,
            signup_sett_url: `//`,
        },
        name: getFullName(user),
        pro_badge: user.pro_status === 1 ? "svg-pro-icon" : null,
        pro_status: user.pro_status,
        trader_score: user.trader_score,
        username: user.username,
    };
}
