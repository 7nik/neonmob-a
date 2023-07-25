<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import Avatar from "$elem/Avatar.svelte";
    import Button from "$elem/Button.svelte";
    import Clickable from "$elem/Clickable.svelte";
    import Icon, { type IconName } from "$elem/Icon.svelte";
    import TradeGrade, { getLetterGrade } from "$elem/TradeGrade.svelte";
    import tip from "$lib/actions/tip";
    import { viewBio } from "$lib/dialogs";
    import { resolve } from "$lib/services/cache";
    import currentUser from "$lib/services/currentUser";
    import { linky } from "$lib/utils/format";
    import DisplayCase from "./DisplayCase.svelte";
    import drawProgressCircle from "./drawProgressCircle";

    const creatorTip = "I'm a NeonMob Creator! Visit my Creator profile to collect my series.";

    export let data;
    $: u = data.user;
    $: resolve.user.set(u.username, u.id);

    // eslint-disable-next-line prefer-destructuring
    $: tab = $page.url.pathname.split("/")[2];

    $: levelIcon = u.level.app_icon_selector as IconName;
    let bioHeight = 0;

    // get the bio section height
    function getHeight (elem: Element) {
        new ResizeObserver(([entry]) => {
            bioHeight = entry.target.scrollHeight;
        }).observe(elem);
    }

    let canvas: HTMLCanvasElement;
    onMount(() => {
        // display and animate level progress on the avatar
        const scale = 0.92; // compensate space taken by the level icon
        const center = 108; // twice bigger and then scale down by CSS to make it smooth
        canvas.width = center * 2;
        canvas.height = center * 2;
        const ctx = canvas.getContext("2d")!;
        // rotate canvas so line start right after the level icon
        ctx.translate(center, center);
        ctx.rotate(1.22); // 160deg - 70deg in rad
        ctx.translate(-center, -center);

        drawProgressCircle({
            ctx,
            cx: center,
            cy: center,
            r: center - 8,
            thickness: 8,
            endValue: u.level.current_progress / 100 * scale,
            bgColor: "#e1e1e1",
            startColor: u.level.icon_color,
            endColor: u.level.gradient_color,
        });
    });

    let milestonesCount: number|"?";
    let favoritesCount: number|"?";
    $: {
        milestonesCount = "?";
        favoritesCount = "?";
        // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
        data.p.stats.then(([, milestones, , , favorites]) => {
            milestonesCount = Number.parseInt(milestones.stats[1].value, 10)
                + Number.parseInt(milestones.stats[2].value.replaceAll(",", ""), 10);
            favoritesCount = favorites.fav_pieces_count + favorites.fav_setts_count;
        });
    }
</script>

