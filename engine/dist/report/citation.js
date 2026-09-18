// report/citation.ts — 引文核验叶子模块（轮 14 审计返工 C1：破 generate↔narrative 循环 import）
// 纯逻辑约束同 generate.ts：输入一律注入、无 fs/子进程/网络/LLM。
// 此模块为零依赖叶子：generate.ts 与 narrative.ts 均从这里取引文核验与 UNVERIFIED_MARK。
//
// #56 / D-065 语义边界（文档化命名——TIST 命名即判据）：
//   supports = presence-level 字面锚在场判定：required_tokens 在引文 excerpt 中逐字命中，
//   且命中点经确定性语境剥离（引语/归属包裹掩蔽＋pre/post 否定窗 cue 表＋伪否定豁免表
//   ＋CJK 独立否定词表）后仍存活。**supports 不是语义蕴含**——改写/同义而字面锚缺席者
//   不升级（FN 类如实披露，归 human-in-loop 复核，D-053④；kernel 内禁 NLI/概率模型，D-058）。
//   fail-safe 从严：语境不确定的命中不计入 supports（宁 insufficient 勿误 supports）。
//   输出空间维持二态 supports/insufficient，不加第三态（D-045 / D-065）。
//   context_flags 词表（机读）：absent:<tok>（字面缺席）/ context-stripped:<tok>（剥离吞没）/
//   negated:<tok>:<kind>@<pos>（否定窗 cue 命中）/ non-asserted:<tok>:<kind>@<pos>（假想·示例语境，
//   非否定但非断言式主张——r18 审计 O2 名实对齐）/ verdict-label:<tok>:@<pos>（cue 词作裁决标签位）/
//   <span-kind>@<pos>（引语/归属/言语/悬挂引号剥离区段）。
export const UNVERIFIED_MARK = '⚠ unverified';
// ---------- D-065 语义边界披露（机读常量——56-check 断言其在位） ----------
export const PRESENCE_LIMITS = {
    semantics: 'presence-level 字面锚在场判定（语境剥离后逐字命中），非语义蕴含判定',
    output_states: ['supports', 'insufficient'],
    fn_disclosure: '改写/同义语义在场但字面锚缺席者如实判 insufficient——语义召回缺口归 human-in-loop 复核（D-053④）；kernel 内禁 NLI/概率模型（D-058）',
    adversarial_fp_guard: '否定窗/引语包裹/归属引导内的字面命中经语境剥离后不计 supports；不确定语境从严降级 insufficient',
};
// ---------- D-065 预声明窗口与四张确定性表（kernel 内零外源） ----------
/** 预声明窗口（字符）：命中点向前找 pre-negation cue 的最大距离。 */
export const NEG_WINDOW_PRE = 60;
/** 预声明窗口（字符）：命中点向后找 post-negation cue 的最大距离（后置否定短，例「X 不成立」）。 */
export const NEG_WINDOW_POST = 40;
/** 归属引导语掩蔽尾长（字符）：引导词到其归属段末（句读或长度先到者）。 */
export const ATTRIBUTION_TAIL = 80;
/** 引语前置言语/归属 cue 回溯窗（字符）。 */
export const SPEECH_LOOKBACK = 24;
/** pre-negation cue 表（EN，词边界匹配；n't 特例只查右界） */
const EN_PRE_NEG_CUES = [
    'not', 'no', 'never', "n't", 'cannot', 'do not', 'does not', 'did not',
    'is not', 'are not', 'was not', 'were not', 'has not', 'have not', 'had not',
    'will not', 'would not', 'should not', 'could not', 'must not', 'shall not',
    'without', 'deny', 'denies', 'denied', 'refute', 'refutes', 'refuted',
    'reject', 'rejects', 'rejected', 'fail', 'fails', 'failed', 'lack', 'lacks', 'lacked',
    'absence of', 'free of', 'devoid of', 'instead of', 'rather than', 'far from',
    'hardly', 'scarcely', 'barely', 'rarely', 'seldom', 'doubt', 'doubts', 'doubted',
    'unlikely', 'impossible', 'no evidence', 'unsupported', 'unproven', 'unverified',
    'unconfirmed', 'below', 'under', 'less than', 'fewer than', 'short of', 'at most',
    'up to', 'no more than', 'other than', 'contrary to', 'lacking',
];
/** non-asserted context cue 表（EN——假想/示例语境标记：非否定，但该处提及非断言式主张；
    与否定 cue 同置剥离面（fail-safe），flag kind 单列 'non-asserted' 以名实对齐（r18 审计 O2） */
