import type NM from "./NM Types";
import type { rarityNameLow } from "./NM Types";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { lazyCurrentUser } from "$lib/services/CurrentUser";
import config from "./config";

const currentUser = lazyCurrentUser();

class SettInfo {
    private sett: NM.Sett & { status?: number };

    constructor (sett: NM.Sett) {
        this.sett = sett;
    }

    get isUnlimited () {
        return this.sett.version === config.VERSION_TYPES.unlimited;
    }

    get isLimited () {
        return this.sett.version !== config.VERSION_TYPES.unlimited;
    }

    get isEditing () {
        return this.sett.status === config.SETT_STATUS_OPTIONS.editing;
    }

    get isSubmitted () {
        return this.sett.status === config.SETT_STATUS_OPTIONS.submitted;
    }

    get isPromoOnly () {
        return this.sett.sett_type === config.SETT_TYPE_VALUES["promo-only"];
    }

    get isReward () {
        return this.sett.sett_type === config.SETT_TYPE_VALUES.reward;
    }

    get isAmateur () {
        return this.sett.sett_type === config.SETT_TYPE_VALUES.amateur;
    }

    get isReplica () {
        return Boolean(this.sett.replica_parent);
    }

    get isSoldOut () {
        return this.sett.percent_sold_out === 100 || Boolean(this.sett.discontinued);
    }

    get isComingSoon () {
        return new Date(this.sett.released) > new Date()
            && new Date(this.sett.published) <= new Date();
    }

    get isNearlySoldOut () {
        if (this.isSoldOut) return false;
        if (this.isUnlimited) {
            dayjs.extend(duration);
            dayjs.extend(relativeTime);
            const diff = dayjs.duration(dayjs().diff(this.sett.discontinue_date));
            if (diff.asDays() > 10) return false;
            return diff.humanize();
        }
        return this.sett.percent_sold_out >= 80 ? 100 - this.sett.percent_sold_out : false;
    }

    get areFreebiesAvailableNow () {
        if (!currentUser.isAuthenticated()
            || !this.sett.daily_freebies
            || this.sett.freebies_discontinued
        ) {
            return false;
        }
        const dailyFreebies = this.sett.daily_freebies < 0
            ? Number.POSITIVE_INFINITY
            : this.sett.daily_freebies;
        const remainingFreebies = dailyFreebies - (currentUser.freebieUsed[this.sett.id] ?? 0);
        return remainingFreebies > 0 && currentUser.freebies > 0;
    }

    /**
     * Number of cards of a rarity
     * @param rarity - certain rarity / core / special / all
     * @param key - count owned (according to sett stats) cards or all
     */
    cards (rarity: rarityNameLow | "core" | "special" | "all", key: "owned" | "total"): number {
        switch (rarity) {
            case "common":
            case "uncommon":
            case "rare":
            case "very rare":
            case "extra rare":
                return this.sett.core_stats.find((s) => s.name === rarity)?.[key] ?? 0;
            case "chase":
            case "variant":
            case "legendary":
                return this.sett.special_stats.find((s) => s.name === rarity)?.[key] ?? 0;
            case "core":
                return this.sett.core_stats.reduce((c, s) => c + s[key], 0);
            case "special":
                return this.sett.special_stats.reduce((c, s) => c + s[key], 0);
            case "all":
                return this.cards("core", key) + this.cards("special", key);
            default:
                return 0;
        }
    }

    /**
     * Check whether the series has a rarity/specials
     * @param rarity - the rarity to check
     */
    has (rarity: rarityNameLow | "special") {
        switch (rarity) {
            case "common":
            case "uncommon":
            case "rare":
            case "very rare":
            case "extra rare":
                return this.sett.core_stats.some((s) => s.name === rarity);
            case "chase":
            case "variant":
            case "legendary":
                return this.sett.special_stats.some((s) => s.name === rarity);
            case "special":
                return this.sett.special_stats.length > 0;
            default:
                return false;
        }
    }
}

export default SettInfo;
