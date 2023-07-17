import type { ID } from "$lib/utils/NM Types";

import { error } from "@sveltejs/kit";
import { getSubmission } from "$api";
import { getRecent } from "$lib/services/cache";

export const load = async ({ params, fetch }) => {
    const subId = Number(params.id) as ID<"submission">;

    const submission = getRecent("submission", subId) ?? await getSubmission(subId, fetch);
    if (!submission) throw error(404);

    return {
        submission,
    };
};

export const trailingSlash = "never";
