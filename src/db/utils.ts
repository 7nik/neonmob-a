import type {
    difficultyNumber,
    rarityNumber,
    fullURL,
    ID,
} from "$lib/utils/NM Types";
import type NM from "$lib/utils/NM Types";

import config from "$lib/utils/config";
import { DIFFICULTY, RARITY, SERVERS } from "./db.server";

type SIZE = keyof NM.OwnedCard["piece_assets"]["image"] | "large-blur";
// eslint-disable-next-line sonarjs/cognitive-complexity
export function convertAssets<T extends SIZE> (assets: string, sizes: T[], gray = true) {
    type Image = { w:number, h:number, n:string };
    type Video = { w:number, h:number, s: {n:string, m:string}[] };
    type T2 = T | `${T}-gray`;

    const { f: folder, i, v } = JSON.parse(assets) as {
        f: string,
        i: Record<T, Image>,
        v?: Record<T, Video>,
    };
    const image = {} as Record<T2, NM.Image>;
    for (const [size, img] of Object.entries(i) as [T, Image][]) {
        if (!sizes.includes(size)) continue;
        // eslint-disable-next-line sonarjs/no-duplicate-string
        const server = size === "large-promo" ? SERVERS.promo : SERVERS.asset;
        image[size] = {
            width: img.w,
            height: img.h,
            url: folder === "icons"
                ? `${SERVERS.avatar}/icons/${img.n}` as fullURL
                : `${server}/${folder}/static/${img.n}` as fullURL,
        };
        // just for API compatibility
        // anyway we maid it gray with CSS
        if (gray && !size.includes("-") && size !== "original") {
            image[`${size}-gray`] = image[size];
        }
    }
    // @ts-ignore - original is a size
    if (sizes.includes("original") && !image.original) {
        // @ts-ignore - original prop exists in this case
        image.original = {
            width: null,
            height: null,
            url: null,
        };
    }
    if (!v) return { image };
    const video = {} as Record<T2, NM.Video>;
    for (const [size, vid] of Object.entries(v) as [T, Video][]) {
        if (!sizes.includes(size)) continue;
        video[size] = {
            width: vid.w,
            height: vid.h,
            sources: vid.s.map(({ n, m }) => ({
                mime_type: m as NM.Video["sources"][0]["mime_type"],
                url: `${SERVERS.asset}/${folder}/animated/${n}` as fullURL,
            })),
        };
    }
    return { image, video };
}

export function convertRarityStats (rarities: string) {
    type RawRarity = { rarity: rarityNumber, total: number|null };

    const stats = (JSON.parse(rarities) as RawRarity[]).map((r) => ({
        rarity: r.rarity,
        name: RARITY[r.rarity].nameLow,
        class_name: RARITY[r.rarity].class,
        total: r.total,
        owned: 0,
    }));
    return {
        core_stats: stats.filter((s) => s.rarity <= 4) as NM.Sett["core_stats"],
        special_stats: stats.filter((s) => s.rarity > 4) as NM.Sett["special_stats"],
    };
}

type RawAvatar = { avatar_small: string|null, avatar_large: string|null }
export const convertAvatar = (
    { avatar_small: small, avatar_large: large }: RawAvatar,
): NM.User["avatar"] => ({
    small: (small ? `${SERVERS.avatar}/${small}` : config.defaultAvatarUrl) as fullURL,
    large: (large ? `${SERVERS.avatar}/${large}` : config.defaultAvatarUrl) as fullURL,
});

export const convertPreview = (name: string|null) => (
    name ? `${SERVERS.asset}/${name}` as fullURL : null
);

export const convertBanner = (name: string|null)  => (
    name ? `${SERVERS.banner}/${name}` as fullURL : null
);

export const SELECT_SETT = `SELECT sett.id, sett.name, sett.slug, sett.description,
    cover_asset, preview0, preview1, preview2, preview3,
    released, published, discontinued, discontinue_date, freebie_discontinued,
    sett_type, version, difficulty, replica, rarities,
    packs_sold_out, freebie_sold_out, total_print_count,
    user.id,
    user.first_name,
    user.last_name,
    user.username,
    user.bio,
    user.trader_score,
    user.avatar_small,
    user.avatar_large`;
