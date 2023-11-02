<script lang="ts">
    import type { Result } from "@uppy/transloadit";
    import type NM from "$lib/utils/NM Types.js";
    import type { fullURL } from "$lib/utils/NM Types.js";

    import { fly } from "svelte/transition";
    import { resetPassword, updateEmailSubscriptions } from "$api";
    import Avatar from "$elem/Avatar.svelte";
    import Button from "$elem/Button.svelte";
    import Select from "$elem/Select.svelte";
    import ToggleSwitch from "$elem/ToggleSwitch.svelte";
    import Uploader from "$elem/Uploader.svelte";
    import progressCircle from "$lib/actions/progressCircle";
    import tip from "$lib/actions/tip";
    import { alert, createDialog } from "$lib/dialogs";
    import { TIMEZONES } from "$lib/utils/date";
    import Field from "./Field.svelte";
    import ChangePassword from "./ChangePassword.svelte";
    import CloseAccount from "./CloseAccount.svelte";

    export let data;

    const { currentUser, p } = data;
    let { emailSubs } = data;
    const { email, timezoneOrig, vacationMode, user } = currentUser;
    let { username } = user;
    let timezone = TIMEZONES.find((t) => t.offset === $timezoneOrig)!;

    let message = "";
    let usernameDisabled = true;
    let errors: Record<string, string[]> = {};

    function showAndHideMessage (msg: string) {
        message = msg;
        if (msg) {
            setTimeout(() => { message = ""; }, 1000);
        }
    }

    function changePassword () {
        if (currentUser.hasUsablePassword()) {
            createDialog(ChangePassword, {
                userId: user.id,
            });
        } else {
            resetPassword(currentUser.email);
            alert(`Instructions for resetting your password have been sent to ${currentUser.email}!`);
        }
    }

    async function updateEmailSubs (field: keyof NM.EmailSubscriptions["email_subscriptions"]) {
        message = "Saving your data...";
        try {
            const d = await updateEmailSubscriptions(emailSubs);
            console.log(d);
            emailSubs = d;
            showAndHideMessage("Saved!");
        } catch (ex) {
            console.error("Failed to update email subs", ex);
            if (ex && typeof ex === "object" && "details" in ex) {
                message = ex.details as string;
            } else {
                message = "Failed to update settings";
            }
            emailSubs[field] = !emailSubs[field];
        }
    }

    function updateUsername ({ username: value }: { username?: string }) {
        if (!value) return Promise.resolve(false);
        username = value;
        return Promise.resolve(true);
    }

    async function updateSetting (data: Partial<NM.UserAccount>) {
        message = "Saving your data...";
        errors = {};
        try {
            await currentUser.update(data);
            if ("username" in data) {
                usernameDisabled = true;
            }
            showAndHideMessage("Saved!");
            return true;
        } catch (ex) {
            console.error("Failed to update settings", ex);
            if (ex && typeof ex === "object" && "body" in ex) {
                const err = ex.body as object;
                if ("details" in err) {
                    message = err.details as string;
                } else {
                    message = "";
                    errors = err as typeof errors;
                    setTimeout(() => {
                        errors = {};
                    }, 5000);
                }
            }
            if ("username" in data) {
                username = user.username;
                usernameDisabled = true;
            }
        }
        return false;
    }

    async function updateTimezoneOffset () {
        if (!await updateSetting({
            original_timezone_offset: timezone.offset,
            timezone_offset: (new Date()).getTimezoneOffset(),
        })) {
            timezone = TIMEZONES.find((t) => t.offset === $timezoneOrig)!;
        }
    }

    async function updateReceiveTradeEmails () {
        if (!await updateSetting({
            vacation_mode: $vacationMode,
        })) {
            $vacationMode = !$vacationMode;
            message = errors.vacation_mode[0];
        }
    }

    async function updateAvatar (assembly: Record<string, Result[]>) {
        updateSetting({
            original_avatar_url: assembly.images_only[0].ssl_url as fullURL,
            small_avatar_url: assembly.small[0].ssl_url as fullURL,
            large_avatar_url: assembly.large[0].ssl_url as fullURL,
        });
    }

    function initiateCloseAccount () {
        createDialog(CloseAccount, {});
    }
</script>

