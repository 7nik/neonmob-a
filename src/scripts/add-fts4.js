import { fileURLToPath, URL } from "node:url";
import DB from "better-sqlite3";

export const db = new DB(
    fileURLToPath(new URL("../db/data.db", import.meta.url)),
);
db.pragma("foreign_keys = ON");

db.exec(`
    BEGIN TRANSACTION;
    DROP TABLE IF EXISTS search_user;
    DROP TABLE IF EXISTS search_sett;
    DROP TABLE IF EXISTS search_card;

    CREATE VIRTUAL TABLE IF NOT EXISTS search_user USING fts4 (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT NOT NULL,
        FOREIGN KEY (id) REFERENCES user(id),
        tokenize=porter
    );
    INSERT INTO search_user(id, username, name)
        SELECT id, username, trim(format('%s %s', first_name, last_name))
        FROM user;
    INSERT INTO search_user(search_user) VALUES('optimize');

    CREATE VIRTUAL TABLE IF NOT EXISTS search_sett USING fts4 (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        FOREIGN KEY (id) REFERENCES sett(id),
        tokenize=porter
    );
    INSERT INTO search_sett(id, name) SELECT id, name FROM sett;
    INSERT INTO search_sett(search_sett) VALUES('optimize');

    CREATE VIRTUAL TABLE IF NOT EXISTS search_card USING fts4 (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        FOREIGN KEY (id) REFERENCES card(id),
        tokenize=porter
    );
    INSERT INTO search_card (id, name) SELECT id, name FROM card;
    INSERT INTO search_card(search_card) VALUES('optimize');

    COMMIT;
`);
db.close();
