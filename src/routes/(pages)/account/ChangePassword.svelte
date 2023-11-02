<!-- @component
    A dialog form for changing the password
 -->
 <script lang="ts">
     import type { ID } from "$lib/utils/NM Types";
    import { updatePassword } from "$api";
    import Button from "$elem/Button.svelte";
    import Icon from "$elem/Icon.svelte";
    import DialogWindow from "$lib/dialogs/DialogWindow.svelte";
    import Field from "./Field.svelte";
    import { errorTip } from "$lib/actions/tip";

    export let userId: ID<"user">;

    let errors: Record<string, string[]> = {};
    const fields = {
        password_current: "",
        password: "",
        password_confirm: "",
    };
    let submitting = false;

    function setField (data: Partial<typeof fields>) {
        for (const [k, v] of Object.entries(data)) {
            fields[k as keyof typeof fields] = v;
        }
        return Promise.resolve(true);
    }

    let close: () => void;

    async function submitPassword () {
        if (submitting) return;
        submitting = true;
        try {
            await updatePassword(userId, fields);
            close();
        } catch (ex) {
            console.error("Failed to update settings", ex);
            if (ex && typeof ex === "object" && "body" in ex) {
                const err = ex.body as object;
                if ("details" in err) {
                    errors = {
                        non_field_errors: [err.details] as string[],
                    };
                } else {
                    errors = err as typeof errors;
                }
            }
            submitting = false;
        }
    }

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    interface $$Events {
        closed: CustomEvent<void>
    }
</script>

<DialogWindow bind:close on:closed blurry="#FFFA" closeable>
    <article>
        <span class="close"><Icon icon="close" on:click={close} /></span>
        <header>
            <h1>Change Password</h1>
        </header>
        <form on:focus={() => { errors = {}; }} on:submit|preventDefault={submitPassword}>
            <Field {errors}
                type="password"
                name="password_current"
                placeholder="Current Password"
                save={setField}
                value={fields.password_current}
                required
                darkTheme
            />
            <Field {errors}
                type="password"
                name="password"
                placeholder="New Password"
                save={setField}
                value={fields.password}
                required
                darkTheme
            />
            <Field {errors}
                type="password"
                name="password_confirm"
                placeholder="New Password Again"
                save={setField}
                value={fields.password}
                required
                darkTheme
            />
            <div use:errorTip={errors.non_field_errors}>
                <Button size="max"
                    type={submitting ? "disabled-light" : "primary"}
                    on:click={submitPassword}
                >Change</Button>
            </div>
        </form>
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
    form {
        padding: 15px 40px 40px;
        display: flex;
        flex-direction: column;
        gap: 10px;
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
</style>
