import { fileURLToPath, URL } from "node:url";
import DB from "better-sqlite3";

export const db = new DB(
    fileURLToPath(new URL("../db/data.db", import.meta.url)),
);
db.pragma("foreign_keys = ON");

// schema
/*
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
**/

const raws = db.prepare(`SELECT id, slug FROM card WHERE description LIKE '%)[%'`).all();
console.log(raws.length);
raws.map((raw) => {
    console.log(raw.id, `https://www.neonmob.com/series/${raw.slug}/`);
})

db.close();
