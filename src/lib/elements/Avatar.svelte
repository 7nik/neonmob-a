<!-- @component
    The user avatar of the given size
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import config from "$lib/utils/config";

    export let user: Pick<NM.User, "id"|"avatar"|"username">
        | { avatar_url: string, full_name: string };
    /**
     * Size of avatar to display, by default - small
     */
    export let size: "small"|"large"|"fill" = "small";

    $: src = ("avatar" in user
        ? user.avatar[size === "small" ? "small" : "large"]
        : user.avatar_url)
        || config.defaultAvatarUrl;
    $: name = "full_name" in user ? user.full_name : user.username;

    // has to use such approach because typing don't allow
    // declaration of `onerror` right in HTML
    // Also: https://github.com/sveltejs/language-tools/issues/1026
    const inlineListeners = {
        onerror: `this.src = "${config.defaultAvatarUrl}"`,
    };
</script>

<svelte:options immutable/>

<img {src} {...inlineListeners} class={size} alt="{name}'s avatar">

<style>
    img {
        display: block; /* to avoid space below */
        border-radius: 100%;
        width: 40px;
        height: 40px;
    }
    img.large {
        width: 100px;
        height: 100px;
    }
    img.fill {
        width: 100%;
        height: 100%;
    }
</style>
