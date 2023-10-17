<!-- @component
    Circles of series completion progress
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import { page } from "$app/stores";
    import Clickable from "$elem/Clickable.svelte";
    import SettCompletionGraph from "$elem/SettCompletionGraph.svelte";
    import { showSettCompletion } from "$lib/dialogs";

    export let sett: NM.Sett;
    /**
     * The owner of the collection
     */
    export let owner: NM.UserMinimal = $page.data.currentUser.user;
    /**
     * Theme (coloring)
     */
    export let darkTheme = false;

    function showPopover (ev: Event) {
        ev.preventDefault();
        ev.stopPropagation();
        showSettCompletion(ev, sett, owner);
    }
</script>

<Clickable on:click={(showPopover)}>
    <SettCompletionGraph {sett} ownerId={owner.id} {darkTheme} />
</Clickable>
