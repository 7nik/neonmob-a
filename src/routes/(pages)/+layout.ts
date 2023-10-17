import { browser } from "$app/environment";
import CurrentUser from "$lib/services/CurrentUser";

export const load = async ({ data, fetch }) => {
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
        } catch {
            // do nothing
        }
    }

    return {
        currentUser,
        quote: data.quote,
    };
};
