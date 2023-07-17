import { json } from "@sveltejs/kit";
import { paginate } from "$db/utils";

export const GET = ({ url }) => json(paginate([], url, 0));
