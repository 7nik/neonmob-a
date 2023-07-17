<!-- @component
    A earned rarity badge image or its placeholder
 -->
<script lang="ts">
    export let badge: { name: string, image: string };
</script>

{#if badge.image.startsWith("http")}
    <img src={badge.image} alt={badge.name}>
{:else}
    <span class={badge.image}></span>
{/if}

<style>
    img {
        max-width: 30px;
        max-height: 30px;
        margin: 5px;
    }
    img:nth-child(6) {
        margin-left: 16px;
        align-self: center;
    }
    span {
        width: 30px;
        height: 30px;
        margin: 5px;
        background-position: center center;
        background-repeat: no-repeat;
        background-size: contain;
    }
    span.unavailable {
        background-image: url('data:image/svg+xml,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 78 90"%3e%3cpath fill="none" stroke="rgba(216%2c 216%2c 216%2c 0.7)" stroke-dasharray="14.0 7.5" stroke-dashoffset="-2" stroke-width="5" d="M2 66V24L39 2l37 22v42L39 88Zl74-43"/%3e%3c/svg%3e');
    }
    span.not-achieved {
        background-image: url('data:image/svg+xml,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 78 90"%3e%3cpath fill="none" stroke="rgba(216%2c 216%2c 216%2c 0.7)" stroke-dasharray="9.0 5.2" stroke-dashoffset="4.5" stroke-width="3" d="M2 66V24L39 2l37 22v42L39 88Z"/%3e%3c/svg%3e');
    }
    span.not-achieved:nth-child(6) {
        margin-left: 16px;
        background-image: url('data:image/svg+xml,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 50"%3e%3cpath fill="none" stroke="rgba(216%2c 216%2c 216%2c 0.7)" stroke-dasharray="6.4 4.1" stroke-dashoffset="3" stroke-width="3" d="m30 10 9-8 19 18-28 30L2 20 20 2Z"/%3e%3c/svg%3e');
    }
    @media screen and (max-width: 960px) {
        img {
            max-width: 20px;
            max-height: 20px;
        }
        span {
            width: 20px;
            height: 20px;
        }
    }
    @media screen and (max-width: 767px) {
        img:nth-child(6), span.not-achieved:nth-child(6) {
            margin-left: 5px;
        }
    }
</style>
