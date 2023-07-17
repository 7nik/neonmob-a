import { json } from "@sveltejs/kit";
import { getAllCategories } from "$db";

export const GET = ({ url }) => {
    if (!url.searchParams.has("page_size")) {
        url.searchParams.set("page_size", "3");
    }
    return json(getAllCategories(url));
};

export const trailingSlash = "always";
