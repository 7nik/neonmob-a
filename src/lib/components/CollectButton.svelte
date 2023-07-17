<!-- @component
    A button to start opening packs
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import Button from "$elem/Button.svelte";
    import { fail } from "$lib/dialogs";
    import SettInfo from "$lib/utils/SettInfo";

    export let sett: NM.Sett;
    export let darkTheme = false;

    $: settInfo = new SettInfo(sett);

    const theme = darkTheme ? "dark" : "light";
    const click = fail;
    /* eslint-disable sonarjs/no-duplicate-string */
    const displayOptions = {
        free: {
            text: "Open Pack",
            button: "reward",
            click,
            // poRoute.launchPackTiers($scope.sett.links.self);
        },
        nearlyGone: {
            // text: $scope.beginner ? "Open Pack" : "Nearly Gone",
            text: "Open Pack",
            button: "reward",
            click,
            // poRoute.launchPackTiers($scope.sett.links.self);
        },
        paid: {
            text: "Open Pack",
            button: "primary",
            click,
            // poRoute.launchPackTiers($scope.sett.links.self);
        },
        nearlyGonePaid: {
            // text: $scope.beginner ? "Open Pack" : "Nearly Gone",
            text: "Open Pack",
            button: "primary",
            click,
            // poRoute.launchPackTiers($scope.sett.links.self);
        },
        /*
            Both likes(Submission) and Coming soon sett using same model(Likemodel).
            We can differentiate by using Content_type_id.
            Both has same Email and notification format.
            Both are using same API URL.(http://testing.neonmob.com/api/likes/).
        */
        comingSoon: {
            text: "Coming soon",
            button: "primary",
            click,
            // click: function() {
            //     if (!artUser.isVerified()) {
            //         return artMessage.showAlert("You have to verify your email before you can do that :(");
            //     }
            //     $scope.sett.notify = !$scope.sett.notify;
            //     if($scope.sett.notify) {
            //         artResource.create(artConfig.api['api-likes-list'], {
            //             content_type: artContentTypes['art.sett'],
            //             object_id: $scope.sett.id,
            //             notify: true
            //         }).then(function() {
            //             $scope.sett.notify = true;
            //         });
            //     } else { // ToDO: Move it to common service, bcoz homepage and collect page using the same functionality.
            //         var obj = {
            //             url: artConfig.api['api-un-like'],
            //             content_type: artContentTypes['art.sett'],
            //             object_id: $scope.sett.id,
            //         }
            //         try {
            //             $http.post(obj.url, obj).then(function () {});
            //         } catch (e) {
            //             NM.error("Something went wrong :( Please reach NeonMob.");
            //         }
            //     }
            // }
        },
        discontinued: {
            text: "Sold Out",
            button: `disabled-${theme}`,
            click: null,
        },
        promo: {
            text: "Promo Series",
            button: `disabled-${theme}`,
            click: null,
        },
        anonymous: {
            text: "Collect",
            button: "primary",
            click,
            // click: function() {
            //     var data = {},
            //         signupUrlParams = {url: '/series/' + $scope.sett.id};

            //     data.page = 'sett-header';
            //     data.settId = $scope.sett.id;

            //     if($scope.sett) {
            //         data.settName = $scope.sett.name;
            //         signupUrlParams.url = $scope.sett.links.permalink;
            //         signupUrlParams.settID = $scope.sett.id;
            //         signupUrlParams.collection = $scope.sett.name;
            //     }

            //     artAnalytics.track('Clicked Collect When Signed Out', data );
            //     var signupUrl = artUrl.updateParams("/signup", signupUrlParams);

            //     $window.location.href = signupUrl;
            // }
        },
        loading: {
            text: "Loading...",
            button: `disabled-${theme}`,
            click: null,
        },
    } as const;

    let btnType: keyof typeof displayOptions;
    $: {
        if (settInfo.isSoldOut) {
            btnType = "discontinued";
        } else if (/* !artUser.isAuthenticated() */sett) {
            btnType = "anonymous";
        } else if (settInfo.isPromoOnly) {
            btnType = "promo";
        } else if (!sett) {
            btnType = "loading";
        } else if (settInfo.isComingSoon) {
            btnType = "comingSoon";
        } else if (settInfo.areFreebiesAvailableNow && !settInfo.isNearlySoldOut) {
            btnType = "free";
        } else if (settInfo.areFreebiesAvailableNow && settInfo.isNearlySoldOut) {
            btnType = "nearlyGonePaid";
        } else if (settInfo.isNearlySoldOut) {
            btnType = "nearlyGone";
        } else {
            btnType = "paid";
        }
    }
</script>

<Button type={displayOptions[btnType].button}
    on:click={displayOptions[btnType].click}
>
    {displayOptions[btnType].text}
</Button>
