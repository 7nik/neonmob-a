<!-- @component
    A dialog window to view current user's carats
 -->
<script lang="ts">
    import { page } from "$app/stores";
    import Button from "$elem/Button.svelte";
    import Icon from "$elem/Icon.svelte";
    import { comma } from "$lib/utils/format";
    import DialogWindow from "./DialogWindow.svelte";

    const { carats } = $page.data.currentUser;

    let close: () => void;
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
</script>

<DialogWindow blurry={"rgba(37,26,48,.9)"} bind:close on:closed closeable={true}>
    <article>
        <header>Carats Balance</header>
        <main>
            <div class="balance">
                <Icon icon="carat"/>
                <h6>Carats Balance</h6>
                <span>{comma(carats)} carats</span>
            </div>
            <p>
                Earn carats by completing series, reaching milestones, and discarding cards.
                <br>
                Spend your carats to open more packs!
            </p>
        </main>
        <div class="button">
            <Button type="subdued-dark" on:click={close}>Thanks!</Button>
        </div>
        <span class="close"><Icon icon="close" on:click={close} /></span>
    </article>
</DialogWindow>

<style>
    article {
        border-radius: 6px;
        padding: 0;
        background-color: white;
        color: #2c2830;
        width: 640px;
        max-width: calc(100vw - 50px);
        font-size: 15px;
        font-weight: 400;
        line-height: 1.3;
        text-align: center;
        display: flex;
        flex-direction: column;
    }
    header {
        padding: 20px;
        font-size: 22px;
        font-weight: 300;
    }
    main {
        border-top: 1px solid #d6d6d6;
        border-bottom: 1px solid #d6d6d6;
        padding: 30px;
        line-height: 1.4;
        font-weight: 400;
    }
    .balance {
        margin: 0 auto 30px;
        display: inline-grid;
        grid-template-columns: auto auto;
        gap: 0 10px;
        align-content: flex-start;
        text-align: left;
        --icon-size: 50px;
    }
    .balance > :global(:first-child) {
        grid-row: span 2;
    }
    .balance h6 {
        font-size: 13px;
        font-weight: 400;
        color: #857A90;
        margin: 0;
    }
    .balance span {
        font-size: 26px;
        color: #2c2830;
    }
    p {
        margin: 0 0 10px;
        color: #5f5668;
    }
    .button {
        margin: 22px auto;
        width: 134px;
        display: grid;
    }
    .close {
        position: absolute;
        top: 15px;
        right: 20px;
        font-family: "Helvetica Neue",Helvetica,Arial,"Lucida Grande",sans-serif;
        font-size: 60px;
        font-weight: 100;
        line-height: .35;
        font-style: normal;
        color: #5f5668;
        height: 0.55em;
        cursor: pointer;
        user-select: none;
        --icon-size: 26px;
    }
</style>
