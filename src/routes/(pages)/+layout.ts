import { redirect } from "@sveltejs/kit";
import { browser } from "$app/environment";
import CurrentUser from "$lib/services/CurrentUser";

export const load = async ({ data, fetch, url }) => {
    const currentUser = CurrentUser();
    if (data.hasSession) {
        try {
            await currentUser.loadUser(fetch, data.userId);
            if (browser) {
                // reset the list of the opened pack at midnight
                const midnight = new Date();
                midnight.setDate(midnight.getDate() + 1);
                midnight.setHours(0, 0, 0, 0);
                setTimeout(function reset () {
                    currentUser.freebieUsed.set({});
                    // reset at the next midnight
                    setTimeout(reset, 86_400_000);
                }, midnight.getTime() - Date.now());
            }
        } catch (ex) {
            console.error("Failed to authenticate", ex);
            if (ex && typeof ex === "object" && "status" in ex && (ex.status as number) < 500) {
                await fetch("/signout");
                throw redirect(302, `/login?next=${encodeURIComponent(url.pathname)}`);
            }
        }
    }

    return {
        currentUser,
        quote: data.quote,
    };
};
