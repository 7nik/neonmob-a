<!-- @component
    A section of the activity feed
 -->
<script lang="ts">
    import type { Paginator } from "$api";
    import type NM from "$lib/utils/NM Types";
    import { page } from "$app/stores";
    import { getActivityItem, ProxyPaginator } from "$api";
    import Activity, { activityHeight } from "$elem/activity/Activity.svelte";
    import Icon from "$elem/Icon.svelte";
    import ToggleSwitch from "$elem/ToggleSwitch.svelte";
    import infiniteScroll from "$lib/actions/infiniteScroll";
    import { array2columns } from "$lib/utils/utils";

    /**
     * The activities provider
     */
    export let paginator: Paginator<NM.ActivityAny>;

    const rarityPrice: Record<string, number> = {
        undefined: 1,
        null: 1,
        common: 1,
        uncommon: 2,
        rare: 4,
        veryRare: 8,
        extraRare: 16,
        chase: 32,
        variant: 24,
        legendary: 200,
    };
    /**
     * How much the trade is imbalanced in terms of rarities
     * 0 - perfectly balanced, >0 - bidder's cards are more expensive, <0 - responder's are such
     */
    function getTradeImbalance (trade: NM.ActivityTrade | NM.ActivityStoryTrade) {
        let bidderPrice = rarityPrice[trade.bidder.rarest_piece?.rarity];
        let responderPrice = rarityPrice[trade.responder.rarest_piece?.rarity];
        if ("items" in trade.bidder && "items" in trade.responder) {
            for (const item of trade.bidder.items) {
                bidderPrice += rarityPrice[item.rarity];
            }
            for (const item of trade.responder.items) {
                responderPrice += rarityPrice[item.rarity];
            }
        }
        return Math.round(bidderPrice >= responderPrice
            ? bidderPrice / responderPrice - 1
            : 1 - responderPrice / bidderPrice);
    }

    let stats = [{
        userId: 0,
        name: ($page.data.user as NM.User)?.name ?? "Total",
        link: "",
        trades: new Set(),
        cards: [0, 0],
        score: 0,
    }] as {
        userId: number,
        name: string,
        link: string,
        trades: Set<number>,
        cards: [number, number],
        score: number,
    }[];
    // adds the trade into the statistics
    // eslint-disable-next-line sonarjs/cognitive-complexity
    function countStats (
        trade: NM.ActivityTrade | NM.ActivityStoryTrade,
        tradeId: number,
        imbalance: number,
    ) {
        if (stats[0].trades.has(tradeId)) return;
        const userId = ($page.data.user as NM.User)?.id;
        if (!userId) return;

        const isPartnerBidder = ("type" in trade ? trade.bidder : trade.bidder.user).id !== userId;
        // info of the trade partner
        const { id, full_name: name, profile_url: link } = isPartnerBidder
            ? ("type" in trade ? trade.bidder : trade.bidder.user)
            : ("type" in trade ? trade.responder : trade.responder.user);
        const partnerCards = isPartnerBidder ? trade.bidder.amt_items : trade.responder.amt_items;
        const userCards = isPartnerBidder ? trade.responder.amt_items : trade.bidder.amt_items;

        const stat = stats.find((item) => item.userId === id);
        if (stat) {
            stat.trades.add(tradeId);
            stat.score += imbalance;
            stat.cards[0] += partnerCards;
            stat.cards[1] += userCards;
        } else {
            stats.push({
                userId: id,
                name,
                link,
                trades: new Set([tradeId]),
                cards: [partnerCards, userCards],
                score: imbalance,
            });
        }
        stats[0].trades.add(tradeId);
        stats[0].cards[0] += userCards;
        stats[0].cards[1] += partnerCards;
        stats[0].score += imbalance;
        // keep the target user info on the first place, the rest sort by score
        stats = stats.sort((a, b) => (a.link && b.link ? b.score - a.score : (a.link ? 1 : -1)));
    }

    const cache = {} as Record<number, Promise<NM.ActivityStoryTrade>>;
    let threshold = 5;
    async function filterTrade (item: NM.ActivityAny) {
        if (item.type !== "trade-completed") return null;
        const tradeId = Number(item.detail_url.match(/\d+/)?.[0]);
        let imbalance = getTradeImbalance(item);
        if (item.bidder.amt_items === 1
            && item.responder.amt_items === 1
            && Math.abs(imbalance) < threshold
        ) {
            countStats(item, tradeId, imbalance);
            return null;
        }

        let trade: NM.ActivityStoryTrade;
        if (tradeId in cache) {
            trade = await cache[tradeId];
        } else {
            const promise = getActivityItem("trade", tradeId, fetch);
            cache[tradeId] = promise;
            trade = await promise;
        }
        imbalance = getTradeImbalance(trade);
        countStats(item, tradeId, imbalance);
        if (Math.abs(imbalance) < threshold) return null;

        return { ...item, imbalance };
    }

    let filterActivity = false;
    $: items = threshold && filterActivity ? new ProxyPaginator(paginator, filterTrade) : paginator;
    $: if (filterActivity) {
        items.loadMore().then((arr) => {
            if (arr.length < 3) items.loadMore();
        });
    }

    let pageWidth = 1000; // thus it will SSR for wide screen
    $: columnCount = Math.min(3, pageWidth / 350);
    $: columns = array2columns($items, columnCount, activityHeight);
    $: loading = items.isLoadingStore;

    async function loadMore () {
        if ($loading) return;
        // when filtered ensure that added at least one row
        let added = 0;
        items.loadMore().then((arr) => {
            added += arr.length;
            if (added < columnCount) items.loadMore();
        });
    }
