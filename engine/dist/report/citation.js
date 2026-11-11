// report/citation.ts —— 查引文站不站得住，单独放这儿
// 纯逻辑的老规矩跟 generate.ts 一样：输入全靠传进来，不碰文件系统、不起子进程、不连网、不调大模型。
// 这个模块谁也不靠：generate.ts 和 narrative.ts 都从这儿拿引文核对和 UNVERIFIED_MARK。
//
// 这条线划在哪儿：
// supports＝只认字面上看得到的锚：required_tokens 在引文 excerpt 里逐字撞上，
// 并且撞上的那一点，经过一套结果固定的语境剥离（引号和归属包裹先遮掉、前后否定窗的词表、
// 伪否定豁免表、中文单独的否定词表）之后还活着。注意 supports 不是「意思对上了」——
// 换了说法、同义但字面锚不在的，不往上升（漏判就照实说出来，交给人复核；内核里不许用任何概率模型）。
// 拿不准就往严里判：语境说不清的那些命中不算 supports（宁可说证据不够，不能错判成支持）。
// 出来的只有 supports/insufficient 两种，不添第三种。
// context_flags 这几个写法是给机器看的：absent:<tok>（字面就没有）/ context-stripped:<tok>（被剥离遮住了）
// / negated:<tok>:<kind>@<pos>（撞上否定词）/ non-asserted:<tok>:<kind>@<pos>（假设、举例那种语境，
// 不是否定但也不是在正儿八经地下结论）/ verdict-label:<tok>:@<pos>（cue 词被当成裁决标签用）/
// <span-kind>@<pos>（引号、归属、说话、悬挂引号被剥掉的那一段）。
export const UNVERIFIED_MARK = '⚠ unverified';
// ---------- 把这条线划在哪儿说清楚，做成机器能读的常量（测试要断言它还在） ----------
export const PRESENCE_LIMITS = {
    semantics: 'presence-level 字面锚在场判定（语境剥离后逐字命中），非语义蕴含判定',
    output_states: ['supports', 'insufficient'],
    fn_disclosure: '改写/同义语义在场但字面锚缺席者如实判 insufficient——语义召回缺口归 human-in-loop 复核；kernel 内禁 NLI/概率模型',
    adversarial_fp_guard: '否定窗/引语包裹/归属引导内的字面命中经语境剥离后不计 supports；不确定语境从严降级 insufficient',
};
// ---------- 事先定好的窗口和四张死表（内核里不靠外面任何东西） ----------
/** 事先定好的窗口（按字符）：从撞上那点往前找否定词，最远找多远。 */
export const NEG_WINDOW_PRE = 60;
/** 事先定好的窗口（按字符）：从撞上那点往后找否定词，最远找多远（后置否定一般短，比如「X 不成立」）。 */
export const NEG_WINDOW_POST = 40;
/** 归属引导语的遮罩尾长（按字符）：从引导词一直到它那段话结尾（碰到标点或长度先用完的那个）。 */
export const ATTRIBUTION_TAIL = 80;
/** 引号前面找说话/归属词的往回看窗口（按字符）。 */
export const SPEECH_LOOKBACK = 24;
// ---------- 词表就是判据 ----------
// 这几张 cue 表的注释都照一个模子写：动这张表就等于动 supports/insufficient 的判定面——改表有三件事必须做：
// ① 同一个提交里写清为什么改；② 评测集和基准对照的门槛不许跟着回调；
// ③ 严禁照着评测语料的标签来调参数。
// 规矩动了，提交里得照实记下来。
/** 否定词表（英文，按词边界匹配；n't 这种特例只看右边界）；词表就是判据——这张表一加一减，supports/insufficient 的结果就变了 */
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
/** 假设/举例语境的词表（英文——这类地方说的是「假如」「比如」，不是否定，但也不是在正儿八经下结论；
    与否定 cue 同置剥离面（fail-safe），flag kind 单列 'non-asserted' 以名实对齐（r18 审计 O2）；词表即判据——本表增删改变 supports/insufficient 判定面 */
