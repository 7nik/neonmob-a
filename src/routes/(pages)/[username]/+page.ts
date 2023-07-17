import { redirect } from "@sveltejs/kit";
import { getUserData } from "$api";

export const load = async ({ params, fetch }) => {
    if (/^\d+$/.test(params.username)) {
        const user = await getUserData(+params.username, fetch);
        // TODO do this redirect only if creator.default_profile === true
        // NM lies as breath
        // if (user?.is_creator) throw redirect(307, `/creator/${user.username}/`);
        if (user) throw redirect(307, `/${user.username}/collection/`);
    }
    throw redirect(307, `/${params.username}/collection/`);
    // throw redirect(307, `/creator/${params.user}`);
};
