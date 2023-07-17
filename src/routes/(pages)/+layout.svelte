<script lang="ts">
    import { ProgressBar } from "@prgm/sveltekit-progress-bar";
    import { initOverlays } from "$lib/overlays/useHistory";
    import Topbar from "./Topbar.svelte";

    export let data;
    initOverlays();
</script>

<ProgressBar color="#C18BF2" zIndex={205} />
<Topbar/>
<main>
    <slot></slot>
</main>
<footer>
    ©{new Date().getFullYear()} NeonMob —&nbsp;
    <i>{data.quote}</i>
</footer>

<style>
    main {
        margin-top: 50px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }
    footer {
        margin-top: auto;
        padding: 20px 10px;
        text-align: center;
        font-size: 13px;
        color: #857a90;
    }
</style>
