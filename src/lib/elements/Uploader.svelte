<!-- @component
    A component for uploading files to NM
 -->
<script lang="ts">
    import type { AssemblyOptions, Result } from "@uppy/transloadit";

    import Uppy from "@uppy/core";
    import Transloadit from "@uppy/transloadit";
    import { createEventDispatcher } from "svelte";
    import { alert } from "$lib/dialogs";
    import { num2fraction } from "$lib/utils/format";

    /**
     * The uploader identification
     */
    export let id: string;
    /**
     * Name of the field in the form
     */
    export let name = "";
    /**
     * File type to accept
     */
    export let accept = "";
    /**
     * Minimal width for images, default - no limit
     */
    export let minImageWidth = 0;
    /**
     * Minimal aspect ratio for images, default - no limit
     */
    export let minAspectRatio = 0;
    /**
     * Maximal aspect ratio for images, default - no limit
     */
    export let maxAspectRatio = 0;
    /**
     * Maximal number of files to upload, default - no limit
     */
    export let maxFileCount = Number.POSITIVE_INFINITY;
    /**
     * Maximal size of files to upload, default - no limit
     */
    export let maxFileSize = Number.POSITIVE_INFINITY;
    /**
     * Params for upload authentication
     */
    export let uploadParams: AssemblyOptions;

    const dispatcher = createEventDispatcher<{
        completed: Record<string, Result[]>,
    }>();

    const progress = {
        total: null as number|null,
    };

    let input: HTMLInputElement;

    const uppy = new Uppy({ id, autoProceed: true })
        .use(Transloadit, { assemblyOptions: uploadParams, waitForEncoding: true })
        // TODO implement case for local dev and testing?
        .on("progress", (value) => {
            progress.total = value;
        })
        .on("transloadit:complete", (result) => {
            progress.total = null;
            dispatcher("completed", result.results);
        })
        .on("error", (error) => {
            console.error(error);
            alert("Sorry, your file could not be uploaded. Please try again.");
        });

    /**
     * Check if the file belongs to the passed types.
     * Firefox ignores the `accept` attribute https://bugzilla.mozilla.org/show_bug.cgi?id=1619203
     * @param file - the file to check
     * @param types - the allowed types (split `accept`)
     */
    function checkFileType (file: File, types: string[]) {
        for (const type of types) {
            if (type.startsWith(".") && file.name.startsWith(type)) return true;
            if (type.endsWith("*") && file.type.startsWith(type.slice(0, -1))) return true;
            if (type === file.type) return true;
        }
        return false;
    }

    /**
     * Checks if image is valid, otherwise throws error
     * @param file - image file to validate
     */
    async function validateImage (file: File) {
        if (!file.type.startsWith("image")) return;
        if (!minAspectRatio && !maxAspectRatio && !minImageWidth) return;

        const img = new Image();
        const load = new Promise((resolve, reject) => {
            img.addEventListener("load", resolve);
            img.addEventListener("error", reject);
        });
        img.src = URL.createObjectURL(file);
        await load;

        // TODO ignore this check for admins?
        const ratio = img.height / img.width;
        if (ratio < minAspectRatio || maxAspectRatio && ratio > maxAspectRatio) {
            const constrains = minAspectRatio === maxAspectRatio
                ? num2fraction(minAspectRatio)
                : `between ${num2fraction(minAspectRatio)} and ${num2fraction(maxAspectRatio)}`;
            // eslint-disable-next-line max-len
            throw new Error(`We're sorry, aspect ratio of the uploaded file(s) should be ${constrains}`);
        }
        if (minImageWidth && img.width < minImageWidth) {
            // eslint-disable-next-line max-len
            throw new Error(`We're sorry, width of the uploaded file(s) should be a minimum of ${minImageWidth}px`);
        }
    }

    /**
     * Try to upload `input`'s files
     */
    async function upload () {
        const files = Array.from(input.files ?? []);
        if (files.length === 0) return;

        if (files.length > maxFileCount) {
            alert(`We're sorry, you can only upload ${maxFileCount} files at a time.
                You included ${files.length} files.`);
            return;
        }

        if (Number.isFinite(maxFileSize) && files.some((f) => f.size > maxFileSize)) {
            const maxFileSizeInMb = Math.ceil(maxFileSize / 1024 / 1024);
            if (files.length > 1) {
                alert(`We're sorry, the file you uploaded is too large.
                    Files must be smaller than ${maxFileSizeInMb} MB`);
                return;
            }
            alert(`We're sorry, one or more of the files you've uploaded is too large.
                All files must be smaller than ${maxFileSizeInMb} MB`);
            return;
        }

        const types = accept.split(",").map((s) => s.trim());
        if (types.length > 0 && files.some((f) => !checkFileType(f, types))) {
            alert(`We're sorry, only following types allowed ${types.join(", ")}`);
            return;
        }

        try {
            await Promise.all(files.map(validateImage));
        } catch (ex) {
            console.log(ex);
            alert((ex as Error).message ?? "Sorry, something went wrong :-(");
            return;
        }

        progress.total = 0;
        uppy.addFiles(files.map((f) => ({
            name: f.name,
            type: f.type,
            data: f,
        })));
    }
</script>

<form on:submit|preventDefault>
    <input
        type="file"
        {name}
        {accept}
        multiple={maxFileCount > 1}
        disabled={progress.total != null}
        hidden
        bind:this={input}
        on:change={upload}
    />
    <slot {progress} openPicker={() => input.click()} />
</form>

<style>
    form {
        display: contents;
    }
    input {
        display: none;
    }
</style>
