import { error, json } from "@sveltejs/kit";
import domain from "../domain.js";

export const GET = async ({
    url,
    params,
    cookies,
    isSubRequest,
}) => {
    const resp = await fetch(`${domain(params.s)}/login`);
    for (const [name, value] of resp.headers.entries()) {
        if (name.toLowerCase() === "set-cookie" && value.startsWith("csrftoken=")) {
            const [token, exp, maxage] = value.split(";").map((s) => s.split("=")[1]);
            cookies.set("csrftoken", token, {
                expires: new Date(exp),
                maxAge: +maxage,
                path: "/",
                domain: url.hostname,
            });
            return json(isSubRequest ? token : "new");
        }
    }

    if (cookies.get("csrftoken")) {
        return json(isSubRequest ? cookies.get("csrftoken") : "old");
    }
    throw error(404);
};
