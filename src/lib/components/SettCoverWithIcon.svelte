<!-- @component
    Series cover with difficulty icon in the bottom left corner
 -->
 <script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import Icon from "$elem/Icon.svelte";

    export let sett: Pick<NM.Sett, "name"|"difficulty"|"sett_assets">;
</script>

<figure>
    <img src="{sett.sett_assets.small.url}" alt="{sett.name}'s cover">
    <span>
        <Icon icon={sett.difficulty.class_name} />
    </span>
</figure>

<style>
    figure {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        margin: 0;
    }
    img {
        width: 100%;
        height: 100%;
        vertical-align: bottom;
        mask-image: url('data:image/svg+xml,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"%3e%3cpath fill="white" d="M0 475c0 2 2 4 4 4h12c3 0 5 2 5 5v12c0 2 2 4 4 4h475V0H0z"/%3e%3c/svg%3e');
        -webkit-mask-image: url('data:image/svg+xml,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"%3e%3cpath fill="white" d="M0 475c0 2 2 4 4 4h12c3 0 5 2 5 5v12c0 2 2 4 4 4h475V0H0z"/%3e%3c/svg%3e');
        mask-size: 500px 500px;
        -webkit-mask-size: 500px 500px;
        mask-position: bottom left;
        -webkit-mask-position: bottom left;
    }
    figure span {
        position: absolute;
        bottom: 0px;
        left: 2px;
        --icon-size: 16px;
    }
</style>