export type RawSett = {
    sett: {
        id: ID<"sett">,
        name: string,
        slug: string,
        description: string,
        cover_asset: string,
        preview0: string|null,
        preview1: string|null,
        preview2: string|null,
        preview3: string|null,
        released: string,
        published: string,
        discontinued: string|null,
        discontinue_date: string,
        freebie_discontinued: string|null,
        sett_type: NM.Sett["sett_type"],
        version: NM.Sett["version"],
        difficulty: difficultyNumber,
        replica: number|null,
        packs_sold_out: number,
        freebie_sold_out: number,
        total_print_count: number|-1,
        rarities: string,
    },
    user: {
        id: ID<"user">,
        first_name: string,
        last_name: string,
        username: string,
        bio: string,
        trader_score: number,
        avatar_small: string|null,
        avatar_large: string|null,
    }
}
export const convertSett = (
    { sett, user }: RawSett,
    host: string,
    categories: NM.Category[],
): NM.Sett  => ({
    base_completed: false,
    categories,
    creator: {
        avatar: convertAvatar(user),
        first_name: user.first_name,
        id: user.id,
        link: `/creator/${user.username}`,
        name: getFullName(user),
        pro_badge: null,
        pro_status: 0,
        twitter_username: null,
        username: user.username,
    },
    daily_freebies: 0,
    description: sett.description,
    difficulty: {
        id: sett.difficulty + 1 as NM.Sett["difficulty"]["id"],
        name: DIFFICULTY[sett.difficulty],
        class_name: `difficulty-${sett.difficulty}`,
        level: sett.difficulty,
    },
    discontinue_date: sett.discontinue_date,
    discontinued: sett.discontinued,
    edition_size: sett.version === 2 ? "unlimited" : "limited",
    exclusivity: 0,
    favorite: false,
    free_packs_available: false,
    free_packs_claimed_percent: sett.freebie_sold_out,
    freebies_discontinued: sett.freebie_discontinued,
    id: sett.id,
    limited_release: sett.version !== 2,
    links: {
        "api-pack": `/`,
        permalink: `/series/${sett.slug}/`,
        piece_names: `/`,
        pieces: `/`,
        self: `/`,
    },
    name: sett.name,
    name_slug: sett.slug,
    notify: false,
    packs_available: false,
    percent_sold_out: sett.packs_sold_out,
    permalink: `/series/${sett.slug}/`,
    preview_0: convertPreview(sett.preview0),
    preview_1: convertPreview(sett.preview1),
    preview_2: convertPreview(sett.preview2),
    preview_3: convertPreview(sett.preview3),
    price: null,
    prints_per_free_pack: 0,
    prints_per_paid_pack: 0,
    public_url: `//${host}/series/${sett.slug}/`,
    published: sett.published,
    released: sett.released,
    replica_parent: sett.replica,
    sett_assets: convertAssets(
        sett.cover_asset,
        ["small", "medium", "large", "large-blur", "original"],
        false,
    ).image,
    sett_type: sett.sett_type,
    total_print_count: sett.total_print_count,
    version: sett.version,
    ...convertRarityStats(sett.rarities),
});

export const SELECT_CATEGORY = `SELECT id, name, slug, description`;
export type RawCategory = {
    id: ID<"category">,
    name: string,
    slug: string,
    description: string,
}
export const convertCategory = (raw: RawCategory): NM.Category  => ({
    collect_url: `/collect/${raw.slug}`, // HTML
    description: raw.description,
    id: raw.id,
    legacy_setts_url: `/api/setts/legacy_list/?category=${raw.slug}`, // old api
    name: raw.name,
    name_slug: raw.slug,
    setts_url: `/api/setts/?category=${raw.slug}`,
});

export function getPageParams (url: URL) {
    const pageSize = Number(url.searchParams.get("page_size")) || 9;
    const pageNumber = Number(url.searchParams.get("page")) || 1;
    const pageOffset = (pageNumber - 1) * pageSize;
    return { pageSize, pageNumber, pageOffset };
}

export function paginate<T> (results: T[], url: URL, count = 0): NM.Paginated<T> {
    const { pageSize, pageNumber } = getPageParams(url);
    let previous: fullURL|null = null;
    if (pageNumber > 1 && count > pageSize) {
        const u = new URL(url);
        u.searchParams.set("page", String(pageNumber - 1));
        previous = u.toString() as fullURL;
    }
    let next: fullURL|null = null;
    if (pageNumber * pageSize < count) {
        const u = new URL(url);
        u.searchParams.set("page", String(pageNumber + 1));
        next = u.toString() as fullURL;
    }
    return {
        next, previous, count, results,
    };
}

export function getFullName (user: Pick<NM.User, "first_name"|"last_name">) {
    return `${user.first_name} ${user.last_name}`.trim();
}
