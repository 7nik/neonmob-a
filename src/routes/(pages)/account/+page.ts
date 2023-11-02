import { redirect } from "@sveltejs/kit";
import { getEmailSubscriptions, getTransloaditOptions } from "$api";

export const load = async ({ parent, fetch }) => {
    const data = await parent();
    if (!data.currentUser.isAuthenticated()) {
        throw redirect(302, "/login?next=/account/");
    }
    return {
        emailSubs: getEmailSubscriptions(fetch),
        p: {
            transloaditParams: getTransloaditOptions(fetch),
        },
    };
};

export const trailingSlash = "always";