</script>

<svelte:window bind:innerWidth={pageWidth}/>

<section use:infiniteScroll={loadMore}>
    <div class="filtering">
        <ToggleSwitch bind:value={filterActivity}>Filter for sus trades</ToggleSwitch>
    </div>
    {#if filterActivity}
        <div class="stats">
            <label>
                Threshold: <input type="number" min="1" bind:value={threshold} />
            </label>
            {#if stats.length > 1}
                <!-- eslint-disable-next-line max-len -->
                {@const sus = stats.filter((user, i) => !i || Math.abs(user.score) * 1.5 / user.trades.size > threshold)}
                {#each sus as user, i}
                    <div>
                        {#if i}
                            <a href={user.link}>{user.name}:</a>
                        {:else}
                            <b>{user.name}:</b>
                        {/if}
                        {user.trades.size} trades
                        <small>
                            ({user.cards[0]}/{user.cards[1]} cards)
                        </small>
                        with ~{Math.abs(Math.round(user.score / user.trades.size))} poi
                    </div>
                {/each}
                <i>{stats.length - sus.length - 1} traders skipped</i>
            {/if}
        </div>
    {/if}
    <div class="activity">
        {#each columns as column}
            <span class="column">
                {#each column as activity}
                    {#if "imbalance" in activity}
                        <span data-num={Math.abs(Number(activity.imbalance))}>
                            <Activity {activity} />
                        </span>
                    {:else}
                        <Activity {activity} />
                    {/if}
                {/each}
            </span>
        {/each}
    </div>
    {#if $loading}
        <div class="loading"><Icon icon="loader" /></div>
    {/if}
</section>

<style>
    .filtering {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-direction: column;
        font-weight: 300;
    }
    .stats label {
        padding: 5px 0;
        display: block;
    }
    .stats {
        text-align: center;
    }
    .stats a, .stats b {
        font-weight: 500;
    }
    .activity {
        display: flex;
        justify-content: center;
    }
    .column:first-child {
        margin-left: -10px;
    }
    .column {
        display: inline-flex;
        flex-direction: column;
    }
    [data-num] {
        position: relative;
    }
    [data-num]::after {
        content: attr(data-num);
        position: absolute;
        bottom: 10px;
        left: 15px;
        color: red;
        font-weight: 700;
    }
    .loading {
        padding: 40px;
        text-align: center;
        --icon-size: 40px;
    }
    @media screen and (min-width: 1700px) {
        .stats {
            position: sticky;
            top: 50px;
            height: 0;
            margin-left: calc(50% + 480px);
            text-align: left;
        }
    }
    @media screen and (max-width: 320px) {
        .column:first-child {
            margin: 0;
            width: 100%;
        }
    }
</style>
