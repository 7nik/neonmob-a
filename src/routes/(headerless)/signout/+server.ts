import { redirect } from "@sveltejs/kit";

export const GET = async ({ url, cookies }) => {
    cookies.delete("sessionid");
    if (url.searchParams.has("noredirect")) {
        return new Response();
    }
    throw redirect(302, "/");
};
