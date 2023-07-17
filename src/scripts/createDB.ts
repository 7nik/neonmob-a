/* eslint-disable unicorn/numeric-separators-style */
/* eslint-disable import/first */
// eslint-disable-next-line import/order
import config from "$lib/utils/config";
// @ts-ignore - switch to NM server
config["main-api-endpoint"] = "https://neonmob.com";
// @ts-ignore - switch to NM server
config["node-api-endpoint"] = "https://napi.neonmob.com";

import type { ID } from "$lib/utils/NM Types";
import type NM from "$lib/utils/NM Types";
import type { OldPaginated, OldPrint } from "$lib/utils/NMA Types";

import fs from "node:fs";
import DB from "better-sqlite3";
import {
    findSetts, getOwnedPrints, getSettCards, getSettCategories, getUserData,
} from "$api";
import { merge } from "$api/utils";

// const db = new DB("src/db/data.db");
const db = new DB(":memory:");
db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS env (
        name TEXT PRIMARY KEY,
        value TEXT
    );
    CREATE TABLE IF NOT EXISTS category (
        id INT PRIMARY KEY,
        name TEXT,
        slug TEXT UNIQUE,
        description TEXT
    );
    CREATE INDEX IF NOT EXISTS category_slug ON category(slug);
    CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        bio TEXT NOT NULL,
        trader_score REAL NOT NULL,
        avatar_small TEXT,
        avatar_large TEXT,
        pro_status INT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS user_username ON user(username);
    CREATE TABLE IF NOT EXISTS creator (
        id INTEGER PRIMARY KEY,
        default_profile INT NOT NULL,
        bio TEXT NOT NULL,
        banner TEXT,
        deviant_art TEXT,
        behance TEXT,
        instagram TEXT,
        facebook TEXT,
        dribble TEXT,
        etsy TEXT,
        twitter TEXT,
        tumbler TEXT,
        FOREIGN KEY (id) REFERENCES user(id)
    );
    CREATE TABLE IF NOT EXISTS sett (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT NOT NULL,
        creator_id INT NOT NULL,
        cover_asset TEXT NOT NULL,
        preview0 TEXT,
        preview1 TEXT,
        preview2 TEXT,
        preview3 TEXT,
        released TEXT,
        published TEXT,
        discontinued TEXT,
        discontinue_date TEXT NOT NULL,
        freebie_discontinued TEXT,
        sett_type INT NOT NULL,
        version INT NOT NULL,
        difficulty INT NOT NULL,
        replica INT REFERENCES sett(id),
        packs_sold_out INT NOT NULL,
        freebie_sold_out INT NOT NULL,
        total_print_count INT NOT NULL,
        rarities TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sett_slug ON sett(slug);
    CREATE TABLE IF NOT EXISTS sett_category (
        sett_id INT NOT NULL REFERENCES sett(id),
        category_id INT NOT NULL REFERENCES category(id),
        PRIMARY KEY (sett_id, category_id)
    );
    CREATE TABLE IF NOT EXISTS card (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT NOT NULL,
        rarity INT NOT NULL,
        position INT NOT NULL,
        total_prints INT NOT NULL,
        asset TEXT NOT NULL,
        sett_id INT NOT NULL REFERENCES sett(id),
        UNIQUE (sett_id, slug),
        UNIQUE (sett_id, position)
    );
    CREATE INDEX IF NOT EXISTS card_slug ON card(slug);
    CREATE INDEX IF NOT EXISTS card_sett ON card(sett_id);
`);

const servers = {} as Record<string, string>;
const addedCategories = new Set<ID<"category">>();
const addedCreators = new Set<ID<"user">>();

const addEnv = db.prepare<[string, string]>(
    `INSERT OR REPLACE INTO env VALUES (?, ?)`,
);

const addCategory = db.prepare<NM.Category>(
    `INSERT OR REPLACE INTO category VALUES (@id, @name, @name_slug, @description)`,
);
// eslint-disable-next-line no-underscore-dangle
const _addUser = db.prepare<[NM.User, string|null, string|null]>(
    `INSERT OR REPLACE INTO user VALUES (
        @id, @first_name, @last_name, @username, @bio, @trader_score, ?, ?, @pro_status
    )`,
);
// eslint-disable-next-line no-underscore-dangle
const _addCreator = db.prepare<[NM.Creator, number, number, string|null]>(
    `INSERT OR REPLACE INTO creator VALUES (
        ?, ?, @creator_bio, ?,
        @deviant_art_url, @behance_url, @instagram_url, @facebook_url,
        @dribbble_url, @etsy_url, @twitter_url, @tumblr_url
    )`,
);
const getAvatar = (avatar: NM.User["avatar"]): [string|null, string|null] => {
    if (!avatar.small || avatar.small.endsWith("/default_avatar.png")) return [null, null];
    if (!servers.avatar) {
        servers.avatar = avatar.small.split("/").slice(0, 3).join("/");
    }
    if (!avatar.small.includes(servers.avatar)) return [null, null];
    return [
        avatar.small.split(servers.avatar)[1].slice(1),
        avatar.large.split(servers.avatar)[1].slice(1),
    ];
};
const trimBanner = (url: string | null) => {
    if (!url) return null;
    if (!url.includes("/profile/banner/")) return null;
    if (!servers.banner) {
        servers.banner = url.split("/").slice(0, 5).join("/");
    }
    return url.split("/profile/banner/")[1];
};
const addCreator = (user: NM.UserInfo, creator: NM.Creator) => {
    _addUser.run(user, ...getAvatar(user.avatar));
    _addCreator.run(
        creator,
        user.id,
        Number(creator.default_profile),
        trimBanner(creator.banner_url),
    );
};

const jsonAssets = (
    images: Record<string, NM.Image>,
    videos: Record<string, NM.Video> | null = null,
) => {
    const folder = images.medium.url.split("/").slice(3, -2).join("/") || "icons";
    const img: Record<string, { w:number, h:number, n:string }> = {};
    for (const [size, image] of Object.entries(images)) {
        if (!image.url) {
            continue;
        }
        if (size.endsWith("-gray")) {
            delete images[size];
            continue; // they aren't used in this site
        }
        if (size === "large-promo" && !servers.promo) {
            servers.promo = image.url.split("/").slice(0, -1).join("/");
        } else if (!servers.asset) {
            servers.asset = image.url.split("/").slice(0, 3).join("/");
        }
        img[size] = {
            h: image.height,
            w: image.width,
            n: image.url.split("/").at(-1)!,
        };
    }
    if (!videos) return JSON.stringify({ f: folder, i: img });
    const vid: Record<string, { w:number, h:number, s: {n:string, m:string}[] }> = {};
    for (const [size, video] of Object.entries(videos)) {
        vid[size] = {
            w: video.width,
            h: video.height,
            s: video.sources.map((source) => ({
                m: source.mime_type,
                n: source.url.split("/").at(-1)!,
            })),
        };
    }
    return JSON.stringify({ f: folder, i: img, v: vid });
};

const addSettCategory = db.prepare(`INSERT OR IGNORE INTO sett_category VALUES (?, ?)`);
// eslint-disable-next-line no-underscore-dangle
const _addSett = db.prepare<[
    NM.Sett,
    number, // creator_id
    string, // cover_asset
    string|null, string|null, string|null, string|null, // preview0-3
    number, // difficulty
    string, // rarities
]>(
    `INSERT OR REPLACE INTO sett VALUES (
        @id, @name, @name_slug, @description,
        ?, ?, ?, ?, ?, ?,
        @released, @published, @discontinued, @discontinue_date, @freebies_discontinued,
        @sett_type, @version, ?, @replica_parent,
        @percent_sold_out, @free_packs_claimed_percent, @total_print_count,
        ?
    )`,
);
const previewToCardMap = {
    "//d1ld1je540hac5.cloudfront.net/icons/kvwholrqagdv.jpeg": [2781],
    "//d1ld1je540hac5.cloudfront.net/icons/tqzmropwofcc.jpeg": [3258, 176325],
    "//d1ld1je540hac5.cloudfront.net/icons/cazcbtegrcji.jpeg": [1348],
    "//d1ld1je540hac5.cloudfront.net/icons/jnrrsvleoqgm.jpeg": [1157],
    "//d1ld1je540hac5.cloudfront.net/icons/hrqgwrtkuhkc.jpeg": [2297],
    "//d1ld1je540hac5.cloudfront.net/icons/cxfxvwpaocgx.jpeg": [3198, 232737],
    "//d1ld1je540hac5.cloudfront.net/icons/rzrcobewerbp.jpeg": [4795, 200008],
    "//d1ld1je540hac5.cloudfront.net/icons/pzowiwhvrkaf.jpeg": [287, 180575],
    "//d1ld1je540hac5.cloudfront.net/icons/vbxghxfwbybb.jpeg": [1671],
    "//d1ld1je540hac5.cloudfront.net/icons/aswqnuofgqdb.jpeg": [945, 194582],
    "//d1ld1je540hac5.cloudfront.net/icons/mouhuzlrjkxg.jpeg": [1342],
    "//d1ld1je540hac5.cloudfront.net/icons/lbxdxhgpzywv.jpeg": [1876, 166581],
    "//d1ld1je540hac5.cloudfront.net/icons/uqzrujadqnkb.jpeg": [1057],
    "//d1ld1je540hac5.cloudfront.net/icons/kqlxgrhoslmf.jpeg": [1267, 250332],
    "//d1ld1je540hac5.cloudfront.net/icons/mtilhdpfpcdx.jpeg": [325],
    "//d1ld1je540hac5.cloudfront.net/icons/wujynmnucmrh.jpeg": [1262],
} as Record<string, ID<"card">[]>;
const trimPreview = async (url: string | null, re: boolean) => {
    if (!url) return null;
    // replace some previews to identical one from the cards
    if (url.includes(".net/icons/")) {
        const cardId = previewToCardMap[url]?.[re ? 1 : 0];
        if (!cardId) {
            console.log("Couldn't to replace preview", url);
            return null;
        }
        const card = await getOwnedPrints(1, cardId);
        url = card.piece_assets.image.medium.url;
    }
    return url.split(servers.asset)[1].slice(1);
};
const addSett = async (sett: NM.Sett) => {
    // a few series have version:null
    if (!sett.version) {
        sett.version = 1;
    }
    const rarities = JSON.stringify(
        [...sett.core_stats, ...sett.special_stats]
            .map(({ rarity, total }) => ({ rarity, total })),
    );
    _addSett.run(
        sett,
        sett.creator.id,
        jsonAssets(sett.sett_assets),
        await trimPreview(sett.preview_0, !!sett.replica_parent),
        await trimPreview(sett.preview_1, !!sett.replica_parent),
        await trimPreview(sett.preview_2, !!sett.replica_parent),
        await trimPreview(sett.preview_3, !!sett.replica_parent),
        sett.difficulty.level,
        rarities,
    );
    for (const category of sett.categories) {
        if (!addedCategories.has(category.id)) {
            addCategory.run(category);
            addedCategories.add(category.id);
        }
        addSettCategory.run(sett.id, category.id);
    }
};

// eslint-disable-next-line max-len
const RARITY = ["Common", "Uncommon", "Rare", "Very Rare", "Extra Rare", "Chase", "Variant", "Legendary"];
// eslint-disable-next-line no-underscore-dangle
const _addCard = db.prepare<[
    number, // id
    string, // name
    string, // slug
    string, // description
    number, // rarity id
    number, // position
    number, // total_prints
    string, // asset
    number, // sett_id
]>(`INSERT OR REPLACE INTO card VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const addCard = (card: OldPrint | NM.Unmerged.Prints, position: number) => {
    const slug = ("name_slug" in card)
        ? card.name_slug
        : card.absolute_url.split("/")[3];
    _addCard.run(
        card.id,
        card.name,
        slug,
        card.description,
        RARITY.indexOf(card.rarity.name),
        position,
        card.num_prints_total === "unlimited" ? -1 : card.num_prints_total,
        jsonAssets(card.piece_assets.image, card.piece_assets.video),
        card.set.id,
    );
};

const getCards = async (sid: number) => {
    // process.stdout.write("o");
    const orderedCards = await getSettCards(0, sid);
    // try to get all the cards quickly
    let someCards: OldPrint[] = [];
    let next: string | null = `https://www.neonmob.com/api/sets/${sid}/pieces/?limit=100`;
    try {
        while (next) {
            // process.stdout.write("c");
            // eslint-disable-next-line max-len
            const resp: NM.Unmerged.Container<OldPaginated<OldPrint>> = await fetch(next).then((r) => r.json());
            const data = merge(resp);
            someCards = someCards.concat(data.results);
            next = data.metadata.resultset.link.next;
            if (next && !next.includes("//")) {
                next = "https://www.neonmob.com".concat(next);
            }
        }
    } catch {
        console.log(`Failed to get cards of series #${sid} - switching to slow endpoint`);
    }
    // correct the cards order and get the missing ones
    // process.stdout.write(orderedCards.length.toString());
    const cards: (OldPrint|NM.Unmerged.Prints)[] = [];
    for (const { id } of orderedCards) {
        const card = someCards.find((c) => c.id === id) ?? await getOwnedPrints(1, id);
        // ?? (process.stdout.write("p"), await getOwnedPrints(1, id));
        cards.push(card);
    }
    return cards;
};

async function saveSett (sett: NM.Sett, creators: NM.Creator[]) {
    if (!addedCreators.has(sett.creator.id)) {
        // process.stdout.write("a");
        const user = await getUserData(sett.creator.id);
        let creator = creators.find((c) => c.username === user.username);
        if (!creator) {
            console.error("creator", user.id, user.username, "wasn't found");
            creator = {
                banner_url: "",
                behance_url: "",
                creator_bio: user.bio,
                default_profile: false,
                deviant_art_url: "",
                dribbble_url: "",
                etsy_url: "",
                facebook_url: "",
                instagram_url: "",
                name: user.name,
                paypal_email_address: "",
                tier: "",
                tier_url: "/",
                tumblr_url: "",
                twitter_url: "",
                url: "/",
                username: user.username,
            };
        }
        addCreator(user, creator);
        // process.stdout.write("s");
        addedCreators.add(sett.creator.id);
    }
    // process.stdout.write("s");
    await addSett(sett);

    const cards = await getCards(sett.id);
    // process.stdout.write("S");
    for (const [pos, card] of cards.entries()) {
        addCard(card, pos);
    }
}

// =============================================================================
//                             EXECUTION START
// =============================================================================

console.log("downloading categories");
const categories = getSettCategories(100);
await categories.waitLoading();
for (const category of categories.items) {
    // skip virtual categories except the Featured
    if (![15, 16, 17, 85, 84, 18].includes(category.id)) {
        addCategory.run(category);
        addedCategories.add(category.id);
    }
}

console.log("downloading creators");
const creators = await fetch("https://www.neonmob.com/api/creator/profile/")
    .then((r) => r.json()) as NM.Creator[];

console.log("downloading series");
const setts = findSetts("", "alphabetical", false, { pageSize: 100 });
await setts.loadAll();
// while (setts.hasMore && setts.items.length < 30) await setts.loadMore();

console.log("saving series and cards:");
// move replicas to the end
setts.items.sort((a, b) => Number(a.replica_parent) - Number(b.replica_parent));
for (const [i, sett] of setts.items.entries()) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`saved ${i} of ${setts.items.length} `);

    try {
        await saveSett(sett, creators);
    } catch (ex) {
        console.log("\nFailed on saving", sett.public_url);
        throw ex;
    }
}
console.log("\nseries and cards saved");

for (const [name, value] of Object.entries(servers)) {
    addEnv.run(`${name}_server`, value);
}
const fSetts = findSetts("featured", "", false, {});
await fSetts.waitLoading();
addEnv.run("featured_setts", JSON.stringify(fSetts.items.map((s) => s.id)));

console.log("saving database");

fs.writeFileSync("src/db/data.db", db.serialize(), "binary");
db.close();

console.log("finished");
