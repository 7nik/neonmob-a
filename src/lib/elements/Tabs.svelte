<!-- @component
    Render tabs with selected one according to the current url
 -->
<script lang="ts">
    import { page } from "$app/stores";

    type Tab = Readonly<{
        path: string,
        tab?: string, // search param "tab"
        prefix?: string, // hidable
        name: string,
        postfix?: string, // hidable
    }>

    /**
     * List of the tabs to render
     */
    export let tabs: readonly Tab[];
    /**
     * Base path of the tabs
     */
    export let basePath: string;
    /**
     * The name of the current tab
     */
    export let currentTab = "";

    function getTabName (url: URL) {
        const path = url.pathname.slice(basePath.length);
        const tabParam = url.searchParams.get("tab");
        let tab = tabs.find((tab) => tab.path === path && ((tab.tab ?? null) === tabParam));
        tab ??= tabs[0];
        return tab.name;
    }

    $: currentTab = getTabName($page.url);
</script>

<nav>
    {#each tabs as tab}
        <a class:selected={tab.name === currentTab}
            href="{basePath}{tab.path}{tab.tab ? `?tab=${tab.tab}` : ""}"
        >
            {#if tab.prefix}<span class="hide-on-small">{tab.prefix}</span>{/if}
            {tab.name}
            {#if tab.postfix}<span class="hide-on-small">{tab.postfix}</span>{/if}
        </a>
    {/each}
</nav>

<style>
    nav {
        width: 100%;
        padding: 0 max(10px, calc((100% - 960px) / 2));
        background: white;
        box-shadow: 0 1px 2px rgb(0 0 0 / 8%);
    }
    nav > * {
        display: inline-block;
        padding: 22px 20px 12px 20px;
        color: #2c2830;
        font-size: 18px;
        font-weight: 300;
        text-align: center;
    }
    nav .selected {
        color: #1A1417;
        font-weight: 400;
    }
    nav .selected::after {
        content: "";
        display: block;
        height: 2px;
        top: 13px;
        margin: 0 -20px;
        position: relative;
        background-image: linear-gradient(45deg,#61D3A5,#64b8d7,#B078B1);
    }
    @media screen and (max-width: 767px) {
        .hide-on-small {
            display: none;
        }
    }
    @media screen and (max-width: 480px) {
        nav * {
            padding: 22px 10px 12px 10px;
        }
        nav .selected::after {
            margin: 0 -10px;
        }
    }
    @media screen and (max-width: 320px) {
        nav * {
            padding: 22px 0 12px 10px;
        }
    }
</style>
