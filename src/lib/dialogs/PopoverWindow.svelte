<!-- @component
    A wrapper to display content on top-layer with aligning to the provided element
 -->
<script lang="ts">
    import {
        autoUpdate,
        computePosition,
        shift,
        flip,
        offset,
    } from "@floating-ui/dom";
    import { createEventDispatcher, onMount } from "svelte";

    export let element: Element;

    let dialog: HTMLDialogElement;

    let closed = false;
    let stopUpdating: () => void;
    onMount(() => {
        stopUpdating = autoUpdate(element, dialog, () => {
            if (closed) return;
            computePosition(element, dialog, {
                placement: "bottom",
                middleware: [
                    offset(8),
                    flip(),
                    shift({
                        mainAxis: true,
                        crossAxis: true,
                    }),
                ],
                strategy: "fixed",
            }).then(({ x, y }) => {
                if (dialog) {
                    dialog.style.left = `${x}px`;
                    dialog.style.top = `${y}px`;
                }
            });
        });
        dialog.showModal();
        return closePopover;
    });

    function backdropClick (ev: MouseEvent) {
        const rect = dialog.getBoundingClientRect();
        if (rect.left > ev.clientX
            || rect.right < ev.clientX
            || rect.top > ev.clientY
            || rect.bottom < ev.clientY
        ) {
            closePopover();
        }
    }

    const dispatch = createEventDispatcher<{
        closed: void,
    }>();
    function closePopover () {
        if (closed) return;
        stopUpdating?.();
        dialog?.remove();
        closed = true;
        dispatch("closed");
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog bind:this={dialog} on:click|self={backdropClick}>
    <slot/>
</dialog>

<style>
    dialog {
        margin: 0 8px;
        padding: 0;
        width: min(320px, calc(100vw - 20px));
        max-width: initial;
        border: none;
        border-radius: 4px;
        overflow: visible;
        color: #5f5668;
        background: white;
        box-shadow: 0 3px 10px rgb(0 0 0 / 25%);
    }
    dialog::backdrop {
        background: transparent;
    }
</style>
