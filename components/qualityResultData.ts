import { INITIAL_RULES } from './QualityRuleConfigWorkbench';
import { INITIAL_SCORE_ITEMS } from './QualityScoreItemWorkbench';
import {
  BoundQualityRuleEntry,
  SpecialQualitySession,
  SpecialQualityTask,
  generateSessionsForTask,
} from './specialQualitySessionData';
import { createDefaultConditionGroups } from './DataMatchConditionBuilder';

export type QualityAppealStatus = '未申诉' | '已申诉未复核' | '已申诉已通过' | '已申诉已驳回';
export type DistributionStatus = '待分发' | '已分发';

export interface AppealRuleEntry {
  ruleId: string;
  ruleName: string;
  originalScoreDisplay: string;
  originalScoreDelta: number;
  appealScore: number;
}

export interface AppealRecordEntry {
  id: string;
  appealTime: string;
  appellant: string;
  items: AppealRuleEntry[];
  reason: string;
}

export interface ReviewRecordEntry {
  id: string;
  reviewTime: string;
  reviewer: string;
  ruleId: string;
  ruleName: string;
  originalScoreDelta: number;
  appealScore: number;
  reviewScore: number;
  decision: '通过' | '驳回';
  reason: string;
}

export interface QualityInspector {
  id: string;
  name: string;
  employeeNo: string;
  specialty: string;
  pendingCount: number;
}

export const QUALITY_INSPECTORS: QualityInspector[] = [
  { id: 'insp_1', name: '陈明', employeeNo: 'QC1001', specialty: '财富管理 / 电销合规', pendingCount: 4 },
  { id: 'insp_2', name: '张颖', employeeNo: 'QC1002', specialty: '全渠道综合质检', pendingCount: 6 },
  { id: 'insp_3', name: '李娜', employeeNo: 'QC1003', specialty: '信用卡 / 个贷业务', pendingCount: 3 },
  { id: 'insp_4', name: '王伟', employeeNo: 'QC1004', specialty: '传统关键词 / 流程规范', pendingCount: 2 },
  { id: 'insp_5', name: '刘芳', employeeNo: 'QC1005', specialty: '高情绪投诉安抚复核', pendingCount: 5 },
];

export interface RecordingDimensionsInfo {
  callDirection: '呼入' | '呼出';
  callerNumber: string;
  calleeNumber: string;
  agentId: string;
  skillGroupName: string;
  hangupParty: string;
  satisfactionRating: string;
  queueDurationSec: number;
  isFirstInbound: boolean;
  callStartTime: string;
}

export interface QualityResultRecord {
  id: string;
  serialNo: string;
  callTime: string;
  machineScore: number;
  status: QualityAppealStatus;
  reviewTime: string;
  reviewer: string;
  appealTime: string;
  appellant: string;
  appealReason: string;
  reviewComment?: string;
  // Audio & speech metrics
  durationSec: number;
  silenceDurationSec: number;
  avgSpeechRate: number;
  avgVolumeDb: number;
  agentAvgSpeechRate: number;
  agentAvgVolumeDb: number;
  recordingFileName: string;
  // Extra recording dimensions (随录信息)
  dimensions: RecordingDimensionsInfo;
  // Distribution metadata
  distributionStatus: DistributionStatus;
  distributedAt: string;
  distributor: string;
  // Appeal & review histories
  appealHistory: AppealRecordEntry[];
  reviewHistory: ReviewRecordEntry[];
  // Linked session detail for "查看" / "复核"
  taskSnapshot: SpecialQualityTask;
  sessionDetail: SpecialQualitySession;
}

export interface ConfigurableDimensionDef {
  key: string;
  label: string;
  group: '语音指标' | '随录信息';
  widthClass: string;
  getValue: (r: QualityResultRecord) => string;
}

