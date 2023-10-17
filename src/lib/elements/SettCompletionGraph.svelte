<!-- @component
    Draws a collection progress circle(s)
 -->
<script lang="ts">
    import type { ID } from "$lib/utils/NM Types";
    import type NM from "$lib/utils/NM Types";

    import SettInfo from "$lib/utils/SettInfo";
    import { readable } from "svelte/store";
    import { page } from "$app/stores";

    export let sett: NM.Sett;
    /**
     * The progress owner
     */
    export let ownerId: ID<"user">;
    /**
     * Height and width of the graph
     */
    export let size = 40;
    /**
     * Which parts show
     */
    export let show: "core"|"specials"|"all" = "all";
    /**
     * Coloring
     */
    export let darkTheme = false;

    // use build-in progress only when view somebody's progress
    $: progress = sett.ownerId === ownerId && !$page.data.currentUser.isCurrentUser(ownerId)
        ? readable(new SettInfo(sett).getProgress())
        : $page.data.currentUser.wealth.getProgress(sett.id, true);
    $: corePercent = $progress.core.owned
        ? Math.floor(100 * $progress.core.owned / $progress.core.count)
        : 0;
    $: specialTotal = $progress.total.count - $progress.core.count;
    $: specialOwned = $progress.total.owned - $progress.core.owned;
    $: specialPercent = specialTotal ? Math.floor(100 * specialOwned / specialTotal) : 0;

    const strokeWidth = 2;
    const specialRadius = size / 2 - strokeWidth;
    const coreRadius = size / 2 - 2 * strokeWidth;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = (r: number) => 2 * Math.PI * r;
    const dashOffset = (percent: number, r: number) => (100 - percent) / 100 * circumference(r);
</script>

<!-- ng-if="ready && isAuthenticated()"> -->
<span
    class="completion" class:dark={darkTheme}
    style:width="{size}px"
    style:height="{size}px"
>
    <span
        class="completion--percent"
        style:font-size="{size / 4}px"
    >
        {show === "specials" ? specialPercent : corePercent}%
    </span>
    <svg
        width="{size}"
        height="{size}"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
    >
        {#if show === "core" || show === "all"}
            <circle
                class="completion--track"
                r="{coreRadius}"
                {cx} {cy}
                fill="transparent"
                stroke-width="{strokeWidth}"
            ></circle>
            <circle
                class="completion--core"
                r="{coreRadius}"
                {cx} {cy}
                fill="transparent"
                transform="rotate(-90 {cx} {cy})"
                stroke-dasharray="{circumference(coreRadius)}"
                stroke-dashoffset="{dashOffset(corePercent, coreRadius)}"
                stroke-width="{strokeWidth}"
            ></circle>
        {/if}
        {#if show === "specials" || show === "all" && specialTotal > 0}
            <circle
                class="completion--track"
                r="{specialRadius}"
                {cx} {cy}
                fill="transparent"
                stroke-width="{strokeWidth}"
            ></circle>
            <circle
                class="completion--special"
                r="{specialRadius}"
                {cx} {cy}
                fill="transparent"
                transform="rotate(-90 {cx} {cy})"
                stroke-dasharray="{circumference(specialRadius)}"
                stroke-dashoffset="{dashOffset(specialPercent, specialRadius)}"
                stroke-width="{strokeWidth}"
            ></circle>
        {/if}
    </svg>
</span>

<style>
    .completion {
        display: inline-block;
        vertical-align: middle;
        position: relative;
        text-align: center;
        user-select: none;
    }
    .completion--percent {
        color: #FFF;
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        line-height: 1;
        font-weight: 500;
        padding-top: 0.2em;
        letter-spacing: -.02em;
    }
    .dark .completion--percent {
        color: #2c2830;
    }
    .completion--track {
        stroke: rgba(255,255,255,.2);
    }
    .dark .completion--track {
        stroke: rgba(0,0,0,0.1);
    }
    .completion--core {
        stroke: #FFF;
    }
    .dark .completion--core {
        stroke: rgba(0,0,0,0.9);
    }
    .completion--special {
        stroke: #26B2DB;
    }
</style>
