# Reply Chat Session, Style Labels, and Regenerate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three first-phase improvements to the core reply generator: style labels on generated suggestions, a "换一批" regeneration flow, and a persisted continue-chat page where users can track "对方说了什么 / 我实际发了什么" and generate the next reply.

**Architecture:** Keep first-round reply generation compatible with existing `GenerateReplyResponse`, but extend suggestions with `styleLabel`. Add dedicated chat-session tables and APIs for continue-chat so it can persist messages, adopted AI drafts, user edits, turn count, and summarized context. Frontend keeps the current generation page as the entry point, adds style badges and "换一批 / 继续聊", then routes continue-chat to a new chat-like page.

**Tech Stack:** Spring Boot 3.2, Java 17, MyBatis Plus, Flyway SQL migrations, React 19, TypeScript, Vite, Wouter, Axios, existing shadcn/Radix UI components, Docker Maven verification.

---

## Scope

Included:
- Add `styleLabel` to normal generated replies, image replies, history detail DTOs, and profile-history DTOs where suggestions are shown.
- Add a first-round "换一批" API that consumes quota and regenerates suggestions for the same original history while excluding previous suggestion text.
- Add continue-chat session creation from a selected current suggestion only.
- Add a new continue-chat page with persisted messages and suggestions.
- Continue-chat supports: opponent message input, optional user real intent, AI generates 3 suggestions, user chooses a suggestion, edits actual sent text, confirms it into the chat timeline.
- Add continue-chat "换一批" for the latest opponent message and same turn context.
- Enforce continue-chat limits: max 12 turns, warn from turn 9, max 16 recent context messages, max 60 stored messages, max 500 chars per message, max 300 chars per turn intent, summary max 600 chars.

Excluded:
- No "微调" feature.
- No "我的表达偏好" feature in this phase.
- No continue-chat entry from History page.
- No guest continue-chat in this phase unless explicitly requested later.
- No multi-branch tree UI; each session is a single linear chat timeline.

## File Structure

Backend files to create:
- `high-eq-backend/src/main/resources/db/migration/V14__add_reply_style_labels_and_chat_sessions.sql`: add style-label columns and chat-session tables.
- `high-eq-backend/src/main/java/com/highiq/entity/ReplyChatSession.java`: persisted continue-chat session metadata.
- `high-eq-backend/src/main/java/com/highiq/entity/ReplyChatMessage.java`: persisted opponent/user chat bubbles.
- `high-eq-backend/src/main/java/com/highiq/entity/ReplyChatSuggestion.java`: persisted AI candidates for a continue-chat turn.
- `high-eq-backend/src/main/java/com/highiq/mapper/ReplyChatSessionMapper.java`: MyBatis Plus mapper.
- `high-eq-backend/src/main/java/com/highiq/mapper/ReplyChatMessageMapper.java`: MyBatis Plus mapper.
- `high-eq-backend/src/main/java/com/highiq/mapper/ReplyChatSuggestionMapper.java`: MyBatis Plus mapper.
- `high-eq-backend/src/main/java/com/highiq/dto/RegenerateReplyRequest.java`: request body for first-round "换一批".
- `high-eq-backend/src/main/java/com/highiq/dto/CreateReplyChatSessionRequest.java`: request body for opening continue-chat from a chosen suggestion.
- `high-eq-backend/src/main/java/com/highiq/dto/ReplyChatSessionDTO.java`: session detail response.
- `high-eq-backend/src/main/java/com/highiq/dto/ReplyChatMessageDTO.java`: chat message DTO.
- `high-eq-backend/src/main/java/com/highiq/dto/ReplyChatSuggestionDTO.java`: continue-chat suggestion DTO.
- `high-eq-backend/src/main/java/com/highiq/dto/GenerateChatSuggestionsRequest.java`: request body for one continue-chat generation turn.
- `high-eq-backend/src/main/java/com/highiq/dto/AdoptChatSuggestionRequest.java`: request body for confirming actual sent text.
- `high-eq-backend/src/main/java/com/highiq/service/ReplyStyleLabelParser.java`: parse packed AI suggestion text into content, reason, style label.
- `high-eq-backend/src/main/java/com/highiq/service/ReplyChatSessionService.java`: continue-chat business logic, limits, quota consumption, context building.
- `high-eq-backend/src/main/java/com/highiq/controller/ReplyChatSessionController.java`: REST APIs under `/reply/chat-sessions`.
- `high-eq-backend/src/test/java/com/highiq/service/ReplyStyleLabelParserTest.java`: parser unit tests.
- `high-eq-backend/src/test/java/com/highiq/service/ReplyChatContextBuilderTest.java`: context-window and limit tests, if the context builder is separated from the session service.

