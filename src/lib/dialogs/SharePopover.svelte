<!-- @component
    Open a popover to share something
-->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";
    import Clickable from "$elem/Clickable.svelte";
    import Icon from "$elem/Icon.svelte";
    import PrintAsset from "$elem/PrintAsset.svelte";
    import share, { channels } from "$lib/utils/share";
    import { absUrl } from "$lib/utils/utils";
    import PopoverWindow from "./PopoverWindow.svelte";

    /**
     * Around which element to show
     */
    export let element: Element;

    /**
     * The url to share, or get it from the shared item
     */
    export let url = "";
    /**
     * Default message in the shared post, or generated based on the shared item
     */
    export let message = "";
    /**
     * The image to share, ot get from the shared item
     */
    export let image: string|null = null;
    /**
     * Share a card (it provides url, message and image)
     */
    export let card: NM.Unmerged.Prints|NM.Unmerged.Card|null = null;
    /**
     * Share a badge (it provides url and message)
     */
    export let badge: NM.BadgeEarned|null = null;
    /**
     * Share a pack (it provides url)
     */
    export let pack: NM.Pack|null = null;
    // export let shimmer = false;
    /**
     * Brag instead of sharing
     */
    export let brag = false;
    /**
     * Source of the shared item
     */
    export let shareSource = "";

    shareSource ||= brag ? "brag" : "share";

    function generateCardMessage () {
        const creator = card?.set.creator.twitter_username;
        if (brag) {
            const twitter = creator ? ` @${creator}` : "";
            return `I'm killing it on @NeonMob today!${twitter}`;
        }
        const twitter = creator ? ` by @${creator}` : "";
        return `I'm obsessed with this card${twitter} I got on @NeonMob`;
    }

    function generateBadgeMessage () {
        if (!badge) return "";
        let action = badge.description.toLowerCase();
        if (/[!,.]/.test(action.at(-1)!)) {
            action = action.slice(0, -1);
        }
        action = action.replace(/your/i, "my");
        if (badge.sett) {
            action = `${action} of ${badge.sett.name}`;
        }
        return `I just ${action} on @NeonMob`;
    }

    function getMessage () {
        if (!message) {
            message = card ? generateCardMessage() : generateBadgeMessage();
        }
        if (!message) console.error("No message to share");
        return message;
    }

    function getPublicUrl () {
        if (pack) {
            return `/activityfeed/pack-opened/${pack.id}`;
        }
        // strip out the host
        if (card) return absUrl(card.public_url);
        if (badge) return absUrl(badge.public_url);
        if (!url) console.error("Empty url to share");
        return url;
    }

    function getImageUrl () {
        if (image) return image;
        if (card) {
            const img = card.piece_assets.image["large-promo"]
                ?? card.piece_assets.image.large;
            return img.url;
        }
        if (badge) return badge.image_url;
        return "";
    }

    // function getShareUrl () {
    //     let url = getPublicUrl();
    //     if (url) {
    //         return createShareUrl(url, shareSource);
    //     }
    //     console.error("publicUrl:", url, "shareSource", shareSource);
    //     return null;
    // }

    function shareOn (channel: typeof channels[number]) {
        share(channel, shareSource, getPublicUrl(), getMessage(), getImageUrl());
    }
</script>

<PopoverWindow {element} on:closed>
    <div>
        {#if card || image}
            <aside>
                {#if card}
                    <PrintAsset
                        card={card}
                        size="small"
                        isPublic
                        showRarity
                        showSettType
                    />
                {:else if image}
                    <img src="{getImageUrl()}" alt="Badge to share">
                {/if}
            </aside>
        {/if}
        <h3>
            {#if brag}
                Brag to your friends!
            {:else}
                Share with your friends!
            {/if}
        </h3>
        <section>
            {#each channels as shareType}
                <Clickable on:click={() => shareOn(shareType)}>
                    <Icon icon={shareType} />
                </Clickable>
            {/each}
        </section>
    </div>
</PopoverWindow>

<style>
    div {
        display: grid;
        grid-template-columns: min-content 1fr;
    }
    aside {
        grid-row: span 2;
        padding: 15px;
        background: #e5e5e5;
        width: 90px;
        height: 90px;
    }
    aside img {
        max-width: 100%;
        max-height: 100%;
    }
    h3 {
        grid-area: 1/2;
        white-space: normal;
        padding: 15px;
        color: #2c2830;
        margin-bottom: 0;
    }
    section {
        grid-area: 2/2;
        display: flex;
        margin-bottom: 15px;
        text-align: center;
        --icon-size: 19px;
    }
    section > :global(* > *) {
        flex-grow: 1;
    }
    section > :global(:not(:first-child) > *) {
        border-left: 1px solid #d6d6d6;
    }
</style>
