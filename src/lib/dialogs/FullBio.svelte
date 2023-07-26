<!-- @component
    A dialog window to view and/or edit a user's bio
 -->
 <script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import { page } from "$app/stores";
    import Button from "$elem/Button.svelte";
    import Icon from "$elem/Icon.svelte";
    import { firstNamePossessive } from "$lib/services/user";
    import DialogWindow from "./DialogWindow.svelte";

    export let user: NM.User;

    /**
     * Start in editing mode, default - no
     */
    export let editing = false;

    const { isCurrentUser } = $page.data.currentUser;

    const bioLimit = 1200;
    const warnLimit = bioLimit - 100;

    let { bio } = user;
    let width = 0;
    let height = 0;

    let close: () => void;

    function startEditing (ev: Event) {
        editing = true;
        const elem = (ev.target as Element).closest("article")!.querySelector(".bio")!;
        width = elem.clientWidth + 2;
        height = elem.clientHeight + 2;
        console.log(width, height);
    }

    function saveBio () {
        user.bio = bio;
        // TODO implement sending to the server and displaying results
        close();
    }

    // fit textarea to its content
    function elastic (elem: HTMLElement) {
        function updateHeight () {
            const h = elem.style.height;
            elem.style.overflow = "hidden";
            elem.style.height = "auto";
            const sh = elem.scrollHeight + 2;
            elem.style.height = elem.clientHeight === sh ? h : `${sh}px`;
            elem.style.overflow = "";
        }

        elem.addEventListener("input", updateHeight);
        updateHeight();
    }
</script>

<DialogWindow blurry={"rgba(37,26,48,.9)"} bind:close on:closed closeable={true}>
    <article class:editing>
        <span class="close"><Icon icon="close" on:click={close} /></span>
        <header>{firstNamePossessive(user, true)} Bio</header>
        <hr>
        <main>
            {#if editing}
                <textarea class="bio"
                    maxlength={bioLimit}
                    placeholder="Enter a bio"
                    bind:value={bio}
                    style:width="{width}px"
                    style:height="{height}px"
                    use:elastic
                ></textarea>
            {:else}
                <div class="bio">{bio}</div>
            {/if}
        </main>
        {#if editing}
            <small class:warn={bio.length >= warnLimit}>
                {bio.length}/{bioLimit}
            </small>
        {/if}
        {#if $isCurrentUser(user)}
            <div class="buttons">
                {#if editing}
                    <Button type="subdued-dark" on:click={close}>Cancel</Button>
                    <Button on:click={saveBio}>Save</Button>
                {:else}
                    <Button type="subdued-dark" on:click={startEditing}>Edit</Button>
                {/if}
            </div>
        {/if}
    </article>
</DialogWindow>

<style>
    article {
        border-radius: 4px;
        padding: 0;
        background-color: white;
        color: #2c2830;
        width: min(calc(100vw - 40px), 649px);
        font-size: 15px;
        font-weight: 400;
        line-height: 1.3;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    article::after {
        content: "";
        height: 3px;
        background-position: bottom left;
        background-repeat: repeat-x;
        background: linear-gradient(90deg, #fbf8cb, #9cd88f, #89cade, #e82663, #ae66ab, #fbf8cb);
        width: 100%;
        position: absolute;
        bottom: 0;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
    }
    header {
        text-align: center;
        padding: 20px;
        font-size: 24px;
        font-weight: 300;
    }
    hr {
        height: 2px;
        margin: 0;
        background: linear-gradient(90deg, #B078B1, #B5CE80, #51B2D5, #B078B1);
        /* background: url('data:image/svg+xml,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 4"%3e%3cdefs%3e%3clinearGradient id="a" x1="0%25" y1="0%25" y2="-3%25"%3e%3cstop offset="0%25" stop-color="%23B078B1"/%3e%3cstop offset="30%25" stop-color="%23B5CE80"/%3e%3cstop offset="77%25" stop-color="%2351B2D5"/%3e%3cstop offset="100%25" stop-color="%23B078B1"/%3e%3c/linearGradient%3e%3c/defs%3e%3cpath fill="url(%23a)" d="M0 0h300v4H0z"/%3e%3c/svg%3e'); */
        background-position: -40px 0;
        background-repeat: repeat-x;
    }
    main {
        padding: 24px 32px 30px;
        font-weight: 400;
    }
    .editing main {
        padding-bottom: 9px;
    }
    .bio {
        white-space: pre-wrap;
        color: #5f5668;
        font-size: 16px;
        border: none;
        box-shadow: none;
        resize: none;
        padding: 7px 10px;
        max-width: 100%;
        border: 1px solid transparent;
        border-radius: 3px;
        line-height: normal;
        max-height: calc(100vh - 200px);
        overflow: auto;
    }
    .editing .bio {
        border-color: #ccc;
        box-shadow: inset 0 1px 2px rgba(0,0,0,.08);
        border-radius: 3px;
    }
    .bio:focus {
        background-color: #f4f0c9;
        border-color: #f4f0c9;
        outline: 0;
    }
    small {
        display: block;
        text-align: right;
        font-size: 12px;
        color: #5F5668;
        line-height: 1;
        padding: 0 32px 9px;
    }
    small.warn {
        color: red;
    }
    .buttons {
        margin: 0 32px 24px;
        /* width: 134px; */
        display: grid;
        grid-template-columns: 100px;
        gap: 12px;
        justify-content: flex-end;
    }
    .editing .buttons {
        grid-template-columns: repeat(2, 100px);
    }
    .close {
        position: absolute;
        top: 15px;
        right: 20px;
        cursor: pointer;
        user-select: none;
        --icon-color: #5f5668;
        --icon-size: 26px;
    }
</style>
