import { error, json } from "@sveltejs/kit";
import { resolveSett } from "$db";

export const GET = async ({ url }) => {
    const slug = url.searchParams.get("slug");
    if (!slug) throw error(400);

    return json(resolveSett(slug));
};
