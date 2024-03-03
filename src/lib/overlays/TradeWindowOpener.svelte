<!-- @component
    A middleware to open a trade window
 -->
<script lang="ts" context="module">
    import type { ComponentProps } from "svelte";
    import type NM from "$lib/utils/NM Types";
    import type { ID } from "$lib/utils/NM Types";
    import type { Actors } from "$elem/TradeWindow.svelte";

    import { get } from "svelte/store";
    import { page } from "$app/stores";
    import { getUserData } from "$api";
    import useHistory from "$lib/overlays/useHistory";
    // eslint-disable-next-line import/no-self-import
    import Overlay from "./TradeWindowOpener.svelte";

    const { view, close } = useHistory(
        "trade window",
        () => Overlay,
        async (url, data?: ComponentProps<Overlay>) => {
            if (data?.tradeId) {
                return {
                    tradeId: data.tradeId,
                };
            }
            // eslint-disable-next-line sonarjs/no-duplicate-string
            const tradeId = new URL(url).searchParams.get("view-trade");
            if (tradeId) {
                return {
                    tradeId: +tradeId,
                };
            }

            if (data?.partner) {
                return {
                    tradeId: 0,
                    partner: data.partner,
                    firstCard: data.firstCard,
                };
            }
            const userId = new URL(url).searchParams.get("new-trade");
            if (userId) {
                return {
                    tradeId: 0,
                    partner: await getUserData(+userId),
                };
            }
            throw new Error("Huh?");
        },
    );

    /**
     * Open an existing trade
     * @param id - the trade id
     */
    export function viewTrade (id: ID<"trade">) {
        const url = new URL(get(page).url);
        url.searchParams.delete("new-trade");
        url.searchParams.set("view-trade", id.toString());
        view({ tradeId: id }, url.toString());
    }

    /**
     * Start a new trade
     * @param partner - the trade partner
     * @param firstCard - optional info about an initial card
     * @param backButtonText - optional name of the back button
     */
    export function startTrade (
        partner: NM.User,
        firstCard: ComponentProps<Overlay>["firstCard"] = null,
        backButtonText: ComponentProps<Overlay>["backButtonText"] = null,
    ) {
        const url = new URL(get(page).url);
        url.searchParams.delete("view-trade");
        url.searchParams.set("new-trade", partner.id.toString());
        view({
            tradeId: 0,
            partner,
            firstCard,
            backButtonText,
        }, url.toString());
    }
</script>

<script lang="ts">
    import { onDestroy } from "svelte";
    import { liveListProvider } from "$api";
    import TradeWindow from "$elem/TradeWindow.svelte";
    import { viewCoreCompletion, viewLevelUp } from "$lib/dialogs";
    import { sidebarOverlay, sidebarTab } from "./sidebar";
    import { getRecentParams } from "$elem/TradePartnerFinder.svelte";
    import viewTradePartners from "./tradePartnerFinder";

    export let tradeId: ID<"trade">;
    export let partner: NM.User|null = null;
    export let firstCard: {
        side: "bidder"|"responder",
        card: Pick<NM.Card, "id"|"name"|"asset_type"|"piece_assets"|"is_replica">,
        sett: { id: ID<"sett">, name: string },
    }|null = null;
    export let backButtonText: "seekers" | "owners" | null = null;

    // eslint-disable-next-line sonarjs/cognitive-complexity
    async function closeTrade (backOrTrade: boolean|NM.Trade) {
        close();
        window.history.replaceState(window.history.state, "", window.location.pathname);
        if (backOrTrade === true) {
            sidebarTab.set(null);
            const params = getRecentParams();
            if (params) {
                viewTradePartners(...params);
            }
            return;
        }
        sidebarTab.set(liveListProvider("trades").total > 0 ? "messages" : null);
        if (typeof backOrTrade !== "object") return;
        const trade = backOrTrade;
        for (const badge of trade.badges ?? []) {
            if (badge.type === "all_pieces") {
                badge.type = "all_rarity";
            }
        }
        // TODO show notifications of the badges
        // artSubscriptionService.broadcast("show-growl-notifications", trade.badges);
        // artSubscriptionService.broadcast("badge-achieved", trade.badges);
        const { currentUser } = $page.data;
        if (trade.level_ups && trade.level_ups.length > 0) {
            currentUser.level.set(trade.level_ups[trade.level_ups.length - 1]);
            for (const level of trade.level_ups) {
                // if (currentUser.areFeaturesGate() &&* level.new_features.length > 0) {
                //     rewardType: "gated-level-up",
                //     message: "Congratulations",
                //     okText: "FIND A SERIES",
                //     data: level,
                //     parentClass: "series-complete-reward",
                //     hasCloseBtn: true,
                // }
                await viewLevelUp(level);
            }
        }
        if (trade.state !== "accepted") return;
        if (trade.total_carats) currentUser.carats.set(trade.total_carats);

        for (const reward of trade.rewards ?? []) {
            // if (currentUser.areFeaturesGated()) {
            //     rewards.push({
            //         rewardType: "series-complete-beginner",
            //         message: "Awesome Job!",
            //         okText: "GREAT!",
            //         data: reward,
            //     });
            await viewCoreCompletion(reward);
        }
    }

    $: {
        if (tradeId) {
            sidebarOverlay.set({
                comp: TradeWindow,
                props: {
                    initialData: { tradeId },
                    backButtonText,
                    closeTrade,
                },
            });
        } else if (partner) {
            const you = $page.data.currentUser.user;
            const actors: Actors = {
                youAreBidder: true,
                bidder: you,
                responder: partner,
                you,
                partner,
            };
            sidebarOverlay.set({
                comp: TradeWindow,
                props: {
                    initialData: firstCard
                        ? { actors, ...firstCard }
                        : { actors },
                    backButtonText,
                    closeTrade,
                },
            });
        } else {
            console.error("Huh?");
        }
    }

    onDestroy(() => {
        sidebarOverlay.set({ comp: null, props: {} });
    });
</script>
