export type GuestChatRole = "opponent" | "user";

export interface GuestChatMessage {
  id: string;
  role: GuestChatRole;
  content: string;
  source: string;
  turnIndex: number;
}

export interface GuestChatSuggestion {
  id: string;
  content: string;
  reason?: string;
  tone?: string;
  styleLabel?: string;
}

export interface GuestChatSession {
  id: string;
  roleBackground: string;
  initialUserIntent: string;
  selectedReply: string;
  createdAt: number;
  updatedAt: number;
  turnCount: number;
  maxTurnCount: number;
  messages: GuestChatMessage[];
  latestSuggestions: GuestChatSuggestion[];
}

interface CreateGuestChatSessionInput {
  initialOpponentMessage: string;
  roleBackground: string;
  initialUserIntent: string;
  selectedReply: string;
  sentReply: string;
}

interface AppendGuestChatMessageInput {
  role: GuestChatRole;
  content: string;
  source: string;
}

const STORAGE_PREFIX = "high-eq-guest-reply-chat:";
const MAX_TURN_COUNT = 20;
const MAX_CONTEXT_MESSAGES = 16;

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const storageKey = (sessionId: string) => `${STORAGE_PREFIX}${sessionId}`;

const getSessionStorage = () => {
  if (typeof window === "undefined" && typeof sessionStorage === "undefined") {
    return null;
  }
  return sessionStorage;
};

const saveGuestChatSession = (session: GuestChatSession) => {
  const storage = getSessionStorage();
  if (!storage) return session;
  storage.setItem(storageKey(session.id), JSON.stringify(session));
  return session;
};

const nextTurnIndex = (messages: GuestChatMessage[]) => {
  return messages.reduce((max, message) => Math.max(max, message.turnIndex), 0) + 1;
};

const calculateTurnCount = (messages: GuestChatMessage[]) => {
  return messages.reduce((max, message) => Math.max(max, message.turnIndex), 0);
};

const normalizeGuestChatSession = (session: GuestChatSession): GuestChatSession => ({
  ...session,
  turnCount: calculateTurnCount(session.messages),
  maxTurnCount: session.maxTurnCount || MAX_TURN_COUNT,
});

const createMessage = (message: AppendGuestChatMessageInput, turnIndex: number): GuestChatMessage => ({
  id: createId(),
  role: message.role,
  content: message.content.trim(),
  source: message.source,
  turnIndex,
});

export const getGuestChatSession = (sessionId: string): GuestChatSession | null => {
  const storage = getSessionStorage();
  if (!storage) return null;

  const rawSession = storage.getItem(storageKey(sessionId));
  if (!rawSession) return null;

  try {
    const session = normalizeGuestChatSession(JSON.parse(rawSession) as GuestChatSession);
    saveGuestChatSession(session);
    return session;
  } catch {
    storage.removeItem(storageKey(sessionId));
    return null;
  }
};

export const createGuestChatSession = (input: CreateGuestChatSessionInput): GuestChatSession => {
  const now = Date.now();
  const id = createId();
  const messages = [
    createMessage(
      {
        role: "opponent",
        content: input.initialOpponentMessage,
        source: "initial_content",
      },
      1,
    ),
    createMessage(
      {
        role: "user",
        content: input.sentReply,
        source: "selected_suggestion",
      },
      1,
    ),
  ];

  return saveGuestChatSession({
    id,
    roleBackground: input.roleBackground,
    initialUserIntent: input.initialUserIntent,
    selectedReply: input.selectedReply,
    createdAt: now,
    updatedAt: now,
    turnCount: 1,
    maxTurnCount: MAX_TURN_COUNT,
    messages,
    latestSuggestions: [],
  });
};

export const appendGuestChatMessages = (
  sessionId: string,
  messages: AppendGuestChatMessageInput[],
): GuestChatSession => {
  const session = getGuestChatSession(sessionId);
  if (!session) {
    throw new Error("临时继续聊不存在");
  }

  const turnIndex = nextTurnIndex(session.messages);
  const nextMessages = messages.map((message) => createMessage(message, turnIndex));
  const hasUserReply = nextMessages.some((message) => message.role === "user");

  return saveGuestChatSession({
    ...session,
    updatedAt: Date.now(),
    turnCount: calculateTurnCount([...session.messages, ...nextMessages]),
    messages: [...session.messages, ...nextMessages],
    latestSuggestions: hasUserReply ? [] : session.latestSuggestions,
  });
};

export const updateGuestChatSuggestions = (
  sessionId: string,
  suggestions: GuestChatSuggestion[],
): GuestChatSession => {
  const session = getGuestChatSession(sessionId);
  if (!session) {
    throw new Error("临时继续聊不存在");
  }

  return saveGuestChatSession({
    ...session,
    updatedAt: Date.now(),
    latestSuggestions: suggestions,
  });
};

export const buildGuestChatContent = (session: GuestChatSession, nextOpponentMessage: string) => {
  const recentMessages = session.messages.slice(-MAX_CONTEXT_MESSAGES);
  const lines = recentMessages.map((message) => {
    const label = message.role === "user" ? "我" : "对方";
    return `${label}：${message.content}`;
  });

  lines.push(`对方：${nextOpponentMessage.trim()}`);

  return [
    "下面是一段正在继续的聊天，请结合前后文理解关系、语气和情绪变化，给出适合我继续发出的回复。",
    "",
    lines.join("\n"),
  ].join("\n");
};
