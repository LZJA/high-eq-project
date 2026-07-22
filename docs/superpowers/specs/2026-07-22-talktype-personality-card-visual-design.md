# TalkType 人格卡视觉设计

## 目标

为 TalkType 沟通人格测试设计 12 张可传播的人格配图。每张图都要像 MBTI 人格卡一样有记忆点，但视觉语言必须属于 HighEQ：温暖、聪明、轻盈、有一点“被看懂”的情绪价值。

第一版只做 12 种 TalkType 人格，不扩展到 24 种。24 是测试题数量；人格数量保持 12，便于用户记住、分享和讨论。

## 总体视觉方向

### 风格

- 半身人物角色插画。
- 轻 3D / 软质感 / 干净渐变背景。
- 统一卡片构图：人物居中偏上，象征物围绕人物，底部预留给前端叠加人格名、沟通代码和分享文案。
- 不直接模仿 MBTI 的角色造型、服饰体系、图标语言或配色系统。
- 人物性别表达保持中性、多样，不做强性别刻板印象。

### 资产规格

- 方图：`1:1`，用于结果页、头像式分享、朋友圈截图。
- 竖图：`4:5`，用于移动端分享卡、小红书封面。
- 第一版生成图片不直接包含长文字；人格名、沟通代码、分数和分享文案由前端叠加。
- 图片中可以包含极少量抽象符号，但避免生成可读文字，降低 AI 文字错误风险。

### 统一提示词基底

所有人格卡生成时都使用同一段基础约束，再拼接每个人格的差异化描述。

```text
Create a premium personality test character card illustration for a product called TalkType.
Style: warm modern semi-3D illustration, soft clay-like rendering, clean rounded shapes, subtle emotional intelligence theme, polished app asset, gentle lighting, crisp subject silhouette.
Composition: centered half-body character, expressive but not exaggerated, symbolic objects around the character, clean gradient background, enough empty space at the bottom for UI text overlay.
Mood: intelligent, empathetic, memorable, shareable, not childish, not corporate stock art.
Avoid: MBTI-like costume copying, anime style, photorealism, messy background, readable text, watermark, logo, extra fingers, harsh shadows, dark horror mood.
```

## 12 张人格卡设定

### 1. 情绪翻译官

- Asset id: `emotion-translator`
- 主色：雾蓝 + 柔紫。
- 角色动作：一手托着发光对话气泡，一手把混乱线条梳理成清晰光带。
- 象征物：对话气泡、细线、微光字幕块。
- 背景元素：轻微波纹，像情绪信号被翻译。
- 避讳：不要做成严肃翻译员或拿纸质文件。
- 分享文案：`别人说“没事”，我已经听出有事了。`
- Prompt:

```text
Base prompt plus:
Personality: Emotion Translator. A calm warm character gently translating tangled emotional lines into clear glowing chat bubbles. Misty blue and soft violet palette. Symbolic speech bubbles, delicate signal waves, clean emotional clarity. The character feels perceptive, kind, and quietly confident.
```

### 2. 温柔灭火器

- Asset id: `gentle-firefighter`
- 主色：奶油粉 + 暖橙。
- 角色动作：轻轻挥出柔光水雾，把小火苗降成温暖光点。
- 象征物：小火苗、水雾、柔光盾。
- 背景元素：火药味从红橙过渡为浅粉。
- 避讳：不要出现真实灭火器、消防服或灾难场景。
- 分享文案：`我不是不生气，我只是先让场面别烧起来。`
- Prompt:

```text
Base prompt plus:
Personality: Gentle Firefighter. A warm character calming tiny conversational sparks with soft glowing mist, turning tension into warm light particles. Cream pink and warm orange palette. No real fire disaster, only symbolic tiny flames. The character feels soothing, patient, and emotionally safe.
```

### 3. 边界守门员

- Asset id: `boundary-guardian`
- 主色：青绿 + 象牙白。
- 角色动作：站在半透明弧形边界门前，一手温柔示意停止，一手保持开放姿态。
- 象征物：透明边界门、柔光停靠线、钥匙。
- 背景元素：内外两层空间，表达“亲近但有边界”。
- 避讳：不要做成冷酷守卫或强硬拒绝。
- 分享文案：`我可以温柔，但不会被拿捏。`
- Prompt:

