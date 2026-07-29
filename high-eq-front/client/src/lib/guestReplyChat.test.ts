import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  appendGuestChatMessages,
  buildGuestChatContent,
  createGuestChatSession,
  getGuestChatSession,
  updateGuestChatSuggestions,
} from "./guestReplyChat";

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  vi.stubGlobal("sessionStorage", {
    getItem: vi.fn((key: string) => storage.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
    removeItem: vi.fn((key: string) => storage.delete(key)),
  });
  vi.stubGlobal("crypto", {
    randomUUID: vi.fn(() => "guest-session-1"),
  });
});

describe("guest temporary reply chat", () => {
  it("creates a temporary session in sessionStorage with the selected reply as the first user message", () => {
    const session = createGuestChatSession({
      initialOpponentMessage: "今天有点累，不太想说话",
      roleBackground: "朋友",
      initialUserIntent: "想关心她但别太打扰",
      selectedReply: "那你先休息，我晚点再找你。",
      sentReply: "那你先休息，我晚点再找你，有事随时叫我。",
    });

    expect(session.id).toBe("guest-session-1");
    expect(session.messages).toEqual([
      expect.objectContaining({ role: "opponent", content: "今天有点累，不太想说话", turnIndex: 1 }),
      expect.objectContaining({ role: "user", content: "那你先休息，我晚点再找你，有事随时叫我。", turnIndex: 1 }),
    ]);
    expect(getGuestChatSession(session.id)?.roleBackground).toBe("朋友");
  });

  it("builds AI context from recent temporary messages and the new opponent message", () => {
    const session = createGuestChatSession({
      initialOpponentMessage: "你今天忙吗",
      roleBackground: "伴侣",
      initialUserIntent: "想自然一点",
      selectedReply: "今天还好，晚上可以好好陪你聊。",
      sentReply: "今天还好，晚上可以好好陪你聊。",
    });

    const content = buildGuestChatContent(session, "那你几点回来呀");

    expect(content).toContain("对方：你今天忙吗");
    expect(content).toContain("我：今天还好，晚上可以好好陪你聊。");
    expect(content).toContain("对方：那你几点回来呀");
  });

  it("stores later opponent messages, suggestions, and adopted user replies without using persistent APIs", () => {
    const session = createGuestChatSession({
      initialOpponentMessage: "在干嘛",
      roleBackground: "朋友",
      initialUserIntent: "轻松回复",
      selectedReply: "刚忙完，准备歇会儿。",
      sentReply: "刚忙完，准备歇会儿。",
    });

    const withOpponent = appendGuestChatMessages(session.id, [
      { role: "opponent", content: "我有点烦", source: "guest_input" },
    ]);
    const withSuggestions = updateGuestChatSuggestions(withOpponent.id, [
      { id: "s1", content: "怎么啦，愿意说的话我听着。", styleLabel: "温柔承接" },
    ]);
    const finalSession = appendGuestChatMessages(withSuggestions.id, [
      { role: "user", content: "怎么啦，愿意说的话我听着。", source: "adopted_suggestion" },
    ]);

    expect(finalSession.messages).toHaveLength(4);
    expect(finalSession.latestSuggestions).toEqual([]);
    expect(getGuestChatSession(session.id)?.messages.at(-1)?.role).toBe("user");
  });

  it("normalizes stale cached turn count from actual message turns", () => {
    storage.set(
      "high-eq-guest-reply-chat:stale-session",
      JSON.stringify({
        id: "stale-session",
        roleBackground: "朋友",
        initialUserIntent: "自然回复",
        selectedReply: "好呀",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        turnCount: 5,
        maxTurnCount: 20,
        messages: [
          { id: "m1", role: "opponent", content: "第一句", source: "initial_content", turnIndex: 1 },
          { id: "m2", role: "user", content: "第一回", source: "selected_suggestion", turnIndex: 1 },
          { id: "m3", role: "opponent", content: "第二句", source: "guest_input", turnIndex: 2 },
          { id: "m4", role: "user", content: "第二回", source: "adopted_suggestion", turnIndex: 2 },
          { id: "m5", role: "opponent", content: "第三句", source: "guest_input", turnIndex: 3 },
          { id: "m6", role: "user", content: "第三回", source: "adopted_suggestion", turnIndex: 3 },
        ],
        latestSuggestions: [],
      }),
    );

    expect(getGuestChatSession("stale-session")?.turnCount).toBe(3);
  });
});
