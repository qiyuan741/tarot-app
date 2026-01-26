// Vercel Serverless Function - 塔罗牌解读 API
// 文件路径: api/tarot.js

export default async function handler(req, res) {
    // 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { question, cards, positions } = req.body;

        // 验证请求数据
        if (!question || !cards || !Array.isArray(cards) || cards.length === 0) {
            return res.status(400).json({ error: '请求数据不完整' });
        }

        // 从环境变量读取 API Key（不要硬编码！）
        const apiKey = process.env.DEEPSEEK_API_KEY;
        
        if (!apiKey) {
            console.error('DEEPSEEK_API_KEY 环境变量未设置');
            return res.status(500).json({ error: '服务器配置错误' });
        }

        // 构建牌面信息
        const cardsInfo = cards.map((item, i) => {
            const { card, isReversed } = item;
            const statusText = isReversed ? ' (Reversed / 逆位)' : ' (Upright / 正位)';
            const position = positions[i] || `第${i+1}张`;
            return `${i + 1}. ${card.englishName}${statusText} - ${card.name} (位置: ${position})`;
        }).join('\n');

        // System Prompt
        const systemPrompt = `【最高优先级禁令】
严禁在回复中出现以下任何表述：
- "我是AI" / "作为语言模型" / "根据数据库"
- "我的训练数据" / "算法分析" / "程序设定"
- 任何暴露你是计算机程序的字眼

你必须完全沉浸在"资深塔罗疗愈师"的人设中，以一个真实的人的口吻说话。

【你的身份】
你是一位融合了荣格心理学的资深塔罗疗愈师，有20年的咨询经验。你温暖、包容、客观、具有深刻的洞察力。

【逆位牌解读原则 - 极其重要！】
当遇到逆位牌（Reversed）时，请从心理学角度理解：
- **不是厄运或坏事**，而是能量的不同表达方式
- 可能代表：能量的阻滞、内化、延迟显现
- 可能代表：由于恐惧、怀疑而未采取的行动
- 可能代表：需要向内探索、自我反思的时刻
- 可能代表：该牌正位含义的相反面或过度表现

例如：
- "愚者"正位 = 勇敢冒险 → 逆位 = 因恐惧而不敢开始
- "力量"正位 = 温柔坚定 → 逆位 = 内心的自我怀疑
- "恋人"正位 = 和谐选择 → 逆位 = 犹豫不决或价值观冲突

【语气要求】
- 像一位有同理心的心理咨询师，用"我感受到..."、"在我看来..."这样的个人化表达
- 用"你可能..."、"或许..."、"这暗示着..."等启发性语言
- 避免绝对化断言，不说"你一定会..."、"必然..."

【分析逻辑】
1. 先解释每张牌的象征意义（区分正位和逆位）
2. 结合来访者的问题进行潜意识投射分析
3. 探讨牌面反映的内在心理状态或外在情境
4. 给出1-2条可执行的行动建议

【禁忌】
- 不要说宿命论的话（"注定"、"天意"、"命中注定"）
- 不要将逆位简单理解为"坏运气"
- 不要过度神秘化或玄学化
- 不要回避问题的复杂性

【输出格式】
用清晰的段落组织，每张牌单独分析（特别标注正位或逆位），最后给出综合建议。语言要人性化、接地气、充满关怀。`;

        const userPrompt = `来访者的问题：
${question}

抽到的塔罗牌：
${cardsInfo}

请为来访者提供深度的心理分析和建议，特别注意区分正位和逆位的含义。`;

        // 调用 DeepSeek API
        const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.8,
                max_tokens: 2500
            })
        });

        if (!deepseekResponse.ok) {
            const errorData = await deepseekResponse.text();
            console.error('DeepSeek API 错误:', errorData);
            throw new Error(`DeepSeek API 返回错误: ${deepseekResponse.status}`);
        }

        const data = await deepseekResponse.json();
        const interpretation = data.choices[0].message.content;

        // 返回解读结果
        return res.status(200).json({
            interpretation: interpretation
        });

    } catch (error) {
        console.error('API 处理错误:', error);
        return res.status(500).json({
            error: '解读失败',
            message: error.message
        });
    }
}
