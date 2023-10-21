import { redirect } from "@sveltejs/kit";

export const GET = async ({ cookies }) => {
    cookies.delete("sessionid");
    cookies.delete("user_id");
    throw redirect(302, "/");
};