{#if ["collection", "cards", "activity"].includes(tab)}
    <DisplayCase userId={data.user.id} />
{/if}

<header>
    <div>
        <a class="avatar" href={u.links.profile}>
            <Avatar user={u} size="fill" />
            <canvas bind:this={canvas} />
            <div class="icon" style:background={u.level.icon_color}>
                <Icon icon={levelIcon} />
            </div>
        </a>
        <section class="main">
            <h1>
                {#if u.pro_badge}
                    <Icon icon="pro" upper hint="Pro Collector" />
                {/if}
                {u.name}
                {#if u.has_released_sett || currentUser.is(u) && u.is_creator}
                    <a href="/creator/{u.username}" use:tip={creatorTip}>
                        <Icon icon="creator-colored"/>
                        Creator Profile
                    </a>
                {/if}
            </h1>
            <div class="info">
                <span>level {u.level.level} - {u.level.name}</span>
                <i class="pipe"></i>
                <span>
                    <span class="hide-on-small">current</span>
                    streak &nbsp; <Icon icon="streak" upper /> &nbsp; &nbsp;
                    <b>{u.streaks.current_streak}</b>
                </span>
                <i class="pipe"></i>
                <span>
                    <span class="hide-on-small">trade</span>
                    grade &nbsp; &nbsp; <TradeGrade user={u} />
                </span>
            </div>
            <div class="bio">
                <div class="bio-text" use:getHeight>
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html linky(u.bio)}
                </div>
                <div class="bio-actions">
                    <!-- show when div's height is over 36px -->
                    {#if bioHeight > 36}
                        <Clickable link on:click={() => viewBio(u)}>
                            <span class="show-full">Expand Full Bio</span>
                        </Clickable>
                    {/if}
                    {#if currentUser.is(u)}
                        <Button type="borderless" icon="edit" on:click={() => viewBio(u, true)}>
                            <span class="edit-bio">Edit Bio</span>
                        </Button>
                    {/if}
                </div>
            </div>
            <div class="actions">
                {#if currentUser.isAuthenticated && !currentUser.is(u)}
                    <!-- disable all if is blocked -->
                    <Button icon="chat" type="subdued-dark" size="nano"
                        hint="Send a Message"
                    >message</Button>
                    <!-- TODO toggle if is friend -->
                    <Button icon="add" type="subdued-dark" size="nano"
                        hint="Add to Friend List"
                    >friend list</Button>
                    <Button icon="trade" type="subdued-dark" size="nano"
                        hint="{u.name}'s trader grade is: {getLetterGrade(u.trader_score)}"
                    >trade</Button>
                {/if}
                <Button icon="share" type="subdued-dark">share</Button>
            </div>
        </section>
        <section class="stats">
            <a href="/{u.username}/milestones/" class="box">
                <Icon icon="badge" />
                <div>
                    <b>{milestonesCount}</b>
                    milestones
                </div>
            </a>
            <a href="/{u.username}/cards/" class="box">
                <Icon icon="cards" />
                <div>
                    <b>{u.num_prints}</b>
                    cards
                </div>
            </a>
            <a href="/{u.username}/favorites/" class="box">
                <Icon icon="like" />
                <div>
                    <b>{favoritesCount}</b>
                    favorites
                </div>
            </a>
            <a href="/{u.username}/milestones/" class="box">
                <Icon icon="best-streak" />
                <div>
                    <b>{u.streaks.best_streak}</b>
                    best streak
                </div>
            </a>
        </section>
    </div>
</header>
<slot/>

<style>
    header {
        background: #fff;
        border: 1px solid #EBEBEB;
    }
    header > div {
        width: 960px;
        position: relative;
        margin: 20px auto 14px;
        display: flex;
        align-items: flex-start;
        gap: 18px;
        color: #857A90;
    }
    .avatar {
        flex-shrink: 0;
        width: 100px;
        aspect-ratio: 1;
        position: relative;
    }
    .avatar .icon {
        border-radius: 50%;
        position: absolute;
        border: 3px solid #efefef;
        height: 28px;
        width: 28px;
        left: 65px;
        top: 76px;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        --icon-size: 14px;
        --icon-color: white;
    }
    .avatar canvas {
        position: absolute;
        top: -58px;
        left: -58px;
        scale: 0.5;
    }
    .main {
        flex-grow: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .main h1 a {
        width: 125px;
        height: 30px;
        padding: 5px;
        float: right;
        background: #4F3969;
        box-shadow: inset 0 -1px 0 rgba(0,0,0,.2);
        border-radius: 4px;
        font-size: 13px;
        color: #fff;
        --icon-size: 22px;
    }
    .main h1 {
        color: #191417;
        margin: 0;
        /* overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap; */
        --icon-size: 26px;
    }
    .info {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-wrap: wrap;
        white-space: nowrap;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .5px;
        --icon-size: 16px;
        --icon-color: #a09fa1;
    }
    .info b {
        color: #191417;
        font-size: 14px;
        font-weight: 500;
    }
    .info .pipe {
        height: 15px;
        border-right: 1px solid #d6d6d6;
        margin: 0 10px;
    }
    .bio {
        max-width: 100%;
    }
    .bio-text {
        font-size: 13px;
        line-height: 18px;
        white-space: pre-wrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
    .bio-actions {
        margin-top: 10px;
        display: flex;
        gap: 10px;
        --icon-size: 13px;
        --icon-color: #857a90;
    }
    .bio-actions span {
        font-size: 13px;
        font-weight: 400;
        letter-spacing: 0;
        text-transform: none;
    }
    .show-full {
        color: #0d9ce6;
    }
    .edit-bio {
        color: #857A90;
    }
    .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }
    .actions :global(button) {
        font-size: 11px;
        padding: 7.5px 11.25px;
        --icon-size: 11px;
    }
    .actions :global(button:last-child) {
        --icon-size: 13px;
    }

    .stats {
        border: 0.5px solid #ccc;
        border-radius: 4px;
        overflow: hidden;
        min-width: 210px;
        display: grid;
        grid-template-columns: auto auto;
        grid-template-rows: auto auto;
        gap: 1px;
        background: #EDEDED;
    }
    .stats .box {
        padding: 10px 8px 6px;
        display: flex;
        gap: 6px;
        background: white;
        font-size: 13px;
        --icon-size: 16px;
    }
    .stats .box:hover {
        background: #efefef;
    }
    .stats .box:first-child {
        --icon-color: #C18BF2;
    }
    .stats .box:nth-child(2) {
        --icon-color: #4bbbf5;
    }
    .stats .box:nth-child(3) {
        --icon-color: #ffcf2f;
    }
    .stats .box:last-child {
        --icon-size: 20px;
    }
    .stats .box:not(:hover) {
        --icon-color: #b6afbc;
    }
    .stats .box:last-child:not(:hover) > :global(:first-child) {
        /* this icon is an image so we color it with this hack */
        filter: brightness(5) sepia(1) brightness(0.7) hue-rotate(210deg);
    }
    .stats .box div {
        display: inline-block;
        color: #857a90;
    }
    .stats .box b {
        display: block;
        color: #191417;
        font-size: 16px;
        font-weight: 500;
        line-height: 19px;
    }

    @media screen and (max-width: 960px) {
        header > div {
            width: 100%;
            padding: 5px 15px 0;
        }
    }
    @media screen and (max-width: 640px) {
        header > div {
            flex-wrap: wrap;
            gap: 10px;
        }
        .avatar {
            width: 80px;
            top: -3px;
            left: -3px;
        }
        .avatar .icon {
            width: 24px;
            height: 24px;
            left: 50px;
            top: 58px;
            --icon-size: 10px;
        }
        .avatar canvas {
            width: 86px;
        }
        .main {
            max-width: calc(100% - 100px);
        }
        .main h1 {
            font-size: 22px;
            --icon-size: 20px;
        }
        .stats {
            flex-grow: 1;
            grid-template-columns: repeat(4, 1fr);
            gap: 0 1px;
            border-color: #EDEDED;
        }
    }
    @media screen and (max-width: 480px) {
        header > div {
            flex-direction: column;
            align-items: center;
        }
        .main, .main h1 {
            max-width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .stats {
            width: 100%;
            grid-template-columns: 1fr 1fr;
            gap: 1px;
        }
    }
</style>
