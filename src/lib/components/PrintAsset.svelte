<!-- @component
    Renders a card image or video with optional RE/LE/rarity icons
 -->
 <script context="module" lang="ts">
    import type { rarityCss } from "$lib/utils/NM Types";

    // import currentUser from "$lib/currentUser";
    // import OwnedCards from "$lib/services/ownedCards";
    // import { loadValue } from "$lib/utils/storage";

    type SIZE = "small" | "medium" | "large" | "large-promo" | "xlarge" | "original";
    // type VIDEO_SIZE = "medium" | "large" | "original";

    // Card with card with assets of certain size
    type SizedCard<S extends SIZE> = Pick<NM.Print, "id"|"name"> & {
        rarity?: {
            name: string,
            class: rarityCss,
        },
        piece_assets: {
            image: Record<S, NM.Image>,
            video?: Record<
                S extends "xlarge" ? "large"
                : S extends "large-promo" ? "large"
                : S extends "small" ? "medium"
                : S,
                NM.Video
            >,
        },
    }

    /**
     * Get the info about the asset of the requested size
     */
    function getCardData<S extends SIZE> (card: SizedCard<S>, size: S) {
        let data: NM.Image & Partial<NM.Video> & { type: "image" | "video" } = {
            type: "image",
            ...card.piece_assets.image[size],
        };
        if (card.piece_assets.video
            && (size in card.piece_assets.video || size === "xlarge")
        ) {
            data = {
                type: "video",
                url: data.url, // video preview
                // @ts-ignore - ts isn't enough smart
                ...card.piece_assets.video[size === "xlarge" ? "large" : size],
            };
        }
        return data;
    }

    /**
     * Fit the size in the given limits but without up-scaling
     * @param data
     * @param maxWidth
     * @param maxHeight
     */
    function getDimensionSize (
        data: { width: number, height: number },
        maxWidth: number,
        maxHeight: number,
    ) {
        const ratio = data.width / data.height;
        let height;
        let width;

        if (maxWidth && maxHeight) {
            if (ratio < maxWidth / maxHeight) {
                height = maxHeight;
                width = Math.ceil(maxHeight * ratio);
            } else {
                width = maxWidth;
                height = Math.ceil(maxWidth / ratio);
            }
        } else if (maxHeight) {
            height = maxHeight;
            width = Math.ceil(maxHeight * ratio);
        } else if (maxWidth) {
            width = maxWidth;
            height = Math.ceil(maxWidth / ratio);
        } else {
            width = data.width;
            height = data.height;
        }
        // do not upscale
        width = Math.min(width, data.width);
        height = Math.min(height, data.height);

        return { width, height };
    }

    /**
     * Stops the video when it isn't visible in an <ul> or document
     * @param video - the element to control
     */
    function stopHiddenVideo (video: HTMLVideoElement) {
        let isPaused = false;
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.intersectionRatio < 0.1 && !video.paused) {
                    video.pause();
                    isPaused = true;
                } else if (isPaused) {
                    video.play();
                    isPaused = false;
                }
            }
        }, {
            root: video.closest("ul"),
            threshold: 0.1,
        });
        observer.observe(video);
    }

    // const ownedCards = new OwnedCards(currentUser.id);

    const muted = true; // loadValue("muteVideo", true);
