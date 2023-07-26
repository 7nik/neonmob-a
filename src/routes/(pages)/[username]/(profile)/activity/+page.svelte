<script lang="ts">
    import type { Paginator } from "$api";
    import type NM from "$lib/utils/NM Types";

    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { getActivityFeed } from "$api";
    import Activities from "$elem/Activities.svelte";
    import Clickable from "$elem/Clickable.svelte";
    import SectionHeader from "$elem/SectionHeader.svelte";
    import OwnedCollections from "$lib/services/OwnedCollections";

    export let data;

    const { isCurrentUser } = data.currentUser;

    const ownProfile = isCurrentUser(data.user);
    let paginator: Paginator<NM.ActivityAny> | null;

    let source: NM.SettMetrics|null = null;
    let recent3: NM.SettMetrics[] = [];
    let recent10: NM.SettMetrics[] = [];
    let restSetts: NM.SettMetrics[] = [];

    $: paginator = source
        ? getActivityFeed("sett", source.id)
        : (browser ? getActivityFeed("user", data.user.id) : null);

    onMount(async () => {
        if (!ownProfile) return;

        const collections = new OwnedCollections(data.user.id);
        await collections.waitLoading();
        const arr = collections.getCollections();
        const recentCollections = arr.concat()
            .sort((a, b) => b.pack_last_acquired - a.pack_last_acquired);
        recent3 = recentCollections.splice(0, 3);
        recent10 = recentCollections.splice(0, 10);
        restSetts = recentCollections
            .sort((a, b) => a.name.replace(/^(the)? /i, "")
                .localeCompare(b.name.replace(/^(the)? /i, "")));
    });

    let pageWidth = 1000;
    $: mobile = pageWidth < 480;

</script>

<svelte:window bind:innerWidth={pageWidth}/>

<section class:ownProfile>
    {#if ownProfile}
        <h2>Activity For</h2>
        {#if !mobile}
            <Clickable on:click={() => { source = null; }}>
                <div class:selected={source === null}>You</div>
            </Clickable>
            {#each recent3 as recent}
                <Clickable on:click={() => { source = recent; }}>
                    <div class:selected2={source === recent}>
                        {#if source === recent}
                            <span style:background-image="url('{recent.background_image}'"/>
                        {/if}
                        {recent.name}
                    </div>
                </Clickable>
            {/each}
            <small>or</small>
        {/if}
        <div class:selected2={source && (mobile || !recent3.includes(source))}>
            {#if source && (mobile || !recent3.includes(source))}
                <span style:background-image="url('{source.background_image}'"/>
            {/if}
            <select bind:value={source}>
                {#if mobile}
                    <option value={null}>You</option>
                {:else}
                    <option value={null}>Choose a Series</option>
                {/if}
                {#each recent3 as recent}
                    <option value={recent} hidden>Choose a Series</option>
                {/each}
                <optgroup label="Recently Collected Series">
                    {#each recent10 as recent}
                        <option value={recent}>{recent.name}</option>
                    {/each}
                </optgroup>
                <optgroup label="Other Series You've Collected">
                    {#each restSetts as recent}
                        <option value={recent}>{recent.name}</option>
                    {/each}
                </optgroup>
            </select>
        </div>
    {:else}
        <SectionHeader title="{data.user.first_name}'s Activity" />
    {/if}
</section>

{#if paginator}
    <Activities {paginator} />
{/if}

<style>
    h2, section {
        width: min(960px, 100%);
        margin: 0 auto;
        padding: 0 5px;
        color: #2c2830;
    }
    h2 {
        margin-top: 20px;
    }
    section {
        margin: 30px auto 0;
    }
    section.ownProfile {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin: 5px auto;
    }
    div {
        position: relative;
        padding: 10px 15px;
        border-radius: 4px;
        font-size: 12px;
        color: #39343e;
        font-weight: 400;
        box-shadow: inset 0 0 0 1px rgba(0,0,0,.2);
    }
    div:hover {
        box-shadow: inset 0 0 0 1px rgba(0,0,0,.4);
    }
    div.selected, div.selected2 {
        background-color: #d6d6d6;
        box-shadow: inset 0 1px 0 0 rgba(0,0,0,.1);
    }
    div.selected2 {
        background-color: transparent;
        color: white;
    }
    span {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        border-radius: 4px;
    }
    span {
        z-index: -1;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center center;
    }
    span::after {
        content: "";
        background-color: rgba(0,0,0,.15);
    }
    small {
        text-transform: uppercase;
        font-size: 10px;
        font-weight: 500;
        letter-spacing: .035em;
        color: #857a90;
        align-self: center;
    }
    select {
        background: transparent;
        border: none;
        font-size: 12px;
        color: #39343e;
        font-weight: 400;
        font-family: locator-web,Helvetica Neue,Helvetica,Arial,sans-serif;
    }
    .selected2 select {
        color: white;
    }
    @media screen and (max-width: 960px) {
        h2 {
            text-align: center;
        }
        section {
            justify-content: center;
        }
        small {
            display: none;
        }
    }
    @media screen and (max-width: 480px) {
        section {
            align-items: center;
            margin-top: 10px;
        }
        h2 {
            margin: 0;
            width: auto;
        }
    }
</style>
