import { get, writable, type Writable } from "svelte/store";

/**
 * Make a reactive field
 */
function createReactiveField <T> (initialValue: T) {
    const store = writable(initialValue);
    let value: T;
    store.subscribe((v) => { value = v; });

    // pass function to make the field callable
    return new Proxy(createReactiveField, {
        get (_, prop) {
            const isPrimitive = value === null || !["object", "function"].includes(typeof value);
            if (prop === Symbol.toPrimitive && isPrimitive || prop === "toJSON") {
                return () => value;
            }
            if (prop === Symbol.toPrimitive && !isPrimitive) return () => String(value);
            if (prop === "subscribe") return store.subscribe;
            if (prop === "update") return store.update;
            if (prop === "set") return store.set;

            return isPrimitive
                ? (value as any)?.[prop]
                : Reflect.get(value as object, prop);
        },
        set (_, prop, newValue) {
            (value as any)[prop] = newValue;
            store.set(value);
            return true;
        },
        apply (_, thisArg, argArray) {
            if (typeof value === "function") {
                return Reflect.apply(value, thisArg, argArray);
            }
            return value;
        },
        has (_, prop) {
            if (["subscribe", "update", "set"].includes(prop as string)) {
                return true;
            }
            return value && ["object", "function"].includes(typeof value)
                && Reflect.has(value, prop);
        },
        // currently not used
        // ownKeys () {
        //     const value = object[field];
        //     if (value && ["object", "function"].includes(typeof value)) {
        //         return Reflect.ownKeys(value);
        //     }
        //     return [];
        // },
    }) as T & Writable<T>;
}

/**
 * Creates a object's copy with fields which can be used as a store as well.
 * NOTE!: at direct reading, all the fields are truthy (objects).
 * Though they easily get coerced to the original type.
 * Also, you can call a field to get its pure value.
 */
export default <T extends object> (object: T) => {
    const fields: Partial<{
        [K in keyof T]: T[K] & Writable<T[K]>
    }> = {};

    const proxy = new Proxy(object, {
        get (_, prop) {
            // eslint-disable-next-line unicorn/no-useless-undefined
            if (!(prop in object)) return undefined;
            if (!(prop in fields)) {
                let value = object[prop as keyof T];
                if (typeof value === "function") value = (value as any).bind(proxy);
                fields[prop as keyof T] = createReactiveField(value);
            }
            return fields[prop as keyof T];
        },
        set (_, prop, value) {
            // assigning a Reactive Field to a Reactive Filed will cause
            // infinite recursive call at executing the filed as method
            if (typeof value === "function" && value.subscribe) {
                value = get(value);
            }
            // bound the function to the object
            if (typeof value === "function") {
                value = value.bind(proxy);
            }
            if (prop in fields) {
                fields[prop as keyof T]!.set(value);
            } else {
                fields[prop as keyof T] = createReactiveField(value);
            }
            return true;
        },
    }) as {
        // it would nice to also have here
        // set [K in keyof T](v: T[K]);
        // to allow direct assignment, but we cannot
        // https://github.com/microsoft/TypeScript/issues/43826

        [K in keyof T]: Writable<T[K]> & (
            // leave functions and objects as is,
            // make getting booleans only via calling,
            // for rest of primitives - both: direct and calling
            // eslint-disable-next-line @typescript-eslint/ban-types
            T[K] extends Function ? T[K]
            : T[K] extends object ? T[K]
            : T[K] extends boolean ? () => T[K]
            : (T[K] & (() => T[K]))
        )
    };
    return proxy;
};