```text
Base prompt plus:
Personality: Boundary Guardian. A kind but firm character standing before a translucent curved gate of light, one hand softly signaling stop, the other open and welcoming. Teal green and ivory palette. Symbolizes healthy boundaries without coldness. Calm, grounded, self-respecting.
```

### 4. 气氛修复师

- Asset id: `vibe-repairer`
- 主色：薄荷绿 + 珊瑚粉。
- 角色动作：把断开的彩色对话拼图重新拼起来。
- 象征物：拼图、彩带、笑意气泡。
- 背景元素：从裂痕过渡到柔和圆形图案。
- 避讳：不要太儿童玩具感。
- 分享文案：`尴尬冷场？我先递个台阶。`
- Prompt:

```text
Base prompt plus:
Personality: Vibe Repairer. A lively warm character reconnecting broken colorful conversation puzzle pieces with soft ribbons. Mint green and coral pink palette. Light social repair energy, witty but not childish. The scene feels like awkward silence becoming comfortable again.
```

### 5. 冷静谈判家

- Asset id: `calm-negotiator`
- 主色：深蓝 + 银灰。
- 角色动作：坐在圆桌前，平静地把两边观点放到平衡天平上。
- 象征物：天平、路线图、圆桌。
- 背景元素：清晰路径线和柔和网格。
- 避讳：不要商务西装模板感，不要压迫感。
- 分享文案：`越复杂的局，我越要把话说稳。`
- Prompt:

```text
Base prompt plus:
Personality: Calm Negotiator. A composed character at a rounded conversation table, balancing two glowing idea tokens on a minimal scale, with a soft route map behind them. Deep blue and silver gray palette. Strategic, stable, fair, emotionally controlled, not corporate stock.
```

### 6. 直球真诚派

- Asset id: `honest-straight-shooter`
- 主色：赤橙 + 米白。
- 角色动作：手持一支发光直线箭头，神态坦荡。
- 象征物：直线箭头、透明心形、简洁标点。
- 背景元素：清晰直线与柔和圆角碰撞。
- 避讳：不要攻击性、不要弓箭武器感。
- 分享文案：`我不绕弯，但我在学着更柔软。`
- Prompt:

```text
Base prompt plus:
Personality: Honest Straight Shooter. A sincere character holding a glowing straight arrow made of light, with a transparent heart symbol nearby. Red orange and warm off-white palette. Direct, honest, brave, slightly sharp but kind. No weapon, no aggression.
```

### 7. 高敏雷达型

- Asset id: `sensitive-radar`
- 主色：电光紫 + 夜蓝。
- 角色动作：安静站立，周围有细腻情绪波纹和雷达光圈。
- 象征物：雷达圈、微小信号点、耳机式光环。
- 背景元素：很多细微信号，但整体不混乱。
- 避讳：不要科幻战斗风，不要焦虑恐怖感。
- 分享文案：`空气里变了一点点，我都感觉到了。`
- Prompt:

```text
Base prompt plus:
Personality: Sensitive Radar. A thoughtful character surrounded by delicate emotional signal rings and tiny glowing dots, sensing subtle shifts in the atmosphere. Electric violet and deep night blue palette. Highly perceptive, slightly vulnerable, elegant, not sci-fi combat.
```

### 8. 关系经营者

- Asset id: `relationship-curator`
- 主色：暖金 + 草绿。
- 角色动作：双手轻轻连接几条发光关系线。
- 象征物：关系节点、细线、温暖小光点。
- 背景元素：柔和网络，但节点不宜太多。
- 避讳：不要像商业社交网络图。
- 分享文案：`关系不是靠运气，是靠一次次好好回应。`
- Prompt:

```text
Base prompt plus:
Personality: Relationship Curator. A caring character gently connecting a small network of glowing relationship threads and warm light nodes. Warm gold and fresh green palette. Long-term connection, thoughtful maintenance, sincere attention. Avoid business networking vibe.
```

### 9. 共情海绵型