Backend files to modify:
- `high-eq-backend/src/main/java/com/highiq/dto/SuggestionDTO.java`: add `styleLabel`.
- `high-eq-backend/src/main/java/com/highiq/entity/ReplySuggestion.java`: add `styleLabel`.
- `high-eq-backend/src/main/java/com/highiq/entity/ProfileReplySuggestion.java`: add `styleLabel`.
- `high-eq-backend/src/main/java/com/highiq/service/AiService.java`: update prompt/output parsing to include style label and add regenerate/continue-chat generation methods.
- `high-eq-backend/src/main/java/com/highiq/service/QwenVisionService.java`: include style labels in image reply format.
- `high-eq-backend/src/main/java/com/highiq/service/DoubaoVisionService.java`: include style labels in image reply format.
- `high-eq-backend/src/main/java/com/highiq/service/ReplyService.java`: store style labels, expose them in DTOs, add first-round regenerate method.
- `high-eq-backend/src/main/java/com/highiq/service/PersonProfileService.java`: return style label on profile suggestion DTOs.
- `high-eq-backend/src/main/java/com/highiq/controller/ReplyController.java`: add `/reply/history/{historyId}/regenerate`.
- `high-eq-backend/src/main/resources/db/init.sql`: mirror schema for fresh local DBs.

Frontend files to create:
- `high-eq-front/client/src/pages/ReplyChatSession.tsx`: continue-chat page.

Frontend files to modify:
- `high-eq-front/client/src/lib/api.ts`: add regenerate and chat-session API clients, plus TypeScript response shapes.
- `high-eq-front/client/src/pages/ReplyApp.tsx`: show style labels, add "换一批", add "继续聊" entry from each current suggestion.
- `high-eq-front/client/src/App.tsx`: route `/reply/chat/:sessionId` to `ReplyChatSession`.
- `high-eq-front/client/src/pages/PersonProfileChat.tsx`: show style labels; do not add continue-chat unless the product later wants profile-specific continuation.
- `high-eq-front/client/src/pages/History.tsx`, `Favorites.tsx`, `PersonProfileDetail.tsx`, `GuestReplyApp.tsx`: show style labels only where DTOs provide them; no continue-chat actions.

## API Contract

### First-Round Regenerate

`POST /api/reply/history/{historyId}/regenerate`

Request:
```json
{
  "replyCount": 3,
  "modelPreference": "deepseek-v4-flash",
  "tone": "",
  "excludeSuggestionIds": ["s1", "s2", "s3"],
  "excludeContents": ["好嘞，听你的..."]
}
```

Response: same shape as `/reply/generate`, with the same `historyId` and new suggestion IDs.

Rules:
- Must verify `historyId` belongs to current user.
- Must consume quota because AI is generating a new batch.
- Must keep the original history record.
- Must insert new `reply_suggestion` rows with next `order_index` values.
- Must ask AI to avoid prior content and angles.

### Create Continue-Chat Session

`POST /api/reply/chat-sessions`

Request:
```json
{
  "historyId": "history-id",
  "suggestionId": "suggestion-id",
  "sentReply": "用户实际发出去或准备作为开场的话"
}
```

Response:
```json
{
  "id": "session-id",
  "historyId": "history-id",
  "sourceSuggestionId": "suggestion-id",
  "roleBackground": "伴侣",
  "initialChatContent": "你今天。在公司吃完再回来吧",
  "initialUserIntent": "因为回去要打球...",
  "tone": "自然得体",
  "modelPreference": "deepseek-v4-flash",
  "turnCount": 0,
  "maxTurnCount": 12,
  "warnTurnCount": 9,
  "status": "active",
  "messages": [
    {"id": "m1", "role": "opponent", "content": "你今天。在公司吃完再回来吧", "source": "initial"},
    {"id": "m2", "role": "user", "content": "好嘞，听你的...", "source": "ai_adopted"}
  ],
  "latestSuggestions": []
}
```