</script>
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import { readable } from "svelte/store";
    import Icon from "$elem/Icon.svelte";
    import ratio from "$lib/actions/ratio";
    import tip from "$lib/actions/tip";
    import config from "$lib/utils/config";

    type S = $$Generic<SIZE>;

    /**
     * A card whose image/video will be displayed
     */
    export let card: SizedCard<S>;
    /**
     * The size type of the image/video
     */
    export let size: S;
    /**
     * Max width of the asset
     */
    export let maxWidth = 0;
    /**
     * Max height of the asset
     */
    export let maxHeight = 0;
    /**
     * Show the RE/LE icon, default - no
     */
    export let showSettType = false;
    /**
     * Force the colored image, default - no
     */
    export let isPublic = false;
    /**
     * Whether to set a fixed size of the asset
     */
    // export let setSize = true;
    // export let showLoading = false;
    /**
     * Show icon of the card's rarity, default - no
     */
    export let showRarity = false;

    if (showRarity && !card.rarity) {
        console.error("No rarity to display");
    }

    // FIXME use ownedCards
    const ownsCard = readable(true); // ownedCards.hasPrint(card.id, true);
    $: grayOut = !isPublic && !$ownsCard;

    // show max quality of the video if user owns the card
    // if the original is gif, it, of course, isn't played as video, but
    // image["original"] is still a gif (seems just a copy of the original)
    // so the original gets played as a video poster
    // if (card.asset_type === "video" && size === "xlarge") {
    //     size = !isPublic && $ownsCard ? "original" : "large";
    // }

    const data = getCardData(card, size);
    // eslint-disable-next-line prefer-const
    let { width, height } = getDimensionSize(data, maxWidth, maxHeight);
    // if (!setSize) {
    //     width = "";
    //     height = "";
    // }
    const showReplica = showSettType && "is_replica" in card && card.is_replica;
    const showLimited = showSettType && "version" in card && card.version === /* lim sett */ 3;

    /**
     * Allows to see the colored (and animated) asset during pressing on it
     */
    function makePeekable (elem: HTMLElement) {
        // if no need to peek
        if (!grayOut) return {};
        elem.addEventListener("mousedown", () => {
            grayOut = false;
        });
        elem.addEventListener("mouseup", () => {
            grayOut = true;
        });
        const cardType = card.piece_assets.video ? "animated" : "colored";
        return tip(elem, `Press and hold to see the ${cardType} version`);
    }
</script>

<svelte:options immutable/>

<!-- <div style:width style:height style:aspect-ratio={ratio} use:makePeekable > -->
<div class="print-asset" class:showRarity
    use:ratio={{ width, height }}
    use:makePeekable
>
    {#if data.type === "video" && data.sources && !grayOut}
        <video
            poster={data.url} width="{width}px" height="{height}px" autoplay loop {muted}
            on:click={(ev) => ev.currentTarget.play()}
            use:stopHiddenVideo
        >
            <!-- on:contextmenu|preventDefault -->
            {#each data.sources as source}
                <source src={source.url} type={source.mime_type}>
            {/each}
        </video>
    {:else}
        <img class:grayOut
            alt={card.name}
            src={data.url ?? config.defaultImageUrl}
        >
    {/if}
    {#if showReplica}
        <span><Icon icon="RE" hint="Replica"/></span>
    {/if}
    {#if showLimited }
        <span><Icon icon="LE" hint="Limited Edition"/></span>
    {/if}
    {#if showRarity && card.rarity }
        <span class="rarity">
            <Icon icon={card.rarity.class} hint={card.rarity.name} />
        </span>
    {/if}
    <!-- {#if showLoading}
        <i class="load-indicator on-white-bg"></i>
    {/if} -->
</div>

<style>
    .print-asset {
        position: relative;
        --icon-size: 26px;
    }
    img, video {
        width: 100%;
        height: 100%;
        display: block;
    }
    .showRarity img, .showRarity video {
        mask-image: url('data:image/svg+xml,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"%3e%3cpath fill="white" d="M0 471c0 2 2 4 4 4h16c3 0 5 2 5 5v16c0 2 2 4 4 4h471V0H0z"/%3e%3c/svg%3e');
        -webkit-mask-image: url('data:image/svg+xml,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"%3e%3cpath fill="white" d="M0 471c0 2 2 4 4 4h16c3 0 5 2 5 5v16c0 2 2 4 4 4h471V0H0z"/%3e%3c/svg%3e');
        mask-size: 500px 500px;
        -webkit-mask-size: 500px 500px;
        mask-position: bottom left;
        -webkit-mask-position: bottom left;
    }
    .grayOut:not(:active) {
        filter: grayscale(1);
    }
    span {
        position: absolute;
        top: 3%;
        right: 3%;
    }
    .rarity {
        top: auto;
        bottom: 2px;
        left: 2px;
        --icon-size: 20px;
    }
</style>
