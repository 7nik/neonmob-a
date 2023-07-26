import type NM from "$lib/utils/NM Types";
import type {
    ComponentEvents,
    ComponentProps,
    SvelteComponent,
    SvelteComponentTyped,
} from "svelte";

import CaratBalance from "./CaratBalance.svelte";
import FullBio from "./FullBio.svelte";
import Login from "./Login.svelte";
import Message from "./Message.svelte";
import SettCompletionPopover from "./SettCompletionPopover.svelte";
import SharePopover from "./SharePopover.svelte";

type EventResult<
    Component extends SvelteComponent,
    EventName extends string,
> = ComponentEvents<Component>[EventName]["detail"];
type ConstructorTypeOf<T, U extends any[] = any[]> = new (...args: U) => T;

let dialog: SvelteComponent | null = null;

/**
 * Creates a modal dialog, destroys the previous one
 * @param Component - component constructor of the dialog
 * @param props - dialog params
 * @returns the name of the pressed button or `null`
 */
// export function createDialog<T extends SvelteComponentTyped<any, { closed: CustomEvent<any> }>>
function createDialog<
    T extends SvelteComponentTyped<any, { closed: CustomEvent<any> }>
> (
    Component: ConstructorTypeOf<T>,
    props: T["$$prop_def"],
): Promise<EventResult<T, "closed">> {
    return new Promise((resolve) => {
        dialog?.$destroy();
        dialog = new Component({
            target: document.body,
            props,
        });
        dialog.$on("closed", (ev: CustomEvent<any>) => {
            dialog?.$destroy();
            dialog = null;
            resolve(ev.detail);
        });
    });
}

/**
 * Show the window about carats of the current user
 */
export function viewCaratBalance () {
    createDialog(CaratBalance, {});
}

/**
 * Show the window with the full user's bio
 * @param user - the target user
 * @param editing - start in bio editing state
 */
export function viewBio (user: NM.User, editing = false) {
    createDialog(FullBio, { user, editing });
}

/**
 * Show an alert message
 * @param title - the main message
 * @param text - an extra description
 * @returns a promise of message get closed
 */
export async function alert (title: string, text = "") {
    await createDialog(Message, {
        title, text,
    });
}

/**
 * Show a confirm dialog
 * @param title - the main message
 * @param text - an extra description
 * @returns a promise whether the OK button was pressed
 */
export async function confirm (title: string, text = "") {
    const button = await createDialog(Message, {
        title,
        text,
        buttons: ["OK", "Cancel"],
    });
    return button === "OK";
}

/**
 * Show a message about unimplemented functionality
 */
export function fail (ev: Event | null = null) {
    ev?.stopPropagation();
    ev?.preventDefault();
    alert("Impossiburu", "This isn't implemented yet :`(");
}

export function login () {
    return createDialog(Login, {});
}

/**
 * Creates a popover window
 * @param Component - component constructor of the popover
 * @param props - popover params
 * @returns promise about the closed popover
 */
function createPopover<
    T extends SvelteComponentTyped<{ element: Element }, { closed: CustomEvent<void> }>
> (
    target: Element | Event,
    Component: ConstructorTypeOf<T>,
    props: Omit<T["$$prop_def"], "element">,
): Promise<void> {
    if (target instanceof Event) target = target.currentTarget as Element;
    // Clickable is a button with display:contents
    // that breaks positioning of the popover
    if (target.nodeName === "BUTTON"
        && !target.clientHeight
        && target.firstElementChild
    ) {
        target = target.firstElementChild;
    }

    return new Promise((resolve) => {
        const popover = new Component({
            target: document.body,
            props: {
                ...props,
                element: target,
            },
        });
        popover.$on("closed", () => {
            popover.$destroy();
            resolve();
        });
    });
}

/**
 * Display a series completion graph popover
 * @param target - the popover's anchor
 * @param sett - the target collection
 * @param owner - the collection owner
 */
export function showSettCompletion (
    target: Element | Event,
    sett: NM.Sett,
    owner: NM.UserMinimal,
) {
    createPopover(target, SettCompletionPopover, { sett, owner });
}

/**
 * Display a share popover
 * @param target - the popover's anchor
 * @param props - the sharing options
 */
export function showShare (
    target: Element | Event,
    props: Omit<ComponentProps<SharePopover>, "element">,
) {
    createPopover(target, SharePopover, props);
}