Rules:
- Create a session only from the current generated result page in the frontend.
- User may edit `sentReply` before opening the session; backend stores the actual sent text.
- Session starts with two messages: original opponent message and actual user sent reply.
- Creating a session does not consume quota.

### Generate Continue-Chat Suggestions

`POST /api/reply/chat-sessions/{sessionId}/generate`

Request:
```json
{
  "opponentMessage": "那你别打太晚，早点回来",
  "userIntent": "想让她放心，但不想显得敷衍",
  "replyCount": 3,
  "tone": "",
  "modelPreference": "deepseek-v4-flash",
  "excludeSuggestionIds": []
}
```

Response:
```json
{
  "sessionId": "session-id",
  "turnCount": 1,
  "maxTurnCount": 12,
  "warnTurnCount": 9,
  "opponentMessageId": "message-id",
  "suggestions": [
    {
      "id": "suggestion-id",
      "content": "知道啦，我不会打太晚...",
      "reason": "这条先接住对方的担心...",
      "tone": "自然得体",
      "styleLabel": "稳重安心"
    }
  ]
}
```

Rules:
- Must verify session belongs to current user.
- Must reject if `turnCount >= 12` with business code/message: `这段续聊已经到达上限，为了保证回复质量，请重新开始一段续聊。`
- Must validate `opponentMessage` 1-500 chars.
- Must validate `userIntent` <= 300 chars.
- Must consume quota.
- Must store the opponent message.
- Must store generated suggestions under that opponent message.
- Must not add a user message until the user confirms actual sent content.

### Regenerate Continue-Chat Suggestions

Use the same endpoint as generate with `excludeSuggestionIds` populated and the same latest opponent message. Frontend should call it as "换一批" only when the latest opponent message has suggestions and no adopted user message after it.

Rules:
- Must consume quota.
- Must not insert a duplicate opponent message for regenerate. Reuse latest `opponentMessageId`.
- Must store the regenerated suggestions with `batch_index + 1`.
- Must ask AI to avoid previous suggestions in the same turn.

### Adopt Continue-Chat Suggestion

`POST /api/reply/chat-sessions/{sessionId}/adopt`

Request:
```json
{
  "suggestionId": "suggestion-id",
  "finalContent": "知道啦，我不会打太晚，打完就跟你说。"
}
```

Response: full `ReplyChatSessionDTO`.

Rules:
- Must verify suggestion belongs to session and current user.
- Must validate `finalContent` 1-500 chars.
- Must mark the suggestion adopted.
- Must insert a user message with the edited `finalContent`.
- Must increment `turnCount` only after adoption. A turn is complete when the user confirms the actual sent message.
- If adoption makes `turnCount == 12`, set session `status = completed`.

## Database Schema

Migration `V14__add_reply_style_labels_and_chat_sessions.sql`:

```sql
ALTER TABLE reply_suggestion
  ADD COLUMN style_label VARCHAR(32) NULL COMMENT '回复风格标签' AFTER suggestion_text;

ALTER TABLE profile_reply_suggestion
  ADD COLUMN style_label VARCHAR(32) NULL COMMENT '回复风格标签' AFTER suggestion_text;

CREATE TABLE reply_chat_session (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  history_id VARCHAR(64) NOT NULL,
  source_suggestion_id VARCHAR(64) NOT NULL,
  role_background VARCHAR(500) NULL,
  initial_chat_content TEXT NULL,
  initial_user_intent TEXT NULL,
  tone VARCHAR(50) NULL,
  model_preference VARCHAR(50) NULL,
  session_summary TEXT NULL,
  turn_count INT NOT NULL DEFAULT 0,
  max_turn_count INT NOT NULL DEFAULT 12,
  warn_turn_count INT NOT NULL DEFAULT 9,
  message_count INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reply_chat_session_user (user_id),
  INDEX idx_reply_chat_session_history (history_id),
  INDEX idx_reply_chat_session_updated (update_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回复续聊会话';

CREATE TABLE reply_chat_message (
  id VARCHAR(64) PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  role VARCHAR(20) NOT NULL COMMENT 'opponent/user',
  content TEXT NOT NULL,
  source VARCHAR(30) NOT NULL DEFAULT 'manual' COMMENT 'initial/manual/ai_adopted',
  source_suggestion_id VARCHAR(64) NULL,
  turn_index INT NOT NULL DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reply_chat_message_session (session_id),
  INDEX idx_reply_chat_message_turn (session_id, turn_index, create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回复续聊消息';

CREATE TABLE reply_chat_suggestion (
  id VARCHAR(64) PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  after_message_id VARCHAR(64) NOT NULL,
  content TEXT NOT NULL,
  reason TEXT NULL,
  tone VARCHAR(50) NULL,
  style_label VARCHAR(32) NULL,
  batch_index INT NOT NULL DEFAULT 1,
  order_index INT NOT NULL DEFAULT 1,
  is_adopted TINYINT NOT NULL DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reply_chat_suggestion_session (session_id),
  INDEX idx_reply_chat_suggestion_after_message (after_message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回复续聊候选建议';
```

