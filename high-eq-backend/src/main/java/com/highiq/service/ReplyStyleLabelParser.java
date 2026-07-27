package com.highiq.service;

/**
 * Parses AI reply suggestions across legacy and current formats.
 */
public final class ReplyStyleLabelParser {

    public static final String DEFAULT_REASON = "这是一条高情商回复，能得体地表达意图";
    public static final String DEFAULT_STYLE_LABEL = "自然得体";

    private static final String REASON_DELIMITER = "|||REASON|||";
    private static final String STYLE_DELIMITER = "|||STYLE|||";

    private ReplyStyleLabelParser() {
    }

    public record ParsedSuggestion(String content, String reason, String styleLabel) {
    }

    public static ParsedSuggestion parse(String rawText) {
        String text = trimToEmpty(rawText);
        if (text.isEmpty()) {
            return new ParsedSuggestion("", DEFAULT_REASON, DEFAULT_STYLE_LABEL);
        }

        ParsedSuggestion sectionParsed = parseSectionFormat(text);
        if (sectionParsed != null) {
            return sectionParsed;
        }

        if (text.contains(REASON_DELIMITER)) {
            String[] contentAndRest = text.split("\\Q" + REASON_DELIMITER + "\\E", 2);
            String content = trimToEmpty(contentAndRest[0]);
            String reason = DEFAULT_REASON;
            String styleLabel = DEFAULT_STYLE_LABEL;

            if (contentAndRest.length > 1) {
                String rest = contentAndRest[1];
                if (rest.contains(STYLE_DELIMITER)) {
                    String[] reasonAndStyle = rest.split("\\Q" + STYLE_DELIMITER + "\\E", 2);
                    reason = defaultIfBlank(reasonAndStyle[0], DEFAULT_REASON);
                    styleLabel = defaultIfBlank(reasonAndStyle.length > 1 ? reasonAndStyle[1] : null, DEFAULT_STYLE_LABEL);
                } else {
                    reason = defaultIfBlank(rest, DEFAULT_REASON);
                }
            }

            return new ParsedSuggestion(content, reason, styleLabel);
        }

        return new ParsedSuggestion(text, DEFAULT_REASON, DEFAULT_STYLE_LABEL);
    }

    private static ParsedSuggestion parseSectionFormat(String text) {
        String content = extractSection(text, "【回复内容】", "【推荐理由】");
        if (content == null || content.isBlank()) {
            return null;
        }

        String reason = extractSection(text, "【推荐理由】", "【风格标签】");
        if (reason == null) {
            reason = extractSection(text, "【推荐理由】", null);
        }
        String styleLabel = extractSection(text, "【风格标签】", null);

        return new ParsedSuggestion(
                content.trim(),
                defaultIfBlank(reason, DEFAULT_REASON),
                defaultIfBlank(styleLabel, DEFAULT_STYLE_LABEL)
        );
    }

    private static String extractSection(String text, String startTag, String endTag) {
        int startIndex = text.indexOf(startTag);
        if (startIndex < 0) {
            return null;
        }

        startIndex += startTag.length();
        int endIndex = endTag == null ? text.length() : text.indexOf(endTag, startIndex);
        if (endIndex < 0) {
            return null;
        }

        return text.substring(startIndex, endIndex).trim();
    }

    private static String defaultIfBlank(String value, String defaultValue) {
        String trimmed = trimToEmpty(value);
        return trimmed.isEmpty() ? defaultValue : trimmed;
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
