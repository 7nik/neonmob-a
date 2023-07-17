import { error, json } from "@sveltejs/kit";
import { findSetts } from "$db";

export const GET = ({ url }) => {
    if (url.searchParams.has("percent_owned")) {
        throw error(403);
    }

    const category = url.searchParams.get("category") ?? "";
    const creator = url.searchParams.has("user_id")
        ? Number(url.searchParams.get("user_id"))
        : undefined;
    const order = ["alphabetical", "discontinue_date", "difficulty", "percent_sold", "release_date"]
        .find((v) => url.searchParams.has(v)) ?? "release_date";

    const setts = findSetts({
        category,
        creator,
        order,
        descending: url.searchParams.get(order) === "asc",
        url,
        credits: url.searchParams.get("credits") === "true",
        freebies: url.searchParams.get("freebies") === "true",
        limited: url.searchParams.get("limited") === "true",
        unlimited: url.searchParams.get("unlimited") === "true",
    });

    return json(setts);
};

export const trailingSlash = "always";
