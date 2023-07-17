import md from "markdown-it";

/**
 * Make the first letter of each word upper cased and other letters lower cased
 * @param text - text to capitalize
 * @returns capitalized text
 */
export function capitalize (text: string) {
    return text.split(" ")
        .map((word) => word[0].toUpperCase().concat(word.slice(1).toLowerCase()))
        .join(" ");
}

/**
 * Selects singular or plural form according to the number
 * @param n - the target number
 * @param singularForm - the word's singular form
 * @param pluralForm - the plural form, by default - plural + "s"
 * @returns the selected word form
 */
export function plural (n: number, singularForm: string, pluralForm = `${singularForm}s`) {
    return n === 1 ? singularForm : pluralForm;
}

/**
 * Converts numbers to text using SI prefixes
 * @param val - a number to convert
 * @param precision - number of digits after the point, default - 1
 * @param roundDown - round the number down, default - yes
 * @returns a short text representation of the number
 */
export function num2text (val: number, precision = 1, roundDown = true) {
    // when val == 0, we get -Infinity * 0 = NaN
    const power = Math.floor(Math.log10(Math.abs(val)) / 3) * Math.sign(val);
    let v = val / 1000 ** power * 10 ** precision;
    v = Math[roundDown ? "floor" : "round"](v);
    v /= 10 ** precision;
    switch (Number.isNaN(power) || power) {
        case Number.NEGATIVE_INFINITY: return "-∞";
        case -8: return `${v}y`;
        case -7: return `${v}z`;
        case -6: return `${v}a`;
        case -5: return `${v}f`;
        case -4: return `${v}p`;
        case -3: return `${v}n`;
        case -2: return `${v}μ`;
        case -1: return `${v}m`;
        case true: return "0";
        case 0: return val.toString();
        case 1: return `${v}k`;
        case 2: return `${v}M`;
        case 3: return `${v}G`;
        case 4: return `${v}T`;
        case 5: return `${v}P`;
        case 6: return `${v}E`;
        case 7: return `${v}Z`;
        case 8: return `${v}Y`;
        case Number.POSITIVE_INFINITY: return "∞";
        default: return (v * 1000 ** power).toExponential();
    }
}

/**
 * Formats number with comma. E.g., 1234567 -> 1,234,567
 * @param number - the number to format
 * @returns the formatted number
 */
export function comma (number = 0) {
    const arr: (string|number)[] = [];
    while (number >= 1000) {
        arr.unshift((number % 1000).toString().padStart(3, "0"));
        number = Math.floor(number / 1000);
    }
    arr.unshift(number);
    return arr.join(",");
}

/**
 * Adds ordinal suffix to the number
 * @param number - the number to add the suffix
 * @returns the number with the original suffix
 */
export function ordinal (number: number) {
    const newLocal = number % 100;
    if ([11, 12, 13].includes(newLocal)) return `${number}th`;
    switch (number % 10) {
        case 1: return `${number}st`;
        case 2: return `${number}nd`;
        case 3: return `${number}rd`;
        default: return `${number}th`;
    }
}

type TruncateOptions = Partial<{
    wordLimit: number,
    wordTolerance: number,
    widows: boolean,
}>;

