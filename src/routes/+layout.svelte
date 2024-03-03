<script lang="ts">
    import { beforeNavigate } from "$app/navigation";
    import { ProgressBar } from "@prgm/sveltekit-progress-bar";

    let progress: ProgressBar;

    beforeNavigate((nav) => {
        nav.complete.catch(() => progress.complete());
    });
</script>

<ProgressBar bind:this={progress} displayThresholdMs={0} color="#C18BF2" zIndex={300} />
<slot></slot>