<article>
    <!-- <div data-ng-if="!userLoaded || !emailSubscriptionsLoaded"
        class="settings-load-indicator load-indicator on-white-bg large"
    ></div> -->
    <!-- <div data-ng-if="userLoaded && emailSubscriptionsLoaded" class=account-settings> -->
    <div class=account-settings>
        {#if message}
            <div class="status-message" transition:fly={{ duration:200, y: "-100%" }}>
                <div>{message}</div>
            </div>
        {/if}
        <h1>Account Settings</h1>
        <form novalidate>
            <fieldset>
                {#await p.transloaditParams}
                    <div class="avatar">
                        <Avatar user={$user} size="fill" />
                    </div>
                {:then uploadParams}
                    <div class="avatar">
                        <Avatar user={$user} size="fill" />
                        <Uploader
                            id="avatar-upload"
                            name="avatar"
                            accept="image/jpeg,image/jpg,image/png"
                            minAspectRatio={1}
                            maxAspectRatio={1}
                            maxFileCount={1}
                            maxFileSize={ 5 * 1024 * 1024 }
                            {uploadParams}
                            on:completed={({ detail }) => updateAvatar(detail)}
                            let:progress
                            let:openPicker
                        >
                            <div>
                                {#if progress.total !== null}
                                    <canvas use:progressCircle={{
                                        bgColor: "#e1e1e1",
                                        startColor: "#C18BF2",
                                        radius: 120,
                                        thickness: 8,
                                        startAngle: 0,
                                        progress: progress.total / 100,
                                    }} />
                                {:else}
                                    <Button on:click={openPicker}>modify</Button>
                                {/if}
                            </div>
                        </Uploader>
                    </div>
                {:catch}
                    <div class="avatar">
                        <Avatar user={$user} size="fill" />
                    </div>
                {/await}
            </fieldset>
            <fieldset>
                <h2>Profile</h2>
                <div class="half">
                    <Field {errors}
                        label="First Name"
                        name="first_name"
                        save={updateSetting}
                        value={user.first_name}
                    />
                    <Field {errors}
                        label="Last Name"
                        name="last_name"
                        save={updateSetting}
                        value={user.last_name}
                    />
                    <Field {errors}
                        label="Username"
                        name="username"
                        save={updateUsername}
                        value={user.username}
                        disabled={usernameDisabled}
                    />
                    {#if usernameDisabled}
                        <Button type="subdued-dark" on:click={() => { usernameDisabled = !usernameDisabled}}>
                            Change
                        </Button>
                    {:else}
                        <Button type="subdued-dark" on:click={() => updateSetting({ username })}>
                            Save
                        </Button>
                    {/if}
                </div>
                <Field {errors}
                    label="Email Address"
                    name="email"
                    placeholder="Email"
                    save={updateSetting}
                    value={$email}
                />
                <Button type="subdued-dark" on:click={changePassword}>
                    {currentUser.hasUsablePassword() ? "Change Password" : "Reset Password"}
                </Button>
                <div class="full">
                    <label for=account-settings--change-timezone_offset>Timezone</label>
                    <Select list={TIMEZONES} bind:value={timezone} let:item on:change={updateTimezoneOffset} >
                        {item?.name}
                    </Select>
                </div>
                <!-- <div class=field>
                    <label for=account-settings--change-timezone_offset>Timezone</label>
                    <div class=input>
                        <select id=account-settings--change-timezone_offset
                            ng-model=selectedTimezone
                            ng-options="tz.name for tz in timezones track by tz.offset"
                            class="btn subdued"
                            ng-change=setOriginalTimezoneOffset()
                        ></select>
                    </div>
                </div> -->
            </fieldset>
        </form>
        <h2>Email Subscriptions</h2>
        <fieldset>
            <ToggleSwitch
                bind:value={emailSubs.daily_freebies}
                on:change={() => updateEmailSubs("daily_freebies")}
            >
                Remind me to claim my free packs daily
            </ToggleSwitch>
            <ToggleSwitch
                bind:value={emailSubs.rewards}
                on:change={() => updateEmailSubs("rewards")}
            >
                When someone I invite joins
            </ToggleSwitch>
            <ToggleSwitch
                bind:value={emailSubs.newsletter}
                on:change={() => updateEmailSubs("newsletter")}
            >
                <span>
                    NeonMob News
                    <small>(releases and other exciting updates!)</small>
                </span>
            </ToggleSwitch>
            <ToggleSwitch
                bind:value={emailSubs.liked_submission_published}
                on:change={() => updateEmailSubs("liked_submission_published")}
            >
                When a series I am interested in is released
            </ToggleSwitch>
        </fieldset>
        <hr>
        <fieldset>
            <ToggleSwitch
                bind:value={$vacationMode}
                on:change={updateReceiveTradeEmails}
                inverted
            >
                <span>
                    Receive Trade Emails
                    <small>
                        Set to </small>NO<small> to disable trade offers (both inbound and outbound)
                        temporarily or permanently. Doing so will disable all trade notification emails.
                        <span class="link" use:tip={`Timeliness in responding to trades matters.
                            Turning off notifications increases the chance trade offers will be
                            overlooked and expire, which creates a poor experience for active
                            traders. In other words, this rule keeps NeonMob moving.`}
                        >
                            Why do we require trades and emails to be linked?
                        </span>
                    </small>
                </span>
            </ToggleSwitch>
        </fieldset>
        <!-- <fieldset class="account-settings--fieldset account-settings--social-connections"
            ng-if=user.can_brag
        >
            <h2 class=strike-through-header>Social Connections</h2>
            <div class=account-settings--social-connections-connected
                data-ng-if=user.connected_accounts.facebook
            >
                <div class="field half">
                    <span class=input>
                        <a href="https://www.facebook.com/{user.connected_accounts.facebook.username}"
                            class=account-settings--social-connections-connected-account
                        >
                            <i class=icon-facebook></i>
                            { user.connected_accounts.facebook.username || "Connected" }
                        </a>
                    </span>
                </div>
                <div class="field half" ng-if=user.has_usable_password>
                    <span class=input>
                        <button ng-click=disconnectFacebook()
                            class="btn subdued account-settings--social-connections-connected-disconnect"
                        >Disconnect</button>
                    </span>
                </div>
                <div ng-if=!user.has_usable_password
                    class="field tip half"
                    data-original-title="Please reset your password above before disconnecting from Facebook."
                >
                    <span class=input>
                        <span class="disabled btn subdued account-settings--social-connections-connected-disconnect">Disconnect</span>
                    </span>
                </div>
            </div>
            <div class="field account-settings--social-connections-disconnected facebook"
                data-ng-if=!user.connected_accounts.facebook
            >
                <span class=input>
                    <a target=_self href="{facebook_connect}?next=/account" class="btn facebook">
                        <i class=icon-facebook></i>
                        Connect Facebook
                    </a>
                </span>
            </div>
        </fieldset> -->
        <hr>
        <fieldset class="close-account">
            <Button type="subdued-dark" on:click={initiateCloseAccount}>Close Account</Button>
        </fieldset>
    </div>
</article>

<style>
    article {
        padding: 20px 10px;
        max-width: 500px;
        margin: 0 auto;
    }
    .status-message {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        text-align: center;
        z-index: 201;
        pointer-events: none;
    }
    .status-message div {
        padding: 16px 20px;
        background: #E82C8E;
        color: #fff;
        display: inline-block;
        white-space: nowrap;
    }
    h1, h2 {
        white-space: nowrap;
        display: flex;
        gap: 0.5ch;
        align-items: center;
        padding: 5px 0;
        color: #2c2830;
        line-height: 1;
    }
    h1::before, h1::after, h2::before, h2::after {
        content: "";
        flex-grow: 1;
        border-top: 1px solid #d6d6d6;
    }
    hr {
        margin: 20px 0;
    }
    fieldset {
        border: none;
        margin: 0;
        padding: 20px 0;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
    }
    label {
        padding: 0 0 2.5px;
        display: block;
        color: #2c2830;
    }
    .avatar {
        position: relative;
        width: 120px;
        height: 120px;
        margin: 0 auto;
    }
    .avatar div {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .avatar canvas {
        position: absolute;
        top: -68px;
        left: -68px;
        scale: 0.5;
    }
    .avatar:not(:hover) :global(button) {
        visibility: hidden;
    }
    .half {
        margin-top: -5px;
        display: grid;
        gap: 10px;
        align-items: flex-end;
        grid-template-columns: 1fr 1fr;
    }
    .half :global(button) {
        height: 34px;
    }
    .full {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        color: #2c2830;
    }
    .full :global(label+*) {
        height: 34px;
    }
    small {
        color: #857a90;
        font-size: 13px;
    }
    .close-account :global(button) {
        width: max(50%, 240px);
        margin: 0 auto;
    }
    .close-account :global(button:not(:hover)) {
        box-shadow: none;
        opacity: 0.5;
    }
</style>