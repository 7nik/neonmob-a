<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import Login from "$elem/Login.svelte";

    function onSuccess () {
        if ($page.url.searchParams.has("next")) {
            goto($page.url.searchParams.get("next")!);
        } else {
            goto("/");
        }
    }
    // TODO shiny button and disable at 429
</script>

<article>
    <Login {onSuccess}/>
    <p class="text-emphasis text-subdued">
        Lost? <a href="/">Go home.</a>
    </p>
</article>

<style>
    article {
        white-space: nowrap;
        height: 100vh;
        width: 100%;
        background: url(https://d1ld1je540hac5.cloudfront.net/assets/img/backgrounds/blurred-bg.jpg) center center no-repeat purple;
        background-size: cover;
        display: flex;
        gap: 10px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    article::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: #000;
        opacity: .2;
    }
    p {
        opacity: .7;
        color: rgba(255,255,255,.6);
        font-style: italic;
        font-size: 18px;
    }
    a {
        font-style: italic;
        color: #93d6f9;
    }
</style>