export const CONFIGURABLE_DIMENSION_DEFS: ConfigurableDimensionDef[] = [
  {
    key: 'durationSec',
    label: '通话时长',
    group: '语音指标',
    widthClass: 'w-[100px]',
    getValue: r => `${r.durationSec} 秒`,
  },
  {
    key: 'silenceDurationSec',
    label: '静音时长',
    group: '语音指标',
    widthClass: 'w-[100px]',
    getValue: r => `${r.silenceDurationSec} 秒`,
  },
  {
    key: 'avgSpeechRate',
    label: '平均语速',
    group: '语音指标',
    widthClass: 'w-[115px]',
    getValue: r => `${r.avgSpeechRate} 字/分`,
  },
  {
    key: 'avgVolumeDb',
    label: '平均音量',
    group: '语音指标',
    widthClass: 'w-[100px]',
    getValue: r => `${r.avgVolumeDb} dB`,
  },
  {
    key: 'agentAvgSpeechRate',
    label: '坐席平均语速',
    group: '语音指标',
    widthClass: 'w-[125px]',
    getValue: r => `${r.agentAvgSpeechRate} 字/分`,
  },
  {
    key: 'agentAvgVolumeDb',
    label: '坐席平均音量',
    group: '语音指标',
    widthClass: 'w-[120px]',
    getValue: r => `${r.agentAvgVolumeDb} dB`,
  },
  {
    key: 'recordingFileName',
    label: '录音文件名',
    group: '语音指标',
    widthClass: 'w-[220px]',
    getValue: r => r.recordingFileName,
  },
  {
    key: 'callDirection',
    label: '呼叫方向',
    group: '随录信息',
    widthClass: 'w-[95px]',
    getValue: r => r.dimensions.callDirection,
  },
  {
    key: 'callerNumber',
    label: '主叫号码',
    group: '随录信息',
    widthClass: 'w-[130px]',
    getValue: r => r.dimensions.callerNumber,
  },
  {
    key: 'calleeNumber',
    label: '被叫号码',
    group: '随录信息',
    widthClass: 'w-[120px]',
    getValue: r => r.dimensions.calleeNumber,
  },
  {
    key: 'agentId',
    label: '坐席工号',
    group: '随录信息',
    widthClass: 'w-[95px]',
    getValue: r => r.dimensions.agentId,
  },
  {
    key: 'skillGroupName',
    label: '技能组名称',
    group: '随录信息',
    widthClass: 'w-[130px]',
    getValue: r => r.dimensions.skillGroupName,
  },
  {
    key: 'hangupParty',
    label: '挂机方',
    group: '随录信息',
    widthClass: 'w-[115px]',
    getValue: r => r.dimensions.hangupParty,
  },
  {
    key: 'satisfactionRating',
    label: '满意度评价',
    group: '随录信息',
    widthClass: 'w-[110px]',
    getValue: r => r.dimensions.satisfactionRating,
  },
  {
    key: 'queueDurationSec',
    label: '排队时长(秒)',
    group: '随录信息',
    widthClass: 'w-[115px]',
    getValue: r => `${r.dimensions.queueDurationSec} 秒`,
  },
  {
    key: 'isFirstInbound',
    label: '是否首次进线',
    group: '随录信息',
    widthClass: 'w-[115px]',
    getValue: r => (r.dimensions.isFirstInbound ? '是' : '否'),
  },
  {
    key: 'callStartTime',
    label: '进线接入时间',
    group: '随录信息',
    widthClass: 'w-[160px]',
    getValue: r => r.dimensions.callStartTime,
  },
];

const DEFAULT_RULES_SET_A: BoundQualityRuleEntry[] = [
  { rule: INITIAL_RULES[6], boundScoreItem: INITIAL_SCORE_ITEMS[3] },
  { rule: INITIAL_RULES[7], boundScoreItem: INITIAL_SCORE_ITEMS[5] },
];

const DEFAULT_RULES_SET_B: BoundQualityRuleEntry[] = [
  { rule: INITIAL_RULES[8], boundScoreItem: INITIAL_SCORE_ITEMS[6] },
  { rule: INITIAL_RULES[0], boundScoreItem: INITIAL_SCORE_ITEMS[0] },
];

const seedSessionsA = generateSessionsForTask({
  taskId: 'RQ20261119001',
  scoringStrategy: '减分',
  rules: DEFAULT_RULES_SET_A,
  count: 5,
});

