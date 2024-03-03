import type NM from "$lib/utils/NM Types";

import { sidebarOverlay } from "./sidebar";
import TradePartnerFinder from "$elem/TradePartnerFinder.svelte";

const viewTradePartners = (
    card: Pick<NM.Card, "id"|"name"|"asset_type"|"piece_assets"|"is_replica">,
    sett: { id: number, name: string },
    searchNeeders: boolean,
)  => sidebarOverlay.set({
    comp: TradePartnerFinder,
    props: {
        card,
        sett,
        searchNeeders,
    },
});

export default viewTradePartners;
