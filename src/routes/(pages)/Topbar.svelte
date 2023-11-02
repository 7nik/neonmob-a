<!-- @component
    The site header bar
 -->
<script lang="ts">
    import { afterNavigate, invalidate } from "$app/navigation";
    import { page } from "$app/stores";
    import Avatar from "$elem/Avatar.svelte";
    import Button from "$elem/Button.svelte";
    import Clickable from "$elem/Clickable.svelte";
    import Icon from "$elem/Icon.svelte";
    import { fail, login } from "$lib/dialogs";
    import UserStuff from "./UserStuff.svelte";

    const { isAuthenticated, user } = $page.data.currentUser;

    afterNavigate(() => {
        (document.getElementById("show-menu") as HTMLInputElement).checked = false;
    });

    async function logIn () {
        if (await login(true)) {
            invalidate((url) => url.pathname.includes("/setts/"));
        }
    }

    async function logOut () {
        await fetch("/signout", {
            redirect: "manual",
        });
        window.location.reload();
    }
</script>

<nav class:anon={!$isAuthenticated}>
    {#if $isAuthenticated}
        <label for="show-menu" class="menu hide-wide">
            <Icon icon="burger" />
        </label>
    {/if}
    <a href="/" class="logo">
        <img src="/img/logo_heart_diamond_flat.png" alt="logo" />
        <!-- Gradient NEONMOB word -->
        <svg class:always-show={!$isAuthenticated} class="hide-wide hide-tiny" viewBox="0 0 91 12">
            <!-- eslint-disable-next-line max-len -->
            <linearGradient id="a" x1="2.3" x2="97" y1="-.8" y2="15.2" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#8BC7E1"></stop>
                <stop offset=".5" stop-color="#AD7CB1"></stop>
                <stop offset="1" stop-color="#FFC955"></stop>
            </linearGradient>
            <!-- eslint-disable-next-line max-len -->
            <path fill="url(#a)" d="m21.1 10.2.3 1.3c-1.2.3-2.7.5-4 .5-3.2 0-5.2-1.2-5.2-3.6 0-1.1.7-2.2 2-2.7-1-.6-1.6-1.5-1.6-2.5C12.6 1 14.3 0 17.5 0c1 0 2.5.1 3.8.4L21 1.7l-3.8-.3c-2 0-3.1.5-3.1 1.9 0 1 1 1.9 2.3 1.9h2.8v1.3h-3c-1.5 0-2.5.8-2.5 2 0 1.6 1.6 2.1 3.6 2.1 1 0 2.5-.1 3.7-.4zM33.4 6c0 3.4-2.4 6-5.8 6a5.8 5.8 0 0 1-5.9-6c0-3.4 2.4-6 5.9-6 3.4 0 5.8 2.6 5.8 6zm-1.6 0c0-2.7-1.7-4.6-4.2-4.6-2.6 0-4.3 2-4.3 4.6 0 2.7 1.7 4.6 4.3 4.6 2.5 0 4.2-2 4.2-4.6zm48.7 0c0 3.4-2.4 6-5.9 6a5.8 5.8 0 0 1-5.8-6c0-3.4 2.4-6 5.8-6 3.5 0 5.9 2.6 5.9 6zm-1.6 0c0-2.7-1.8-4.6-4.3-4.6s-4.3 2-4.3 4.6c0 2.7 1.8 4.6 4.3 4.6S79 8.6 79 6zM5.4 0C2.4.1 0 2.5 0 5.5V12h1.6V5.4c0-2.2 1.6-3.9 3.8-3.9 2.1 0 3.8 1.7 3.8 3.9V12h1.5V5.5c0-3-2.3-5.4-5.3-5.4zm35 0c-3.1 0-5.5 2.4-5.5 5.4V12h1.6V5.4c0-2.2 1.7-3.9 3.8-3.9 2.2 0 3.8 1.7 3.8 3.9V12h1.6V5.5c0-3-2.4-5.4-5.4-5.4zM62 .1c-2 0-3.7 1-4.6 2.6A5.3 5.3 0 0 0 52.8 0c-3 0-5.4 2.4-5.4 5.4V12H49V5.4c0-2.2 1.6-3.9 3.8-3.9 2.1 0 3.8 1.7 3.8 3.9V12h1.6V5.4c0-2.2 1.6-3.9 3.8-3.9 2.1 0 3.8 1.7 3.8 3.9V12h1.5V5.5C67.3 2.5 65 0 62 0zM91 8.6c0 1.9-1.6 3.4-3.8 3.4h-5.6V.3h4.8c2.4 0 3.8 1.2 3.8 3 0 1-.6 2-1.5 2.5 1.4.4 2.3 1.5 2.3 2.8zm-7.8-3.2h3.2c1.3 0 2.2-.8 2.2-2 0-1-.8-1.8-2.2-1.8h-3.2v3.8zm6.2 3.2c0-1-.9-2-2.2-2h-4v4h4c1.3 0 2.2-.8 2.2-2z"></path>
        </svg>
    </a>
    <input type="checkbox" id="show-menu" hidden />
    <label for="show-menu" class="menu-overlay"></label>
    <menu>
        {#if $isAuthenticated}
            <form action="/search/">
                <input type="search" id="global-search"
                    name="search"
                    placeholder="Search"
                    autocomplete="off" required
                >
                <span><Icon icon="search"/></span>
                <button type="submit" hidden>Go!</button>
            </form>
        {/if}
        <label for="show-menu" data-sveltekit-preload-data="tap">
            {#if $isAuthenticated}
                <a href="/">Dashboard</a>
                <a href="/{$user.username}/collection">Your Collection</a>
            {/if}
            <a href="/collect/">Collect</a>
            <a href="/vote/newest">Vote</a>
            <a href="/create">Create</a>
            {#if $isAuthenticated}
                <label for="global-search" class="show-form"><Icon icon="search"/></label>
                <a href="/{$user.username}" class="avatar">
                    <Avatar user={$user} size="small" />
                </a>
                <div class="account-menu">
                    <hr>
                    <a href="/account/">Account Settings</a>
                    <a href="/subscription">Pro Subscription</a>
                    <Clickable on:click={fail}><span>Invite Friends</span></Clickable>
                    <a href="https://discord.gg/McPJQDMgBj">Official Discord Channel</a>
                    <a href="https://help.neonmob.com">Help Center</a>
                    <a href="https://forum.neonmob.com/">Forums</a>
                    <Clickable on:click={fail}><span>Buy credits</span></Clickable>
                    <a href="/signout/"
                        data-sveltekit-preload-data="off"
                        on:click|preventDefault={logOut}
                    >
                        Log Out
                    </a>
                    <hr>
                </div>
            {/if}
        </label>
    </menu>

    <div class="right">
        {#if !$isAuthenticated}
            <!-- TODO: update links to point to own pages -->
            <a href="https://www.neonmob.com/signup" class="hide-small">
                <Button type="subdued-light">start a collection</Button>
            </a>
            <a href="/login?next={encodeURIComponent($page.url.pathname)}"
                on:click|preventDefault={logIn}
                data-sveltekit-preload-data="off"
                data-sveltekit-preload-code="hover"
            >
                <Button type="subdued-light">log in</Button>
            </a>
        {:else}
            <UserStuff/>
        {/if}
    </div>
</nav>

<style>
    nav {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        width: 100%;
        background-color: #191417;
        height: 50px;
        position: fixed;
        top: 0;
        z-index: 100;
    }
    .menu {
        color: #FFF8;
        padding: 0 10px;
        display: flex;
        align-items: center;
        cursor: pointer;
        --icon-size: 18px;
    }
    .logo {
        padding: 0 10px;
        display: flex;
        align-items: center;
    }
    .logo img {
        width: 34px;
    }
    .logo svg {
        height: 12px;
        margin-left: .5ch;
    }
    form input {
        display: block;
        position: fixed;
        top: -50px;
        right: 0;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 50px;
        padding-left: 35px;
        line-height: 140%;
        font-weight: 400;
        font-size: 18px;
        border-radius: 0;
        opacity: 0;
        box-shadow: none;
        appearance: none;
        outline: 0;
        border: 0;
        cursor: pointer;
        animation: all .3s ease-in;
    }
    form input:focus {
        opacity: 1;
        top: 0px;
        z-index: 1;
    }
    form span {
        position: fixed;
        top: -34px;
        left: 10px;
        color: #857a90;
        animation: top .3s ease-in;
        z-index: 2;
    }
    form input:focus + span {
        top: 16px;
    }

    .right {
        margin: 0 50px 0 auto;
        display: flex;
        align-items: stretch;
        z-index: 1;
    }
    .right * {
        align-self: center;
    }
    .anon .right {
        margin-right: 10px;
        gap: 10px;
    }
    .avatar {
        padding: 10px;
        margin-left: auto;
    }
    .avatar :global(img) {
        height: 30px;
        width: 30px;
    }
    .account-menu {
        display: none;
        position: absolute;
        left: auto;
        right: 8px;
        top: 48px;
        border-radius: 4px;
        background: white;
        overflow: hidden;
    }
    .account-menu hr {
        height: 3px;
        margin: 0;
        border: none;
        background-position: bottom;
        background-repeat: repeat-x;
        background: linear-gradient(90deg,#B6E294,#EDEAC1,#B170AF,#E52A67,#8DC2DB,#84C698,#F8F7C9);
    }
    .avatar:hover ~ .account-menu, .account-menu:hover {
        display: block;
    }

    @media (min-width: 951px) {
        .hide-wide:not(.always-show) {
            display: none;
        }
        .menu-overlay {
            opacity: 0;
        }
        menu {
            display: flex;
            align-items: stretch;
            height: 50px;
            padding: 0;
            margin: 0;
            position: fixed;
            /* thus when menu turns into mobile is't already out of screen */
            left: -210px;
            margin-left: 264px;
            right: 0;
            z-index: 1;
        }
        .anon menu {
            margin-left: 360px;
        }
        menu > label {
            display: contents;
        }
        menu > label > a, menu > label > a:hover, .show-form {
            display: flex;
            align-items: center;
            text-transform: uppercase;
            text-decoration: none;
            font-weight: 500;
            font-size: 12px;
            color: white;
            opacity: 0.5;
            letter-spacing: 0.05em;
            padding: 0 10px;
            --icon-size: 18px;
        }
        menu > label > a:hover, .show-form:hover, a.avatar {
            opacity: 1;
        }
        .account-menu a, .account-menu span {
            color: #2c2830;
            display: block;
            padding: 7px 16px;
            font-size: 13px;
            width: 100%;
        }
        .account-menu a:hover, .account-menu span:hover {
            background: #ececec;
            color: #2c2830;
        }
    }
    @media (max-width: 950px) {
        .hide-small {
            display: none;
        }
        .menu + .logo {
            margin-left: 0;
        }
        .logo img {
            width: 26px;
        }
        .logo svg {
            height: 10px;
        }
        .right {
            margin-right: 10px;
        }
        .menu-overlay {
            content: "";
            display: block;
            width: 100vw;
            height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            background: #0006;
            z-index: 200;
            opacity: 0;
            transition: opacity 0.3s;
        }
        #show-menu:not(:checked) + .menu-overlay {
            pointer-events: none;
        }
        #show-menu:checked + .menu-overlay {
            opacity: 1;
        }
        menu {
            display: flex;
            flex-direction: column;
            width: 210px;
            height: 100vh;
            margin: 0;
            padding: 0;
            position: fixed;
            top: 0;
            left: -210px;
            background: white;
            z-index: 201;
            overflow-y: scroll;
            text-align: left;
            transition: left 0.3s;
        }
        #show-menu:checked ~ menu {
            left: 0;
        }
        menu > label {
            flex-grow: 1;
        }
        menu input {
            position: static;
            opacity: 1;
            padding-left: 35px;
        }
        menu input + span {
            top: 16px;
            position: absolute;
        }
        menu a:link, menu a:visited, menu .account-menu span {
            color: #2c2830;
            display: block;
            padding: 10px;
            font-size: 14px;
            cursor: pointer;
            border-top: 1px solid #d6d6d6;
        }
        menu a:link:hover, menu a:visited:hover {
            background: #ececec;
            color: #2c2830;
        }
        menu label label, menu .avatar.avatar {
            display: none;
        }
        menu .account-menu {
            display: block;
            position: static;
        }
    }
    @media (max-width: 400px) {
        .hide-tiny:not(.always-show) {
            display: none;
        }
        .menu + .logo {
            padding: 0;
        }
    }
</style>
