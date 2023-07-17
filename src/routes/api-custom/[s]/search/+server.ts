import type {
    absoluteURL,
    fullURL,
    rarityCss,
    rarityName,
} from "$lib/utils/NM Types";
import type NM from "$lib/utils/NM Types";
import type { FoundCard, FoundUser } from "../../c/search/+server";

import { error, json } from "@sveltejs/kit";
import { JSDOM } from "jsdom";
import domain from "../domain";

// TODO do search only for authenticated users
export const GET = async ({ url, params, request }) => {
    const query = url.searchParams.get("search")?.trim().toLowerCase();
    if (!query) return json({ cards: [], sett: [], users: [] });

    const link = `${domain(params.s)}/search/${url.search}`;

    const resp = await fetch(link, {
        headers: {
            Cookie: request.headers.get("Cookie") ?? "",
        },
    });
    const dom = new JSDOM(await resp.text());
    const containers = dom.window.document.querySelectorAll(".pod > ul");
    if (containers.length < 3) {
        throw error(401);
    }

    const cards: FoundCard[] = Array.from(containers[0].children).map((li) => {
        const aTitle = li.children[1].children[1].firstElementChild;
        const aSeries = li.children[1].children[2].firstElementChild;
        const aCreator = li.children[1].children[2].lastElementChild;
        const iRarity = li.querySelector(".piece-name i") as HTMLElement;
        return {
            id: Number(li.querySelector("[data-piece-id]")?.getAttribute("data-piece-id")),
            name: text(aTitle),
            name_slug: slug(aTitle),
            piece_assets: { image: { small: extractAssets(li.querySelector("img")!) } },
            rarity: {
                name: iRarity.getAttribute("title") as rarityName,
                class: [...iRarity.classList][1] as rarityCss,
            },
            public_url: href(aTitle),
            sett: {
                id: 0,
                name: text(aSeries),
                name_slug: slug(aSeries),
                link: href(aSeries),
            },
            creator: {
                id: 0,
                link: href(aCreator),
                name: text(aCreator),
                username: slug(aCreator),
            },
        };
    });

    const setts: NM.Sett[] = Array.from(containers[1].children).map((li) => {
        const aTitle = li.children[1].children[1].firstElementChild;
        const aCreator = li.children[1].children[1].lastElementChild?.firstElementChild;
        return {
            id: 0,
            name: text(aTitle),
            name_slug: slug(aTitle),
            creator: {
                avatar: { large: "//", small: "//" },
                first_name: text(aCreator),
                id: 0,
                link: href(aCreator),
                name: text(aCreator),
                pro_badge: null,
                pro_status: 0,
                twitter_username: null,
                username: slug(aCreator),
            },
            description: "",
            percent_sold_out: 0,
            free_packs_claimed_percent: 0,
            sett_assets: {
                small: extractAssets(li.querySelector("img")!),
                medium: { url: "//", width: 0, height: 0 },
                large: { url: "//", width: 0, height: 0 },
                "large-blur": { url: "//", width: 0, height: 0 },
                original: { url: "//", width: 0, height: 0 },
            },
            released: "",
            published: "",
            daily_freebies: 0,
            permalink: href(aTitle),
            links: {
                self: href(aTitle),
                pieces: "/",
                permalink: "/",
                piece_names: "/",
                "api-pack": "/",
            },
            price: null,
            preview_0: null,
            preview_1: null,
            preview_2: null,
            preview_3: null,
            sett_type: 0,
            core_stats: [],
            special_stats: [],
            free_packs_available: false,
            packs_available: false,
            total_print_count: -1,
            edition_size: "limited",
            discontinued: null,
            discontinue_date: "",
            prints_per_free_pack: 0,
            prints_per_paid_pack: 0,
            freebies_discontinued: null,
            exclusivity: 0,
            limited_release: false,
            public_url: href(aTitle) as fullURL,
            categories: [],
            version: 1,
            favorite: false,
            base_completed: false,
            difficulty: {
                id: 2,
                name: "Easy",
                class_name: "difficulty-1",
                level: 1,
            },
            replica_parent: null,
            notify: false,
        };
    });

    const users: FoundUser[] = Array.from(containers[2].children).map((li) => {
        const aName = li.children[1].children[0].firstElementChild;
        return {
            avatar: {
                large: "//",
                small: li.querySelector("img")!.getAttribute("src") as fullURL,
            },
            id: 0,
            link: href(aName),
            name: text(aName),
            username: slug(aName),
        };
    });

    return json({ cards, setts, users });
};

function text (el: Element | null | undefined) {
    if (!el) {
        console.log("no element");
        return "";
    }
    return el.textContent?.trim() ?? "";
}

function href (el: Element | null | undefined) {
    if (!el) {
        console.log("no element");
        return "/";
    }
    return el.getAttribute("href") as absoluteURL;
}

function slug (el: Element | null | undefined) {
    const parts = href(el).split("/");
    return parts.at(-1) || parts.at(-2) || "";
}

function extractAssets (el: HTMLImageElement) {
    return {
        url: el.src as fullURL,
        height: +el.height,
        width: +el.width,
    };
}
