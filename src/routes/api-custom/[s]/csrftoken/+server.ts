import { HOSTNAMES } from "$env/static/private";
import { error, json } from "@sveltejs/kit";
import domain from "../domain.js";

const allowedHosts = HOSTNAMES.split(",");

export const GET = async ({ request, params, cookies }) => {
    if (!allowedHosts.includes(request.headers.get("host")!)) {
        throw error(403);
    }
    const resp = await fetch(`${domain(params.s)}/login`);
    for (const [name, value] of resp.headers.entries()) {
        if (name.toLowerCase() === "set-cookie" && value.startsWith("csrftoken=")) {
            const [token, exp, maxage] = value.split(";").map((s) => s.split("=")[1]);
            cookies.set("csrftoken", token, {
                expires: new Date(exp),
                maxAge: +maxage,
                path: "/",
                // TODO: enable
                // secure: true,
            });
            return json("new");
        }
    }

    if (cookies.get("csrftoken")) {
        return json("old");
    }
    throw error(404);
};
