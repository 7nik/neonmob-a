<!-- @component
    Colors the content in the rarity's color
-->
<script lang="ts">
    import type { rarityCss } from "$lib/utils/NM Types";

    /**
     * How to color the text
     */
    export let rarity: rarityCss | "all_core_pieces";
    /**
     * How to color the text
     */
    export let darkTheme = false;
</script>

<span class="{rarity}" class:dark={darkTheme}><slot/></span>

<style>
    .common {
        color: #728a94;
    }
    .common.dark {
        color: #ACBAC0;
    }
    .uncommon {
        color: #00b495;
    }
    .uncommon.dark {
        color: #00D8B2;
    }
    .rare {
        color: #4bbbf5;
    }
    .rare.dark {
        color: #93d6f9;
    }
    .veryRare {
        color: #c08eef;
    }
    .veryRare.dark {
        color: #d9bbf5;
    }
    .extraRare {
        color: #E82C8E;
    }
    .extraRare.dark {
        color: #eb439a;
    }
    .chase {
        color: #76d7eb;
        background: -webkit-linear-gradient(0deg,#E82C8E,#f7cf25);
    }
    .variant {
        color: #9cc8f7;
        background: -webkit-linear-gradient(0deg,#728a94,#412e3f);
    }
    .legendary {
        background: -webkit-linear-gradient(0deg,#c56c13,#7289c6);
    }
    .all_core_pieces {
        color: #9dcbe2;
        background: -webkit-linear-gradient(0deg,#85adfc,#9a79dc);
    }
    .all_core_pieces, .chase, .variant, .legendary {
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
</style>
