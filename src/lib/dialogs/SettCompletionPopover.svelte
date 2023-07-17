<!-- @component
    Shows a popover with the detailed series completion progress
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import Icon from "$elem/Icon.svelte";
    import SettCompletionGraph from "$elem/SettCompletionGraph.svelte";
    import currentUser from "$lib/services/currentUser";
    import PopoverWindow from "./PopoverWindow.svelte";

    export let element: Element;
    export let sett: NM.Sett;
    export let owner: Pick<NM.User, "id"|"first_name">;
</script>

<PopoverWindow {element} on:closed>
    <h3>
        { $currentUser.id === owner.id ? "Your" : `${owner.first_name}'s'` }
        "{sett.name}"
        Progress
    </h3>
    <div>
        <h3>Core Series Progress</h3>
        {#each sett.core_stats as stat}
            <span>
                <Icon icon={stat.class_name}/>
                {stat.owned}/{stat.total} {stat.name}
            </span>
        {/each}
        <aside>
            <SettCompletionGraph {sett} show={"core"} size={70} darkTheme />
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
                <SettCompletionGraph {sett} show={"specials"} size={70} darkTheme />
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
