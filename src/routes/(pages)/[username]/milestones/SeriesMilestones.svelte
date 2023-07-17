<!-- @component
    Section with the user's series milestones
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";
    import type { ID } from "$lib/utils/NM Types";

    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { EndlessPaginator, getUserRarityMilestones, getUserSeriesMilestones } from "$api";
    import Icon from "$elem/Icon.svelte";
    import RarityText from "$elem/RarityText.svelte";
    import SettAsset from "$elem/SettCoverWithIcon.svelte";
    import resolve from "$lib/actions/resolve";
    import tip from "$lib/actions/tip";
    import { ordinal } from "$lib/utils/format";
    import { absUrl, infiniteScroll } from "$lib/utils/utils";
    import BadgeImage from "./BadgeImage.svelte";

    export let userId: ID<"user">;

    let sortOptions = [{
        name: "Series",
        key: "name",
        order: null,
    }, {
        name: "Milestone",
        key: "milestones",
        order: null,
    }, {
        name: "Rank",
        key: "rank",
        order: null,
    }, {
        name: "Time",
        key: "completion_time",
        order: null,
    }, {
        name: "Order",
        key: "completion_order",
        order: null,
    }] as { name: string, key: string, order: "desc"|"asc"|null }[];

    $: activeOption = sortOptions.find((o) => o.order !== null)
        ?? ($page.url.searchParams.has("settId")
            ? { key: "sett_id", order: $page.url.searchParams.get("settId") }
            : { key: "", order: "" });

    function toggleOrder (name: string) {
        for (const sortOption of sortOptions) {
            sortOption.order = sortOption.name === name
                ? (sortOption.order === "desc" ? "asc" : "desc")
                : null;
        }
        sortOptions = sortOptions;
    }

    let ready = false;
    let rarityBadges: NM.UserRarityStats | null;
    let rarityLoading = true;
    $: if (ready) {
        getUserRarityMilestones(userId).then((data) => {
            rarityBadges = data;
            rarityLoading = false;
        // unauthorized user cannot see the rarity stats
        }, () => { rarityLoading = false; });
    } else {
        rarityBadges = null;
    }
    $: seriesBadges = ready
        ? getUserSeriesMilestones(userId, activeOption.key, activeOption.order ?? "")
        : new EndlessPaginator<NM.SettMilestones>();
    $: loadingSeries = seriesBadges?.isLoadingStore;

    infiniteScroll(() => seriesBadges.loadMore());

    onMount(() => {
        ready = true;
    });
</script>