/** 后置否定词表（英文，撞上那点之后的一小段）；词表就是判据——加一个减一个，supports/insufficient 的结果就变 */
const EN_POST_NEG_CUES = [
    'not', "n't", 'never', 'cannot', 'could not', 'did not', 'does not', 'is not',
    'was not', 'were not', 'will not', 'would not', 'should not', 'must not', 'no longer',
    'no more', 'false', 'incorrect', 'invalid',
    'absent', 'missing', 'unsupported', 'untrue', 'wrong', 'denied', 'refuted', 'rejected',
    'unverified', 'unconfirmed', 'unproven', 'questionable', 'dubious', 'insufficient',
    'inadequate', 'unreached', 'unmet', 'lacking', 'unreliable', 'disproven', 'disproved', 'negated',
];
/** 假设/举例语境的词表（英文——这类地方说的是「假如」「比如」，不是否定，但也不是在正儿八经下结论；
    与否定 cue 同走剥离窗（fail-safe），flag kind 单列 'non-asserted' 名实对齐（r18 审计 O2） */
const EN_NON_ASSERT_CUES = [
    'for example', 'e.g.', 'for instance', 'as an example', 'as a hypothetical',
    'suppose', 'supposing', 'assuming', 'imagine', 'in theory', 'hypothetical',
    'hypothetically', 'fictional', 'illustrative', 'if it were',
];
/** 伪否定豁免表（英文——看着像否定其实是肯定或在打比方；cue 撞进它盖住的地方就作废）；词表就是判据——改了它就改判定面 */
const EN_PSEUDO_NEG = [
    'not only', 'not just', 'not merely', 'not simply', 'no doubt', 'not necessarily',
    'not because', 'notwithstanding', 'cannot but', 'not to mention', 'make no mistake',
    'not for nothing', 'whether or not', 'no wonder', 'nothing but', 'none but',
    'nothing short of', 'no less than', 'not half bad', 'more often than not',
    'not impossible', 'not uncommon', 'not unheard', 'not without', 'cannot help',
];
/** 否定词表（中文单独一份——不照英文那份搬；按子串匹配，没有词边界这回事）；词表就是判据——改了它就改判定面 */
const CJK_PRE_NEG_CUES = [
    '不', '没', '未', '无', '非', '否', '别', '莫', '勿', '毋',
    '缺乏', '缺少', '缺失', '欠缺', '否认', '拒绝', '反对', '质疑',
    '并非', '并无', '不再', '不会', '不能', '不可', '不是', '不对', '不成立', '不正确', '不属实',
    '没有', '未有', '未能', '无法', '无从', '无效', '未见', '未达', '不足', '不够', '不达标',
    '鲜有', '罕见', '低于', '弱于', '不及', '达不到',
];
/** 后置否定词表（中文）；词表就是判据——改了它就改判定面 */
const CJK_POST_NEG_CUES = [
    '不成立', '不正确', '不属实', '不实', '不存在', '未见', '未能', '无法', '无从',
    '不足', '不够', '未达', '不达标', '低于', '缺席', '缺失', '缺乏', '欠缺',
    '为假', '为误', '系误', '有误', '存疑', '可疑', '不可靠', '无效', '失真',
];
/** 伪否定豁免表（中文——双重否定和固定词形本来就不是否定）；词表就是判据——改了它就改判定面 */
const CJK_PSEUDO_NEG = [
    '不得不', '不能不', '不可不', '不无', '未必不', '并非不', '不是不', '不曾不', '未尝不', '未曾不',
    '非常', '非凡', '非同小可', '无可厚非', '非但', '莫非', '否则',
    '无缝', '无限', '无比', '无价', '无形', '无色', '无声', '无毒', '无害', '无副作用',
    '无缘无故', '无非', '无论', '无辜', '无私', '无畏', '无疑', '毫无疑问', '别人', '别处', '别的', '别样', '莫名其妙',
];
/** 假设/举例语境的词表（中文——说的是「假如」「比如」，不是否定，但也不是在下结论；
    与否定 cue 同走剥离窗（fail-safe），flag kind 单列 'non-asserted' 名实对齐。
    假想语境表与否定表对称并列：
    词表即判据——本表增删改变 supports/insufficient 判定面（改表三件义务见 EN_PRE_NEG_CUES 表头）；
    ≥2 字词形禁单字（子串误吞灾难）；「严格来说」不收（限定语非假想语境）；
    种子表一次先验声明，禁后续参照标签渐进调参 */
