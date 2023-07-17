import { error, json } from "@sveltejs/kit";
import { getCategory } from "$db";

export const GET = ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw error(404);
    return json(category);
};

export const trailingSlash = "always";
