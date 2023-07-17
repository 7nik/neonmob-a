import { getSubmissions } from "$api";

export const load = async ({ params, fetch }) => ({
    p: {
        submissions: getSubmissions(params.category, fetch).toPOJO(),
    },
});