const CJK_NON_ASSERT_PRE_CUES = [
    '例如', '比如', '譬如', '举例来说', '比如说', '打个比方',
    '假设', '假定', '假如', '假若', '倘若', '倘使', '试想', '设想', '假想', '设若',
];
/** 假设/举例语境的词表（中文，撞上那点之后的一小段——在说「假设」「限定」这类口气；
    词表即判据——本表增删改变 supports/insufficient 判定面；「理论」不收「理论上」收（「理论物理」豁免） */
const CJK_NON_ASSERT_POST_CUES = [
    '理论上', '在理论上', '原则上', '纯属虚构', '仅为示例', '仅供参考',
];
/** 假设语境的豁免表（中文——「假设」这个词在科研写法里就是个名词，一词两用；
    词表即判据——本表增删改变 supports/insufficient 判定面；逐词过单测为验收点（文献记载 FP/FN 主源） */
const CJK_NON_ASSERT_PSEUDO = [
    '假说', '假设性', '零假设', '假设检验', '工作假设',
];
/** 引号包裹的样式表（自己定的）——成对引号；什么时候剥＝前面有归属词或者引文本身是一句话；词表就是判据——改了它就改判定面 */
const CUE_TOKEN_SET = new Set(EN_PRE_NEG_CUES.concat(EN_POST_NEG_CUES, CJK_PRE_NEG_CUES, CJK_POST_NEG_CUES));
const QUOTE_PAIRS = [
    { open: '“', close: '”' }, { open: '‘', close: '’' },
    { open: '「', close: '」' }, { open: '『', close: '』' },
    { open: '"', close: '"' },
];
/** 归属引导语表（别人说的话——从引导词遮到标点或者 ATTRIBUTION_TAIL，谁先到算谁）；词表就是判据——改了它就改判定面 */
const ATTRIBUTION_LEADS = [
    '据称', '据说', '传说', '据悉', '有报道称', '有报告指出', '第三方称', '他人主张', '引用称', '引述称',
    '有文献称', '有资料称', '外界认为', '有评论称', '有网友称', '闻称',
    'according to', 'as reported by', 'others claim', 'they claim', 'critics say',
    'allegedly', 'purportedly', 'it is claimed', 'it is alleged', 'sources say', 'reports say',
];
/** 说话/归属词表（往回看引号前面用；英文按词边界，中文按子串） */
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
/** 伪言语豁免表（中文——字面上带「说」但压根不是说话动作的固定词形）；词表就是判据——改了它就改判定面 */
const CJK_SPEECH_PSEUDO = [
    '名称', '简称', '对称', '俗称', '称呼', '称谓', '统称', '别称', '美称',
    '小说', '说教', '说笑', '说法', '图说', '难说',
    '不得不说', '不能说', '不必说', '没话说', '无话可说', '假说', '举例来说', '比如说',
];
function isWordChar(ch) {
    return ch !== undefined && /[A-Za-z0-9_]/.test(ch);
}
/** 判是不是一句话：好几个词、中英混着的长句、带句末标点、或者中文 ≥6 个字——这算一句话（别人说的），不是引用个术语；单个词（包括长 snake_case 键名）永远当术语，不剥 */
function isClauseLike(s) {
    const words = s.trim().split(/\s+/).filter(function (w) { return w.length > 0; });
    const cjkCount = (s.match(/[一-鿿]/g) || []).length;
    return words.length >= 3 || (words.length >= 2 && s.trim().length >= 12) || /[，。；：？！!?]/.test(s) || cjkCount >= 6;
}
/** 英文 cue 按词边界扫（n't 特例：左边肯定是词里的字，只管右边） */
function enCuesIn(text, cues, offset) {
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
                out.push({ start: offset + i, end: offset + i + cue.length, kind: 'cue' });
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
/** 语境剥离：引号包裹（有归属词或者本身就是句话）＋归属引导那一段＋没配对的引号按最严处理——返回一段等长的遮罩文本和命中区表 */
function stripContexts(excerpt) {
    const spans = [];
    const lower = excerpt.toLowerCase();
    // 1) 成对引号：前面有归属词（在 SPEECH_LOOKBACK 之内）或者里头是句话 → 遮掉；
    // 配对位置不管剥没剥都记下来（免得术语的引号被当成没配对的引号）
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
            const hasSpeech = enCuesIn(lookback, EN_SPEECH_CUES, 0).length > 0 || CJK_SPEECH_CUES.some(function (cue) { return lookback.indexOf(cue) >= 0; });
            if (hasSpeech || isClauseLike(inner)) {
                spans.push({ start: o, end: c + pair.close.length, kind: 'quoted' });
            }
            pos = c + pair.close.length;
        }
    }
    // 2) 归属引导那段：从引导词到标点（。；！？\n;:）或者到 ATTRIBUTION_TAIL，谁先到就遮到哪儿
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
    // 3) 说话的后半截也剥：从说话词到最近一个标点/转折，或者到 ATTRIBUTION_TAIL，谁先到遮到哪儿
    // （没引号的那种归属："the doc says X but our config disables them"——says 后面那截说的是别人）
    const SPEECH_BOUNDARY = /[，,、。；;!！?？:：\n]|\b(but|however|though|although|whereas|while|yet)\b|但/;
    const speechCues = enCuesIn(excerpt, EN_SPEECH_CUES, 0).concat(substrCuesIn(excerpt, CJK_SPEECH_CUES, 0));
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
    // 4) 没配对的引号按最严处理：把已经遮掉的地方以外，那些孤零零的开引号/闭引号扫一遍
    const masked = new Array(excerpt.length).fill(false);
    for (const s of spans) {
        for (let k = s.start; k < s.end; k++) {
            masked[k] = true;
        }
    }
    const closers = new Set(['”', '’', '」', '』']);
    for (let k = 0; k < excerpt.length; k++) {
        if (masked[k]) {
            continue;
        }
        const ch = excerpt[k];
        // 孤零零的开引号（“‘「『）→ 遮到文章末尾；孤零零的双引号分不清是开还是关 → 整篇都遮（宁可从严）；已经配对过的不动
        if ((ch === '“' || ch === '‘' || ch === '「' || ch === '『') && !paired[k]) {
            spans.push({ start: k, end: excerpt.length, kind: 'unbalanced-quote' });
            break;
        }
        if (ch === '"' && !paired[k]) {
            spans.push({ start: 0, end: excerpt.length, kind: 'unbalanced-quote' });
            break;
        }
        // 孤零零的闭引号（”’」』）→ 从文章开头遮到这儿（从严：前面那些可能本来就是没配对的引文）；配对过的位置不动
        if (closers.has(ch) && !paired[k]) {
            spans.push({ start: 0, end: k + 1, kind: 'unbalanced-quote' });
            break;
        }
    }
    // 生成一段等长的遮罩文本（剥掉的地方换成空格，位置不变）
    const chars = excerpt.split('');
    for (const s of spans) {
        for (let k = s.start; k < s.end; k++) {
            chars[k] = ' ';
        }
    }
    return { text: chars.join(''), spans: spans };
}
/** 查否定窗：撞上那点 [start,end) 前头那段查否定词、后头那段查后置否定词；撞进伪否定盖住的地方就不算 */
function negationHits(maskedText, start, end, pseudoSpans, ctxPseudoSpans) {
    const hits = [];
    const preBase = Math.max(0, start - NEG_WINDOW_PRE);
    const preWin = maskedText.slice(preBase, start);
    const postWin = maskedText.slice(end, Math.min(maskedText.length, end + NEG_WINDOW_POST));
    const enPre = enCuesIn(preWin, EN_PRE_NEG_CUES, preBase).map(function (s) { return { start: s.start, end: s.end, kind: 'pre-neg' }; });
    const cjkPre = substrCuesIn(preWin, CJK_PRE_NEG_CUES, preBase).map(function (s) { return { start: s.start, end: s.end, kind: 'pre-neg' }; });
    const enPost = enCuesIn(postWin, EN_POST_NEG_CUES, end).map(function (s) { return { start: s.start, end: s.end, kind: 'post-neg' }; });
    const cjkPost = substrCuesIn(postWin, CJK_POST_NEG_CUES, end).map(function (s) { return { start: s.start, end: s.end, kind: 'post-neg' }; });
    // 假设/举例的窗口怎么接：
    // 剥的窗口跟否定词用同一套参数；flag kind=pre-ctx/post-ctx → 走现有的映射，出来就是 non-asserted；
    // 两张伪表各管各的（ctx 撞上就查 ctxPseudo，否定撞上就查 pseudoSpans）；赋值豁免那套照抄
    const enPreCtx = enCuesIn(preWin, EN_NON_ASSERT_CUES, preBase).map(function (s) { return { start: s.start, end: s.end, kind: 'pre-ctx' }; });
    const cjkPreCtx = substrCuesIn(preWin, CJK_NON_ASSERT_PRE_CUES, preBase).map(function (s) { return { start: s.start, end: s.end, kind: 'pre-ctx' }; });
    const enPostCtx = enCuesIn(postWin, EN_NON_ASSERT_CUES, end).map(function (s) { return { start: s.start, end: s.end, kind: 'post-ctx' }; });
    const cjkPostCtx = substrCuesIn(postWin, CJK_NON_ASSERT_POST_CUES, end).map(function (s) { return { start: s.start, end: s.end, kind: 'post-ctx' }; });
    for (const h of enPre.concat(cjkPre, enPost, cjkPost, enPreCtx, cjkPreCtx, enPostCtx, cjkPostCtx)) {
        const isCtx = h.kind === 'pre-ctx' || h.kind === 'post-ctx';
        if (intersects(h, pseudoSpans) || (isCtx && intersects(h, ctxPseudoSpans))) {
            continue;
        }
        // 赋值豁免：cue 紧贴 '=' 右边（allow=never / mode=false 这类是配置的值，不是在否定什么主张——ctx 撞上走同一套）
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
/** 伪否定盖住的地方整张表（全文扫一遍；英文按词边界，中文按子串） */
function pseudoSpansOf(maskedText) {
    const en = enCuesIn(maskedText, EN_PSEUDO_NEG, 0).map(function (s) { return { start: s.start, end: s.end, kind: 'pseudo' }; });
    const cjk = substrCuesIn(maskedText, CJK_PSEUDO_NEG, 0).map(function (s) { return { start: s.start, end: s.end, kind: 'pseudo' }; });
    return en.concat(cjk);
}
/** 纯函数结果存起来：stripContexts/pseudoSpansOf/ctxPseudo 都是只看 evidence.excerpt 的纯函数——按对象拿 WeakMap 存（好几条断言用同一份证据时不必重算，结果一模一样） */
const stripMemo = new WeakMap();
export function checkCitationSupport(claim, evidence) {
    const flags = [];
    if (!evidence.grounded || evidence.excerpt.length === 0) {
        return { claim_id: claim.claim_id, evidence_id: evidence.evidence_id, support: 'insufficient', matched_tokens: [], missing_tokens: claim.required_tokens.slice(), context_flags: flags, reason: '引文未落地（grounded=false 或 excerpt 为空）——有引文不等于支撑结论' };
    }
    let cached = stripMemo.get(evidence);
    if (!cached) {
        const stripped = stripContexts(evidence.excerpt);
        const hay0 = stripped.text.toLowerCase();
        cached = { text: stripped.text, spans: stripped.spans, pseudo: pseudoSpansOf(hay0), ctxPseudo: substrCuesIn(hay0, CJK_NON_ASSERT_PSEUDO, 0) };
        stripMemo.set(evidence, cached);
    }
    const stripped = { text: cached.text, spans: cached.spans };
    const hay = stripped.text.toLowerCase();
    const pseudoSpans = cached.pseudo;
    const ctxPseudo = cached.ctxPseudo;
    const matched = [];
    const missing = [];
    for (const tok of claim.required_tokens) {
        const needle = tok.toLowerCase();
        let pos = hay.indexOf(needle);
        let clean = false;
        const negCues = [];
        while (pos >= 0) {
            const hits = negationHits(hay, pos, pos + needle.length, pseudoSpans, ctxPseudo);
            // 裁决标签位：锚本身是个否定词还紧挨着 ':'（unsupported: / 不成立: 这种是标签，不是内容）
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
            if (negCues.length === 0) {
                // 全文一个活的命中都没有：分清是「被剥掉遮了」还是「字面上压根没有」
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
