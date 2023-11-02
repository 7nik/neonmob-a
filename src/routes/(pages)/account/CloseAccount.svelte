<!-- @component
    A dialog form for closing the account
 -->
 <script lang="ts">
    import { closeAccount } from "$api";
    import { goto } from "$app/navigation";
    import Button from "$elem/Button.svelte";
    import Icon from "$elem/Icon.svelte";
    import DialogWindow from "$lib/dialogs/DialogWindow.svelte";

    let closeDialog: () => void;
    let showButtons = true;

    async function closeAcc () {
        showButtons = false;
        goto(await closeAccount());
        closeDialog();
    }

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    interface $$Events {
        closed: CustomEvent<void>
    }
</script>

<DialogWindow bind:close={closeDialog} on:closed blurry="#FFFA" closeable>
    <article>
        <span class="close"><Icon icon="close" on:click={closeDialog} /></span>
        <header>
            <h1>Close Account</h1>
        </header>
        <main>
            <p>
                <Icon icon="warning" />
                If you close your account, you will immediately forfeit all your cards, credits and
                carats. Any ongoing subscription will be cancelled with no partial refund and you
                will lose all Pro benefits. This is irreversible. Are you sure you want to do this?
            </p>
            {#if showButtons}
                <div>
                    <Button on:click={closeDialog}>Keep account</Button>
                    <Button type="subdued-light" on:click={closeAcc}>Close account</Button>
                </div>
            {/if}
        </main>
    </article>
</DialogWindow>


<style>
    article {
        border-radius: 6px;
        padding: 0;
        background-color: #120F0F;
        color: #b39ea9;
        width: 480px;
        max-width: calc(100vw - 50px);
        font-size: 15px;
        font-weight: 400;
        line-height: normal;
    }
    header {
        position: relative;
    }
    header::after {
        content: "";
        height: 1px;
        background-position: bottom left;
        background-repeat: repeat-x;
        background-size: 300px;
        background: linear-gradient(90deg, #B078B1, #B5CE80, #51B2D5, #B078B1);
        width: 100%;
        position: absolute;
        bottom: 0;
    }
    h1 {
        color: white;
        padding: 30px 60px 20px 40px;
        margin: 0;
    }
    main {
        padding: 15px 40px 40px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    p {
        color: #eb439a;
        --icon-color: #eb439a;
        --icon-size: 30px;
    }
    div {
        display: flex;
        justify-content: space-between;
    }

    .close {
        position: absolute;
        top: 30px;
        right: 30px;
        font-family: "Helvetica Neue",Helvetica,Arial,"Lucida Grande",sans-serif;
        font-size: 60px;
        font-weight: 100;
        line-height: .35;
        font-style: normal;
        color: #fff;
        opacity: 0.6;
        height: 0.55em;
        cursor: pointer;
        user-select: none;
        z-index: 1;
        --icon-size: 26px;
    }
    .close:hover {
        opacity: 1;
    }
    @media screen and (max-width: 420px) {
        div {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
        }
    }
</style>
