export default <T> (html: string, prop: string) => {
    const line = html.match(/\.constant\("nmConfig",\s*JSON.parse\("(.*)"\)\);/);
    if (!line) return null;
    // decode all the chars like \u0022
    const json = line[1].replace(
        /\\u([\da-f]{4})/gi,
        (_, code) => String.fromCodePoint(Number.parseInt(code, 16)),
    );
    return JSON.parse(json)[prop] as T;
};