Also mirror these changes in `src/main/resources/db/init.sql`.

## Prompt Formats

### Normal Reply Generation

Extend the output format while remaining parseable:

```text
【回复内容】
回复的文字内容
【推荐理由】
用一两句话说明它哪里体贴、哪里照顾到关系和用户真实意图
【风格标签】
从以下标签中选择一个：温柔体贴、俏皮亲密、稳重安心、真诚直接、委婉缓和、轻松自然、主动解释、边界清楚
```

Parser fallback:
- If `【风格标签】` missing, infer with a deterministic fallback method from tone/content keywords, default `自然得体`.
- Continue to parse old stored rows without style labels.

### Regenerate Prompt Addition

Add:

```text
# 已生成过的回复，新的回复不要重复这些表达和角度
- ...

请换一批新的表达方式，仍然贴合对方关系和用户真实意图。不要只是替换几个同义词。
```

### Continue-Chat Prompt

Use a separate builder:

```text
# 角色设定
你是一位专业的情商沟通顾问。你要基于已经发生的真实聊天，帮用户生成下一句可以直接发出去的微信/私聊回复。
回复要自然、有生活感和人情味，避免官方、客服式、心理咨询式、说教式或像 AI 总结的表达。

# 关系背景
对方信息：{roleBackground}
本次会话最开始对方说："{initialChatContent}"
用户最初真实意图：{initialUserIntent}

# 会话摘要
{sessionSummary or "暂无"}

# 最近对话
对方：...
我：...

# 对方最新消息
"{opponentMessage}"

# 用户这次真实想法
{userIntent or "未补充，以自然回应对方最新消息为准"}

# 回复要求
生成 {replyCount} 条候选。
1. 优先回应对方最新消息里的情绪、关心、疑问或担忧。
2. 不要重复用户已经说过的话。
3. 不要推翻用户已经确认发送过的内容。
4. 如果用户补充了这次真实想法，以这次真实想法为准。
5. 每条 20-80 字，像可以直接发出去的聊天消息。

# 输出格式
...
```

## Implementation Tasks

### Task 1: Style Label Parser and DTO Support

**Files:**
- Create: `high-eq-backend/src/main/java/com/highiq/service/ReplyStyleLabelParser.java`
- Create: `high-eq-backend/src/test/java/com/highiq/service/ReplyStyleLabelParserTest.java`
- Modify: `high-eq-backend/src/main/java/com/highiq/dto/SuggestionDTO.java`

- [ ] **Step 1: Write parser unit tests**

Create `ReplyStyleLabelParserTest.java` with tests for:
- Parses content/reason/style label from full modern format.
- Parses legacy `content|||REASON|||reason`.
- Defaults style label to `自然得体` when missing.
- Trims whitespace.

Expected assertions:
```java
assertEquals("好嘞，听你的", parsed.content());
assertEquals("这条很体贴", parsed.reason());
assertEquals("俏皮亲密", parsed.styleLabel());
```

- [ ] **Step 2: Run parser test and verify it fails**

Run:
```bash
docker run --rm -v "$PWD":/app -v "$HOME/.m2":/root/.m2 -w /app maven:3.9.12-eclipse-temurin-17 mvn -Dtest=ReplyStyleLabelParserTest test
```

Expected: FAIL because parser does not exist.

