<!-- @component
    A wrapper to make content clickable and satisfy a11y
 -->
<script lang="ts">
    export let link = false;
</script>

<button on:click class:link>
    <slot/>
</button>

<style>
    button {
        display: contents;
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;

        text-align: inherit;
        color: inherit;
        font-style: inherit;
        font-variant-ligatures: inherit;
        font-variant-caps: inherit;
        font-variant-numeric: inherit;
        font-variant-east-asian: inherit;
        font-variant-alternates: inherit;
        font-weight: inherit;
        font-stretch: inherit;
        font-size: inherit;
        font-family: inherit;
        font-optical-sizing: inherit;
        font-kerning: inherit;
        font-feature-settings: inherit;
        font-variation-settings: inherit;
    }
    button.link {
        color: #93d6f9;
    }
</style>
