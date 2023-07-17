import { error, redirect } from "@sveltejs/kit";
import { browser } from "$app/environment";
import { getUserData } from "$api";
import { resolve } from "$lib/services/cache";

export const load = async ({ params, fetch }) => {
    const user = await getUserData(+params.id, fetch);
    if (!user) throw error(404);
    if (browser) {
        resolve.user.set(user.username, user.id);
    }
    throw redirect(307, user.links.profile);
};
