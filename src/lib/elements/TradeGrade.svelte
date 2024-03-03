<!-- @component
    Renders a user trade grade icon
 -->
<script context="module" lang="ts">
    const GRADES = ["F", "F+", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];
    /**
     * Converts grade number to the grade name
     * @param grade - the grade number
     * @returns the grade name
     */
    export function getLetterGrade (grade: number) {
        return GRADES[grade];
    }
    /**
     * Converts grade number to the CSS class
     * @param grade - the grade number
     * @returns the CSS class
     */
    export function getLetterGradeClass (grade: number) {
        return GRADES[grade][0];
    }
    const EXTRA = `Not responding to trade offers brings down your Trader Grade,
        while responding brings it up. You can also propose trades to help improve your grade.`;
</script>
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import { page } from "$app/stores";
    import tip from "$lib/actions/tip";
    import { firstNamePossessive } from "$lib/services/user";

    export let user: NM.User;

    const { isCurrentUser } = $page.data.currentUser;

    $: grade = Math.floor(user.trader_score);
    if (grade < 0 || grade > 13) console.error("Bad grade", user.trader_score);
    $: yourself = isCurrentUser(user);
    $: name = yourself ? "Your" : firstNamePossessive(user);
    $: hint = `${name} trader grade is: ${getLetterGrade(grade)}. ${yourself ? EXTRA : ""}`;
</script>

<svelte:options immutable/>

<span class={getLetterGradeClass(grade)} use:tip={hint}>
    {getLetterGrade(grade)}
</span>

<style>
    span {
        font-family: locator-web,Helvetica Neue,Helvetica,Arial,sans-serif;
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.035em;
        line-height: 20px;
        color: white;
        padding-top: 2px;
        box-sizing: border-box;
        width: 20px;
        height: 20px;
        vertical-align: middle;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        border-radius: 100%;
    }
    span.A {
        background: #e72864;
    }
    span.B {
        background: #50aed2;
    }
    span.C {
        background: #4dcd9a;
    }
    span.D, span.F {
        background: #524b5a;
    }
</style>
