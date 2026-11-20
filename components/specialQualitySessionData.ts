import { QualityRuleItem } from './QualityRuleConfigWorkbench';
import { QualityScoreItem } from './QualityScoreItemWorkbench';
import { RuleConditionItem } from './QualityRuleConditionCard';
import { MatchConditionGroup } from './DataMatchConditionBuilder';

export type SpecialTaskStatus = '待执行' | '执行中' | '已完成' | '执行失败';
export type SpecialTaskType = '大模型' | '大小模型混用' | '传统';
export type SpecialTaskPriority = '高' | '中' | '低';
export type SpecialScoringStrategy = '加分' | '减分' | '不区分';
export type SpecialDataType = '语音';

export interface BoundQualityRuleEntry {
  rule: QualityRuleItem;
  boundScoreItem?: QualityScoreItem | null;
}

export interface SessionTranscriptQualityTag {
  ruleId: string;
  ruleName: string;
  tagLabel: string;
  scoreType: '加分' | '减分' | '扣分';
  scoreDelta: number;
}

export interface SessionTranscriptUtterance {
  id: string;
  speaker: '客户' | '坐席';
  text: string;
  startSec: number;
  endSec: number;
  timeLabel: string;
  speechRate: number; // 字/分钟
  volumeDb: number; // dB
  qualityTags: SessionTranscriptQualityTag[];
}

export interface WaveformQualityHitRegion {
  id: string;
  ruleId: string;
  ruleName: string;
  tagLabel: string;
  startSec: number;
  endSec: number;
  scoreType: '加分' | '减分' | '扣分';
  scoreDelta: number;
  channel: 1 | 2 | 'both';
}

export interface SessionRuleConditionHit {
  conditionId: string;
  conditionLabel: string; // e.g. 条件A
  ruleType: string; // e.g. 文字检查/关键字
  expressionOrDesc: string;
  wordDistance?: string;
  applicableRole: string;
  precondition: string;
  detectionScope: string;
  minHitCount: number;
  actualHitCount: number;
  isHit: boolean;
  matchedSnippets: string[];
  matchedUtteranceIds: string[];
}

export type RuleAppealStatus = '未申诉' | '已申诉' | '已复核' | '已驳回';

export interface SessionQualityRuleResult {
  ruleId: string;
  ruleName: string;
  isHit: boolean;
  scoreDelta: number; // e.g. -20, +10, 0
  scoreDisplay: string;
  conditions: SessionRuleConditionHit[];
  appealStatus?: RuleAppealStatus;
  appealScore?: number;
  appealReason?: string;
  reviewScore?: number;
  reviewReason?: string;
}

export interface SpecialQualitySession {
  id: string;
  serialNo: string;
  callTime: string;
  durationSec: number;
  channels: 1 | 2;
  silenceDurationSec: number;
  avgSpeechRate: number;
  interruptDurationSec: number;
  avgVolumeDb: number;
  score: number;
  scoringStrategy: SpecialScoringStrategy;
  utterances: SessionTranscriptUtterance[];
  waveformPeaksCh1: number[];
  waveformPeaksCh2?: number[];
  hitRegions: WaveformQualityHitRegion[];
  ruleResults: SessionQualityRuleResult[];
}

export interface SpecialQualityTask {
  id: string;
  name: string;
  status: SpecialTaskStatus;
  failReason?: string;
  taskType: SpecialTaskType;
  priority: SpecialTaskPriority;
  scoringStrategy: SpecialScoringStrategy;
  dataType: SpecialDataType;
  conditionGroups: MatchConditionGroup[];
  rules: BoundQualityRuleEntry[];
  creator: string;
  createdAt: string;
  updatedAt: string;
  sessions?: SpecialQualitySession[];
}

// Deterministic pseudo-random helper for stable waveform peaks
function generateWaveformPeaks(seedStr: string, length: number, bias = 0): number[] {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) % 1000003;
  }
  const peaks: number[] = [];
  for (let i = 0; i < length; i++) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    const base = ((seed % 1000) / 1000) * 0.78 + 0.12;
    // Create natural speech envelope pauses every ~14 bars
    const pauseMask = i % 17 === 0 || i % 17 === 1 ? 0.18 : 1;
    const val = Math.min(0.96, Math.max(0.08, (base + bias) * pauseMask));
    peaks.push(Number(val.toFixed(2)));
  }
  return peaks;
}

