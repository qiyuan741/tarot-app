// 塔罗牌数据
const TAROT_CARDS = [
    { name: "愚者", symbol: "🃏", englishName: "The Fool" },
    { name: "魔术师", symbol: "🎩", englishName: "The Magician" },
    { name: "女祭司", symbol: "🌙", englishName: "The High Priestess" },
    { name: "皇后", symbol: "👑", englishName: "The Empress" },
    { name: "皇帝", symbol: "⚔️", englishName: "The Emperor" },
    { name: "教皇", symbol: "📿", englishName: "The Hierophant" },
    { name: "恋人", symbol: "💑", englishName: "The Lovers" },
    { name: "战车", symbol: "🏇", englishName: "The Chariot" },
    { name: "力量", symbol: "🦁", englishName: "Strength" },
    { name: "隐士", symbol: "🕯️", englishName: "The Hermit" },
    { name: "命运之轮", symbol: "🎡", englishName: "Wheel of Fortune" },
    { name: "正义", symbol: "⚖️", englishName: "Justice" },
    { name: "倒吊人", symbol: "🙃", englishName: "The Hanged Man" },
    { name: "死神", symbol: "💀", englishName: "Death" },
    { name: "节制", symbol: "🍵", englishName: "Temperance" },
    { name: "恶魔", symbol: "😈", englishName: "The Devil" },
    { name: "塔", symbol: "🗼", englishName: "The Tower" },
    { name: "星星", symbol: "⭐", englishName: "The Star" },
    { name: "月亮", symbol: "🌙", englishName: "The Moon" },
    { name: "太阳", symbol: "☀️", englishName: "The Sun" },
    { name: "审判", symbol: "📯", englishName: "Judgement" },
    { name: "世界", symbol: "🌍", englishName: "The World" }
];

// 添加小阿尔卡纳
const suits = [
    { suit: "权杖", symbol: "🔥", english: "Wands" },
    { suit: "圣杯", symbol: "💧", english: "Cups" },
    { suit: "宝剑", symbol: "⚔️", english: "Swords" },
    { suit: "星币", symbol: "💰", english: "Pentacles" }
];

suits.forEach(({suit, symbol, english}) => {
    for (let i = 1; i <= 10; i++) {
        const name = i === 1 ? `${suit}王牌` : `${suit}${i}`;
        const engName = i === 1 ? `Ace of ${english}` : `${i} of ${english}`;
        TAROT_CARDS.push({ name, symbol, englishName: engName });
    }
    ['侍从', '骑士', '王后', '国王'].forEach((court, idx) => {
        const courtEng = ['Page', 'Knight', 'Queen', 'King'][idx];
        TAROT_CARDS.push({
            name: `${suit}${court}`,
            symbol,
            englishName: `${courtEng} of ${english}`
        });
    });
});
