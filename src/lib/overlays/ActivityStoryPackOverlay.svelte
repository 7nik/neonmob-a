<!-- @component
    Overlay with pack details from activity feed
 -->
 <script lang="ts" context="module">
    // eslint-disable-next-line import/no-self-import
    import Overlay from "./ActivityStoryPackOverlay.svelte";
    import useHistory from "./useHistory";

    const { view, close } = useHistory(
        "story pack",
        () => Overlay,
        (url, data: { packId?: number } = {}) => {
            const packId: ID<"pack-opened"> = data.packId ?? Number(url.match(/\d+/)?.[0]);
            return { packId };
        },
    );

    export { view as viewPackStory };
</script>

<script lang="ts">
    import type { ID } from "$lib/utils/NM Types";
    import { getActivityItem } from "$api";
    import Icon from "$elem/Icon.svelte";
    import PackBlock from "../../routes/(pages)/activityfeed/PackBlock.svelte";
    import CloseableOverlay from "./CloseableOverlay.svelte";

    export let packId: ID<"pack-opened">;
</script>

<CloseableOverlay {close}>
    {#await getActivityItem("pack-opened", packId)}
        <div class="loading"><Icon icon="loader" /></div>
    {:then trade}
        <PackBlock activity={trade} />
    {/await}
</CloseableOverlay>

<style>
    .loading {
        margin: 0 auto;
        min-height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        align-self: center;
        --icon-size: 40px;
    }
</style>
