import { redirect } from "@sveltejs/kit";
import CurrentUser from "$lib/services/CurrentUser";
import OtherUsers from "$lib/services/OtherUsers.js";

export const load = async ({ data, fetch, url }) => {
    const currentUser = CurrentUser();
    const otherUsers = new OtherUsers();
    if (data.hasSession) {
        try {
            otherUsers.load(fetch);
            await currentUser.loadUser(fetch, data.userId);
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
        otherUsers: otherUsers.waitLoading(),
        quote: data.quote,
    };
};
