import { getActivityItem } from "$api";

export const load = ({ params, fetch }) => ({
    activity: getActivityItem("trade", +params.id, fetch),
});

export const trailingSlash = "never";
