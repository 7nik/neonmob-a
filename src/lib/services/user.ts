import type NM from "$lib/utils/NM Types";
import currentUser from "$lib/services/currentUser";

/**
 * Returns the user's first name either username
 */
export function firstName (user: NM.UserMinimal) {
    if (user.id === currentUser.id) {
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
    if (user.id === currentUser.id) {
        return capital ? "Your" : "your";
    }
    return `${firstName(user)}'s`;
}
