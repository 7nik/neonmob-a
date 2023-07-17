<!-- @component
    Renders the text and allows to shorten it if it's too long
 -->
<script lang="ts">
    import Button from "$elem/Button.svelte";
    import { linky, md2html } from "$lib/utils/format";

    /**
     * The text to render
     */
    export let content: string;
    /**
     * Method of rendering
     */
    export let type: "markdown" | "linky";
    /**
     * The number of words to shorten the text to
     */
    export let wordLimit = 0;
    /**
     * The number of exceeding words before starting to shorten the text
     */
    export let wordTolerance = 0;

    const render = type === "markdown" ? md2html : linky;
    const canBeShorten = content.split(/\s+/).length >= wordLimit + wordTolerance;
    let fullContent = !canBeShorten;
    $: renderOptions = {
        wordLimit: fullContent ? 0 : wordLimit,
        wordTolerance,
        widows: false,
    };
</script>

<div>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html render(content, renderOptions)}
    {#if canBeShorten}
        <Button
            type="subdued-dark"
            size={fullContent ? "auto" : "nano"}
            on:click={() => { fullContent = !fullContent; }}
        >
            {fullContent ? "less" : "●●●"}
        </Button>
    {/if}
</div>
