// This has a LOT of limitations, namely that it's bad
// It only handles one element + child text
// It only handles (eventName)="$1" and $1 is a templateArgs function syntax
export function compileToFunction(templateStr, templateArgs) {
    const matchTemplateArgs = str => {
        console.log(str)
        if (str.startsWith('{{') && str.endsWith('}}')) {
            const key = str.slice(2, str.length - 2);
            return templateArgs[key];
        }
        return str;
    }

    /**
     * Get element name
     */
    const openingTagStartIndex = templateStr.indexOf("<");
    const openingTagEndIndex = templateStr.indexOf(">", openingTagStartIndex);
    const openingTagStr = templateStr.slice(openingTagStartIndex, openingTagEndIndex + 1);
    const [_, elName] = /^<([a-z0-9]+)/.exec(openingTagStr);

    /**
     * Assign event listener data from template
     */
    // [{name: "click", value: "$1"}]
    const events = [];

    const eventMatches = openingTagStr.matchAll(/\(([a-z]+)\)="(.*?)"/g);

    for (const match of eventMatches) {
        events.push({ name: match[1], value: matchTemplateArgs(match[2]) });
    }

    const closingTagStartIndex = templateStr.indexOf(`</${elName}>`, openingTagEndIndex);
    const textBetweenTags = templateStr.slice(openingTagEndIndex + 1, closingTagStartIndex);

    let innerHTML = '';
    for (let i = 0; i < textBetweenTags.length; i++) {
        const char = textBetweenTags[i];
        if (char === '{' && textBetweenTags[i + 1] === '{') {
            const endIndex = textBetweenTags.indexOf('}}', i) + 2;
            const templateArg = textBetweenTags.slice(i, endIndex);
            innerHTML += matchTemplateArgs(templateArg);
            i = endIndex - 1;
        } else {
            innerHTML += char;
        }
    }

    /**
     * Construct the element, and add the event listeners and innerHTML
     */
    const el = document.createElement(elName);

    for (const { name, value } of events) {
        el.addEventListener(name, value);
    }

    el.innerHTML = innerHTML;

    return el;
}