- [ ] **Step 3: Implement parser**

Implement a focused parser with a record:
```java
public record ParsedSuggestion(String content, String reason, String styleLabel) {}
```

Behavior:
- Prefer section parsing for `【回复内容】`, `【推荐理由】`, `【风格标签】`.
- Fallback to `|||REASON|||`.
- Use `自然得体` when style label is absent or blank.
- Keep fallback reason as existing wording: `这是一条高情商回复，能得体地表达意图`.

- [ ] **Step 4: Add `styleLabel` to `SuggestionDTO`**

Add:
```java
private String styleLabel;
```

- [ ] **Step 5: Run parser test**

Run the same Maven test command.

Expected: PASS.

### Task 2: Database Migration for Style Labels and Chat Sessions

**Files:**
- Create: `high-eq-backend/src/main/resources/db/migration/V14__add_reply_style_labels_and_chat_sessions.sql`
- Modify: `high-eq-backend/src/main/resources/db/init.sql`
- Modify: `high-eq-backend/src/main/java/com/highiq/entity/ReplySuggestion.java`
- Modify: `high-eq-backend/src/main/java/com/highiq/entity/ProfileReplySuggestion.java`

- [ ] **Step 1: Add Flyway migration**

Use the SQL from the Database Schema section.

- [ ] **Step 2: Mirror schema in init SQL**

Update table definitions in `init.sql` so a fresh local DB contains:
- `reply_suggestion.style_label`
- `profile_reply_suggestion.style_label`
- `reply_chat_session`
- `reply_chat_message`
- `reply_chat_suggestion`

- [ ] **Step 3: Update suggestion entities**

Add:
```java
private String styleLabel;
```

to `ReplySuggestion` and `ProfileReplySuggestion`.

- [ ] **Step 4: Run backend compile**

Run:
```bash
docker run --rm -v "$PWD":/app -v "$HOME/.m2":/root/.m2 -w /app maven:3.9.12-eclipse-temurin-17 mvn -DskipTests compile
```

Expected: BUILD SUCCESS.

### Task 3: Generate and Persist Style Labels

**Files:**
- Modify: `high-eq-backend/src/main/java/com/highiq/service/AiService.java`
- Modify: `high-eq-backend/src/main/java/com/highiq/service/QwenVisionService.java`
- Modify: `high-eq-backend/src/main/java/com/highiq/service/DoubaoVisionService.java`
- Modify: `high-eq-backend/src/main/java/com/highiq/service/ReplyService.java`
- Modify: `high-eq-backend/src/main/java/com/highiq/service/PersonProfileService.java`

- [ ] **Step 1: Update text prompt output format**

In `AiService.buildPrompt`, add `【风格标签】` after `【推荐理由】` and list the approved labels:
`温柔体贴、俏皮亲密、稳重安心、真诚直接、委婉缓和、轻松自然、主动解释、边界清楚`.

- [ ] **Step 2: Update image prompt output format**

Change vision output rows from:
```text
回复内容|||REASON|||推荐理由
```
to:
```text
回复内容|||REASON|||推荐理由|||STYLE|||风格标签
```

Keep parser backward-compatible for old image rows.

- [ ] **Step 3: Use parser in `ReplyService.generateReplies`**

Replace manual split logic with `ReplyStyleLabelParser.parse(aiSuggestion)`.

Store:
```java
.suggestionText(aiSuggestion)
.styleLabel(parsed.styleLabel())
```

Return:
```java
SuggestionDTO.builder()
    .id(suggestionId)
    .content(parsed.content())
    .reason(parsed.reason())
    .tone(selectedTone)
    .styleLabel(parsed.styleLabel())
    .build();
```

- [ ] **Step 4: Return style labels from history and profile history**

Update `getSuggestionsForHistory` and `getSuggestionsForProfileHistory` so they use stored `styleLabel` first, parser fallback second, default `自然得体` last.

- [ ] **Step 5: Verify existing generate endpoint**

Run:
```bash
docker compose up -d --build backend
curl -sS http://localhost:8080/api/actuator/health
```

Expected: `{"status":"UP"}`.

Then call `/api/reply/generate` with a valid token and confirm each suggestion has `styleLabel`.

### Task 4: First-Round "换一批" Backend

