import { getActivityItem } from "$api";

export const load = ({ params, fetch }) => ({
    activity: getActivityItem("pack-opened", +params.id, fetch),
});

export const trailingSlash = "never";
