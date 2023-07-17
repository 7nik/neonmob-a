import type { rarityName, rarityCss, rarityNameLow } from "$lib/utils/NM Types";

// import fs from "node:fs";
import DB from "better-sqlite3";

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

// const subpath = import.meta.glob("./data.db", { eager: true, as: "url" })["./data.db"];
// const folders = import.meta.url.replace("file://", "").split("/");
// while (folders.length > 0 && !fs.existsSync(folders.join("/").concat(subpath))) {
//     folders.pop();
// }
// const fullPath = folders.length > 0 ? folders.join("/").concat(subpath) : "";
const fullPath = "";

export const db = fullPath
    ? new DB(fullPath, { readonly: true })
    : new DB(":memory:");
db.pragma("foreign_keys = ON");
if (fullPath) {
    db.pragma("query_only = ON");
} else {
    // add empty tables
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
}

export const SERVERS: Record<string, string> = db.prepare("SELECT * FROM env").raw().all()
    // eslint-disable-next-line unicorn/no-array-reduce
    .reduce((s, [name, value]: string[]) => {
        if (!name.endsWith("_server")) return s;
        s[name.slice(0, -7)] = value;
        return s;
    }, {});