**Files:**
- Create: `high-eq-backend/src/main/java/com/highiq/dto/RegenerateReplyRequest.java`
- Modify: `high-eq-backend/src/main/java/com/highiq/controller/ReplyController.java`
- Modify: `high-eq-backend/src/main/java/com/highiq/service/ReplyService.java`
- Modify: `high-eq-backend/src/main/java/com/highiq/service/AiService.java`

- [ ] **Step 1: Add request DTO**

Fields:
```java
private Integer replyCount;
private String modelPreference;
private String tone;
private List<String> excludeSuggestionIds;
private List<String> excludeContents;
```

- [ ] **Step 2: Add `AiService.generateRegeneratedReplies`**

Signature:
```java
public List<String> generateRegeneratedReplies(
    String chatContent,
    String roleBackground,
    String userIntent,
    Integer replyCount,
    String tone,
    String requestedModel,
    List<String> excludeContents
)
```

It should call the text model only for this phase. If image-history regeneration is needed later, add it as a separate task.

- [ ] **Step 3: Add `ReplyService.regenerateReplies`**

Behavior:
- Verify history exists, belongs to user, status is active.
- Resolve model from request or history.
- Check model availability.
- Consume quota.
- Load excluded contents from request and `excludeSuggestionIds`; ignore IDs that do not belong to this history.
- Call `aiService.generateRegeneratedReplies`.
- Insert new `reply_suggestion` rows using the same history ID and continuing `order_index`.
- Return `GenerateReplyResponse` with same history ID.

- [ ] **Step 4: Add controller endpoint**

```java
@PostMapping("/history/{historyId}/regenerate")
public ApiResponse<GenerateReplyResponse> regenerateReplies(...)
```

- [ ] **Step 5: Verify regenerate manually**

Call normal generate, copy returned `historyId` and suggestion IDs, then call regenerate.

Expected:
- `code = 200`
- same `historyId`
- new suggestion IDs
- each suggestion has `styleLabel`
- daily quota decreases.

### Task 5: Continue-Chat Backend Entities, Mappers, and DTOs

**Files:**
- Create all entity, mapper, and DTO files listed in File Structure.

- [ ] **Step 1: Create entities**

Use MyBatis Plus annotations:
```java
@TableName("reply_chat_session")
public class ReplyChatSession { ... }
```

Use `@TableId(type = IdType.ASSIGN_UUID)` for IDs.

- [ ] **Step 2: Create mappers**

Each mapper extends `BaseMapper<Entity>`.

- [ ] **Step 3: Create DTOs**

DTO requirements:
- `ReplyChatSessionDTO` includes metadata, limits, messages, latestSuggestions.
- `ReplyChatMessageDTO` includes id, role, content, source, turnIndex, createTime.
- `ReplyChatSuggestionDTO` includes id, content, reason, tone, styleLabel, isAdopted.

- [ ] **Step 4: Compile**

Run Docker Maven compile.

Expected: BUILD SUCCESS.

### Task 6: Continue-Chat Service and Controller

**Files:**
- Create: `high-eq-backend/src/main/java/com/highiq/service/ReplyChatSessionService.java`
- Create: `high-eq-backend/src/main/java/com/highiq/controller/ReplyChatSessionController.java`
- Modify: `high-eq-backend/src/main/java/com/highiq/service/AiService.java`

- [ ] **Step 1: Implement constants**

In service:
```java
private static final int MAX_CONTINUE_TURNS = 12;
private static final int WARN_CONTINUE_TURNS = 9;
private static final int MAX_CONTEXT_MESSAGES = 16;
private static final int MAX_STORED_MESSAGES = 60;
private static final int MAX_MESSAGE_CHARS = 500;
private static final int MAX_INTENT_CHARS = 300;
private static final int MAX_SUMMARY_CHARS = 600;
```

- [ ] **Step 2: Implement `createSession`**

Inputs: userId, request.

Behavior:
- Load history and suggestion.
- Verify ownership.
- Use request `sentReply` if present, otherwise parsed suggestion content.
- Insert session.
- Insert two messages: opponent initial content, user sent reply.
- Return session detail.

- [ ] **Step 3: Implement `generateSuggestions`**