/** post-negation cue 表（EN，命中点之后短窗） */
const EN_POST_NEG_CUES = [
    'not', "n't", 'never', 'cannot', 'could not', 'did not', 'does not', 'is not',
    'was not', 'were not', 'will not', 'would not', 'should not', 'must not', 'no longer',
    'no more', 'false', 'incorrect', 'invalid',
    'absent', 'missing', 'unsupported', 'untrue', 'wrong', 'denied', 'refuted', 'rejected',
    'unverified', 'unconfirmed', 'unproven', 'questionable', 'dubious', 'insufficient',
    'inadequate', 'unreached', 'unmet', 'lacking', 'unreliable', 'disproven', 'disproved', 'negated',
];
/** non-asserted context cue 表（EN——假想/示例语境标记：非否定，但该处提及非断言式主张；
    与否定 cue 同走剥离窗（fail-safe），flag kind 单列 'non-asserted' 名实对齐（r18 审计 O2） */
const EN_NON_ASSERT_CUES = [
    'for example', 'e.g.', 'for instance', 'as an example', 'as a hypothetical',
    'suppose', 'supposing', 'assuming', 'imagine', 'in theory', 'hypothetical',
    'hypothetically', 'fictional', 'illustrative', 'if it were',
];
/** pseudo-negation 豁免表（EN——形似否定实为肯定/修辞；cue 命中其覆盖区即作废） */
const EN_PSEUDO_NEG = [
    'not only', 'not just', 'not merely', 'not simply', 'no doubt', 'not necessarily',
    'not because', 'notwithstanding', 'cannot but', 'not to mention', 'make no mistake',
    'not for nothing', 'whether or not', 'no wonder', 'nothing but', 'none but',
    'nothing short of', 'no less than', 'not half bad', 'more often than not',
    'not impossible', 'not uncommon', 'not unheard', 'not without', 'cannot help',
];
/** pre-negation cue 表（CJK 独立词表——不 port 英文表；子串匹配无词边界） */
const CJK_PRE_NEG_CUES = [
    '不', '没', '未', '无', '非', '否', '别', '莫', '勿', '毋',
    '缺乏', '缺少', '缺失', '欠缺', '否认', '拒绝', '反对', '质疑',
    '并非', '并无', '不再', '不会', '不能', '不可', '不是', '不对', '不成立', '不正确', '不属实',
    '没有', '未有', '未能', '无法', '无从', '无效', '未见', '未达', '不足', '不够', '不达标',
    '鲜有', '罕见', '低于', '弱于', '不及', '达不到',
];
/** post-negation cue 表（CJK） */
const CJK_POST_NEG_CUES = [
    '不成立', '不正确', '不属实', '不实', '不存在', '未见', '未能', '无法', '无从',
    '不足', '不够', '未达', '不达标', '低于', '缺席', '缺失', '缺乏', '欠缺',
    '为假', '为误', '系误', '有误', '存疑', '可疑', '不可靠', '无效', '失真',
];
/** pseudo-negation 豁免表（CJK——双重否定与固定词形非否定） */
const CJK_PSEUDO_NEG = [
    '不得不', '不能不', '不可不', '不无', '未必不', '并非不', '不是不', '不曾不', '未尝不', '未曾不',
    '非常', '非凡', '非同小可', '无可厚非', '非但', '莫非', '否则',
    '无缝', '无限', '无比', '无价', '无形', '无色', '无声', '无毒', '无害', '无副作用',
    '无缘无故', '无非', '无论', '无辜', '无私', '无畏', '无疑', '毫无疑问', '别人', '别处', '别的', '别样', '莫名其妙',
];
/** 引语包裹模式表（自设计）——成对引号；剥离条件=归属 cue 前置或引文为语句形态 */
const CUE_TOKEN_SET = new Set(EN_PRE_NEG_CUES.concat(EN_POST_NEG_CUES, CJK_PRE_NEG_CUES, CJK_POST_NEG_CUES));
const QUOTE_PAIRS = [
    { open: '“', close: '”' }, { open: '‘', close: '’' },
    { open: '「', close: '」' }, { open: '『', close: '』' },
    { open: '"', close: '"' },
];
/** 归属引导语表（第三方主张——引导词至句读或 ATTRIBUTION_TAIL 掩蔽） */
const ATTRIBUTION_LEADS = [
    '据称', '据说', '传说', '据悉', '有报道称', '有报告指出', '第三方称', '他人主张', '引用称', '引述称',
    '有文献称', '有资料称', '外界认为', '有评论称', '有网友称', '闻称',
    'according to', 'as reported by', 'others claim', 'they claim', 'critics say',
    'allegedly', 'purportedly', 'it is claimed', 'it is alleged', 'sources say', 'reports say',
];
/** 言语/归属 cue 表（引语前置回溯用；EN 词边界、CJK 子串） */
const EN_SPEECH_CUES = [
    'said', 'says', 'say', 'claimed', 'claims', 'claim', 'argued', 'argues', 'argue',
    'asserted', 'asserts', 'stated', 'states', 'wrote', 'writes', 'alleges', 'alleged',
    'quotes', 'quoted', 'according to', 'per',
    'mentions', 'mentioned', 'notes', 'noted', 'cites', 'cited', 'reports', 'reported',
    'warns', 'warned', 'suggests', 'suggested', 'implies', 'implied', 'describes',
    'described', 'remarks', 'remarked', 'observes', 'observed', 'contends', 'contended',
];
const CJK_SPEECH_CUES = [
    '说', '称', '指出', '认为', '声称', '断言', '写道', '表示', '强调', '质疑',
    '引述', '评论', '批评', '主张', '问道', '答曰', '曰',
    '提到', '提及', '暗示', '警告', '注明', '记载', '记录为', '描述为',
];
/** 伪言语豁免表（CJK——含言语字但非言语行为的固定词形） */
const CJK_SPEECH_PSEUDO = [
    '名称', '简称', '对称', '俗称', '称呼', '称谓', '统称', '别称', '美称',
    '小说', '说教', '说笑', '说法', '图说', '难说',
    '不得不说', '不能说', '不必说', '没话说', '无话可说',
];
function isWordChar(ch) {
    return ch !== undefined && /[A-Za-z0-9_]/.test(ch);
}
/** 语句形态判定：多词句/双语长句/含句读终结符或 ≥6 CJK 字——语句（他人主张）而非术语引用；单词词组（含长 snake_case 键名）恒为术语不剥 */
function isClauseLike(s) {
    const words = s.trim().split(/\s+/).filter(function (w) { return w.length > 0; });
    const cjkCount = (s.match(/[一-鿿]/g) || []).length;
    return words.length >= 3 || (words.length >= 2 && s.trim().length >= 12) || /[，。；：？！!?]/.test(s) || cjkCount >= 6;
}
/** EN cue 词边界扫描（n't 特例：左界必为词字符故只查右界） */
function enCuesIn(text, cues) {
    const lower = text.toLowerCase();
    const out = [];
    for (const cue of cues) {
        let i = 0;
        while (true) {
            i = lower.indexOf(cue, i);
            if (i < 0) {
                break;
            }
            const left = i > 0 ? lower[i - 1] : ' ';
            const right = i + cue.length < lower.length ? lower[i + cue.length] : ' ';
            const boundary = cue === "n't" ? !isWordChar(right) : (!isWordChar(left) && !isWordChar(right));
            if (boundary) {
                out.push({ start: i, end: i + cue.length, kind: 'cue' });
            }
            i += cue.length;
        }
    }
    return out;
}
function substrCuesIn(text, cues, offset) {
    const out = [];
    for (const cue of cues) {
        let i = 0;
        while (true) {
            i = text.indexOf(cue, i);
            if (i < 0) {
                break;
            }
            out.push({ start: offset + i, end: offset + i + cue.length, kind: 'cue' });
            i += cue.length;
        }
    }
    return out;
}
function intersects(a, spans) {
    return spans.some(function (s) { return a.start < s.end && s.start < a.end; });
}
/** 语境剥离：引语包裹（归属 cue 或语句形态）＋归属引导段＋未闭合引号 fail-safe——返回等长掩蔽文本与命中区表 */
function stripContexts(excerpt) {
    const spans = [];
    const lower = excerpt.toLowerCase();
    // 1) 成对引号：归属 cue 前置（SPEECH_LOOKBACK 内）或内容语句形态 → 掩蔽；
    //    配对位不论剥离与否均登记（防止术语引号被误判悬挂开号）
    const paired = new Array(excerpt.length).fill(false);
    for (const pair of QUOTE_PAIRS) {
        let pos = 0;
        while (true) {
            const o = excerpt.indexOf(pair.open, pos);
            if (o < 0) {
                break;
            }
            const c = excerpt.indexOf(pair.close, o + pair.open.length);
            if (c < 0) {
                break;
            }
            for (let k = o; k < c + pair.close.length; k++) {
                paired[k] = true;
            }
            const inner = excerpt.slice(o + pair.open.length, c);
            const lookback = lower.slice(Math.max(0, o - SPEECH_LOOKBACK), o);
            const hasSpeech = enCuesIn(lookback, EN_SPEECH_CUES).length > 0 || CJK_SPEECH_CUES.some(function (cue) { return lookback.indexOf(cue) >= 0; });
            if (hasSpeech || isClauseLike(inner)) {
                spans.push({ start: o, end: c + pair.close.length, kind: 'quoted' });
            }
            pos = c + pair.close.length;
        }
    }
    // 2) 归属引导段：lead → 句读（。；！？\n;:）或 ATTRIBUTION_TAIL 先到者掩蔽
    for (const lead of ATTRIBUTION_LEADS) {
        let i = 0;
        const leadLower = lead.toLowerCase();
        while (true) {
            i = lower.indexOf(leadLower, i);
            if (i < 0) {
                break;
            }
            let end = Math.min(excerpt.length, i + ATTRIBUTION_TAIL);
            const tail = excerpt.slice(i + leadLower.length, end);
            const cut = tail.search(/[。；！？\n;:]/);
            if (cut >= 0) {
                end = i + leadLower.length + cut + 1;
            }
            spans.push({ start: i, end: end, kind: 'attributed' });
            i = end;
        }
    }
    // 3) 言语子句剥离：speech cue → 最近句读/转折边界或 ATTRIBUTION_TAIL 先到者掩蔽
    //    （无引号归属："the doc says X but our config disables them"——says 其后子句归属第三方）
    const SPEECH_BOUNDARY = /[，,、。；;!！?？:：\n]|\b(but|however|though|although|whereas|while|yet)\b|但/;
    const speechCues = enCuesIn(excerpt, EN_SPEECH_CUES).concat(substrCuesIn(excerpt, CJK_SPEECH_CUES, 0));
    const speechPseudo = substrCuesIn(excerpt, CJK_SPEECH_PSEUDO, 0);
    for (const sc of speechCues) {
        if (intersects(sc, spans) || intersects(sc, speechPseudo)) {
            continue;
        }
        let end = Math.min(excerpt.length, sc.start + ATTRIBUTION_TAIL);
        const tail = excerpt.slice(sc.end, end);
        const cut = tail.search(SPEECH_BOUNDARY);
        if (cut >= 0) {
            end = sc.end + cut;
        }
        spans.push({ start: sc.start, end: end, kind: 'speech-quoted' });
    }
    // 4) 未闭合引号 fail-safe：扫描已掩蔽区外的悬挂开/闭号
    const masked = new Array(excerpt.length).fill(false);
    for (const s of spans) {
        for (let k = s.start; k < s.end; k++) {
            masked[k] = true;
        }
    }
    const closers = { '”': '“', '’': '‘', '」': '「', '』': '『' };
    for (let k = 0; k < excerpt.length; k++) {
        if (masked[k]) {
            continue;
        }
        const ch = excerpt[k];
        // 悬挂开号（“‘「『）→ 掩蔽至文末；悬挂 " 开闭歧义不可判 → 全篇掩蔽（fail-safe 从严）；已配对位豁免
        if ((ch === '“' || ch === '‘' || ch === '「' || ch === '『') && !paired[k]) {
            spans.push({ start: k, end: excerpt.length, kind: 'unbalanced-quote' });
            break;
        }
        if (ch === '"' && !paired[k]) {
            spans.push({ start: 0, end: excerpt.length, kind: 'unbalanced-quote' });
            break;
        }
        // 悬挂闭号（”’」』）→ 掩蔽文首至此（fail-safe：其前文本可能是未配对的引语）；已配对位豁免
        if (closers[ch] !== undefined && !paired[k]) {
            spans.push({ start: 0, end: k + 1, kind: 'unbalanced-quote' });
            break;
        }
    }
    // 生成等长掩蔽文本（剥离区→空格，保位）
    const chars = excerpt.split('');
    for (const s of spans) {
        for (let k = s.start; k < s.end; k++) {
            chars[k] = ' ';
        }
    }
    return { text: chars.join(''), spans: spans };
}
/** 否定窗检测：命中点 [start,end) 的前窗查 pre-cues、后窗查 post-cues；命中伪否定覆盖区即豁免 */
function negationHits(maskedText, start, end, pseudoSpans) {
    const hits = [];
    const preWin = maskedText.slice(Math.max(0, start - NEG_WINDOW_PRE), start);
    const postWin = maskedText.slice(end, Math.min(maskedText.length, end + NEG_WINDOW_POST));
    const enPre = enCuesIn(preWin, EN_PRE_NEG_CUES).map(function (s) { return { start: Math.max(0, start - NEG_WINDOW_PRE) + s.start, end: Math.max(0, start - NEG_WINDOW_PRE) + s.end, kind: 'pre-neg' }; });
    const cjkPre = substrCuesIn(preWin, CJK_PRE_NEG_CUES, Math.max(0, start - NEG_WINDOW_PRE)).map(function (s) { return { start: s.start, end: s.end, kind: 'pre-neg' }; });
    const enPost = enCuesIn(postWin, EN_POST_NEG_CUES).map(function (s) { return { start: end + s.start, end: end + s.end, kind: 'post-neg' }; });
    const cjkPost = substrCuesIn(postWin, CJK_POST_NEG_CUES, end).map(function (s) { return { start: s.start, end: s.end, kind: 'post-neg' }; });
    for (const h of enPre.concat(cjkPre, enPost, cjkPost)) {
        if (intersects(h, pseudoSpans)) {
            continue;
        }
        // 赋值豁免：cue 紧邻 '=' 右侧（allow=never / mode=false 等配置取值非主张否定）
        let j = h.start - 1;
        while (j >= 0 && maskedText[j] === ' ') {
            j--;
        }
        if (j >= 0 && maskedText[j] === '=') {
            continue;
        }
        hits.push(h);
    }
    return hits;
}
/** 伪否定覆盖区全表（一次全文扫描；EN 词边界、CJK 子串） */
function pseudoSpansOf(maskedText) {
    const en = enCuesIn(maskedText, EN_PSEUDO_NEG).map(function (s) { return { start: s.start, end: s.end, kind: 'pseudo' }; });
    const cjk = substrCuesIn(maskedText, CJK_PSEUDO_NEG, 0).map(function (s) { return { start: s.start, end: s.end, kind: 'pseudo' }; });
    return en.concat(cjk);
}
export function checkCitationSupport(claim, evidence) {
    const flags = [];
    if (!evidence.grounded || evidence.excerpt.length === 0) {
        return { claim_id: claim.claim_id, evidence_id: evidence.evidence_id, support: 'insufficient', matched_tokens: [], missing_tokens: claim.required_tokens.slice(), context_flags: flags, reason: '引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论' };
    }
    const stripped = stripContexts(evidence.excerpt);
    const hay = stripped.text.toLowerCase();
    const pseudoSpans = pseudoSpansOf(hay);
    const matched = [];
    const missing = [];
    for (const tok of claim.required_tokens) {
        const needle = tok.toLowerCase();
        let pos = hay.indexOf(needle);
        let clean = false;
        const negCues = [];
        while (pos >= 0) {
            const hits = negationHits(hay, pos, pos + needle.length, pseudoSpans);
            // 裁决标签位：锚本身是否定 cue 且紧邻 ':'（unsupported: / 不成立: 等标签非内容）
            const labelLike = CUE_TOKEN_SET.has(needle) && hay[pos + needle.length] === ':';
            if (hits.length === 0 && !labelLike) {
                clean = true;
                break;
            }
            if (labelLike) {
                negCues.push({ klass: 'verdict-label', tag: '@' + pos });
            }
            for (const h of hits) {
                negCues.push({ klass: (h.kind === 'pre-ctx' || h.kind === 'post-ctx') ? 'non-asserted' : 'negated', tag: h.kind + '@' + pos });
            }
            pos = hay.indexOf(needle, pos + 1);
        }
        if (clean) {
            matched.push(tok);
        }
        else {
            missing.push(tok);
            if (pos === -1 && negCues.length === 0) {
                // 全文无存活命中：区分「剥离吞没」与「字面缺席」
                if (hay.indexOf(needle) < 0 && evidence.excerpt.toLowerCase().indexOf(needle) >= 0) {
                    flags.push('context-stripped:' + tok);
                }
                else {
                    flags.push('absent:' + tok);
                }
            }
            else {
                for (const c of negCues) {
                    flags.push(c.klass + ':' + tok + ':' + c.tag);
                }
            }
        }
    }
    for (const s of stripped.spans) {
        flags.push(s.kind + '@' + s.start);
    }
    flags.sort();
    if (missing.length === 0) {
        return { claim_id: claim.claim_id, evidence_id: evidence.evidence_id, support: 'supports', matched_tokens: matched, missing_tokens: [], context_flags: flags, reason: '全部支撑锚在引文原文中逐字命中（语境剥离后 presence-level 成立——非语义蕴含）' };
    }
    return { claim_id: claim.claim_id, evidence_id: evidence.evidence_id, support: 'insufficient', matched_tokens: matched, missing_tokens: missing, context_flags: flags, reason: '支撑锚未命中或语境剥离（否定/引语/归属窗）：' + missing.join(', ') };
}
export function checkAllCitations(claims, evidence) {
    const index = {};
    for (const e of evidence) {
        index[e.evidence_id] = e;
    }
    const out = [];
    for (const c of claims) {
        const e = index[c.evidence_id];
        if (!e) {
            out.push({ claim_id: c.claim_id, evidence_id: c.evidence_id, support: 'insufficient', matched_tokens: [], missing_tokens: c.required_tokens.slice(), context_flags: [], reason: '引文锚不可解析（evidence_id 不存在）' });
            continue;
        }
        out.push(checkCitationSupport(c, e));
    }
    return out;
}
