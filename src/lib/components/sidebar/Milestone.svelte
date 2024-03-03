<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import Icon from "$elem/Icon.svelte";
    import RarityText from "$elem/RarityText.svelte";
    import SettCoverWithIcon from "$elem/SettCoverWithIcon.svelte";
    import Time from "$elem/Time.svelte";
    import { num2text } from "$lib/utils/format";
    import resolve from "$lib/actions/resolve";

    /**
     * The milestone data
     */
    export let milestone: NM.Milestone;
</script>

<svelte:options immutable />

<a href={milestone.sett.public_url} use:resolve={{ sett: milestone.sett }}>
    <aside>
        <SettCoverWithIcon sett={milestone.sett} />
    </aside>
    <section>
        <header>{milestone.sett.name}</header>
        <div>
            <span class="default">
                By <span class="creator">{milestone.sett.creator.name}</span>
            </span>
            <span class="hovered">
                {#if milestone.completed_date}
                    <Time stamp={milestone.completed_date} />
                {:else if (milestone.discontinue_date)}
                    <Time stamp={milestone.discontinue_date} />
                    to collect
                {/if}
            </span>
        </div>
    </section>
    <div class="badge">
        <div class="default">
            <Icon icon={milestone.css_class} />
            <RarityText rarity={milestone.css_class}>
                {milestone.owned}/{milestone.total}
            </RarityText>
        </div>
        <div class="hovered">
            <Icon icon="carat" />
            {num2text(milestone.reward, 0, false)}
        </div>
    </div>
</a>

<style>
    a {
        padding: 10px;
        gap: 0 10px;
        text-decoration: none;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        cursor: pointer;
        font-size: 15px;
        font-weight: 400;
        overflow: hidden;
        border-bottom: 1px solid #efefef;
        --icon-size: 20px;
    }
    a:hover {
        background: #f4f4f4;
    }
    a:not(:hover) .hovered, a:hover .default {
        display: none;
    }
    aside {
        width: 40px;
        border-radius: 8px;
        overflow: hidden;
    }
    section {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        color: #2c2830;
    }
    section div {
        font-size: 13px;
        color: #8A7F95;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    section div span :global(time) {
        font-size: 13px;
        font-style: normal;
    }
    .creator {
        color: #109DE6;
    }
    .badge {
        width: 24px;
        margin-bottom: 4px;
    }
    .badge > * {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        font-size: 12px;
        text-transform: uppercase;
    }
    .badge .hovered {
        font-weight: 500;
        color: #085B85;
    }
</style>
