<!-- @component
    Umbrella component for item in the activity feed
 -->
<script lang="ts" context="module">
    import type NM from "$lib/utils/NM Types";

    import { scaleHeight } from "$lib/utils/utils";

    export function activityHeight (activity: NM.ActivityAny) {
        switch (activity.type) {
            case "pack-opened": return scaleHeight(activity.rarest_piece, 300) + 54;
            case "badge-earned": return activity.sett_id ? 369 : 330;
            case "sett-published": return 495;
            case "trade-completed": return 367;
            // case "submission-created":
            default: return 354;
        }
    }
</script>

<script lang="ts">
    import ActivityBadge from "./ActivityBadge.svelte";
    import ActivityPack from "./ActivityPack.svelte";
    import ActivitySett from "./ActivitySett.svelte";
    import ActivitySubmission from "./ActivitySubmission.svelte";
    import ActivityTrade from "./ActivityTrade.svelte";

    export let activity: NM.ActivityAny;
</script>

<svelte:options immutable />

{#if activity.type === "badge-earned"}
    <ActivityBadge {activity} />
{:else if activity.type === "pack-opened"}
    <ActivityPack {activity} />
{:else if activity.type === "sett-published"}
    <ActivitySett {activity} />
{:else if activity.type === "submission-created"}
    <ActivitySubmission {activity} />
{:else if activity.type === "trade-completed"}
    <ActivityTrade {activity} />
{:else}
    <div>Unknown activity: {console.error(activity), JSON.stringify(activity)}</div>
{/if}