const seedSessionsB = generateSessionsForTask({
  taskId: 'SQ20261119002',
  scoringStrategy: '加分',
  rules: DEFAULT_RULES_SET_B,
  count: 5,
});

function buildTaskSnapshot(id: string, name: string, strategy: '减分' | '加分', rules: BoundQualityRuleEntry[]): SpecialQualityTask {
  return {
    id,
    name,
    status: '已完成',
    taskType: '大小模型混用',
    priority: '高',
    scoringStrategy: strategy,
    dataType: '语音',
    conditionGroups: createDefaultConditionGroups(),
    rules,
    creator: '张颖',
    createdAt: '2026-11-18 10:00:00',
    updatedAt: '2026-11-19 09:00:00',
  };
}

const taskSnapA = buildTaskSnapshot('RQ20261119001', '电销外呼每日全量合规质检', '减分', DEFAULT_RULES_SET_A);
const taskSnapB = buildTaskSnapshot('SQ20261119002', '高情绪投诉录音回溯专项质检', '加分', DEFAULT_RULES_SET_B);

function computeAgentStats(sess: SpecialQualitySession): { agentRate: number; agentVol: number } {
  const agentUtterances = sess.utterances.filter(u => u.speaker === '坐席');
  if (agentUtterances.length === 0) {
    return { agentRate: sess.avgSpeechRate, agentVol: sess.avgVolumeDb };
  }
  const agentRate = Math.round(
    agentUtterances.reduce((s, u) => s + u.speechRate, 0) / agentUtterances.length
  );
  const agentVol = Math.round(
    agentUtterances.reduce((s, u) => s + u.volumeDb, 0) / agentUtterances.length
  );
  return { agentRate, agentVol };
}

function enrichRecordWithHistories(raw: Omit<QualityResultRecord, 'appealHistory' | 'reviewHistory'>): QualityResultRecord {
  const rules = raw.sessionDetail.ruleResults;
  const targetIdx = rules.findIndex(r => r.isHit) >= 0 ? rules.findIndex(r => r.isHit) : 0;

  if (raw.status === '未申诉') {
    return {
      ...raw,
      appealHistory: [],
      reviewHistory: [],
      sessionDetail: {
        ...raw.sessionDetail,
        ruleResults: rules.map(r => ({
          ...r,
          appealStatus: '未申诉',
        })),
      },
    };
  }

  const ruleStatus: '已申诉' | '已复核' | '已驳回' =
    raw.status === '已申诉已通过'
      ? '已复核'
      : raw.status === '已申诉已驳回'
      ? '已驳回'
      : '已申诉';

  const updatedRules = rules.map((r, idx) => {
    const isTarget = idx === targetIdx;
    if (!isTarget) {
      return {
        ...r,
        appealStatus: '未申诉' as const,
      };
    }
    const suggestedAppealScore = r.scoreDelta < 0 ? 0 : r.scoreDelta === 0 ? 10 : r.scoreDelta;
    const finalReviewScore =
      ruleStatus === '已复核'
        ? suggestedAppealScore
        : ruleStatus === '已驳回'
        ? r.scoreDelta
        : undefined;
    return {
      ...r,
      appealStatus: ruleStatus,
      appealScore: suggestedAppealScore,
      appealReason: raw.appealReason,
      reviewScore: finalReviewScore,
      reviewReason: raw.reviewComment,
    };
  });

  const targetRule = updatedRules[targetIdx];
  const appealHistory: AppealRecordEntry[] = targetRule
    ? [
        {
          id: `AP_${raw.id}_1`,
          appealTime: raw.appealTime,
          appellant: raw.appellant,
          items: [
            {
              ruleId: targetRule.ruleId,
              ruleName: targetRule.ruleName,
              originalScoreDisplay: targetRule.scoreDisplay,
              originalScoreDelta: targetRule.scoreDelta,
              appealScore: targetRule.appealScore ?? 0,
            },
          ],
          reason: raw.appealReason,
        },
      ]
    : [];

  const reviewHistory: ReviewRecordEntry[] =
    targetRule && (raw.status === '已申诉已通过' || raw.status === '已申诉已驳回')
      ? [
          {
            id: `RV_${raw.id}_1`,
            reviewTime: raw.reviewTime,
            reviewer: raw.reviewer || '张颖',
            ruleId: targetRule.ruleId,
            ruleName: targetRule.ruleName,
            originalScoreDelta: targetRule.scoreDelta,
            appealScore: targetRule.appealScore ?? 0,
            reviewScore: targetRule.reviewScore ?? targetRule.scoreDelta,
            decision: raw.status === '已申诉已通过' ? '通过' : '驳回',
            reason: raw.reviewComment || '核听原声完成复核。',
          },
        ]
      : [];

  return {
    ...raw,
    appealHistory,
    reviewHistory,
    sessionDetail: {
      ...raw.sessionDetail,
      ruleResults: updatedRules,
    },
  };
}

