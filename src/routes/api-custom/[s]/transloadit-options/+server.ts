import type { TransloaditOptions } from "@uppy/transloadit";

import { error, json } from "@sveltejs/kit";
import domain from "../domain.js";
import getNmConfig from "../getNmConfig.js";

export const GET = async ({ params, request }) => {
    const html = await fetch(`${domain(params.s)}/account`, {
        headers: new Headers({
            cookie: request.headers.get("cookie") ?? "",
        }),
    }).then((r) => {
        if (r.ok) return r.text();
        throw error(r.status);
    });

    const options = getNmConfig<TransloaditOptions>(html, "transloadit_avatar_options");
    if (options) return json(options);

    throw error(404);
};
