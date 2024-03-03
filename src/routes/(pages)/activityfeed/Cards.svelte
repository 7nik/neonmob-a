<!-- @component
    Block of cards for detailed view of activity feed item
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";
    import type { ID } from "$lib/utils/NM Types";

    import Clickable from "$elem/Clickable.svelte";
    import Icon from "$elem/Icon.svelte";
    import ratio from "$lib/actions/ratio";
    import { viewPrint } from "$lib/overlays/PrintDetailsOverlay.svelte";

    /**
     * The main card
     */
    export let rarestCard: NM.ActivityStoryPack["packs"][number]["rarest_piece"];
    /**
     * Rest of the cards
     */
    export let restCards: NM.ActivityStoryPack["packs"][number]["pieces"];
    /**
     * The cards owner
     */
    export let owner: NM.ActivityStoryPack["user"];

    function convertUser (user: NM.ActivityStoryPack["user"]) {
        return {
            avatar: {
                small: user.avatar_url,
                large: user.avatar_url,
            },
            id: user.id,
            name: user.full_name,
            username: user.username,
        };
    }

    function viewCard ({ piece_id: cardId }: { piece_id: ID<"card"> }) {
        viewPrint({
            cardId,
            gallery: [rarestCard.piece_id, ...restCards.map((c) => c.piece_id)],
            owner: convertUser(owner),
        });
    }
</script>

<div>
    <Clickable on:click={() => viewCard(rarestCard)}>
        <figure use:ratio={rarestCard.large_image}
        >
            {#if rarestCard.large_video}
                <video poster={rarestCard.large_image?.url} loop muted autoplay>
                    {#each rarestCard.large_video?.sources as source}
                        <source src={source.url} type={source.mime_type}>
                    {/each}
                </video>
            {:else if rarestCard.large_image}
                <img src={rarestCard.large_image.url}
                    alt="Card {rarestCard.name}"
                />
            {/if}
            <div class="overlay"></div>
            <figcaption>
                <Icon icon={rarestCard.rarity} upper />
                <span class="name">{rarestCard.name}</span>
            </figcaption>
        </figure>
    </Clickable>
</div>
<div class="rest">
    {#each restCards as card}
        <Clickable on:click={() => viewCard(card)}>
            <figure>
                {#if card.small_video}
                    <video poster={card.small_image.url} loop muted autoplay>
                        {#each card.small_video.sources as source}
                            <source src={source.url} type={source.mime_type}>
                        {/each}
                    </video>
                {:else}
                    <img src={card.small_image.url} alt="Card {card.name}"/>
                {/if}
                <div class="overlay"></div>
                <figcaption>
                    <Icon icon={card.rarity} upper />
                </figcaption>
            </figure>
        </Clickable>
    {/each}
</div>

<style>
    figure {
        margin: 0;
        cursor: zoom-in;
        position: relative;
    }
    figure img, figure video {
        width: 100%;
        display: block;
    }
    figure:hover .overlay {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        background: #00000040;
        z-index: 1;
    }
    figure figcaption {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 2;
        padding: 20% 10px 10px;
        color: #fff;
        font-size: 14px;
        background: linear-gradient(to bottom, transparent, #00000080);
        background-size: contain;
    }

    .rest {
        background: url('data:image/svg+xml,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3e%3crect width="80" height="80" x="10" y="10" fill="none" stroke="black" stroke-dasharray="5%2c4" stroke-width="2" opacity=".1" rx="3"/%3e%3cpath fill="none" stroke="%23979797" stroke-linecap="square" d="M100 0v100H0" opacity=".2"/%3e%3c/svg%3e');
        background-size: 33.33%;
        font-size: 0;
        display: flex;
        flex-wrap: wrap;
    }
    .rest figure {
        width: 33.334%;
        aspect-ratio: 1;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
    }
    .rest figure img, .rest figure video {
        width: 100%;
    }
    .rest figure figcaption {
        padding: 30% 10px 10px;
        background: linear-gradient(to bottom, transparent, #00000050);
    }
</style>
