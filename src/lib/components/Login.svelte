<!-- @component
    A login block
 -->
<script lang="ts">
    import type { SubmitFunction } from "@sveltejs/kit";

    import { enhance } from "$app/forms";
    import { page } from "$app/stores";
    import Button from "$elem/Button.svelte";
    import Icon from "$elem/Icon.svelte";
    import LabeledInput from "$elem/LabeledInput.svelte";

    export let onSuccess: () => any;

    let username = "";
    let password = "";
    const errors = {
        username: false,
        password: false,
    };
    let shaking = false;
    let processing = false;
    let disabled = 0;

    const submit: SubmitFunction = () => {
        processing = true;
        return ({ result }) => {
            processing = false;
            if (result.type === "failure") {
                if (result.data?.detail) {
                    console.error("Failed to login, reason:", result.data.detail);
                }
                errors.username = true;
                errors.password = true;
                shaking = true;
                setTimeout(() => { shaking = false; }, 1200);
                if (result.status === 429) {
                    disabled = Number(String(result.data?.detail).match(/\d+/)?.[0]);
                    disabled ||= 60;
                    const timer = setInterval(() => {
                        disabled -= 1;
                        if (disabled <= 0) {
                            clearInterval(timer);
                        }
                    }, 1000);
                }
            } else if (result.type !== "error") {
                // if on a page with the topbar
                if ("quote" in $page.data) {
                    $page.data.currentUser?.loadUser();
                }
                onSuccess();
            }
        };
    }
</script>

<div class:shaking>
    <h2>
        Log in to
        <svg viewBox="0 0 91 12">
            <!-- eslint-disable-next-line max-len -->
            <linearGradient id="a" x1="2.3" x2="97" y1="-.8" y2="15.2" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#8BC7E1"></stop>
                <stop offset=".5" stop-color="#AD7CB1"></stop>
                <stop offset="1" stop-color="#FFC955"></stop>
            </linearGradient>
            <!-- eslint-disable-next-line max-len -->
            <path fill="url(#a)" d="m21.1 10.2.3 1.3c-1.2.3-2.7.5-4 .5-3.2 0-5.2-1.2-5.2-3.6 0-1.1.7-2.2 2-2.7-1-.6-1.6-1.5-1.6-2.5C12.6 1 14.3 0 17.5 0c1 0 2.5.1 3.8.4L21 1.7l-3.8-.3c-2 0-3.1.5-3.1 1.9 0 1 1 1.9 2.3 1.9h2.8v1.3h-3c-1.5 0-2.5.8-2.5 2 0 1.6 1.6 2.1 3.6 2.1 1 0 2.5-.1 3.7-.4zM33.4 6c0 3.4-2.4 6-5.8 6a5.8 5.8 0 0 1-5.9-6c0-3.4 2.4-6 5.9-6 3.4 0 5.8 2.6 5.8 6zm-1.6 0c0-2.7-1.7-4.6-4.2-4.6-2.6 0-4.3 2-4.3 4.6 0 2.7 1.7 4.6 4.3 4.6 2.5 0 4.2-2 4.2-4.6zm48.7 0c0 3.4-2.4 6-5.9 6a5.8 5.8 0 0 1-5.8-6c0-3.4 2.4-6 5.8-6 3.5 0 5.9 2.6 5.9 6zm-1.6 0c0-2.7-1.8-4.6-4.3-4.6s-4.3 2-4.3 4.6c0 2.7 1.8 4.6 4.3 4.6S79 8.6 79 6zM5.4 0C2.4.1 0 2.5 0 5.5V12h1.6V5.4c0-2.2 1.6-3.9 3.8-3.9 2.1 0 3.8 1.7 3.8 3.9V12h1.5V5.5c0-3-2.3-5.4-5.3-5.4zm35 0c-3.1 0-5.5 2.4-5.5 5.4V12h1.6V5.4c0-2.2 1.7-3.9 3.8-3.9 2.2 0 3.8 1.7 3.8 3.9V12h1.6V5.5c0-3-2.4-5.4-5.4-5.4zM62 .1c-2 0-3.7 1-4.6 2.6A5.3 5.3 0 0 0 52.8 0c-3 0-5.4 2.4-5.4 5.4V12H49V5.4c0-2.2 1.6-3.9 3.8-3.9 2.1 0 3.8 1.7 3.8 3.9V12h1.6V5.4c0-2.2 1.6-3.9 3.8-3.9 2.1 0 3.8 1.7 3.8 3.9V12h1.5V5.5C67.3 2.5 65 0 62 0zM91 8.6c0 1.9-1.6 3.4-3.8 3.4h-5.6V.3h4.8c2.4 0 3.8 1.2 3.8 3 0 1-.6 2-1.5 2.5 1.4.4 2.3 1.5 2.3 2.8zm-7.8-3.2h3.2c1.3 0 2.2-.8 2.2-2 0-1-.8-1.8-2.2-1.8h-3.2v3.8zm6.2 3.2c0-1-.9-2-2.2-2h-4v4h4c1.3 0 2.2-.8 2.2-2z"></path>
        </svg>
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
    <form action="/login" method="POST" use:enhance={submit}>
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
        {#if processing}
            <span class="loader"><Icon icon="loader" /></span>
        {:else}
            <Button size="max" type={disabled > 0 ? "disabled-light" : "primary"}>
                {disabled > 0 ? `dude, slow down for ${disabled} sec` : "Log in"}
            </Button>
        {/if}
    </form>
    <a href="/login/reset-password/">Forgot password?</a>
</div>

<style>
    div {
        border-radius: 4px;
        width: 300px;
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
    svg {
        height: 0.55em;
        width: 4.2em;
        display: inline-block;
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
    .loader {
        display: flex;
        align-items: center;
        justify-content: center;
        --icon-size: 40px;
    }

    form :global(button) {
        position: relative;
        border-top-right-radius: 0;
        border-top-left-radius: 0;
    }
    form :global(button::after) {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: .3;
        background: linear-gradient(45deg,rgba(255,255,255,0) 30%,#fff 30%,#fff 50%,rgba(255,255,255,0) 50%) -250px center no-repeat;
        transition: background .2s ease-in-out;
    }
    form :global(button:hover::after) {
        background-position:250px center;
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
