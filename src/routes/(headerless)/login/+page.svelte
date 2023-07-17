<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { signIn, updateCsrfToken } from "$api";
    import Button from "$elem/Button.svelte";
    import LabeledInput from "$elem/LabeledInput.svelte";
    import { alert } from "$lib/dialogs";
    import { getCookie } from "$lib/utils/utils";

    let username = "";
    let password = "";
    const errors = {
        username: false,
        password: false,
    };
    let shaking = false;

    async function submit (firstTry = true) {
        const result = await signIn(username, password);
        if ("redirect" in result) {
            goto($page.url.searchParams.get("next") ?? "/");
            return;
        }
        if (firstTry && result.detail.startsWith("CSRF Failed:")) {
            await updateCsrfToken();
            submit(false);
            return;
        }
        console.error("login error", result);
        if (result.field_errors) {
            errors.username = true;
            errors.password = true;
            shaking = true;
            setTimeout(() => { shaking = false; }, 1200);
        } else {
            alert(result.detail);
        }
    }

    onMount(() => {
        if (!getCookie("csrftoken")) {
            updateCsrfToken();
        }
    });
</script>

<article>
    <div class:shaking>
        <h2>
            Log in to
            <!-- svelte-ignore a11y-missing-content -->
            <a class="neonmob-logo-text" href="/"></a>
        </h2>
        <!-- <fieldset class="form--fieldset">
            <div class="form--field-btn">
                <a target="_self" ng-href="/login/facebook/?next=%2F7nik%2Fcollection%2F"
                    class="btn facebook" href="/login/facebook/?next=%2F7nik%2Fcollection%2F"
                >
                    <span><i class="icon-facebook"></i>&nbsp; Log in with Facebook</span>
                </a>
            </div>
        </fieldset> -->
        <form on:submit|preventDefault={() => submit()}>
            <LabeledInput
                bind:value={username}
                name="username"
                autocomplete="username"
                error={errors.username}
            >
                {#if errors.username}
                    Incorrect
                {:else}
                    Email or username
                {/if}
            </LabeledInput>
            <LabeledInput
                bind:value={password}
                type="password"
                name="password"
                autocomplete="current-password"
                error={errors.password}
            >
                {#if errors.password}
                    Incorrect
                {:else}
                    Password
                {/if}
            </LabeledInput>
            <Button size="max">Log in</Button>
        </form>
        <a href="/login/reset-password/">Forgot password?</a>
        <p class="text-emphasis text-subdued">
            Lost? <a href="/">Go home.</a>
        </p>
    </div>
</article>

<style>
    article {
        white-space: nowrap;
        height: 100vh;
        width: 100%;
        background: url(https://d1ld1je540hac5.cloudfront.net/assets/img/backgrounds/blurred-bg.jpg) center center no-repeat purple;
        background-size: cover;
        display: flex;
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
    div {
        border-radius: 4px;
        padding: 20px;
        width: 340px;
        box-sizing: border-box;
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 1;
    }
    h2 {
        font-size: 37px;
        white-space: nowrap;
        color: #fff;
        font-weight: 300;
        margin-bottom: 0.5em;
    }
    h2 a {
        height: 0.55em;
        width: 4.2em;
        /* vertical-align: baseline; */
        background: url('data:image/svg+xml,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 601 81"%3e%3clinearGradient id="a" x1="2" x2="600" y1="41" y2="41" gradientUnits="userSpaceOnUse"%3e%3cstop offset="0" stop-color="%238a4fff"/%3e%3cstop offset=".3" stop-color="%23009eff"/%3e%3cstop offset=".7" stop-color="%2336c5dd"/%3e%3cstop offset="1" stop-color="%230dcc96"/%3e%3c/linearGradient%3e%3cpath fill="url(%23a)" d="M36 1C17 1 1 17 1 37v44h11V37a24 24 0 0 1 48 0v44h12V37C72 17 56 1 36 1Z"/%3e%3clinearGradient id="b" x1="2" x2="600" y1="41" y2="41" gradientUnits="userSpaceOnUse"%3e%3cstop offset="0" stop-color="%238a4fff"/%3e%3cstop offset=".3" stop-color="%23009eff"/%3e%3cstop offset=".7" stop-color="%2336c5dd"/%3e%3cstop offset="1" stop-color="%230dcc96"/%3e%3c/linearGradient%3e%3cpath fill="url(%23b)" d="M267 1c-20 0-36 16-36 36v44h12V37a24 24 0 0 1 48 0v44h12V37c0-20-16-36-36-36Z"/%3e%3clinearGradient id="c" x1="2" x2="600" y1="41" y2="41" gradientUnits="userSpaceOnUse"%3e%3cstop offset="0" stop-color="%238a4fff"/%3e%3cstop offset=".3" stop-color="%23009eff"/%3e%3cstop offset=".7" stop-color="%2336c5dd"/%3e%3cstop offset="1" stop-color="%230dcc96"/%3e%3c/linearGradient%3e%3cpath fill="url(%23c)" d="M409 1c-12 0-23 6-29 16a36 36 0 0 0-66 20v44h12V37a24 24 0 0 1 48 0v44h11V37a24 24 0 0 1 48 0v44h12V37c0-20-16-36-36-36Z"/%3e%3clinearGradient id="d" x1="2" x2="600" y1="41" y2="41" gradientUnits="userSpaceOnUse"%3e%3cstop offset="0" stop-color="%238a4fff"/%3e%3cstop offset=".3" stop-color="%23009eff"/%3e%3cstop offset=".7" stop-color="%2336c5dd"/%3e%3cstop offset="1" stop-color="%230dcc96"/%3e%3c/linearGradient%3e%3cpath fill="url(%23d)" d="M187 1c-20 0-36 16-36 36v8a36 36 0 0 0 72 0v-8c0-20-16-36-36-36Zm0 68c-13 0-24-10-24-24v-8a24 24 0 0 1 48 0v8c0 14-11 24-24 24Z"/%3e%3clinearGradient id="e" x1="2" x2="600" y1="41" y2="41" gradientUnits="userSpaceOnUse"%3e%3cstop offset="0" stop-color="%238a4fff"/%3e%3cstop offset=".3" stop-color="%23009eff"/%3e%3cstop offset=".7" stop-color="%2336c5dd"/%3e%3cstop offset="1" stop-color="%230dcc96"/%3e%3c/linearGradient%3e%3cpath fill="url(%23e)" d="M489 1c-20 0-36 16-36 36v8a36 36 0 0 0 72 0v-8c0-20-16-36-36-36Zm0 68c-13 0-24-10-24-24v-8a24 24 0 0 1 48 0v8c0 14-11 24-24 24Z"/%3e%3clinearGradient id="f" x1="2" x2="600" y1="41" y2="41" gradientUnits="userSpaceOnUse"%3e%3cstop offset="0" stop-color="%238a4fff"/%3e%3cstop offset=".3" stop-color="%23009eff"/%3e%3cstop offset=".7" stop-color="%2336c5dd"/%3e%3cstop offset="1" stop-color="%230dcc96"/%3e%3c/linearGradient%3e%3cpath fill="url(%23f)" d="M590 39a23 23 0 0 0-17-38h-39v80h43a23 23 0 0 0 13-42Zm-45-26h28a11 11 0 0 1 0 22h-28V13Zm32 56h-32V47h32a11 11 0 0 1 0 22Z"/%3e%3clinearGradient id="g" x1="2" x2="600" y1="41" y2="41" gradientUnits="userSpaceOnUse"%3e%3cstop offset="0" stop-color="%238a4fff"/%3e%3cstop offset=".3" stop-color="%23009eff"/%3e%3cstop offset=".7" stop-color="%2336c5dd"/%3e%3cstop offset="1" stop-color="%230dcc96"/%3e%3c/linearGradient%3e%3cpath fill="url(%23g)" d="M81 24c0 7 3 13 7 17a23 23 0 0 0 16 40h39V69h-39a11 11 0 0 1 0-22h27V35h-27a11 11 0 0 1 0-22h39V1h-39C91 1 81 11 81 24Z"/%3e%3c/svg%3e') center center no-repeat;
        background-size: contain;
        /* overflow: hidden;
        text-indent: 100%; */
        display: inline-block;
        /* vertical-align: middle; */
    }
    form {
        color: #0006;
        font-size: 18px;
        border-radius: 3px;
        overflow: hidden;
        display: grid;
        grid-template-rows: repeat(3, 60px);
    }
    a {
        font-style: italic;
        color: #93d6f9;
    }
    p {
        opacity: .7;
        color: rgba(255,255,255,.6);
        font-style: italic;
        font-size: 18px;
    }

    .shaking {
        animation: shaking .6s ease-in-out both;
    }
    @keyframes shaking {
        0%, 100% {
            transform: translateX(0);
        }
        10%, 30%, 50%, 70%, 90% {
            transform: translateX(-10px);
        }
        20%, 40%, 60%, 80% {
            transform: translateX(10px);
        }
    }
</style>
