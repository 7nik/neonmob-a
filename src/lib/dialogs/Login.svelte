<!-- @component
    A dialog window to log in
 -->
<script lang="ts">
    import Login from "$elem/Login.svelte";
    import DialogWindow from "./DialogWindow.svelte";

    let close: (reason: null) => void;

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    interface $$Events {
        closed: CustomEvent<null>
    }
</script>

<DialogWindow bind:close blurry={"#FFFA"} closeable={false} on:closed>
    <div>
        <Login onSuccess={() => close(null)} />
    </div>
</DialogWindow>

<style>
    div {
        border-radius: 4px;
        padding: 20px;
        box-shadow: 0 0 0 5px #fff3, 0 0 2px 2px #0002;
        background-color: #1a1417;
    }
</style>