Behavior:
- Verify ownership and active status.
- Reject if `turnCount >= 12`.
- Validate lengths.
- If request is first generate for this opponent message, insert opponent message.
- If request is regenerate for latest opponent message, reuse latest opponent message and collect excluded suggestions.
- Build prompt from fixed background, session summary, recent 16 messages, latest opponent message, user intent.
- Consume quota.
- Generate 3 suggestions.
- Store them under `reply_chat_suggestion`.
- Return turn response.

- [ ] **Step 4: Implement `adoptSuggestion`**

Behavior:
- Verify suggestion belongs to session/user.
- Validate final content.
- Mark suggestion adopted.
- Insert user message with `source = ai_adopted`, `source_suggestion_id = suggestionId`.
- Increment `turnCount`.
- If `turnCount >= 12`, status becomes `completed`.
- Return full session detail.

- [ ] **Step 5: Implement `getSessionDetail`**

Return all messages in chronological order and latest unadopted suggestions for the most recent opponent message that does not yet have a user response.

- [ ] **Step 6: Add controller endpoints**

```java
@PostMapping("/reply/chat-sessions")
@GetMapping("/reply/chat-sessions/{sessionId}")
@PostMapping("/reply/chat-sessions/{sessionId}/generate")
@PostMapping("/reply/chat-sessions/{sessionId}/adopt")
```

Controller should parse JWT exactly like `ReplyController`.

- [ ] **Step 7: Verify manually with curl**

Flow:
1. Generate first-round replies.
2. Create session from one suggestion.
3. Generate continue-chat suggestions.
4. Adopt one suggestion with edited `finalContent`.
5. Get session detail and confirm timeline contains edited content.

### Task 7: Frontend Types and API Client

**Files:**
- Modify: `high-eq-front/client/src/lib/api.ts`

- [ ] **Step 1: Add `styleLabel` to reply suggestion type usages**

Where inline types exist, add:
```ts
styleLabel?: string;
```

- [ ] **Step 2: Add regenerate API**

```ts
regenerateReplies: async (historyId: string, data: {
  replyCount?: number;
  modelPreference?: string;
  tone?: string;
  excludeSuggestionIds?: string[];
  excludeContents?: string[];
}) => {
  const response = await apiClient.post(`/reply/history/${historyId}/regenerate`, data, { timeout: 0 });
  return response.data;
}
```

- [ ] **Step 3: Add chat session APIs**

Add:
```ts
createChatSession
getChatSession
generateChatSuggestions
adoptChatSuggestion
```

Each uses `/reply/chat-sessions`.

- [ ] **Step 4: Run type check**

Run:
```bash
cd high-eq-front && pnpm check
```

Expected: no TypeScript errors.

### Task 8: Frontend First-Round Result UI

**Files:**
- Modify: `high-eq-front/client/src/pages/ReplyApp.tsx`

- [ ] **Step 1: Display style label**

Replace or supplement `方案 {index + 1}` badge:
```tsx
<Badge variant="secondary">
  {suggestion.styleLabel ? `${suggestion.styleLabel}版` : `方案 ${index + 1}`}
</Badge>
```

Keep `tone` badge as a secondary badge if useful.

- [ ] **Step 2: Add "换一批" button**

Show when `suggestions.length > 0 && currentHistoryId`.

Behavior:
- Button text: `换一批`
- Loading text: `正在换一批...`
- Calls `replyAPI.regenerateReplies(currentHistoryId, { replyCount, modelPreference, tone, excludeSuggestionIds, excludeContents })`
- Replace visible `suggestions` with response suggestions.
- Keep `currentHistoryId`.
- Toast on success/failure.

- [ ] **Step 3: Add "继续聊" action per card**

Add button text `继续聊`.

On click:
- Open an edit confirmation dialog or inline panel: `确认你实际发出去的话`
- Default textarea value = suggestion.content
- Confirm button text = `进入继续聊`
- Calls `replyAPI.createChatSession({ historyId: currentHistoryId, suggestionId: suggestion.id, sentReply })`
- Navigate to `/reply/chat/${sessionId}`.

- [ ] **Step 4: Type check**

Run `pnpm check`.

Expected: PASS.

### Task 9: Continue-Chat Page

**Files:**
- Create: `high-eq-front/client/src/pages/ReplyChatSession.tsx`
- Modify: `high-eq-front/client/src/App.tsx`

