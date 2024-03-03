<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import { goto } from "$app/navigation";
    import { liveListProvider } from "$api";
    import Avatar from "$elem/Avatar.svelte";
    import Icon from "$elem/Icon.svelte";
    import Time from "$elem/Time.svelte";
    import { sharedTradePreview } from "$lib/actions/tradePreviews";
    import { viewCoreCompletion, viewLevelUp } from "$lib/dialogs";
    // import { viewTrade } from "$lib/overlays/TradeWindowOpener.svelte";
    import { firstName, firstNamePossessive } from "$lib/services/user";
    import { absUrl } from "$lib/utils/utils";

    /**
     * The notification to display
     */
    export let notification: NM.Notification<object, string, string>;

    const {
        noun, users, id, url, images,
    } = notification.object;
    let verbPhrase = "";
    // getVerbPhrase
    $: {
        const ending = notification.actor.action_data ? ":" : ".";
        verbPhrase = notification.verb_phrase;
        // is it even used?
        if (["proposed", "withdrew", "modified"].includes(verbPhrase)) {
            verbPhrase = `${verbPhrase} a ${noun} to ${firstName(users[0])}${ending}`;
        } else if (verbPhrase === "expired") {
            verbPhrase = `let ${firstNamePossessive(users[0])} ${noun} expire.`;
        } else if (notification.verb === "friend") {
            verbPhrase = `${verbPhrase} ${firstName(users[0])} as a friend.`;
        } else if (["submission-series", "coming-soon", "leveled-up", "series-completed"]
            .includes(notification.verb)
        ) {
            verbPhrase = ""; // we will display `action_data` instead of it
        } else if (users.length > 0) {
            const list = users
                .flatMap((user, i, { length }) =>  (i === length - 1
                    ? [length === 1 ? "" : "and ", firstNamePossessive(user)]
                    : [firstName(user), length > 2 ? ", " : " "]
                ))
                .join("");
            verbPhrase = `${verbPhrase} ${list} ${noun}${ending}`;
        } else {
            verbPhrase = `${verbPhrase} the ${noun}${ending}`;
        }
    }

    function notificationPreview (elem: HTMLElement) {
        if (notification.object.type === "trade-event") {
            sharedTradePreview(elem, id);
        }
    }

    function markRead (ev: Event) {
        if (notification.read) return;
        liveListProvider("notifications").markRead(notification.id);
        ev.stopPropagation();
        ev.preventDefault();
    }

    function notificationClick (ev: Event & {currentTarget:HTMLAnchorElement}) {
        markRead(ev);

        switch (notification.object.type) {
            case "trade-event":
                // viewTrade(id);
                break;
            case "series-completed": {
                const seriesReward = notification.object as unknown as NM.Reward;
                viewCoreCompletion(seriesReward);
                break;
            }
            case "leveled-up": {
                const levelReward = notification.object as unknown as NM.UserLevelUp;
                viewLevelUp(levelReward);
                break;
            }
            case "Series-remainder":
            case "badge-obtained":
                goto(ev.currentTarget.href);
                break;
            default:
                console.error("Unknown notification type", notification.object.type, notification);
                if (url) goto(ev.currentTarget.href);
        }
    }
</script>

<svelte:options immutable />

<a href={absUrl(url ?? "")}
    class:unread={!notification.read}
    on:click={notificationClick}
    use:notificationPreview
    data-sveltekit-preload-data="tap"
>
    <Avatar user={notification.actor} />
    <section>
        <div>
            {#if verbPhrase}
                <strong>{firstName(notification.actor)}</strong>
                {verbPhrase}
            {/if}
            {#if notification.actor.action_data}
                <i>{notification.actor.action_data}</i>
            {/if}
        </div>
        <div class="bottom">
            <Time stamp={notification.actor.time} />
            {#if !notification.read}
                <span class="read">
                    <Icon icon="checkmark" hint="Mark as read" on:click={markRead} />
                </span>
            {/if}
        </div>
    </section>
    {#if images[0]}
        <img src={images[0]} alt="Notification thumbnail">
    {/if}
</a>

<style>
    a {
        padding: 8px 10px;
        gap: 0 10px;
        text-decoration: none;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        cursor: pointer;
        font-size: 14px;
        font-weight: 400;
        position: relative;
    }
    a.unread {
        background: rgba(75,187,245,.2);
    }
    a:hover {
        background: #f4f4f4;
    }
    a::before {
        content: "";
        display: block;
        position: absolute;
        bottom: -1px;
        height: 1px;
        width: 100%;
        background: #efefef;
        margin-left: 50px;
    }
    a:hover::before {
        background: transparent;
    }
    section {
        flex-grow: 1;
        max-width: calc(100% - 100px);
        display: flex;
        gap: 2px;
        flex-direction: column;
        justify-content: center;
        color: #857a90;
    }
    div.bottom {
        display: flex;
        justify-content: space-between;
        --icon-size: 14px;
    }
    strong, i {
        color: #2c2830;
        font-weight: 400;
    }
    .unread .read {
        height: 1em;
    }
    .unread:not(:hover) .read {
        display: none;
    }
    img {
        max-width: 40px;
    }
</style>
