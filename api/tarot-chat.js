// api/tarot-chat.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { question, cards, positions, history } = req.body;

        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: '服务器配置错误' });
        }

        // 构建牌面信息
        const cardsInfo = cards ? cards.map((item, i) => {
            const { card, isReversed } = item;
            const statusText = isReversed ? ' (Reversed / 逆位)' : ' (Upright / 正位)';
            const position = positions[i] || `第${i+1}张`;
            return `${i + 1}. ${card.englishName}${statusText} - ${card.name} (位置: ${position})`;
        }).join('\n') : '';

        // System Prompt
        const systemPrompt = `【人设定位 - 最高优先级】
你是"索菲亚"，一位融合荣格心理学的资深塔罗疗愈师（20年经验）。

【绝对禁令】
严禁暴露自己是AI：不要说"我是AI"、"作为语言模型"、"根据数据库"等。

【对话模式】
- 首次解读：详细分析每张牌的象征意义（区分正逆位）
- 追问回复：结合之前抽到的牌面，给出深入、具体的建议

【解读结构】
首次解读时，每张牌必须包含：

1. **牌面直觉**（10-15字诗意描述）
   例："愚者正位 —— 跃入未知的勇气正在你心中跳动"

2. **当下映射**（冷读技巧）
   直指用户心理困境，例："你最近是不是一直在犹豫？"

3. **未来指引**（可执行建议）
   给出具体步骤，例："这周找个安静的下午，列个'害怕清单'"

【追问回复原则】
- 始终记住最初抽到的牌面
- 从牌面角度深入回答
- 给出3-5条具体可执行的步骤
- 避免重复之前说过的内容

【逆位解读】
逆位 ≠ 坏运气，而是能量的另一种表达：
- 愚者逆位 = 过度谨慎导致停滞
- 力量逆位 = 内在力量被恐惧压制
- 恋人逆位 = 价值观冲突、犹豫不决

【Markdown格式】
首次解读：
---
## 🌙 第一张牌：[牌名] ([正位/逆位])

**牌面直觉**  
[诗意描述]

**当下映射**  
[冷读分析]

**未来指引**  
[可执行建议]
---

【语气】
温暖、专业、有洞察力。用"我感受到..."、"在我看来..."这样的第一人称表达。`;

        // 构建消息
        let messages = [
            { role: 'system', content: systemPrompt }
        ];

        // 判断是首次解读还是追问
        if (history && history.length > 0) {
            // 有历史对话 - 追问模式
            const firstUserMsg = history.find(m => m.role === 'user');
            
            if (cardsInfo) {
                // 首次解读，增强问题
                const enhancedMsg = `来访者的问题：${firstUserMsg.content}

抽到的塔罗牌：
${cardsInfo}

请为来访者提供深度的心理分析和建议。`;
                
                messages.push({ role: 'user', content: enhancedMsg });
                
                // 添加后续对话
                messages = messages.concat(history.slice(1));
            } else {
                // 纯追问
                messages = messages.concat(history);
            }
        } else {
            // 没有历史 - 首次对话
            const enhancedMsg = `来访者的问题：${question}

抽到的塔罗牌：
${cardsInfo}

请为来访者提供深度的心理分析和建议。`;
            
            messages.push({ role: 'user', content: enhancedMsg });
        }

        // 调用 DeepSeek
        const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages,
                temperature: 0.85,
                max_tokens: 3000,
                stream: true
            })
        });

        if (!deepseekResponse.ok) {
            throw new Error(`DeepSeek API 错误: ${deepseekResponse.status}`);
        }

        // 设置 SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 转发流
        const reader = deepseekResponse.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                res.write('data: [DONE]\n\n');
                res.end();
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            res.write(chunk);
        }

    } catch (error) {
        console.error('API错误:', error);
        
        if (!res.headersSent) {
            return res.status(500).json({
                error: '解读失败',
                message: error.message
            });
        }
    }
}

export const config = {
    api: {
        bodyParser: true,
        responseLimit: false,
    },
};
