import { lazyCurrentUser } from "$lib/services/CurrentUser";
import { fullUrl } from "./utils";

const currentUser = lazyCurrentUser();

const REFERRAL_PARAMS = {
    CODE: "rc",
    CHANNEL: "rh",
    SOURCE: "rs",
} as const;

function createShareUrl (link: string, source: string, channel: string) {
    const url = new URL(fullUrl(link));
    if (channel) url.searchParams.set(REFERRAL_PARAMS.CHANNEL, channel);
    if (source) url.searchParams.set(REFERRAL_PARAMS.SOURCE, source);
    if (currentUser.isAuthenticated() && !link.includes(currentUser.referralUrl)) {
        url.searchParams.set(REFERRAL_PARAMS.CODE, currentUser.referralCode);
    }
    return url.toString();
}

const POPUP_SIZE = "width=600,height=520";

const SHARE_CHANNELS = {
    facebook (url: string) {
        // the original code uses FB Connect with its initializing at page start
        // I'm not glad to load over a half MB just for rare sharing
        // and anyway the FB app was disabled so it doesn't work

        // function share () {
        //     window.FB.ui({ method: "share", href: url });
        // }

        // if ("FB" in window) {
        //     share();
        //     return;
        // }

        // window.fbAsyncInit = () => {
        //     FB.init({
        //         appId: "315202068505923",
        //         xfbml: true,
        //         version: "v2.6",
        //     });
        //     share(); // is it ok here?
        // };

        // document.body.insertAdjacentHTML("beforeend", `<div id="fb-root"></div>`);
        // const script = document.createElement("script");
        // script.id = "facebook-jssdk";
        // script.src = "//connect.facebook.net/en_US/sdk.js";
        // document.head.append(script);

        const link = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(link, "_fbIt", POPUP_SIZE);
    },
    pinterest (url: string, message: string, image: string) {
        const link = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(message)}&media=${encodeURIComponent(image)}`;
        window.open(link, "_pinIt", POPUP_SIZE);
    },
    twitter (url: string, message: string) {
        const link = `https://twitter.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;
        window.open(link, "_tweetIt", POPUP_SIZE);
    },
} as const;

type Channel = keyof typeof SHARE_CHANNELS;

export const channels = Object.keys(SHARE_CHANNELS) as Channel[];

export default (
    channel: Channel, // where share
    source: string, // type of shared page
    url: string, // the url to share
    message: string, // the default message
    image = "", // the image to share
) => {
    // if (!config.canBrag) return; // why? it's global
    SHARE_CHANNELS[channel](createShareUrl(url, source, channel), message, fullUrl(image));
};