function formatSecLabel(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface DialogueScenarioTemplate {
  suffix: string;
  callTime: string;
  channels: 1 | 2;
  silenceDurationSec: number;
  interruptDurationSec: number;
  utterances: Array<{
    speaker: '客户' | '坐席';
    text: string;
    startSec: number;
    endSec: number;
    speechRate: number;
    volumeDb: number;
    hitKeywords?: string[];
  }>;
}

const DIALOGUE_SCENARIOS: DialogueScenarioTemplate[] = [
  {
    suffix: '20261119testvoice001',
    callTime: '2026-11-19 09:18:42',
    channels: 2,
    silenceDurationSec: 4.2,
    interruptDurationSec: 1.6,
    utterances: [
      {
        speaker: '坐席',
        text: '您好，这里是金商银行财富管理专线，请问有什么可以帮您？',
        startSec: 1,
        endSec: 5,
        speechRate: 256,
        volumeDb: 63,
      },
      {
        speaker: '客户',
        text: '你好，我看你们双十一推出的那款稳健理财产品，是不是肯定保本、每年稳赚百分之四点五以上？',
        startSec: 6,
        endSec: 12,
        speechRate: 288,
        volumeDb: 68,
      },
      {
        speaker: '坐席',
        text: '您放心先生，这款属于低风险R2级产品，往期业绩从来没亏过，基本相当于保本保收益，稳赚不赔的。',
        startSec: 13,
        endSec: 21,
        speechRate: 312,
        volumeDb: 71,
        hitKeywords: ['保本保收益', '稳赚'],
      },
      {
        speaker: '客户',
        text: '那太好了，如果我现在转十万进来，半年后一定能拿回本金和利息对吧？',
        startSec: 22,
        endSec: 27,
        speechRate: 276,
        volumeDb: 65,
      },
      {
        speaker: '坐席',
        text: '是的，您可以直接打开手机银行财富专区搜索产品编号购买，不过提醒一下市场有波动，具体以说明书为准。',
        startSec: 28,
        endSec: 36,
        speechRate: 265,
        volumeDb: 64,
      },
      {
        speaker: '客户',
        text: '行，我大概清楚了，还有个事，我的借记卡非柜面转账限额怎么突然降了？',
        startSec: 37,
        endSec: 43,
        speechRate: 294,
        volumeDb: 67,
      },
      {
        speaker: '坐席',
        text: '先生，为了保障您的资金安全，我需要先为您做一下常规信息核对，帮您查一下限额原因后再为您办理调整，请稍等。',
        startSec: 44,
        endSec: 52,
        speechRate: 249,
        volumeDb: 62,
        hitKeywords: ['资金安全', '限额'],
      },
      {
        speaker: '客户',
        text: '好的好的，麻烦快一点。',
        startSec: 53,
        endSec: 56,
        speechRate: 235,
        volumeDb: 61,
      },
    ],
  },
  {
    suffix: '20261119testvoice002',
    callTime: '2026-11-19 10:05:19',
    channels: 2,
    silenceDurationSec: 6.5,
    interruptDurationSec: 2.3,
    utterances: [
      {
        speaker: '客户',
        text: '喂！你们银行怎么回事啊？我的信用卡刚收到短信说在异地被刷了三千多，我人根本没去过那里！',
        startSec: 1,
        endSec: 8,
        speechRate: 342,
        volumeDb: 76,
      },
      {
        speaker: '坐席',
        text: '先生您先别着急，非常理解您现在的心情，请深呼吸，我马上为您优先核查交易并启动应急保护！',
        startSec: 9,
        endSec: 16,
        speechRate: 262,
        volumeDb: 66,
        hitKeywords: ['别着急', '理解您的心情'],
      },
      {
        speaker: '客户',
        text: '这钱要是追不回来我可要投诉到银保监了，你们安全风控怎么做的？',
        startSec: 17,
        endSec: 23,
        speechRate: 335,
        volumeDb: 75,
      },
      {
        speaker: '坐席',
        text: '请您放心，针对疑似盗刷交易我们有专门的冻结与争议拒付通道。为了保护您账户内剩余资金不被盗刷，我先为您紧急挂失卡片并核验您的本人身份信息。',
        startSec: 24,
        endSec: 34,
        speechRate: 258,
        volumeDb: 64,
        hitKeywords: ['保护账户', '核验身份'],
      },
      {
        speaker: '客户',
        text: '那卡里的钱现在安全了吗？会不会再被扣走？',
        startSec: 35,
        endSec: 40,
        speechRate: 280,
        volumeDb: 68,
      },
      {
        speaker: '坐席',
        text: '已经为您完成临时止付拦截，后续任何消费都无法通过。接下来我为您登记盗刷争议受理单，专员会在24小时内同步处理进展，请保持电话畅通。',
        startSec: 41,
        endSec: 51,
        speechRate: 252,
        volumeDb: 63,
        hitKeywords: ['专员回访', '24小时内'],
      },
      {
        speaker: '客户',
        text: '行，你们这样处理态度还算积极，谢谢。',
        startSec: 52,
        endSec: 56,
        speechRate: 230,
        volumeDb: 60,
      },
    ],
  },
  {
    suffix: '20261119testvoice003',
    callTime: '2026-11-18 15:42:08',
    channels: 1,
    silenceDurationSec: 3.1,
    interruptDurationSec: 0.4,
    utterances: [
      {
        speaker: '客户',
        text: '那个那个那个，我的新信用卡收到后从手机激活不了，是要去银行网点开通吗？',
        startSec: 1,
        endSec: 9,
        speechRate: 327,
        volumeDb: 67,
      },
      {
        speaker: '坐席',
        text: '请问您申请这个信用卡的时候是自己扫码注册申请的吗？',
        startSec: 10,
        endSec: 16,
        speechRate: 259,
        volumeDb: 62,
      },
      {
        speaker: '客户',
        text: '对啊，当时业务员让我扫码申请的。',
        startSec: 17,
        endSec: 22,
        speechRate: 304,
        volumeDb: 65,
      },
      {
        speaker: '坐席',
        text: '了解，因为是首次面签渠道申请的卡片，您需要携带本人有效身份证件和信用卡卡片，前往任意网点柜台完成面签激活即可正常使用。',
        startSec: 23,
        endSec: 34,
        speechRate: 267,
        volumeDb: 63,
        hitKeywords: ['本人身份证', '柜面激活'],
      },
      {
        speaker: '客户',
        text: '噢好的好的，我周六去网点办一下，顺便问下年费怎么算？',
        startSec: 35,
        endSec: 40,
        speechRate: 256,
        volumeDb: 62,
      },
      {
        speaker: '坐席',
        text: '该卡片首年免年费，次年消费满6笔即可豁免年费；另外提醒您绑定支付宝或快捷支付时请妥善保管短信验证码。还有其他问题需要帮助吗？',
        startSec: 41,
        endSec: 50,
        speechRate: 274,
        volumeDb: 63,
        hitKeywords: ['年费规则', '验证码安全'],
      },
      {
        speaker: '客户',
        text: '暂时没有了，感谢解答。',
        startSec: 51,
        endSec: 54,
        speechRate: 242,
        volumeDb: 60,
      },
    ],
  },
  {
    suffix: '20261118testvoice004',
    callTime: '2026-11-18 11:27:55',
    channels: 2,
    silenceDurationSec: 5.8,
    interruptDurationSec: 1.9,
    utterances: [
      {
        speaker: '坐席',
        text: '您好，金商银行信用卡中心为您服务，工号6018，请问有什么可以帮您？',
        startSec: 1,
        endSec: 6,
        speechRate: 248,
        volumeDb: 62,
      },
      {
        speaker: '客户',
        text: '我想问下我账单分期一万块分12期，你们利息一共多少钱？广告说免息怎么还收费？',
        startSec: 7,
        endSec: 14,
        speechRate: 295,
        volumeDb: 69,
      },
      {
        speaker: '坐席',
        text: '先生您好，账单分期是不收利息但会收取分期手续费，目前12期标准费率为每期0.6%，折算年化利率约13.06%，每一期本金和手续费都会明晰列示在账单中。',
        startSec: 15,
        endSec: 27,
        speechRate: 260,
        volumeDb: 64,
        hitKeywords: ['分期费率', '年化利率'],
      },
      {
        speaker: '客户',
        text: '那如果我提前还清，后面的手续费是不是就不收了？',
        startSec: 28,
        endSec: 33,
        speechRate: 272,
        volumeDb: 66,
      },
      {
        speaker: '坐席',
        text: '是的，提前结清未出账期数的手续费不再收取，仅收取当期应还部分及少量提前还款违约金（如有减免活动则免收），具体规则可在办理页面详情页确认。',
        startSec: 34,
        endSec: 45,
        speechRate: 263,
        volumeDb: 63,
      },
      {
        speaker: '客户',
        text: '行，讲得挺清楚的，我自己操作一下。',
        startSec: 46,
        endSec: 50,
        speechRate: 245,
        volumeDb: 61,
      },
    ],
  },
  {
    suffix: '20261117testvoice005',
    callTime: '2026-11-17 16:50:12',
    channels: 2,
    silenceDurationSec: 7.4,
    interruptDurationSec: 3.1,
    utterances: [
      {
        speaker: '客户',
        text: '我上次办理的理财收益怎么比当时宣传的少了这么多，你们是不是欺诈消费者？',
        startSec: 1,
        endSec: 8,
        speechRate: 318,
        volumeDb: 74,
      },
      {
        speaker: '坐席',
        text: '哎呀您买的是净值型理财产品，市场行情不好我们也没有办法，条款里早就写明不保本的，亏一点很正常，您自己买的时候没仔细看吧？',
        startSec: 9,
        endSec: 20,
        speechRate: 305,
        volumeDb: 72,
        hitKeywords: ['没仔细看', '自己买'],
      },
      {
        speaker: '客户',
        text: '你什么意思？当时电话里可不是这么说的，你们这是推卸责任！',
        startSec: 21,
        endSec: 27,
        speechRate: 345,
        volumeDb: 77,
      },
      {
        speaker: '坐席',
        text: '您别激动，我也只是按规定解释，要不我帮您转高级客诉专员核查当时外呼录音吧。',
        startSec: 28,
        endSec: 36,
        speechRate: 279,
        volumeDb: 66,
        hitKeywords: ['转高级客诉', '核查录音'],
      },
      {
        speaker: '客户',
        text: '赶紧转吧，我要调当时的销售录音！',
        startSec: 37,
        endSec: 42,
        speechRate: 310,
        volumeDb: 73,
      },
    ],
  },
];

function buildConditionHitsFromRule(
  rule: QualityRuleItem,
  scenario: DialogueScenarioTemplate,
  shouldHitRule: boolean
): { hits: SessionRuleConditionHit[]; matchedUtteranceIndices: number[] } {
  const rawConditions: RuleConditionItem[] =
    rule.conditions && rule.conditions.length > 0 ? rule.conditions : [];

  const matchedUtteranceIndices: number[] = [];
  const hits: SessionRuleConditionHit[] = [];

  if (rawConditions.length === 0) {
    const targetIdx = Math.min(2, scenario.utterances.length - 1);
    if (shouldHitRule) matchedUtteranceIndices.push(targetIdx);
    const snippetText = scenario.utterances[targetIdx]?.text.slice(0, 12) || '规范检测片段';
    hits.push({
      conditionId: `${rule.id}_cond_A`,
      conditionLabel: '条件A',
      ruleType: rule.ruleMode === '大模型' ? '大模型质检/服务规范' : '文字检查/关键字',
      expressionOrDesc: rule.description || `检测规则：${rule.name}`,
      wordDistance: '15',
      applicableRole: '坐席',
      precondition: '无',
      detectionScope: '全文',
      minHitCount: 1,
      actualHitCount: shouldHitRule ? 1 : 0,
      isHit: shouldHitRule,
      matchedSnippets: shouldHitRule ? [snippetText] : [],
      matchedUtteranceIds: shouldHitRule ? [String(targetIdx)] : [],
    });
    return { hits, matchedUtteranceIndices };
  }

  rawConditions.forEach((cond, idx) => {
    const letter = String.fromCharCode(65 + idx);
    const isThisConditionHit = shouldHitRule ? true : idx > 0 ? false : false;

    // Pick a realistic utterance matching role
    const roleMatchIdx = scenario.utterances.findIndex((u, uIdx) => {
      if (cond.applicableRole === '坐席') return u.speaker === '坐席' && uIdx >= idx;
      if (cond.applicableRole === '客户') return u.speaker === '客户' && uIdx >= idx;
      return uIdx >= idx;
    });
    const chosenIdx =
      roleMatchIdx >= 0
        ? roleMatchIdx
        : Math.min(idx + 1, scenario.utterances.length - 1);

    if (isThisConditionHit) {
      matchedUtteranceIndices.push(chosenIdx);
    }

    const chosenUtterance = scenario.utterances[chosenIdx];
    const keywords =
      cond.keywords && cond.keywords.length > 0
        ? cond.keywords
        : chosenUtterance?.hitKeywords && chosenUtterance.hitKeywords.length > 0
        ? chosenUtterance.hitKeywords
        : [rule.name.slice(0, 6)];

    let expressionOrDesc = '';
    if (cond.ruleType === '文字检查/文本相似度' && cond.similarSentences && cond.similarSentences.length > 0) {
      expressionOrDesc = `相似话术（相似度≥${cond.similarityThreshold || 80}%）：${cond.similarSentences.join('；')}`;
    } else if (cond.ruleType.startsWith('文字检查/')) {
      if (keywords.length >= 2) {
        expressionOrDesc = `(((${keywords.join('|')})>@10)&${cond.applicableRole})`;
      } else {
        expressionOrDesc = `符合以下 ${cond.detectionType || '包含任意关键词'}：${keywords.join('、')}`;
      }
    } else if (cond.ruleType.startsWith('大模型质检/')) {
      const dimDesc =
        cond.llmCheckDimensions && cond.llmCheckDimensions.length > 0
          ? cond.llmCheckDimensions.map(d => d.name).join('、')
          : '';
      expressionOrDesc =
        cond.llmCheckScene ||
        (dimDesc ? `大模型检测维度：${dimDesc}` : '') ||
        `大模型语义判别：检查${cond.applicableRole}对话内容是否满足「${rule.name}」规范`;
    } else if (cond.ruleType.startsWith('语音检查/')) {
      expressionOrDesc = `${cond.ruleType}：阈值检测（静音${cond.silenceComparator || '大于'}${cond.silenceDurationSeconds || 5}秒 / 语速>${cond.speechRateWordsPerMinute || 320}字/分）`;
    } else if (cond.ruleType === '系统参数' && cond.systemParamName) {
      expressionOrDesc = `${cond.systemParamCategory || '随录参数'} · ${cond.systemParamName} ${cond.systemParamOperator || '等于'} ${cond.systemParamValue || ''}`;
    } else {
      expressionOrDesc = `${cond.ruleType}：${rule.description || rule.name}`;
    }

    const snippets = isThisConditionHit ? keywords.slice(0, 3) : [];

    hits.push({
      conditionId: cond.id || `${rule.id}_cond_${letter}`,
      conditionLabel: cond.name || `条件${letter}`,
      ruleType: cond.ruleType,
      expressionOrDesc,
      wordDistance: cond.repeatWindowSentences ? String(cond.repeatWindowSentences) : '15',
      applicableRole: cond.applicableRole || '坐席',
      precondition: cond.precondition || '无',
      detectionScope:
        cond.detectionScope === '指定范围'
          ? `第${cond.scopeStartSentence || 1}句至第${cond.scopeEndSentence || 5}句`
          : cond.detectionScope || '全文',
      minHitCount: cond.minHitCount || 1,
      actualHitCount: isThisConditionHit ? 1 : 0,
      isHit: isThisConditionHit,
      matchedSnippets: snippets,
      matchedUtteranceIds: isThisConditionHit && chosenUtterance ? [`u_${chosenIdx}`] : [],
    });
  });

  return { hits, matchedUtteranceIndices };
}

export function generateSessionsForTask(params: {
  taskId: string;
  scoringStrategy: SpecialScoringStrategy;
  rules: BoundQualityRuleEntry[];
  count?: number;
}): SpecialQualitySession[] {
  const { taskId, scoringStrategy, rules, count = 5 } = params;
  const strategyInitialScore =
    scoringStrategy === '加分' ? 0 : 100;

  return Array.from({ length: count }, (_, sIdx) => {
    const scenario = DIALOGUE_SCENARIOS[sIdx % DIALOGUE_SCENARIOS.length];
    const serialNo = `CJFH-${taskId.toLowerCase()}-${scenario.suffix}`;

    // Clone utterances with empty tags initially
    const utterances: SessionTranscriptUtterance[] = scenario.utterances.map((u, uIdx) => ({
      id: `u_${uIdx}`,
      speaker: u.speaker,
      text: u.text,
      startSec: u.startSec,
      endSec: u.endSec,
      timeLabel: formatSecLabel(u.startSec),
      speechRate: u.speechRate,
      volumeDb: u.volumeDb,
      qualityTags: [],
    }));

    const hitRegions: WaveformQualityHitRegion[] = [];
    const ruleResults: SessionQualityRuleResult[] = [];
    let runningScore = strategyInitialScore;

    rules.forEach((entry, rIdx) => {
      const { rule, boundScoreItem } = entry;
      // Deterministically mix hit and unhit rules across sessions
      const shouldHitRule = (sIdx + rIdx) % 2 === 0 || (sIdx === 0 && rIdx === 0);

      // Compute score delta aligned with scoringStrategy
      const rawVal = boundScoreItem?.scoreValue ?? rule.scoreValue ?? 10;
      let delta = 0;
      let tagScoreType: '加分' | '减分' = '减分';

      if (scoringStrategy === '加分') {
        tagScoreType = '加分';
        delta = shouldHitRule ? Math.abs(rawVal) : 0;
      } else if (scoringStrategy === '减分') {
        tagScoreType = '减分';
        delta = shouldHitRule ? -Math.abs(rawVal) : 0;
      } else {
        // 不区分
        const itemType = boundScoreItem?.scoreType || (rule.scoreType === '加分' ? '加分' : '减分');
        tagScoreType = itemType === '加分' ? '加分' : '减分';
        delta = shouldHitRule ? (tagScoreType === '加分' ? Math.abs(rawVal) : -Math.abs(rawVal)) : 0;
      }

      runningScore = Math.min(100, Math.max(0, runningScore + delta));

      const { hits, matchedUtteranceIndices } = buildConditionHitsFromRule(
        rule,
        scenario,
        shouldHitRule
      );

      if (shouldHitRule && matchedUtteranceIndices.length > 0) {
        const targetUtteranceIdx = matchedUtteranceIndices[0];
        const targetU = utterances[targetUtteranceIdx];
        const tagLabel = boundScoreItem?.name || rule.name;

        if (targetU) {
          targetU.qualityTags.push({
            ruleId: rule.id,
            ruleName: rule.name,
            tagLabel,
            scoreType: tagScoreType,
            scoreDelta: delta,
          });

          hitRegions.push({
            id: `reg_${sIdx}_${rule.id}`,
            ruleId: rule.id,
            ruleName: rule.name,
            tagLabel,
            startSec: targetU.startSec,
            endSec: targetU.endSec,
            scoreType: tagScoreType,
            scoreDelta: delta,
            channel: targetU.speaker === '坐席' ? 1 : 2,
          });
        }
      }

      ruleResults.push({
        ruleId: rule.id,
        ruleName: rule.name,
        isHit: shouldHitRule,
        scoreDelta: delta,
        scoreDisplay: delta > 0 ? `+${delta}` : `${delta}`,
        conditions: hits,
      });
    });

    const durationSec =
      utterances.length > 0 ? utterances[utterances.length - 1].endSec + 2 : 55;
    const avgSpeechRate = Math.round(
      utterances.reduce((sum, u) => sum + u.speechRate, 0) / Math.max(1, utterances.length)
    );
    const avgVolumeDb = Math.round(
      utterances.reduce((sum, u) => sum + u.volumeDb, 0) / Math.max(1, utterances.length)
    );

    const waveformPeaksCh1 = generateWaveformPeaks(`${serialNo}_ch1`, 96, 0.05);
    const waveformPeaksCh2 =
      scenario.channels === 2
        ? generateWaveformPeaks(`${serialNo}_ch2`, 96, -0.02)
        : undefined;

    return {
      id: `${taskId}_sess_${sIdx + 1}`,
      serialNo,
      callTime: scenario.callTime,
      durationSec,
      channels: scenario.channels,
      silenceDurationSec: scenario.silenceDurationSec,
      avgSpeechRate,
      interruptDurationSec: scenario.interruptDurationSec,
      avgVolumeDb,
      score: runningScore,
      scoringStrategy,
      utterances,
      waveformPeaksCh1,
      waveformPeaksCh2,
      hitRegions,
      ruleResults,
    };
  });
}