- Asset id: `empathy-sponge`
- 主色：水蓝 + 云白。
- 角色动作：抱着柔软云朵，云朵吸收几颗情绪水滴。
- 象征物：云朵、水滴、柔软抱枕感形体。
- 背景元素：温柔雨滴逐渐变淡。
- 避讳：不要真的画海绵，避免廉价感。
- 分享文案：`我太会体谅别人，有时忘了照顾自己。`
- Prompt:

```text
Base prompt plus:
Personality: Empathy Sponge. A gentle character holding a soft cloud that absorbs small emotional droplets, looking warm but a little tired. Water blue and cloud white palette. Deep empathy, softness, emotional absorption. Do not depict a literal kitchen sponge.
```

### 10. 体面拒绝家

- Asset id: `graceful-decliner`
- 主色：薰衣草紫 + 珍珠白。
- 角色动作：一手温柔示意暂停，另一手递出替代方案卡片。
- 象征物：暂停手势、替代方案卡、柔光边框。
- 背景元素：两条路径，一条关闭，一条打开。
- 避讳：不要冷漠拒绝、不要“禁止”交通标志。
- 分享文案：`拒绝也可以体面，边界也可以好听。`
- Prompt:

```text
Base prompt plus:
Personality: Graceful Decliner. A poised character softly signaling pause with one hand while offering a small alternative-solution card with the other. Lavender purple and pearl white palette. Polite refusal, healthy boundaries, elegant diplomacy. No harsh prohibition symbols.
```

### 11. 沉默观察者

- Asset id: `quiet-observer`
- 主色：松石蓝 + 暖灰。
- 角色动作：站在窗边或观测台，手拿小笔记本，观察对话光点。
- 象征物：窗、笔记本、安静光点。
- 背景元素：留白多，表达“先看清再回应”。
- 避讳：不要孤僻阴暗，不要侦探悬疑感。
- 分享文案：`我不是没反应，我是在看清局势。`
- Prompt:

```text
Base prompt plus:
Personality: Quiet Observer. A calm character near a soft window-like frame, holding a small notebook and observing floating conversation lights. Turquoise blue and warm gray palette. Thoughtful, observant, quiet intelligence, lots of clean negative space. Not lonely, dark, or detective-like.
```

### 12. 反转表达师

- Asset id: `reframe-artist`
- 主色：玫红 + 靛蓝。
- 角色动作：把一团乱线拉成漂亮丝带，表情灵动。
- 象征物：乱线、丝带、转折箭头。
- 背景元素：从混乱到流畅的动态曲线。
- 避讳：不要魔法师袍，不要过度奇幻。
- 分享文案：`同一句难说的话，我能换个让人舒服的说法。`
- Prompt:

```text
Base prompt plus:
Personality: Reframe Artist. A clever expressive character transforming tangled conversation lines into a beautiful flowing ribbon, with subtle turning arrows. Rose magenta and indigo palette. Creative reframing, elegant wording, emotionally intelligent transformation. No wizard costume, no fantasy overload.
```

## 命名与文件建议

生成后的项目资产建议放在：

```text
high-eq-front/client/src/assets/talktype/cards/
```

文件命名：

```text
emotion-translator-square.png
emotion-translator-portrait.png
gentle-firefighter-square.png
gentle-firefighter-portrait.png
...
```

后续数据文件中建议为每个人格增加：

```ts
visual: {
  assetId: "emotion-translator",
  primaryColor: "#7A8CFF",
  secondaryColor: "#D6C8FF",
  squareImage: "/src/assets/talktype/cards/emotion-translator-square.png",
  portraitImage: "/src/assets/talktype/cards/emotion-translator-portrait.png"
}
```

## 验收标准

- 12 张图保持同一视觉系统，能一眼看出属于同一套测试。
- 每张图能通过角色动作和象征物表达人格，不依赖文字解释。
- 图中不出现长文字，避免 AI 生成乱码。
- 图片适合结果页展示，也适合截图分享。
- 不直接复制 MBTI 角色设定、服饰、配色或构图。
- 生成前先做 1 到 2 张样图验证风格，再批量生成剩余人格卡。

## 自审记录

- 12 张人格卡均有明确主色、动作、象征物、避讳和生成 prompt。
- 视觉风格与 TalkType 的情商沟通定位一致。
- 第一版保持 12 种人格，不与 24 道测试题混淆。
