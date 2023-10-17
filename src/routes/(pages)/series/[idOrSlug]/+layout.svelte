<script lang="ts">
    import Tabs from "$elem/Tabs.svelte";
    import SettInfo from "$lib/utils/SettInfo";
    import SettHeader from "./SettHeader.svelte";

    export let data;

    const { user, isCurrentUser, wealth } = data.currentUser;

    $: ({ sett, owner } = data);
    $: settInfo = new SettInfo(sett);
    $: setupTabs(), sett, owner;

    let tabs: { path: string, name: string, tab?: string }[] = [{
        path: "",
        name: "Series Details",
    }];

    function setupTabs () {
        if (owner
            ? tabs.some((tab) => tab.path === `user/${owner!.username}/cards/`)
            : tabs.length > 1
        ) {
            return;
        }

        tabs = tabs.slice(0, 1);

        if (owner && !isCurrentUser(owner)) {
            tabs.push({
                path: `user/${owner.username}/cards/`,
                name: `${owner.first_name}'s Cards
                    (${settInfo.cards("core", "owned")}/${settInfo.cards("core", "total")})`,
            });
        }

        const progress = wealth.getProgress(sett.id);
        const isCollecting = progress.total.owned > 0;
        // TODO make reactive
        if (isCollecting) {
            tabs.push({
                path: `user/${user.username}/cards/`,
                name: `Your Cards (${progress.core.owned}/${progress.core.count})`,
            });
        } else {
            tabs.push({
                path: "",
                name: "Preview Cards",
                tab: "preview",
            });
        }
    }

</script>

<header style:background-image="url('{sett.sett_assets["large-blur"].url}')">
    <SettHeader {sett} {owner} />
</header>
<Tabs basePath="/series/{data.sett.name_slug}/" {tabs} />
<article>
    <slot/>
</article>

<style>
    header {
        position: relative;
        padding: 35px 0 15px;
        background-position: center center;
        background-size: cover;
    }
    header::after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: rgba(0,0,0,.25);
    }
    header > :global(*) {
        position: relative;
        z-index: 1;
    }

    header + :global(nav[class]) {
        padding: 0 max(10px, calc((100% - 940px) / 2));
    }
    header + :global(nav .selected.selected::after) {
        height: 4px;
    }
    article {
        margin: 0 auto;
        padding: 0 0 20px 10px;
        width: min(960px, 100%);
    }

    @media screen and (max-width: 768px) {
        article {
            padding-right: 10px;
        }
    }
</style>
