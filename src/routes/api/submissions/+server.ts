import { error } from "@sveltejs/kit";

export const GET = () => {
    throw error(404);
};