- [ ] **Step 1: Add route**

Add `/reply/chat/:sessionId`.

- [ ] **Step 2: Build page skeleton**

Layout:
- Header: `续聊`, role background, tone, `turnCount / maxTurnCount`.
- Timeline: opponent bubbles left, user bubbles right.
- Bottom panel when active and no pending suggestions:
  - `对方又说了什么？` textarea, max 500.
  - `我这次想表达什么？` textarea, max 300, optional.
  - `生成回复` button.
- Candidate panel when suggestions exist:
  - Title `下一句可以这样回`
  - 3 suggestion cards with style label, content, reason, buttons `复制` and `用这句`
  - `换一批` button.

- [ ] **Step 3: Implement data load**

On mount:
- Call `replyAPI.getChatSession(sessionId)`.
- Render messages and latest suggestions.

- [ ] **Step 4: Implement generate**

On submit:
- Validate opponent message locally.
- Call `generateChatSuggestions`.
- Append opponent message from response or reload full session detail.
- Render candidates.

- [ ] **Step 5: Implement "用这句" confirmation**

Click `用这句`:
- Open editable textarea with suggestion content.
- Confirm button `确认已发送`.
- Call `adoptChatSuggestion(sessionId, { suggestionId, finalContent })`.
- Replace page state with returned full session detail.

- [ ] **Step 6: Implement continue-chat "换一批"**

Calls generate endpoint with same latest opponent message and `excludeSuggestionIds` from visible/latest candidates.

Rules:
- Disabled after a suggestion is adopted for that opponent message.
- Consumes quota through backend.

- [ ] **Step 7: Implement limit UX**

When `turnCount >= warnTurnCount`, show small notice:
`这段续聊已经比较完整了，后面如果换了话题，可以重新开一段。`

When session status is `completed`:
- Disable generation.
- Show:
`这段续聊已经到达上限。为了保证回复质量，建议从新的聊天内容重新开始。`

- [ ] **Step 8: Type check**

Run `pnpm check`.

Expected: PASS.

### Task 10: Final Verification

**Files:** No source changes unless verification finds defects.

- [ ] **Step 1: Backend compile**

Run:
```bash
cd high-eq-backend
docker run --rm -v "$PWD":/app -v "$HOME/.m2":/root/.m2 -w /app maven:3.9.12-eclipse-temurin-17 mvn -DskipTests compile
```

Expected: BUILD SUCCESS.

- [ ] **Step 2: Frontend type check**

Run:
```bash
cd high-eq-front
pnpm check
```

Expected: no TypeScript errors.

- [ ] **Step 3: Frontend build**

Run:
```bash
cd high-eq-front
pnpm build
```

Expected: Vite build succeeds.

- [ ] **Step 4: Docker service smoke test**

Run:
```bash
cd high-eq-backend
docker compose up -d --build backend
curl -sS http://localhost:8080/api/actuator/health
```

Expected: `{"status":"UP"}`.

- [ ] **Step 5: Browser smoke test**

Open `http://localhost:3000/app`:
- Generate replies.
- Confirm style-label badges appear.
- Click "换一批"; confirm visible suggestions change and badges remain.
- Click "继续聊" on one suggestion.
- Edit actual sent text and enter continue-chat page.
- Enter opponent's next message and optional intent.
- Generate suggestions.
- Click "用这句", edit final content, confirm it appears as a user bubble.
- Confirm turn count increments.

## Self-Review

Spec coverage:
- Style labels are covered by Tasks 1, 2, 3, 7, 8, 9.
- First-round "换一批" is covered by Tasks 4, 7, 8, 10.
- Continue-chat new page, persisted timeline, edited sent content, context capacity, and max turn limit are covered by Tasks 5, 6, 7, 9, 10.
- Excluded features are explicitly out of scope.

Placeholder scan:
- No TBD/TODO placeholders are present.
- All APIs, routes, limits, and schema names are specified.

Type consistency:
- `styleLabel` is consistently camelCase in Java DTOs and TypeScript.
- SQL columns use snake_case (`style_label`) and MyBatis Plus maps them by default.
- Continue-chat route is consistently `/reply/chat/:sessionId` on frontend and `/reply/chat-sessions` on backend.

