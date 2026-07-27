package com.highiq.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ReplyStyleLabelParserTest {

    @Test
    void parsesSectionFormatWithStyleLabel() {
        String text = """
                【回复内容】
                好嘞，听你的
                【推荐理由】
                这条很体贴
                【风格标签】
                俏皮亲密
                """;

        ReplyStyleLabelParser.ParsedSuggestion parsed = ReplyStyleLabelParser.parse(text);

        assertEquals("好嘞，听你的", parsed.content());
        assertEquals("这条很体贴", parsed.reason());
        assertEquals("俏皮亲密", parsed.styleLabel());
    }

    @Test
    void parsesLegacyReasonFormat() {
        ReplyStyleLabelParser.ParsedSuggestion parsed =
                ReplyStyleLabelParser.parse("我知道啦|||REASON|||先接住对方的关心");

        assertEquals("我知道啦", parsed.content());
        assertEquals("先接住对方的关心", parsed.reason());
        assertEquals("自然得体", parsed.styleLabel());
    }

    @Test
    void parsesPipeStyleFormat() {
        ReplyStyleLabelParser.ParsedSuggestion parsed =
                ReplyStyleLabelParser.parse("我知道啦|||REASON|||先接住对方的关心|||STYLE|||稳重安心");

        assertEquals("我知道啦", parsed.content());
        assertEquals("先接住对方的关心", parsed.reason());
        assertEquals("稳重安心", parsed.styleLabel());
    }

    @Test
    void defaultsBlankStyleLabel() {
        String text = """
                【回复内容】
                好的
                【推荐理由】
                简短自然
                【风格标签】

                """;

        ReplyStyleLabelParser.ParsedSuggestion parsed = ReplyStyleLabelParser.parse(text);

        assertEquals("好的", parsed.content());
        assertEquals("简短自然", parsed.reason());
        assertEquals("自然得体", parsed.styleLabel());
    }
}
