import type NM from "$lib/utils/NM Types";

import { lazyCurrentUser } from "$lib/services/CurrentUser";

const currentUser = lazyCurrentUser();

/**
 * Returns the user's first name either username
 */
export function firstName (user: NM.UserMinimal) {
    if (currentUser.isCurrentUser(user)) {
        return "You";
    }
    return user.first_name || user.username || "someone";
}

/**
 * Returns the user's first name either username if possessive form
 * @param user - The user
 * @param capital - Whether to capitalize "your", default - no
 */
export function firstNamePossessive (user: NM.UserMinimal, capital = false) {
    if (currentUser.isCurrentUser(user)) {
        return capital ? "Your" : "your";
    }
    return `${firstName(user)}'s`;
}
