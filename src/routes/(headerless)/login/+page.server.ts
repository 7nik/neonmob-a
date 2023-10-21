import { fail, redirect, type HttpError } from "@sveltejs/kit";
import { getCurrentUserData, signIn, updateCsrfToken } from "$api";

type Fetch = typeof fetch;

const CSRFyFetch = (fetch: Fetch): Fetch => async (link, init) => {
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

export const actions = {
    default: async ({ request, fetch, cookies }) => {
        const data = await request.formData();
        const username = data.get("username") as string;
        const password = data.get("password") as string;

        if (!username || !password) {
            return fail(400, { detail: "All fields are required" });
        }

        try {
            const result = await signIn(username, password, CSRFyFetch(fetch));
            if ("redirect" in result) {
                const user = await getCurrentUserData(fetch);
                if (user) {
                    cookies.set("user_id", String(user.id), { maxAge: 365 * 86_400 });
                }
                throw redirect(302, result.redirect);
            }
        } catch (ex) {
            if (ex && typeof ex === "object" && "status" in ex) {
                const err = ex as HttpError;
                // if it's the thrown redirect
                if (err.status === 302) throw err;
                return fail(err.status, { detail: err.body?.message });
            }
        }
        return fail(400, { detail: "Sometimes things go wrong..." });
    },
};
