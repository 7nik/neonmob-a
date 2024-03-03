<!-- @component
    Shows a popover with the detailed series completion progress
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import Icon from "$elem/Icon.svelte";
    import SettCompletionGraph from "$elem/SettCompletionGraph.svelte";
    import { firstNamePossessive } from "$lib/services/user";
    import PopoverWindow from "./PopoverWindow.svelte";

    export let element: Element;
    export let sett: NM.Sett;
    export let owner: NM.UserMinimal;
    /**
     * Hide the header with the progress owner's name
     */
    export let hideHeader = false;
</script>

<PopoverWindow {element} on:closed>
    {#if !hideHeader}
        <h3>
            {firstNamePossessive(owner, true)}
            "{sett.name}"
            Progress
        </h3>
    {/if}
    <div>
        <h3>Core Series Progress</h3>
        {#each sett.core_stats as stat}
            <span>
                <Icon icon={stat.class_name}/>
                {stat.owned}/{stat.total} {stat.name}
            </span>
        {/each}
        <aside>
            <SettCompletionGraph {sett} ownerId={owner.id} show={"core"} size={70} darkTheme />
        </aside>
    </div>
    {#if sett.special_stats?.length}
        <div>
            <h3>Special Series Progress</h3>
            {#each sett.special_stats as stat}
                <span>
                    <Icon icon={stat.class_name}/>
                    {stat.owned}/{stat.total} {stat.name}
                </span>
            {/each}
            <aside>
                <SettCompletionGraph
                    {sett}
                    ownerId={owner.id}
                    show={"specials"}
                    size={70}
                    darkTheme
                />
            </aside>
        </div>
    {/if}
</PopoverWindow>

<style>
    h3 {
        white-space: normal;
        padding: 15px;
        color: #2c2830;
        margin-bottom: 0;
    }
    div {
        border-top: 1px solid #d6d6d6;
        padding-bottom: 15px;
        display: grid;
        grid-template-columns: 1fr auto;
    }
    span {
        padding: 0 15px;
        line-height: 1.5;
        text-transform: capitalize;
        --icon-size: 20px;
    }
    aside {
        grid-area: 1/2 / 7/3;
        padding: 7.5px 15px;
    }
</style>
