import type { MaybePromise } from "@sveltejs/kit";
import type { ComponentProps, SvelteComponent, SvelteComponentTyped } from "svelte";
import { browser } from "$app/environment";
import { afterNavigate } from "$app/navigation";
import { absUrl } from "$lib/utils/utils";

/**
 * In general, all of it is a workaround for Shallow routing
 * https://github.com/sveltejs/kit/pull/9847
 */

type ConstructorTypeOf<T> = new (props: any) => T;
type HistoryListener = (action: "create"|"destroy", data?: any) => void;

// overlay instances
const overlays: Record<string, SvelteComponent | null> = {};
// overlay's actions
const actions: Record<string, HistoryListener> = {};

// state to restore on closing an overlay
let svelteKitState: any;
let svelteKitUrl: string | null;

// name of current overlay
let currentName: string | null = null;
export function initOverlays () {
    if (!browser) return;

    svelteKitState = window.history.state;
    svelteKitUrl = window.location.href;

    afterNavigate((nav) => {
        svelteKitState = window.history.state;
        svelteKitUrl = nav.to?.url.href ?? null;
        // close overlay on navigation
        if (currentName) {
            actions[currentName]("destroy");
            currentName = null;
        }
    });

    // show and close overlays when navigate by the history stack
    window.addEventListener("popstate", (ev) => {
        const newName: string | null = ev.state?.overlayName ?? null;
        if (currentName !== newName) {
            if (currentName) {
                actions[currentName]("destroy");
            }
            currentName = newName;
        }
        if (newName) {
            actions[newName]("create", ev.state?.overlayData);
        }
    });
}


/**
 * Function to show and hide an overlay according to browser history
 * @param name - overlay's internal name
 * @param getComponent - fn that return the overlay component.
 *      Using getter allows modules to pass self-reference
 * @param url2props - fn to extract overlay's props from url or history state
 * @param props2history - fn to filter saved props, default one save all
 */
export default <
    T extends SvelteComponentTyped<any>, D,
> (
    name: string,
    getComponent: () => ConstructorTypeOf<T>,
    url2props: (url: string, data?: D) => MaybePromise<ComponentProps<T>>,
    props2history: (props: ComponentProps<T>) => D = (props) => props,
) => {
    if (browser) {
        actions[name] = async (action, data: D) => {
            if (action === "create") {
                const props = await url2props(window.location.href, data);
                view(props);
            } else {
                overlays[name]?.$destroy();
                overlays[name] = null;
            }
        };
    }

    /**
     * Show/update the overlay
     * @param props - the overlay props
     * @param url - if provided - a history entry will be added
     */
    function view (
        props: ComponentProps<T>,
        url?: string,
    ) {
        const overlay = overlays[name];
        if (overlay) {
            overlay.$set(props);
        } else {
            const anotherOverlay = Object.entries(overlays).find(([, o]) => o)?.[0];
            if (anotherOverlay) {
                actions[anotherOverlay]("destroy");
            }
            overlays[name] = new (getComponent())({
                target: document.body,
                props,
            });
            currentName = name;
            // assume the component will be destroyed only via the `close` function
        }
        if (url) {
            window.history.pushState(
                {
                    overlayName: name,
                    overlayData: props2history(props),
                },
                "",
                absUrl(url),
            );
        }
    }

    /**
     * Close the overlay with updating browser history
     */
    function close () {
        overlays[name]?.$destroy();
        overlays[name] = null;
        window.history.pushState(svelteKitState, "", svelteKitUrl);
    }

    return { view, close };
};
