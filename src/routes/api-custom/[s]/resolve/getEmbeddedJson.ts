export default <T> (html: string, elemId: string) => {
    const line = new RegExp(`\\n\\s*<input type="hidden" value="(.*)" id="${elemId}">\\s*\\n`)
        .exec(html);
    if (!line) return null;
    return JSON.parse(line[1].replaceAll("&quot;", `"`)) as T;
};
