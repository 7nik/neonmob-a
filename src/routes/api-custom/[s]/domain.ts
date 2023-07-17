import { error } from "@sveltejs/kit";

const domains: Record<string, string> = {
    p: "https://www.neonmob.com",
    s: "https://staging.neonmob.com",
};

export default (s: string) => {
    if (s in domains) return domains[s];
    throw error(404);
};
