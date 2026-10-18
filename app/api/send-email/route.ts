// ==========================================
    // ★ゴフクヤサン秘伝のチューニング（プロンプト増幅器・最終進化版）
    // ==========================================
    
    // 1. デジナ基準のベース指定（モナリザ出力用の完全平面・高解像度データ）
    let baseInstruction = "Flat overhead shot, perfectly seamless 2D textile pattern graphic design. Intended for Epson Monna Lisa high-end digital textile printing on silk. High resolution, crisp details, vivid color separation, no halftone dots. ";

    // 2. 配置と構図の最適化（密度の反映）
    let layoutInstruction = density === '総柄（ぎっしり華やか）'
      ? "Continuous all-over repeating pattern, densely packed motifs, rich and gorgeous layout with minimal negative space."
      : "Scattered motifs with elegant negative space, refined traditional Japanese layout, well-balanced floating elements.";

    // 3. 画風・質感（筆致）の自動検知と英語プロンプトへの超変換
    let tunedStyle = 'Masterpiece, highly detailed digital textile design. ';
    
    if (motif.includes('浮世絵')) tunedStyle += 'Ukiyo-e woodblock print aesthetic, flat bold colors, precise ink outlines, Edo period traditional art style. ';
    if (motif.includes('京友禅')) tunedStyle += 'Kyo-Yuzen dyeing style, delicate line art, elegant and refined motifs, soft gradation, subtle gold leaf accents. ';
    if (motif.includes('水彩画')) tunedStyle += 'Soft pastel watercolor wash, delicate color blending, transparent and gentle texture. ';
    if (motif.includes('油絵')) tunedStyle += 'Thick impasto oil painting style, visible rich brushstrokes, expressive texture, deep color saturation. ';
    if (motif.includes('アールヌーヴォー')) tunedStyle += 'Art Nouveau style, Alphonse Mucha aesthetic, elegant flowing curves, intricate floral ornaments. ';
    if (motif.includes('アールデコ')) tunedStyle += 'Art Deco style, geometric elegance, symmetrical balance, 1920s glamour, gold and black contrasts. ';
    if (motif.includes('ミッドセンチュリー')) tunedStyle += 'Mid-century modern textile, organic abstract shapes, retro color palette, minimal and stylish. ';
    if (motif.includes('70sサイケ')) tunedStyle += '70s psychedelic pop art, vibrant contrasting colors, wavy hypnotic patterns, retro groovy vibe. ';
    if (motif.includes('大正ロマン') || motif.includes('昭和レトロ')) tunedStyle += 'Taisho Roman retro style, nostalgic Japanese aesthetic, Takehisa Yumeji style, vintage modern crossover. ';
    if (motif.includes('スチームパンク')) tunedStyle += 'Steampunk aesthetic, brass clockwork, gears and cogs, Victorian industrial fantasy, metallic accents. ';
    if (motif.includes('ゴスロリ')) tunedStyle += 'Gothic Lolita aesthetic, dark elegant fantasy, intricate black lace borders, decadent beauty, mysterious mood. ';
    if (motif.includes('ゆめかわいい')) tunedStyle += 'Dreamy kawaii style, pastel color palette, magical girl aesthetic, sparkling stars, soft fluffy texture. ';

    // 4. NG要素の徹底排除（布地スキャナーの鉄則＆炎上回避）
    const negativePrompt = "Absolutely NO humans, NO faces, NO body parts, NO clothing items being worn. NO 3D perspective, NO fabric folds, NO wrinkles, NO lighting/shadow effects, NO background scenes. The image MUST consist ONLY of the repeating pattern motifs on the solid background color.";

    // 最終的なプロンプトの組み立て
    const prompt = `
${baseInstruction}
${layoutInstruction}

【Textile Requirements】
Motifs: ${motif}
Background Color: Solid ${color}
Format: ${ratioInstruction}

【Art Style & Texture】
${tunedStyle}

【Strict Restrictions】
${negativePrompt}
`;