const RAW_QUALITY_RESULT_RECORDS: Array<Omit<QualityResultRecord, 'appealHistory' | 'reviewHistory'>> = [
  {
    id: 'QR20261119001',
    serialNo: 'CJFH-pf1-kf-20261119voice001',
    callTime: '2026-11-19 09:18:42',
    machineScore: 65,
    status: '已申诉未复核',
    reviewTime: '',
    reviewer: '',
    appealTime: '2026-11-19 10:25:14',
    appellant: '张晓雅',
    appealReason: '已向客户补充提示市场波动以说明书为准，不应认定为恶意承诺保本保收益。',
    durationSec: seedSessionsA[0].durationSec,
    silenceDurationSec: seedSessionsA[0].silenceDurationSec,
    avgSpeechRate: seedSessionsA[0].avgSpeechRate,
    avgVolumeDb: seedSessionsA[0].avgVolumeDb,
    agentAvgSpeechRate: computeAgentStats(seedSessionsA[0]).agentRate,
    agentAvgVolumeDb: computeAgentStats(seedSessionsA[0]).agentVol,
    recordingFileName: 'REC_20261119_091842_6028.wav',
    dimensions: {
      callDirection: '呼出',
      callerNumber: '95588',
      calleeNumber: '13810248811',
      agentId: '6028',
      skillGroupName: '财富顾问组',
      hangupParty: '客户挂机',
      satisfactionRating: '满意',
      queueDurationSec: 8,
      isFirstInbound: false,
      callStartTime: '2026-11-19 09:18:34',
    },
    distributionStatus: '待分发',
    distributedAt: '',
    distributor: '',
    taskSnapshot: taskSnapA,
    sessionDetail: {
      ...seedSessionsA[0],
      serialNo: 'CJFH-pf1-kf-20261119voice001',
      callTime: '2026-11-19 09:18:42',
      score: 65,
    },
  },
  {
    id: 'QR20261119002',
    serialNo: 'CJFH-pf1-kf-20261119voice002',
    callTime: '2026-11-19 10:05:19',
    machineScore: 75,
    status: '已申诉未复核',
    reviewTime: '',
    reviewer: '',
    appealTime: '2026-11-19 11:12:08',
    appellant: '周杰',
    appealReason: '客户进线情绪激动抢话，坐席已第一时间完成挂失与安抚，申请复核减分项。',
    durationSec: seedSessionsA[1].durationSec,
    silenceDurationSec: seedSessionsA[1].silenceDurationSec,
    avgSpeechRate: seedSessionsA[1].avgSpeechRate,
    avgVolumeDb: seedSessionsA[1].avgVolumeDb,
    agentAvgSpeechRate: computeAgentStats(seedSessionsA[1]).agentRate,
    agentAvgVolumeDb: computeAgentStats(seedSessionsA[1]).agentVol,
    recordingFileName: 'REC_20261119_100519_6012.wav',
    dimensions: {
      callDirection: '呼入',
      callerNumber: '13922014452',
      calleeNumber: '95588',
      agentId: '6012',
      skillGroupName: 'VIP专席组',
      hangupParty: '客户挂机',
      satisfactionRating: '一般',
      queueDurationSec: 19,
      isFirstInbound: true,
      callStartTime: '2026-11-19 10:05:00',
    },
    distributionStatus: '待分发',
    distributedAt: '',
    distributor: '',
    taskSnapshot: taskSnapA,
    sessionDetail: {
      ...seedSessionsA[1],
      serialNo: 'CJFH-pf1-kf-20261119voice002',
      callTime: '2026-11-19 10:05:19',
      score: 75,
    },
  },
  {
    id: 'QR20261119003',
    serialNo: 'CJFH-pf1-kf-20261118voice003',
    callTime: '2026-11-18 15:42:08',
    machineScore: 80,
    status: '已申诉未复核',
    reviewTime: '',
    reviewer: '李娜',
    appealTime: '2026-11-18 17:04:33',
    appellant: '李婷',
    appealReason: '柜面面签引导完整，语音识别将“网点”误转写导致命中未告知规范。',
    durationSec: seedSessionsA[2].durationSec,
    silenceDurationSec: seedSessionsA[2].silenceDurationSec,
    avgSpeechRate: seedSessionsA[2].avgSpeechRate,
    avgVolumeDb: seedSessionsA[2].avgVolumeDb,
    agentAvgSpeechRate: computeAgentStats(seedSessionsA[2]).agentRate,
    agentAvgVolumeDb: computeAgentStats(seedSessionsA[2]).agentVol,
    recordingFileName: 'REC_20261118_154208_6018.wav',
    dimensions: {
      callDirection: '呼入',
      callerNumber: '13655129901',
      calleeNumber: '95588',
      agentId: '6018',
      skillGroupName: '信用卡综合组',
      hangupParty: '客户挂机',
      satisfactionRating: '非常满意',
      queueDurationSec: 12,
      isFirstInbound: true,
      callStartTime: '2026-11-18 15:41:56',
    },
    distributionStatus: '已分发',
    distributedAt: '2026-11-18 18:10:00',
    distributor: '张颖',
    taskSnapshot: taskSnapA,
    sessionDetail: {
      ...seedSessionsA[2],
      serialNo: 'CJFH-pf1-kf-20261118voice003',
      callTime: '2026-11-18 15:42:08',
      score: 80,
    },
  },
  {
    id: 'QR20261119004',
    serialNo: 'CJFH-pf1-kf-20261118voice004',
    callTime: '2026-11-18 11:27:55',
    machineScore: 70,
    status: '已申诉未复核',
    reviewTime: '',
    reviewer: '张颖',
    appealTime: '2026-11-18 14:20:45',
    appellant: '张晓雅',
    appealReason: '分期年化利率及提前结清手续费均已口播到位，申请复核撤销扣分。',
    durationSec: seedSessionsA[3].durationSec,
    silenceDurationSec: seedSessionsA[3].silenceDurationSec,
    avgSpeechRate: seedSessionsA[3].avgSpeechRate,
    avgVolumeDb: seedSessionsA[3].avgVolumeDb,
    agentAvgSpeechRate: computeAgentStats(seedSessionsA[3]).agentRate,
    agentAvgVolumeDb: computeAgentStats(seedSessionsA[3]).agentVol,
    recordingFileName: 'REC_20261118_112755_6028.wav',
    dimensions: {
      callDirection: '呼入',
      callerNumber: '13788231109',
      calleeNumber: '95588',
      agentId: '6028',
      skillGroupName: '信用卡综合组',
      hangupParty: '客户挂机',
      satisfactionRating: '满意',
      queueDurationSec: 25,
      isFirstInbound: false,
      callStartTime: '2026-11-18 11:27:30',
    },
    distributionStatus: '已分发',
    distributedAt: '2026-11-18 15:35:10',
    distributor: '张颖',
    taskSnapshot: taskSnapA,
    sessionDetail: {
      ...seedSessionsA[3],
      serialNo: 'CJFH-pf1-kf-20261118voice004',
      callTime: '2026-11-18 11:27:55',
      score: 70,
    },
  },
  {
    id: 'QR20261119005',
    serialNo: 'CJFH-pf1-kf-20261117voice005',
    callTime: '2026-11-17 16:50:12',
    machineScore: 60,
    status: '已申诉未复核',
    reviewTime: '',
    reviewer: '陈明',
    appealTime: '2026-11-18 09:30:00',
    appellant: '赵敏',
    appealReason: '客户多次打断解释，坐席已积极转接高级客诉专员。',
    durationSec: seedSessionsA[4].durationSec,
    silenceDurationSec: seedSessionsA[4].silenceDurationSec,
    avgSpeechRate: seedSessionsA[4].avgSpeechRate,
    avgVolumeDb: seedSessionsA[4].avgVolumeDb,
    agentAvgSpeechRate: computeAgentStats(seedSessionsA[4]).agentRate,
    agentAvgVolumeDb: computeAgentStats(seedSessionsA[4]).agentVol,
    recordingFileName: 'REC_20261117_165012_6027.wav',
    dimensions: {
      callDirection: '呼入',
      callerNumber: '13500197734',
      calleeNumber: '95588',
      agentId: '6027',
      skillGroupName: 'VIP专席组',
      hangupParty: '坐席挂机',
      satisfactionRating: '不满意',
      queueDurationSec: 42,
      isFirstInbound: true,
      callStartTime: '2026-11-17 16:49:30',
    },
    distributionStatus: '已分发',
    distributedAt: '2026-11-18 10:15:20',
    distributor: '张颖',
    taskSnapshot: taskSnapA,
    sessionDetail: {
      ...seedSessionsA[4],
      serialNo: 'CJFH-pf1-kf-20261117voice005',
      callTime: '2026-11-17 16:50:12',
      score: 60,
    },
  },
  {
    id: 'QR20261119006',
    serialNo: 'CJFH-pf1-kf-20261117voice006',
    callTime: '2026-11-17 14:12:30',
    machineScore: 85,
    status: '已申诉已通过',
    reviewTime: '2026-11-18 15:40:12',
    reviewer: '刘芳',
    appealTime: '2026-11-17 16:05:40',
    appellant: '张晓雅',
    appealReason: '加分项「高情绪客户安抚化解出色」实际已完整执行情绪安抚动作，模型漏检。',
    reviewComment: '核听原声确认安抚步骤完整，申诉通过，恢复评分。',
    durationSec: seedSessionsB[1].durationSec,
    silenceDurationSec: seedSessionsB[1].silenceDurationSec,
    avgSpeechRate: seedSessionsB[1].avgSpeechRate,
    avgVolumeDb: seedSessionsB[1].avgVolumeDb,
    agentAvgSpeechRate: computeAgentStats(seedSessionsB[1]).agentRate,
    agentAvgVolumeDb: computeAgentStats(seedSessionsB[1]).agentVol,
    recordingFileName: 'REC_20261117_141230_6028.wav',
    dimensions: {
      callDirection: '呼入',
      callerNumber: '13899012233',
      calleeNumber: '95588',
      agentId: '6028',
      skillGroupName: '财富顾问组',
      hangupParty: '客户挂机',
      satisfactionRating: '非常满意',
      queueDurationSec: 6,
      isFirstInbound: false,
      callStartTime: '2026-11-17 14:12:24',
    },
    distributionStatus: '已分发',
    distributedAt: '2026-11-17 17:10:05',
    distributor: '张颖',
    taskSnapshot: taskSnapB,
    sessionDetail: {
      ...seedSessionsB[1],
      serialNo: 'CJFH-pf1-kf-20261117voice006',
      callTime: '2026-11-17 14:12:30',
      score: 85,
    },
  },
  {
    id: 'QR20261119007',
    serialNo: 'CJFH-pf1-kf-20261116voice007',
    callTime: '2026-11-16 10:33:15',
    machineScore: 92,
    status: '已申诉已通过',
    reviewTime: '2026-11-17 11:08:27',
    reviewer: '李娜',
    appealTime: '2026-11-16 14:55:19',
    appellant: '刘强',
    appealReason: '开场白工号及礼貌用语齐全，因客户背景噪音干扰未识别。',
    reviewComment: '核实开场白清晰无误，申诉通过。',
    durationSec: seedSessionsB[0].durationSec,
    silenceDurationSec: seedSessionsB[0].silenceDurationSec,
    avgSpeechRate: seedSessionsB[0].avgSpeechRate,
    avgVolumeDb: seedSessionsB[0].avgVolumeDb,
    agentAvgSpeechRate: computeAgentStats(seedSessionsB[0]).agentRate,
    agentAvgVolumeDb: computeAgentStats(seedSessionsB[0]).agentVol,
    recordingFileName: 'REC_20261116_103315_6031.wav',
    dimensions: {
      callDirection: '呼出',
      callerNumber: '95588',
      calleeNumber: '13966778899',
      agentId: '6031',
      skillGroupName: '财富顾问组',
      hangupParty: '客户挂机',
      satisfactionRating: '满意',
      queueDurationSec: 5,
      isFirstInbound: true,
      callStartTime: '2026-11-16 10:33:10',
    },
    distributionStatus: '已分发',
    distributedAt: '2026-11-16 16:00:11',
    distributor: '张颖',
    taskSnapshot: taskSnapB,
    sessionDetail: {
      ...seedSessionsB[0],
      serialNo: 'CJFH-pf1-kf-20261116voice007',
      callTime: '2026-11-16 10:33:15',
      score: 92,
    },
  },
  {
    id: 'QR20261119008',
    serialNo: 'CJFH-pf1-kf-20261115voice008',
    callTime: '2026-11-15 17:19:44',
    machineScore: 55,
    status: '已申诉已驳回',
    reviewTime: '2026-11-16 13:22:09',
    reviewer: '王伟',
    appealTime: '2026-11-15 18:10:02',
    appellant: '张晓雅',
    appealReason: '认为话术属于安抚性质，不构成责怪客户。',
    reviewComment: '核听坐席存在“您自己买的时候没仔细看吧”等不当表述，维持原扣分判罚，驳回申诉。',
    durationSec: seedSessionsA[4].durationSec,
    silenceDurationSec: seedSessionsA[4].silenceDurationSec,
    avgSpeechRate: seedSessionsA[4].avgSpeechRate,
    avgVolumeDb: seedSessionsA[4].avgVolumeDb,
    agentAvgSpeechRate: computeAgentStats(seedSessionsA[4]).agentRate,
    agentAvgVolumeDb: computeAgentStats(seedSessionsA[4]).agentVol,
    recordingFileName: 'REC_20261115_171944_6028.wav',
    dimensions: {
      callDirection: '呼入',
      callerNumber: '13311223344',
      calleeNumber: '95588',
      agentId: '6028',
      skillGroupName: 'VIP专席组',
      hangupParty: '坐席挂机',
      satisfactionRating: '不满意',
      queueDurationSec: 36,
      isFirstInbound: true,
      callStartTime: '2026-11-15 17:19:08',
    },
    distributionStatus: '已分发',
    distributedAt: '2026-11-16 09:05:30',
    distributor: '陈明',
    taskSnapshot: taskSnapA,
    sessionDetail: {
      ...seedSessionsA[4],
      serialNo: 'CJFH-pf1-kf-20261115voice008',
      callTime: '2026-11-15 17:19:44',
      score: 55,
    },
  },
  {
    id: 'QR20261119009',
    serialNo: 'CJFH-pf1-kf-20261115voice009',
    callTime: '2026-11-15 09:40:28',
    machineScore: 68,
    status: '已申诉已驳回',
    reviewTime: '2026-11-16 10:14:51',
    reviewer: '张颖',
    appealTime: '2026-11-15 11:32:18',
    appellant: '李婷',
    appealReason: '已向客户说明需要身份核验，申请撤销未核验扣分。',
    reviewComment: '录音中仅口头询问姓名未完成动态核验步骤，驳回申诉。',
    durationSec: seedSessionsA[2].durationSec,
    silenceDurationSec: seedSessionsA[2].silenceDurationSec,
    avgSpeechRate: seedSessionsA[2].avgSpeechRate,
    avgVolumeDb: seedSessionsA[2].avgVolumeDb,
    agentAvgSpeechRate: computeAgentStats(seedSessionsA[2]).agentRate,
    agentAvgVolumeDb: computeAgentStats(seedSessionsA[2]).agentVol,
    recordingFileName: 'REC_20261115_094028_6018.wav',
    dimensions: {
      callDirection: '呼出',
      callerNumber: '95588',
      calleeNumber: '18600991122',
      agentId: '6018',
      skillGroupName: '信用卡综合组',
      hangupParty: '系统超时释放',
      satisfactionRating: '一般',
      queueDurationSec: 15,
      isFirstInbound: false,
      callStartTime: '2026-11-15 09:40:13',
    },
    distributionStatus: '已分发',
    distributedAt: '2026-11-15 14:20:00',
    distributor: '陈明',
    taskSnapshot: taskSnapA,
    sessionDetail: {
      ...seedSessionsA[2],
      serialNo: 'CJFH-pf1-kf-20261115voice009',
      callTime: '2026-11-15 09:40:28',
      score: 68,
    },
  },
  {
    id: 'QR20261119010',
    serialNo: 'CJFH-pf1-kf-20261119voice010',
    callTime: '2026-11-19 11:02:14',
    machineScore: 72,
    status: '未申诉',
    reviewTime: '',
    reviewer: '',
    appealTime: '',
    appellant: '',
    appealReason: '',
    durationSec: seedSessionsA[1].durationSec,
    silenceDurationSec: seedSessionsA[1].silenceDurationSec,
    avgSpeechRate: seedSessionsA[1].avgSpeechRate,
    avgVolumeDb: seedSessionsA[1].avgVolumeDb,
    agentAvgSpeechRate: computeAgentStats(seedSessionsA[1]).agentRate,
    agentAvgVolumeDb: computeAgentStats(seedSessionsA[1]).agentVol,
    recordingFileName: 'REC_20261119_110214_6028.wav',
    dimensions: {
      callDirection: '呼出',
      callerNumber: '95588',
      calleeNumber: '13911002288',
      agentId: '6028',
      skillGroupName: '财富顾问组',
      hangupParty: '客户挂机',
      satisfactionRating: '满意',
      queueDurationSec: 9,
      isFirstInbound: false,
      callStartTime: '2026-11-19 11:02:05',
    },
    distributionStatus: '待分发',
    distributedAt: '',
    distributor: '',
    taskSnapshot: taskSnapA,
    sessionDetail: {
      ...seedSessionsA[1],
      serialNo: 'CJFH-pf1-kf-20261119voice010',
      callTime: '2026-11-19 11:02:14',
      score: 72,
    },
  },
  {
    id: 'QR20261119011',
    serialNo: 'CJFH-pf1-kf-20261119voice011',
    callTime: '2026-11-19 13:45:09',
    machineScore: 88,
    status: '未申诉',
    reviewTime: '',
    reviewer: '',
    appealTime: '',
    appellant: '',
    appealReason: '',
    durationSec: seedSessionsB[2].durationSec,
    silenceDurationSec: seedSessionsB[2].silenceDurationSec,
    avgSpeechRate: seedSessionsB[2].avgSpeechRate,
    avgVolumeDb: seedSessionsB[2].avgVolumeDb,
    agentAvgSpeechRate: computeAgentStats(seedSessionsB[2]).agentRate,
    agentAvgVolumeDb: computeAgentStats(seedSessionsB[2]).agentVol,
    recordingFileName: 'REC_20261119_134509_6012.wav',
    dimensions: {
      callDirection: '呼入',
      callerNumber: '13800138000',
      calleeNumber: '95588',
      agentId: '6012',
      skillGroupName: 'VIP专席组',
      hangupParty: '客户挂机',
      satisfactionRating: '非常满意',
      queueDurationSec: 4,
      isFirstInbound: true,
      callStartTime: '2026-11-19 13:45:05',
    },
    distributionStatus: '待分发',
    distributedAt: '',
    distributor: '',
    taskSnapshot: taskSnapB,
    sessionDetail: {
      ...seedSessionsB[2],
      serialNo: 'CJFH-pf1-kf-20261119voice011',
      callTime: '2026-11-19 13:45:09',
      score: 88,
    },
  },
];

export const INITIAL_QUALITY_RESULT_RECORDS: QualityResultRecord[] =
  RAW_QUALITY_RESULT_RECORDS.map(enrichRecordWithHistories);