<section class="series">
    <div class="totals">
        {#if rarityBadges}
            <div>
                <div class="badges">
                    {#each rarityBadges.core as badge}
                        <div>
                            <img src={badge.image_url} alt="{badge.name} badge"
                                use:tip={`Completed ${badge.name}`}
                            >
                            <RarityText rarity={badge.css_class}>{badge.count}</RarityText>
                        </div>
                    {/each}
                </div>
                <div class="title">
                    CORE MILESTONES
                </div>
            </div>
            <div class="base">
                <img src={rarityBadges.base.image_url} alt="{rarityBadges.base.name} badge"
                    use:tip={`Completed ${rarityBadges.base.name}`}
                >
                <RarityText rarity={rarityBadges.base.css_class}>
                    {rarityBadges.base.count}/{rarityBadges.base.total}
                </RarityText>
            </div>
            <div class="pipe"></div>
            <div>
                <div class="badges">
                    {#each rarityBadges.special as badge}
                        <div>
                            <img src={badge.image_url} alt="{badge.name} badge"
                                use:tip={`Completed ${badge.name}`}
                            >
                            <RarityText rarity={badge.css_class}>{badge.count}</RarityText>
                        </div>
                    {/each}
                </div>
                <div class="title">
                    SPECIAL MILESTONES
                </div>
            </div>
        {/if}
        {#if rarityLoading}
            <div class="loading"><Icon icon="loader"/></div>
        {/if}
    </div>
    <header class="row">
        {#each sortOptions as sorting}
            <div>
                {sorting.name}
                <span class:selected={sorting.order !== null}>
                    <Icon icon={sorting.order === "asc" ? "ascendingSimple" : "descendingSimple"}
                        on:click={() => toggleOrder(sorting.name)}
                    />
                </span>
            </div>
        {/each}
    </header>
    {#each $seriesBadges as badges}
        <div class="row">
            <div class="info">
                <div class="thumb">
                    <SettAsset sett={badges.sett} />
                </div>
                <div class="links" use:resolve={{ sett: badges.sett }}>
                    <a href={absUrl(badges.sett.public_url)}>{badges.sett.name}</a>
                    <a href={badges.sett.creator.link}>{badges.sett.creator.name}</a>
                </div>
            </div>
            <div class="badges">
                {#each badges.milestones.core as badge}
                    <BadgeImage {badge} />
                {/each}
                <BadgeImage badge={badges.milestones.base} />
                <div class="pipe"></div>
                {#each badges.milestones.special as badge}
                    <BadgeImage {badge} />
                {/each}
            </div>
            <div class="stat rank" class:completed={badges.rank}>
                <Icon icon="rank" upper/>
                {badges.rank ? ordinal(badges.rank) : "--"}
            </div>
            <div class="stat time" class:completed={badges.completion_time !== "--"}>
                <Icon icon="time" upper/>
                {badges.completion_time}
            </div>
            <div class="stat order" class:completed={badges.completion_order}>
                <Icon icon="completed" upper/>
                {badges.completion_order ? ordinal(badges.completion_order) : "--"}
            </div>
        </div>
    {/each}
    {#if $loadingSeries}
        <div class="loading"><Icon icon="loader"/></div>
    {/if}
</section>

<style>
    .series{
        background: white;
        border-radius: 4px;
        color: #2c2830;
    }
    .totals {
        padding-top: 20px;
        margin: 0 auto;
        width: max-content;
        display: flex;
        text-align: center;
        font-size: 15px;
    }
    .totals > div {
        text-align: center;
        margin: 0 auto;
        width: min-content;
    }
    .totals .title {
        font-size: 10px;
        font-weight: 500;
        letter-spacing: .35px;
        margin: 8px 0;
    }
    .totals .badges {
        padding: 8px 30px;
        display: flex;
        gap: 40px;
        width: min-content;
        font-weight: 400;
    }
    .totals .badges div {
        min-width: 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
    }
    .totals .base {
        padding: 11px 13px;
    }
    .totals img {
        max-width: 40px;
        max-height: 40px;
    }
    .totals .pipe {
        height: 40px;
        margin: 14px .5em 0;
        border-color: #d6d6d6;
    }
    .loading {
        width: 100%;
        padding: 20px;
        text-align: center;
        --icon-size: 40px;
    }
    .totals .loading {
        padding: 28px 0 40px;
    }

    header {
        border-top: 1px solid rgba(214,214,214,.4);
        margin-top: 5px;
    }
    header div {
        margin: 2px 0;
        color: rgba(44, 40, 48, .8);
        font-size: 10px;
        font-weight: 500;
        letter-spacing: .35px;
        text-transform: uppercase;
    }
    header span {
        cursor: pointer;
        --icon-size: 13px;
        --icon-color: #bcbabd;
    }
    header span:hover, header .selected {
        --icon-color: #2c2830;
    }
    .row {
        display: flex;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid rgba(214,214,214,.4);
    }
    .row > :first-child {
        width: 30%;
        padding: 0 15px;
    }
    .row > :nth-child(2) {
        width: 47%;
        padding: 0 20px;
    }
    .row > :nth-child(3) {
        width: 9%;
        padding-left: 20px;
    }
    .row > :nth-child(4) {
        width: 9%;
        padding-left: 5px;
    }
    .row > :nth-child(5) {
        width: 9%;
        /* padding-left: 5px; */
    }
    .info {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .thumb {
        height: 60px;
        width: 60px;
        flex-shrink: 0;
    }
    .links {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .links a {
        color: #2c2830;
        font-size: 15px;
    }
    .links a + a {
        color: #857A90;
        font-size: 13px;
        font-style: italic;
    }
    .row .badges {
        display: flex;
        gap: 3px;
        justify-content: center;
        border-left: 1px solid rgba(214,214,214,.6);
        border-right: 1px solid rgba(214,214,214,.6);
    }
    .row .badges .pipe {
        height: 22px;
        margin: 0 6px;
        align-self: center;
        border-color: #d6d6d6;
    }
    .stat {
        font-size: 13px;
        color: rgba(128,128,128,.3);
        margin-top: 10px;
        --icon-size: 16px;
    }
    .stat.completed {
        color: rgba(57,52,62,.9);
        --icon-color: #A19FA2;
    }
    @media screen and (max-width: 960px) {
        .totals .loading {
            padding: 18px 0 40px;
        }
        .totals .badges {
            padding: 8px 20px;
            gap: 30px;
        }
        .totals img {
            max-width: 30px;
            max-height: 30px;
        }
        .info {
            min-width: 0;
        }
        .links, .links a {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .row .badges {
            border: none;
            gap: 3px;
        }
        .row > :nth-child(n + 3) {
            /* width: 12%; */
            padding-left: 0;
        }
    }
    @media screen and (max-width: 767px) {
        .totals .badges {
            padding: 6px 0px;
            gap: 10px;
        }
        .totals .base {
            padding-right: 5px;
            padding-top: 9px;
        }
        .row {
            display: grid;
            grid-template-areas: "info badges badges badges" "info rank time order";
            grid-template-columns: 35% 1fr 70px 1fr;
            gap: 0 10px;
        }
        .row.row > * {
            width: auto;
        }
        .row > :first-child {
            grid-area: info;
        }
        .row > :nth-child(2) {
            grid-area: badges;
            justify-self: center;
        }
        .row > :nth-child(3) {
            grid-area: rank;
            justify-self: end;
        }
        .row > :nth-child(4) {
            grid-area: time;
            justify-self: center;
        }
        .row > :nth-child(5) {
            grid-area: order;
        }
        .row .badges .pipe {
            margin: 0;
        }
    }
    @media screen and (max-width: 480px) {
        .totals {
            font-size: 12px;
        }
        .totals .badges {
            gap: 3px;
        }
        .totals .badges div {
            min-width: 30px;
        }
        .totals .base {
            padding: 10px 3px 0;
        }
        .totals img {
            max-width: 20px;
            max-height: 20px;
        }
        .totals .pipe {
            height: 30px;
            margin-top: 10px;
        }
        .totals .title {
            font-size: 8px;
        }
        .row {
            display: grid;
            grid-template-areas: "info info info" "badges badges badges" "rank time order";
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
        }
        .row > :nth-child(2) {
            justify-self: start;
            padding-left: 15px;
        }
        .row > :nth-child(3) {
            justify-self: start;
            padding-left: 15px;
        }
        .row > :nth-child(4) {
            justify-self: start;
        }
    }
    @media screen and (max-width: 320px) {
        .totals .badges {
            gap: 0;
        }
        .totals .badges div {
            min-width: 25px;
        }
        .row .badges {
            border: none;
            gap: 0;
        }
    }
</style>