/**
 * Splits a string into text and links
 * @param text - the text with links
 * @param options.wordLimit - text will be truncated to
*  this number of words if the number if above this number + `wordTolerance`
 * @param options.wordTolerance - number of extra words before triggering text truncating
 * @param options.widows - allow a widow word, if no, the last space will be replaced with `&nbsp;`
 * @returns HTML code
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function linky (text: string, options: TruncateOptions = {}) {
    const regexp = /(ftp|https?):\/\/\S*[^\s"(),.;<>{}]/g;
    const parts: string[] = [];
    let match: RegExpExecArray | null;
    let start = 0;

    // split the text into plain text and links
    // and links always have odd index
    // eslint-disable-next-line no-cond-assign
    while (match = regexp.exec(text)) {
        parts.push(text.slice(start, match.index), match[0]);
        start = regexp.lastIndex;
    }
    parts.push(text.slice(start));

    const {
        wordLimit = 0,
        wordTolerance = 0,
        widows = true,
    } = options;
    // count number of words
    let wordCount = 0;
    for (const [i, part] of parts.entries()) {
        wordCount += i % 2 ? 1 : part.split(/\s+/).length;
        if (wordCount >= wordLimit + wordTolerance) break;
    }
    // truncate the text if needs
    if (wordLimit && wordCount >= wordLimit + wordTolerance) {
        let foundWordsCount = 0;
        for (const [i, part] of parts.entries()) {
            const words = i % 2 ? [part] : part.split(/\s+/);
            // truncate if the limit reached and it's not a link
            if (foundWordsCount + words.length >= wordLimit && !(i % 2)) {
                words.length = wordLimit - foundWordsCount;
                if (words.length > 0) {
                    words[words.length - 1] += "...";
                } else {
                    words[0] = "...";
                }
                parts[i] = words.join(" ");
                break;
            }
            foundWordsCount += words.length;
        }
    }
    // glue two last words if needs
    if (!widows && wordCount > 3) {
        for (let i = parts.length - 1; i >= 0; i--) {
            // skip links
            if (i % 2) continue;
            if (parts[i].includes(" ")) {
                const words = parts[i].split(/\s+/);
                words[words.length - 2] = `${words.at(-2)}\u00A0${words.at(-1)}`;
                words.pop();
                parts[i] = words.join(" ");
                break;
            }
        }
    }
    return parts.map((part, i) => (
        i % 2 ? `<a target="_blank" rel="noreferrer" href=${part}>${part}</a>` : part
    )).join("");
}

const markdown = md({ html: false, linkify: true });
// render <a> with target="_blank" rel="noreferrer"
markdown.renderer.rules.link_open = (tokens, idx, options, _env, self) => {
    tokens[idx].attrPush(["target", "_blank"]);
    tokens[idx].attrPush(["rel", "noreferrer"]);
    return self.renderToken(tokens, idx, options);
};

/**
 * Converts markdown code into HTML code
 * @param code - the markdown code to convert
 * @param options.wordLimit - text will be truncated to
*  this number of words if the number if above this number + `wordTolerance`
 * @param options.wordTolerance - number of extra words before triggering text truncating
 * @param options.widows - allow a widow word, if no, the last space will be replaced with `&nbsp;`
 * @returns HTML code
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function md2html (code: string, options: TruncateOptions = {}) {
    if (code.trim().length === 0) return "";

    const {
        wordLimit = 0,
        wordTolerance = 0,
        widows = true,
    } = options;
    if (widows && wordLimit) {
        return markdown.render(code.trim());
    }
    // do changes through AST to not corrupt tags and attributes
    const ast = markdown.parse(code.trim(), {});
    // count words
    let wordCount = 0;
    let levels = [ast];
    let indexes = [0];
    while (levels.length > 0) {
        const token = levels[0][indexes[0]];
        if (token.children && token.children.length > 0) {
            levels.unshift(token.children);
            indexes.unshift(0);
            continue;
        }
        if (token.type === "text") {
            wordCount += token.content.split(/\s+/).length;
            // it's enough to stop counting here
            if (wordCount >= wordLimit + wordTolerance) break;
        }
        indexes[0] += 1;
        if (indexes[0] >= levels[0].length) {
            levels.shift();
            indexes.shift();
            indexes[0] += 1;
        }
    }
    if (wordLimit && wordCount >= wordLimit + wordTolerance) {
        // truncate
        let foundWordsCount = 0;
        levels = [ast];
        indexes = [0];
        const tagStack = [null] as (string|null)[];
        while (levels.length > 0) {
            if (foundWordsCount >= wordLimit && !tagStack[0]) {
                // remove current and next tokens and go up
                // eslint-disable-next-line prefer-destructuring
                levels[0].length = indexes[0];
                levels.shift();
                indexes.shift();
                tagStack.shift();
                continue;
            }
            const token = levels[0][indexes[0]];
            if (token.children && token.children.length > 0) {
                // to deeper
                levels.unshift(token.children);
                indexes.unshift(0);
                tagStack.unshift(null);
                continue;
            }
            if (token.type === "text") {
                const words = token.content.split(/\s+/);
                if (foundWordsCount + words.length >= wordLimit) {
                    // truncate the text
                    words.length = wordLimit - foundWordsCount;
                    words[words.length - 1] += "...";
                    token.content = words.join(" ");
                }
                foundWordsCount += words.length;
            } else if (token.nesting === 1) {
                // remember the opened tag
                if (tagStack[0]) console.error("overriding tag", tagStack[0]);
                tagStack[0] = token.tag;
            } else if (token.nesting === -1) {
                // forget the opened tag
                tagStack[0] = null;
            }
            // go to next part
            indexes[0] += 1;
            // if it was last part, go up
            if (indexes[0] >= levels[0].length) {
                levels.shift();
                indexes.shift();
                tagStack.shift();
                indexes[0] += 1;
            }
        }
    }
    // no widows filter - glue two last words in "long" text
    if (!widows && wordCount > 3) {
        levels = [ast];
        indexes = [ast.length - 1];
        while (levels.length > 0) {
            const token = levels[0][indexes[0]];
            if (token.type === "text" && token.content.includes(" ")) {
                const words = token.content.split(/\s+/);
                words[words.length - 2] = `${words.at(-2)}\u00A0${words.at(-1)}`;
                words.pop();
                token.content = words.join(" ");
                break;
            }
            if (token.children && token.children.length > 0) {
                levels.unshift(token.children);
                indexes.unshift(0);
                continue;
            }
            indexes[0] -= 1;
            if (indexes[0] < 0) {
                levels.shift();
                indexes.shift();
                indexes[0] -= 1;
            }
        }
    }
    // eslint-disable-next-line prefer-const
    return markdown.renderer.render(ast, markdown.options, {});
}
