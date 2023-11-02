<!-- @component
    A field with label and error message
 -->
<script lang="ts">
    import { errorTip } from "$lib/actions/tip";

    type T = $$Generic<string>;

    export let label = "";
    export let name: T;
    export let placeholder = label;
    export let type: "text"|"password" = "text";
    export let value: string;
    export let disabled = false;
    export let required = false;
    export let errors: Record<string, string[]>;
    export let save: (data: Record<T, string>) => Promise<boolean>;
    export let darkTheme = false;

    let v = value;

    async function saveField () {
        if (!await save({ [name]: v } as Record<T, string>)) {
            setTimeout(() => {
                v = value;
            }, 5000);
        }
    }
</script>

<div class:darkTheme>
    {#if label}
        <label for="field-{name}">{label}</label>
    {/if}
    {#if type === "text"}
        <input id="field-{name}"
            type="text"
            placeholder={placeholder}
            {disabled}
            {required}
            bind:value={v}
            on:change={saveField}
            use:errorTip={errors[name]}
        >
    {:else}
        <input id="field-{name}"
            type="password"
            placeholder={placeholder}
            {disabled}
            {required}
            bind:value={v}
            on:change={saveField}
            use:errorTip={errors[name]}
        >
    {/if}
</div>

<style>
    div {
        position: relative;
    }
    label{
        display: block;
        padding: 0 0 2.5px;
        color: #2c2830;
    }
    input {
        width: 100%;
        margin: 0;
        padding: 8px 12px;
        font-size: 14px;
        line-height: normal;
        background-color: #fff;
        height: 34px;
        border: 1px solid #ccc;
        border-radius: 3px;
        box-shadow: inset 0 1px 0 rgba(0,0,0,.05);
    }
    input:focus {
        background-color: #f4f0c9;
        outline: 0;
        border-color: #f4f0c9;
        color: #2c2830;
    }
    input:disabled {
        background-color: rgba(0, 0, 0, .065);
        border: none;
        color: #39343e;
        box-shadow: inset 0 1px 0 0 rgba(0,0,0,.1)
    }
    .darkTheme input {
        border: none;
        background-color: #FFF4;
        color: white;
        box-shadow: none;
    }
    .darkTheme input:focus {
        background-color: #fff;
        color: #2c2830;
    }
    .darkTheme input:disabled {
        background-color: #FFF2;
    }
</style>
