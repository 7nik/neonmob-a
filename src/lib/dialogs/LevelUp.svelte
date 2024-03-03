<!-- @component
    The window to display congratulation on level upping
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";
    import type { IconName } from "$lib/elements/Icon.svelte";

    import { page } from "$app/stores";
    import animate from "$lib/actions/animate";
    import Icon from "$lib/elements/Icon.svelte";
    import EarnedCarats from "$lib/components/EarnedCarats.svelte";
    import config from "$lib/utils/config";
    import RewardWindow from "./RewardWindow.svelte";

    export let data: NM.UserLevelUp;

    const userLevel = $page.data.currentUser.level;
    const icon = data.app_icon_selector as IconName;
    const prevIconColor = $userLevel.icon_color;
    const prevLevel = data.level - 1;
    const prevLevelName = data.previous_level_name;
    const nextLevel = data.level;
    const nextIconColor = data.icon_color;
    const nextLevelName = data.name;
    let showNextLevel = false;

    const src = `${config.animationAssets}/levels/${data.level - 1}.json`;

    function onCompleted () {
        showNextLevel = true;
    }
</script>

<RewardWindow on:closed title="Level Up!" button="Great!">
    <h2>
        Level
        <div class:showNextLevel>
            <span>{prevLevel}</span>
            <span>{nextLevel}</span>
        </div>
    </h2>
    <div class="level-icon">
        <span style:background={prevIconColor}>
            <Icon {icon} />
        </span>
        <div use:animate={{ src, onCompleted }}></div>
    </div>
    <h3>
        <div class:showNextLevel>
            <span style:color={prevIconColor}>{prevLevelName}</span>
            <span style:color={nextIconColor}>{nextLevelName}</span>
        </div>
    </h3>
    <p>{data.copy}</p>
    <EarnedCarats earned={data.carats} proBonus={data.pro_bonus} total={data.total_carats} />
</RewardWindow>

<style>
    h2 {
        font-size: 22px;
        font-weight: 700;
        margin: -12px 0 px;
        letter-spacing: .61px;
        color: white;
    }
	h2 div, h3 div {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		height: 1.3em;
	}
	h2 div span, h3 div span {
		transition: opacity 0.5s ease-in-out, transform 0.6s ease-in-out;
		transform: translateY(0) rotateX(0);
	}
	h2 div span:last-child, h3 div span:last-child {
		opacity: 0;
		transform: translateY(-0.3em) rotateX(-90deg);
	}
	h2 div.showNextLevel span:first-child, h3 div.showNextLevel span:first-child {
		opacity: 0;
		transform: translateY(-1.0em) rotateX(90deg);
	}
	h2 div.showNextLevel span:last-child, h3 div.showNextLevel span:last-child {
		opacity: 1;
		transform: translateY(-1.3em) rotateX(0);
	}
    .level-icon {
        width: min-content;
        height: min-content;
        margin: 10px auto;
        padding: 3px;
        border: 4px solid #241f21;
        border-radius: 50%;
        position: relative;
        --icon-size: 28px;
    }
    .level-icon span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        color: white;
        border-radius: 100%;
        vertical-align: middle;
    }
    .level-icon div {
        position: absolute;
        top: -7px;
        left:-7px;
        width: 70px;
        height: 70px;
    }
    h3 {
        margin: 3px;
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
    }
    p {
        margin: 5px;
        display: inline-block;
        width: 275px;
        color: #B39EA9;
        letter-spacing: .42px;
    }
</style>
