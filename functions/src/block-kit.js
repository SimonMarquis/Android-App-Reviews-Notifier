/**
 * @param {string} type
 * @param {...object} elements
 */
const block = (type, ...elements) => ({
    "type": type,
    "elements": elements.filter((it) => it != null),
});

/**
 * @param {...object} elements
 */
export const contextBlock = (...elements) => block("context", ...elements);


/**
 * @param {...object} elements
 */
export const richTextBlock = (...elements) => block("rich_text", ...elements);

/**
 * @param {...object} elements
 */
export const richTextSectionBlock = (...elements) => block("rich_text_section", ...elements);

/**
 * @param {...object} elements
 */
export const richTextQuoteBlock = (...elements) => block("rich_text_quote", ...elements);

/**
 * @param {string} text
 */
export const mrkdwnElement = (text) => ({
    "type": "mrkdwn",
    "text": text,
});

/**
 * @param {string} url
 * @param {string} alt
 */
export const imageElement = (url, alt = "") => ({
    "type": "image",
    "image_url": url,
    "alt_text": alt,
});

/**
 * @param {string} text
 * @param {object=} style
 * @param {boolean=} style.bold
 * @param {boolean=} style.italic
 */
export const textElement = (text, style) => ({
    "type": "text",
    "text": text,
    ...(style) && {"style": style},
});

/**
 * @param {string} name
 * @param {string} unicode
 */
export const emojiElement = (name, unicode) => (
    {
        "type": "emoji",
        "name": name,
        "unicode": unicode,
    });

/**
 * @param {string} text
 */
export const bold = (text) => `*${text?.trim()}*`;

/**
 * {@link https://api.slack.com/reference/surfaces/formatting#linking-urls|Slack Links}
 * @param {string} text
 * @param {string} url
 */
export const linkify = (text, url) => `<${escape(url)}|${escape(text)}>`;

/**
 * {@link https://api.slack.com/reference/surfaces/formatting#escaping|Slack Escaping text}
 * @param {string} text
 */
const escape = (text) => text
    ?.replaceAll("&", "&amp;")
    ?.replaceAll("<", "&lt;")
    ?.replaceAll(">", "&gt;");
