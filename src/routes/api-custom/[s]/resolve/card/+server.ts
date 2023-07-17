import type NM from "$lib/utils/NM Types";
import { error, json } from "@sveltejs/kit";
import { merge } from "$api/utils";
import domain from "../../domain";
import getEmbeddedJson from "../getEmbeddedJson";

export const GET = async ({ params, url }) => {
    const settSlug = url.searchParams.get("settSlug");
    const cardSlug = url.searchParams.get("cardSlug");
    if (!settSlug || !cardSlug) throw error(400);

    let printId = url.searchParams.get("printId");
    printId = printId ? `${printId}/` : "";

    const html = await fetch(
        `${domain(params.s)}/series/${settSlug}/${cardSlug}/${printId}`,
    ).then((r) => {
        if (r.ok) return r.text();
        throw error(r.status);
    });

    const rawPrint = getEmbeddedJson<NM.Unmerged.Container<NM.Unmerged.Prints>>(
        html,
        "piece-detail-piece",
    );
    const print = rawPrint ? merge(rawPrint) : null;
    const owner = getEmbeddedJson<NM.Unmerged.UserLong>(html, "piece-detail-target-user");

    return json({
        cardId: print?.id,
        print,
        owner,
    });
};
