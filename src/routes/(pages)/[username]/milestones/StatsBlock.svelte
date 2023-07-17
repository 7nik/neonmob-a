<!-- @component
    Block of user's stastics
 -->
<script lang="ts">
    import type { IconName } from "$elem/Icon.svelte";
    import type NM from "$lib/utils/NM Types";

    import Icon from "$elem/Icon.svelte";
    import TradeGrade from "$elem/TradeGrade.svelte";

    export let block: NM.UserStats[0];
    export let user: NM.User;

    function getIcon (name: string) {
        return name.replace("icon-im-", "").replace("i ", "").replace("icon-", "") as IconName;
    }
</script>

<div class="block">
    <header>{block.name}</header>
    {#each block.stats as stat}
        <div class="row">
            <Icon icon={getIcon(stat.web_icon_selector)} />
            &nbsp; {stat.name}
            {#if stat.name === "Trader Grade"}
                <b><TradeGrade user={user} /></b>
            {:else}
                <b>{stat.value}</b>
            {/if}
        </div>
    {/each}
</div>

<style>
    .block {
        background: #fff;
        border-radius: 4px;
        color: #5f5668;
        --icon-size: 16px;
        --icon-color: #A19FA2;
    }
    header {
        border-bottom: 1px solid #d6d6d6;
        padding: 13px 15px;
        text-transform: uppercase;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: .5px;
    }
    .row {
        padding: 9px 15px;
        font-size: 15px;
    }
    .row b {
        font-weight: 500;
        float: right;
    }
</style>
