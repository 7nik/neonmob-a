<script lang="ts">
    import { page } from "$app/stores";
    import Avatar from "$elem/Avatar.svelte";
    import Button from "$elem/Button.svelte";
    import Clickable from "$elem/Clickable.svelte";
    import Icon, { type IconName } from "$elem/Icon.svelte";
    import TradeGrade, { getLetterGrade } from "$elem/TradeGrade.svelte";
    import progressCircle from "$lib/actions/progressCircle";
    import tip from "$lib/actions/tip";
    import { fail, viewBio } from "$lib/dialogs";
    import { viewConversation } from "$lib/overlays";
    import { startTrade } from "$lib/overlays/TradeWindowOpener.svelte";
    import { resolve } from "$lib/services/cache";
    import { linky } from "$lib/utils/format";
    import DisplayCase from "./DisplayCase.svelte";

    const creatorTip = "I'm a NeonMob Creator! Visit my Creator profile to collect my series.";

    export let data;

    const { isAuthenticated, isCurrentUser, isVerified, vacationMode } = data.currentUser;

    // let canTrade = true;
    let canFriend = true;

    $: ({ user, isFriend, isBlocked } = data);
    $: resolve.user.set(user.username, user.id);

    // eslint-disable-next-line prefer-destructuring
    $: tab = $page.url.pathname.split("/")[2];

    $: levelIcon = user.level.app_icon_selector as IconName;
    let bioHeight = 0;

    // get the bio section height
    function getHeight (elem: Element) {
        new ResizeObserver(([entry]) => {
            bioHeight = entry.target.scrollHeight;
        }).observe(elem);
    }

    // params for level progress on the avatar
    $: progressParams = {
        bgColor: "#e1e1e1",
        startColor: user.level.icon_color,
        endColor: user.level.gradient_color,
        // twice bigger and then scale down by CSS to make it smooth
        radius: 100,
        thickness: 8,
        startAngle: 160,
        // convert to 0..1 range and compensate space taken by the level icon
        progress: user.level.current_progress / 100 * 0.92,
    };

    let milestonesCount: number|"?";
    let favoritesCount: number|"?";
    $: {
        milestonesCount = "?";
        favoritesCount = "?";
        // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
        data.p.stats.then(([, milestones, , , favorites]) => {
            if (!milestones && !favorites) return;
            milestonesCount = Number.parseInt(milestones.stats[1].value, 10)
                + Number.parseInt(milestones.stats[2].value.replaceAll(",", ""), 10);
            favoritesCount = favorites.fav_pieces_count + favorites.fav_setts_count;
        });
    }
</script>

{#if ["collection", "cards", "activity"].includes(tab)}
    <DisplayCase user={data.user} />
{/if}

<header>
    <div>
        <a class="avatar" href={user.links.profile}>
            <Avatar user={user} size="fill" />
            <canvas use:progressCircle={progressParams} />
            <div class="icon" style:background={user.level.icon_color}>
                <Icon icon={levelIcon} />
            </div>
        </a>
        <section class="main">
            <h1>
                {#if user.pro_badge}
                    <Icon icon="pro" upper hint="Pro Collector" />
                {/if}
                {user.name}
                {#if user.has_released_sett || $isCurrentUser(user) && user.is_creator}
                    <a href="/creator/{user.username}" use:tip={creatorTip}>
                        <Icon icon="creator-colored"/>
                        Creator Profile
                    </a>
                {/if}
            </h1>
            <div class="info">
                <span>level {user.level.level} - {user.level.name}</span>
                <i class="pipe"></i>
                <span>
                    <span class="hide-on-small">current</span>
                    streak &nbsp; <Icon icon="streak" upper /> &nbsp; &nbsp;
                    <b>{user.streaks.current_streak}</b>
                </span>
                <i class="pipe"></i>
                <span>
                    <span class="hide-on-small">trade</span>
                    grade &nbsp; &nbsp; <TradeGrade user={user} />
                </span>
            </div>
            <div class="bio">
                <div class="bio-text" use:getHeight>
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html linky(user.bio)}
                </div>
                <div class="bio-actions">
                    <!-- show when div's height is over 36px -->
                    {#if bioHeight > 36}
                        <Clickable link on:click={() => viewBio(user)}>
                            <span class="show-full">Expand Full Bio</span>
                        </Clickable>
                    {/if}
                    {#if $isCurrentUser(user)}
                        <Button type="borderless" icon="edit" on:click={() => viewBio(user, true)}>
                            <span class="edit-bio">Edit Bio</span>
                        </Button>
                    {/if}
                </div>
            </div>
            <div class="actions">
                {#if $isAuthenticated && !$isCurrentUser(user)}
                    {#if $isBlocked.isBlocked && $isBlocked.isBlockedByUser}
                        <span class="text-body text-emphasis bio-actions--text">
                            You have blocked this user
                        </span>
                        <Button type="subdued-dark"
                            on:click={() => data.otherUsers.unblockUser(user.id)}
                        >Unblock</Button>
                    {:else}
                        {#if $isBlocked.isBlocked}
                            <Button icon="chat" type="disabled-dark" size="nano"
                                hint="This user has blocked you"
                            >message</Button>
                            <Button icon="add" type="disabled-dark" size="nano"
                                hint="Remove from Friend List"
                            >friend list</Button>
                            <Button icon="trade" type="disabled-dark" size="nano"
                                hint="This user has blocked you"
                            >trade</Button>
                        {:else}
                            <Button icon="chat" type="subdued-dark" size="nano"
                                hint="Send a Message"
                                on:click={() => viewConversation(user.id)}
                            >message</Button>
                            {#if $isVerified && canFriend}
                                {#if $isFriend}
                                    <Button icon="minus" type="subdued-dark" size="nano"
                                        hint="Remove from Friend List"
                                        on:click={() => data.otherUsers.endFriendship(user.id)}
                                    >friend list</Button>
                                {:else}
                                    <Button icon="add" type="subdued-dark" size="nano"
                                        hint="Add to Friend List"
                                        on:click={() => data.otherUsers.startFriendship(user.id)}
                                    >friend list</Button>
                                {/if}
                            {/if}
                            <Button icon="trade" size="nano"
                                type={$vacationMode || user.vacation_mode ? "disabled-dark" : "subdued-dark"}
                                hint={$vacationMode ? "To enable, turn on trading in Settings"
                                    : user.vacation_mode ? "This user has disabled trading"
                                    : `${user.name}'s trader grade is: ${getLetterGrade(user.trader_score)}`}
                                on:click={() => startTrade(user)}
                            >trade</Button>
                        {/if}
                    {/if}
                {/if}
                <!-- TODO share profile popup -->
                <Button icon="share" type="subdued-dark"
                    on:click={fail}
                >share</Button>
            </div>
        </section>
        <section class="stats">
            <a href="/{user.username}/milestones/" class="box">
                <Icon icon="badge" />
                <div>
                    <b>{milestonesCount}</b>
                    milestones
                </div>
            </a>
            <a href="/{user.username}/cards/" class="box">
                <Icon icon="cards" />
                <div>
                    <b>{user.num_prints}</b>
                    cards
                </div>
            </a>
            <a href="/{user.username}/favorites/" class="box">
                <Icon icon="like" />
                <div>
                    <b>{favoritesCount}</b>
                    favorites
                </div>
            </a>
            <a href="/{user.username}/milestones/" class="box">
                <Icon icon="best-streak" />
                <div>
                    <b>{user.streaks.best_streak}</b>
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
