import type { LottiePlayer } from "lottie-web";
import type { Action } from "svelte/action";

type Params = {
    src: string,
    onCompleted?: () => void,
}

/**
 * Plays once the given Bodymovin animation
 * @param elem - the element for playing the animation
 * @param params.src - link to the Bodymovin animation data
 * @param params.onCompleted - optional callback called after completing the animation
 */
const animate: Action<HTMLElement, Params> = (elem, params) => {
    if (!params) {
        console.error("No params");
        return;
    }
    try {
        Promise.all([
            fetch(params.src).then((resp) => resp.json()),
            // https://github.com/airbnb/lottie-web/issues/2739
            import("lottie-web") as unknown as Promise<LottiePlayer>,
        ]).then(([data, player]) => {
            const animation = player.loadAnimation({
                container: elem,
                renderer: "svg",
                loop: false,
                autoplay: true,
                animationData: data,
            });
            animation.addEventListener("complete", () => animation.destroy());
            if (params.onCompleted) {
                animation.addEventListener("destroy", params.onCompleted);
            }
        });
    } catch (ex) {
        console.error("Failed to load the animation", params.src, ex);
        params.onCompleted?.();
    }
};

export default animate;
