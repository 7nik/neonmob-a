import { fail, redirect } from "@sveltejs/kit";
import { getCurrentUserData, signIn, updateCsrfToken } from "$api";

export const actions = {
    default: async ({ request, fetch, cookies }) => {
        const data = await request.formData();
        const username = data.get("username");
        const password = data.get("password");

        if (!username || !password) {
            return fail(400, { detail: "All fields are required" });
        }

        const f: typeof fetch = async (link, init) => {
            if (init?.headers) {
                const csrf = await updateCsrfToken(fetch);
                if (init.headers instanceof Headers) {
                    // eslint-disable-next-line sonarjs/no-duplicate-string
                    init.headers.set("X-CSRFToken", csrf);
                } else if (Array.isArray(init.headers)) {
                    init.headers.push(["X-CSRFToken", csrf]);
                } else {
                    init.headers["X-CSRFToken"] = csrf;
                }
            }
            return fetch(link, init);
        };

        const result = await signIn(username as string, password as string, f);
        if ("redirect" in result) {
            const user = await getCurrentUserData(fetch);
            if (user) {
                cookies.set("user_id", String(user.id), { maxAge: 365 * 86_400 });
            }
            throw redirect(302, result.redirect);
        }
        return fail(400, result.field_errors ? {} : { detail: result.detail });
    },
};
