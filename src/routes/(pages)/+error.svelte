<script lang="ts">
    import { page } from "$app/stores";
    import MetaSeo from "$elem/MetaSeo.svelte";

    const href = "https://github.com/7nik/neonmob-a/issues";
</script>

<!-- eslint-disable-next-line max-len -->
<MetaSeo title="NeonMob" url="/" description="Join the digital collecting revolution on NeonMob. Collect, trade, and discover limited edition art" />

{#if $page.status === 403}
    <div class="err-403">
        <!-- dunno what the text should be here -->
        <h1>Hey, stop.</h1>
        You aren't allowed to be here.
        <br>
        You think you are? <a {href}>Let us know.</a>
    </div>
{:else if $page.status === 404}
    <div class="err-404">
        <h1>Oh crap.</h1>
        There's no page here.
        <br>
        Was there supposed to be? <a {href}>Let us know.</a>
    </div>
{:else if $page.status >= 500}
    <div class="err-500">
        <h1>Server error: {$page.error?.message}</h1>
        Sorry about that. <span><a {href}>Let us know</a> what happened.</span>
    </div>
{:else}
    <!-- likely originally, all there errors were ending up in 404 or 500 case -->
    <div>
        <h1>Oops, something went wrong.</h1>
        <h2>{$page.error?.message}</h2>
        Sorry about that. <span><a {href}>Let us know</a> what happened.</span>
    </div>
{/if}

<style>
    div {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        font-size: 15px;
        flex-grow: 1;
        justify-content: center;
    }
    div::before {
        width: 300px;
        height: 200px;
        margin-bottom: 20px;
        display: block;
        opacity: .3;
        background: center center no-repeat;
        background-size: contain;
    }
    div.err-403::before {
        content: '';
        background-image: url(/img/error/unowned-dark.svg);
    }
    div.err-404::before {
        content: '';
        background-image: url(/img/error/happy-poo.svg);
    }
    div.err-500::before {
        content: '';
        background-image: url(/img/error/fried-server.svg);
    }
</style>
