<!-- @component
    Renders a banner. The parent must have non-static position and `overflow:hidden`
 -->
<script lang="ts" context="module">
    export type BannerColor = "" | "yellow" | "green" | "red" | "violet"
        | "blue" | "purple" | "purple-dark";
</script>
<script lang="ts">
    export let bannerColor: BannerColor;
    export let bannerText: string;
</script>

{#if bannerColor && bannerText}
    <span class={bannerColor}>{bannerText}</span>
{/if}

<style>
    span {
        position: absolute;
        padding: .55em 0 0.4em;
        text-transform: uppercase;
        font-weight: 700;
        font-size: 10px;
        letter-spacing: .1em;
        width: 140%;
        left: 35%;
        top: -35%;
        transform-origin: 0 0;
        transform: rotate(45deg);
        box-shadow: inset 0 1px 0 rgb(255 255 255 / 10%), 0 1px 2px rgb(0 0 0 / 10%);
        text-align: center;
        color: #fff
    }

    .yellow {
        background: #fbf8cf;
        color: #2c2830
    }
    .green {
        background: #00D8B2;
    }
    .red {
        background: #E82C8E;
    }
    .violet {
        background: #5D8CEE;
    }
    .blue {
        background: #4bbbf5;
    }
    .purple {
        background: #B078B1;
    }
    .purple-dark {
        background: #542F69;
    }
</style>
