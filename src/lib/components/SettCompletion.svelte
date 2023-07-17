<!-- @component
    Circles of series completion progress
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import Clickable from "$elem/Clickable.svelte";
    import SettCompletionGraph from "$elem/SettCompletionGraph.svelte";
    import { showSettCompletion } from "$lib/dialogs";
    import currentUser from "$lib/services/currentUser";

    export let sett: NM.Sett;
    /**
     * The owner of the collection
     */
    export let user: NM.User = $currentUser.you;
    /**
     * Theme (coloring)
     */
    export let darkTheme = false;

    function showPopover (ev: Event) {
        ev.preventDefault();
        ev.stopPropagation();
        showSettCompletion(ev, sett, user);
    }
</script>

<Clickable on:click={(showPopover)}>
    <SettCompletionGraph {sett} {darkTheme} />
</Clickable>
