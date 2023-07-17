<!-- @component
    A series item in a list
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import SettAsset from "$elem/SettCoverWithIcon.svelte";
    import resolve from "$lib/actions/resolve";

    export let sett: NM.Unmerged.FavoriteSetts["results"][number];
</script>

<div class="sett" use:resolve={{ sett }}>
    <a class="img" href={sett.links.permalink}>
            <SettAsset sett={sett} />
    </a>
    <div class="info">
        <a href={sett.links.permalink}>{sett.name}</a>
        <span>
            By
            <a href="/{sett.creator.username}">
                {sett.creator.name}
            </a>
        </span>
    </div>
    <slot/>
</div>

<style>
    .sett {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 10px 20px 10px 10px;
        background: white;
    }
    .img {
        flex-shrink: 0;
        display: block;
        width: 60px;
        height: 60px;
        border-radius: 4px;
        overflow: hidden;
    }
    .info {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        font-size: 15px;
    }
    .info span {
        font-size: 13px;
        color: #857a90;
    }
</style>
