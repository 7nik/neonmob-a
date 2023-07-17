<!-- @component
    General and difficulties statistics about the user
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import { onMount, tick } from "svelte";
    import { getUserStatsDifficulty } from "$api";
    import Icon, { type IconName } from "$elem/Icon.svelte";
    import SectionHeader from "$elem/SectionHeader.svelte";
    import { comma } from "$lib/utils/format";
    import StatsBlock from "./StatsBlock.svelte";

    /**
     * The target user
     */
    export let user: NM.User;
    /**
     * User's statistics
     */
    export let stats: Promise<NM.UserStats>;
    /**
     * User's level
     */
    export let level: NM.UserLevel;
    /**
     * User's current level points
     */
    export let currentPoints: number;

    const levelIcon = level.app_icon_selector as IconName;
    const gradient = `linear-gradient(90deg, ${level.icon_color} 0, ${level.gradient_color} 100%)`;
    let progress = 0;
    let difficulties: NM.UserDifficultyStat[] | null;

    onMount(async () => {
        await tick(); // make a pause to render 0 progress
        progress = level.current_progress;
        difficulties = await getUserStatsDifficulty(user.id);
    });
</script>

<section class="level">
    <h3 style:color={level.icon_color}>{level.name}</h3>
    <div class="progress">
        <div class="icon" style:background={level.icon_color}><Icon icon={levelIcon}/></div>
        <div class="track">
            <div style:width="{progress}%" style:background={gradient}></div>
        </div>
        <div class="icon"><Icon icon="question"/></div>
    </div>
    <div class="points">
        <b style:color={level.icon_color}>LEVEL {level.level}</b>
        <span>{comma(currentPoints)} / {comma(level.points_required)}</span>
        <b style:color={level.gradient_color}>LEVEL {level.level + 1}</b>
    </div>
</section>
<section class="stats">
    {#await stats}
        <div class="loading"><Icon icon="loader"/></div>
    {:then stats}
        {#each stats as block}
            {#if "name" in block}
                <StatsBlock {block} {user} />
            {/if}
        {/each}
    {/await}
</section>
<SectionHeader title="Stats by Series Difficulty" small/>
<section class="stats">
    {#if difficulties}
        {#each difficulties as block}
            <StatsBlock {block} {user} />
        {/each}
    {:else}
        <div class="loading"><Icon icon="loader"/></div>
    {/if}
</section>

<style>
    section {
        margin-bottom: 10px;
    }
    .level {
        background: #fff;
        border-radius: 0 0 4px 4px;
        padding: 14px 15px 20px;
    }
    .level h3 {
        font-size: 18px;
        font-weight: 700;
        text-align: center;
        text-transform: uppercase;
    }
    .level .progress {
        display: flex;
        align-items: center;
    }
    .level .icon {
        background: #efefef;
        border: 4px solid #fff;
        border-radius: 20px;
        height: 36px;
        width: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
        --icon-size: 16px;
        --icon-color: #fff;
    }
    .level .track {
        flex-grow: 1;
        height: 12px;
        margin: 0 -10px;
        background: #efefef;
    }
    .level .track div {
        width: 0;
        height: 100%;
        border-radius: 20px;
        transition: width .5s linear;
    }
    .level .icon ~ .icon {
        --icon-size: 18px;
        --icon-color: #39343E;
    }
    .level .points {
        display: flex;
        justify-content: space-between;
        padding: 10px 5px 0;
        font-size: 13px;
    }
    .level .points span {
        color: #5F5668;
        font-weight: 500;
    }
    .stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        /* margin: 10px 0; */
    }
    .loading {
        width: 100%;
        padding: 60px;
        text-align: center;
        grid-column: 1/5;
        --icon-size: 40px;
    }
    @media screen and (max-width: 960px) {
        .stats {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    @media screen and (max-width: 640px) {
        .stats {
            grid-template-columns: 1fr;
        }
    }
</style>
