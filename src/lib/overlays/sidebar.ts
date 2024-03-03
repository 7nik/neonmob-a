import type { ComponentProps, SvelteComponentTyped, ComponentType } from "svelte";
import type { Subscriber, Unsubscriber, Updater } from "svelte/store";
import type { ID } from "$lib/utils/NM Types";
import type NM from "$lib/utils/NM Types";

import { get, writable } from "svelte/store";
import { page } from "$app/stores";
import { getConversationInfo } from "$api";
import { alert } from "$lib/dialogs";

type Data<T extends SvelteComponentTyped|null> = {
    comp: T extends SvelteComponentTyped ? ComponentType<T> : null,
    props: T extends SvelteComponentTyped ? ComponentProps<T> : Record<string, never>;
}
// cannot use generic on values to have use a custom store type with generic methods
// https://github.com/microsoft/TypeScript/issues/17574
type ComponentStore = {
    set <T extends SvelteComponentTyped|null>(data: Data<T>): void
    subscribe <T extends SvelteComponentTyped|null>(run: Subscriber<Data<T>>): Unsubscriber
    update <T extends SvelteComponentTyped|null>(updater: Updater<Data<T>>): void;
}
/**
 * Set or remove the sidebar overlay content
 * @param param.comp - the new content
 * @param param.props - optional, the content component props
 */
export const sidebarOverlay = writable({ comp: null, props: {} }) as ComponentStore;

type State = "milestone" | "friends" | "messages" | "notifications" | "conversation" | null;
export const sidebarTab = writable<State>(null);

let collocutorId: ID<"user">;
export const conversationData = writable<{
    conversationId: ID<"conversation">,
    collocutor: NM.UserCollocutor,
    canClose: boolean,
    canBack: boolean,
    onClose:(back: boolean) => void,
}>();

/**
 * Show a conversation tab
 * @param data - the collocutor's ID or the conversation's data
 */
export async function viewConversation (
    data: NM.ConversationInfo | ID<"user">,
    canClose = true,
    prevTab = get(sidebarTab),
) {
    const canBack = prevTab === "messages"
        || prevTab === "friends"
        || prevTab === null && window.innerWidth < 640;
    const onClose = (back: boolean) => sidebarTab.set(back ? prevTab : null);
    let conversation: NM.ConversationInfo;
    if (typeof data === "number") {
        if (data === collocutorId) {
            conversationData.update((data) => ({
                ...data,
                canClose,
                canBack,
                onClose,
            }));
            sidebarTab.set("conversation");
            return;
        }
        try {
            conversation = await getConversationInfo(data);
        } catch (reason) {
            alert(String(reason));
            return;
        }
    } else {
        conversation = data;
    }

    const { isCurrentUser } = get(page).data.currentUser;
    const collocutor = conversation.users.find((user) => !isCurrentUser(user))!;
    conversationData.set({
        conversationId: conversation.id,
        collocutor,
        canBack,
        canClose,
        onClose,
    });
    collocutorId = collocutor.id;
    sidebarTab.set("conversation");
}

sidebarTab.subscribe((newTab) => {
    if (newTab === "conversation" && !conversationData) {
        console.warn("No conversation data");
        sidebarTab.set(null);
    }
});
