// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { CurrentUserStores } from "$lib/services/CurrentUser";
import type OtherUsers from "$lib/services/OtherUsers";

declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        interface PageData {
            currentUser: CurrentUserStores,
            otherUsers: OtherUsers,
        }
        // interface Platform {}
    }
}
