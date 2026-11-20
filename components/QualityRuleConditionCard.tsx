import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Trash2, X } from 'lucide-react';

export type ConditionRuleType =
  | '文字检查/关键字'
  | '文字检查/文本相似度'
  | '文字检查/语义标签'
  | '文字检查/上下文重复'
  | '语音检查/静音检查'
  | '语音检查/语速检测'
  | '语音检查/抢话检查'
  | '语音检查/非正常挂机'
  | '语音检查/非正常接听'
  | '语音检查/录音时长检查'
  | '语音检查/音量检测'
  | '语音检查/角色检查'
  | '系统参数'
  | '大模型质检/服务规范'
  | '大模型质检/服务内容'
  | '大模型质检/服务分类';

export const CONDITION_RULE_TYPES: ConditionRuleType[] = [
  '文字检查/关键字',
  '文字检查/文本相似度',
  '文字检查/语义标签',
  '文字检查/上下文重复',
  '语音检查/静音检查',
  '语音检查/语速检测',
  '语音检查/抢话检查',
  '语音检查/非正常挂机',
  '语音检查/非正常接听',
  '语音检查/录音时长检查',
  '语音检查/音量检测',
  '语音检查/角色检查',
  '系统参数',
  '大模型质检/服务规范',
  '大模型质检/服务内容',
  '大模型质检/服务分类',
];

export type AnalysisMethodType = '单句分析' | '多句分析';

export type DetectionMatchType =
  | '包含任意关键词'
  | '包含全部上述关键词'
  | '包含任意N个关键词'
  | '全部不包含';

export type ApplicableRoleType = '全部' | '坐席' | '客户';

export type DetectionScopeType =
  | '全文'
  | '指定范围'
  | '前置条件命中之前'
  | '前置条件命中之后'
  | '前置条件命中前后';

export const DETECTION_SCOPE_OPTIONS: { value: DetectionScopeType; label: string }[] = [
  { value: '全文', label: '全文' },
  { value: '指定范围', label: '指定范围' },
  { value: '前置条件命中之前', label: '前置条件命中之前' },
  { value: '前置条件命中之后', label: '前置条件命中之后' },
  { value: '前置条件命中前后', label: '前置条件命中前后' },
];

export type SilenceRoleRelationType = '不同角色之间' | '不区分角色' | '相同角色';

export type SilenceComparatorType = '大于' | '小于';

export type SpeechRateCheckMethodType = '单句话语速' | '整个会话平均语速';

export type RoleCheckTargetType = '坐席' | '客户';

export type CallBoundaryRoleType = '任意' | '客户' | '坐席';

export type VolumeDetectionMethodType = '音量范围检测' | '相邻句子音量波动' | '最大音量跨度';

export type SystemParamCategoryType = '随录参数' | '业务参数';

export type SystemParamOperatorType =
  | '等于'
  | '不等于'
  | '包含'
  | '不包含'
  | '非空'
  | '大于'
  | '小于';

export interface SystemParamFieldDef {
  name: string;
  fieldType: 'text' | 'number';
  operators: SystemParamOperatorType[];
  defaultVal: string;
}

export const SYSTEM_PARAM_DEFINITIONS: Record<SystemParamCategoryType, SystemParamFieldDef[]> = {
  随录参数: [
    {
      name: '呼叫方向',
      fieldType: 'text',
      operators: ['等于', '不等于', '包含', '不包含', '非空'],
      defaultVal: '呼入',
    },
    {
      name: '主叫号码',
      fieldType: 'text',
      operators: ['等于', '不等于', '包含', '不包含', '非空'],
      defaultVal: '13800138000',
    },
    {
      name: '被叫号码',
      fieldType: 'text',
      operators: ['等于', '不等于', '包含', '不包含', '非空'],
      defaultVal: '95588',
    },
    {
      name: '坐席工号',
      fieldType: 'text',
      operators: ['等于', '不等于', '包含', '不包含', '非空'],
      defaultVal: '8012',
    },
    {
      name: '技能组名称',
      fieldType: 'text',
      operators: ['等于', '不等于', '包含', '不包含', '非空'],
      defaultVal: 'VIP专席组',
    },
    {
      name: '挂机方',
      fieldType: 'text',
      operators: ['等于', '不等于', '包含', '不包含', '非空'],
      defaultVal: '坐席挂机',
    },
    {
      name: '满意度评价',
      fieldType: 'text',
      operators: ['等于', '不等于', '包含', '不包含', '非空'],
      defaultVal: '不满意',
    },
    {
      name: '排队时长(秒)',
      fieldType: 'number',
      operators: ['等于', '不等于', '大于', '小于', '包含', '不包含', '非空'],
      defaultVal: '30',
    },
  ],
  业务参数: [
    {
      name: '客户等级',
      fieldType: 'text',
      operators: ['等于', '不等于', '包含', '不包含', '非空'],
      defaultVal: '钻石卡客户',
    },
    {
      name: '业务类型',
      fieldType: 'text',
      operators: ['等于', '不等于', '包含', '不包含', '非空'],
      defaultVal: '账单分期',
    },
    {
      name: '产品名称',
      fieldType: 'text',
      operators: ['等于', '不等于', '包含', '不包含', '非空'],
      defaultVal: '尊享白金卡',
    },
    {
      name: '进线渠道',
      fieldType: 'text',
      operators: ['等于', '不等于', '包含', '不包含', '非空'],
      defaultVal: '手机银行APP',
    },
    {
      name: '工单状态',
      fieldType: 'text',
      operators: ['等于', '不等于', '包含', '不包含', '非空'],
      defaultVal: '待升级处理',
    },
    {
      name: '逾期天数',
      fieldType: 'number',
      operators: ['等于', '不等于', '大于', '小于', '包含', '不包含', '非空'],
      defaultVal: '15',
    },
    {
      name: '涉案金额',
      fieldType: 'number',
      operators: ['等于', '不等于', '大于', '小于', '包含', '不包含', '非空'],
      defaultVal: '5000',
    },
  ],
};

export interface RuleConditionItem {
  id: string;
  name: string; // 条件A, 条件B, 条件C...
  ruleType: ConditionRuleType;
  keywords: string[];
  analysisMethod: AnalysisMethodType;
  detectionType: DetectionMatchType;
  matchNCount: number; // Used when detectionType === '包含任意N个关键词'
  synonymExpansion: boolean;
  // Fields for 文字检查/文本相似度
  similarityThreshold: number; // 0-100 (%)
  singleSentenceEffective?: boolean; // 单句话内生效
  similarSentences: string[];  // 相似话术设置列表（每条体现为一行话术文本）
  // Fields for 文字检查/上下文重复
  repeatWindowSentences?: number;      // 在N句以内重复
  repeatSimilarityThreshold?: number;  // 相似度大于N%（0-100）
  repeatViolationCount?: number;       // 重复次数为N次时违规
  ignoreShortSentenceLength?: number;  // 当句子少于N个字时不检查
  exceptionSentences?: string[];       // 例外句子列表
  // Fields for 语音检查/静音检查
  silenceRoleRelation?: SilenceRoleRelationType; // 【不同角色之间、不区分角色、相同角色】
  silenceComparator?: SilenceComparatorType;     // 【大于、小于】
  silenceDurationSeconds?: number;               // N秒
  // Fields for 语音检查/语速检测
  speechRateCheckMethod?: SpeechRateCheckMethodType; // 检查方式：单句话语速、整个会话平均语速
  speechRateWordsPerMinute?: number;                 // 语速每分钟超过N个字时命中
  speechRateIgnoreShortWords?: number;               // 当一句话少于N字时不检测
  // Fields for 语音检查/抢话检查
  interruptionDurationMs?: number;                   // 抢话时间≥N毫秒
  interruptionMinWords?: number;                     // 抢话句子的字数≥N个字
  interruptionDelayMs?: number;                      // 抢话延迟判定N毫秒
  // Fields for 语音检查/角色检查
  roleCheckSentenceIndex?: number;                   // 检测第N句话
  roleCheckExpectedRole?: RoleCheckTargetType;       // 【坐席、客户】
  // Fields for 语音检查/非正常挂机
  abnormalHangupComparator?: SilenceComparatorType;  // 【大于、小于】
  abnormalHangupSeconds?: number;                    // N秒
  abnormalHangupLastRole?: CallBoundaryRoleType;     // 【任意、客户、坐席】
  // Fields for 语音检查/非正常接听
  abnormalAnswerComparator?: SilenceComparatorType;  // 【大于、小于】
  abnormalAnswerSeconds?: number;                    // N秒
  abnormalAnswerFirstRole?: CallBoundaryRoleType;    // 【任意、客户、坐席】
  // Fields for 语音检查/录音时长检查
  recordingDurationComparator?: SilenceComparatorType; // 【大于、小于】
  recordingDurationSeconds?: number;                   // N秒
  // Fields for 语音检查/音量检测
  volumeDetectionMethod?: VolumeDetectionMethodType;   // 音量范围检测、相邻句子音量波动、最大音量跨度
  volumeComparator?: SilenceComparatorType;            // 【大于、小于】
  volumeDecibels?: number;                             // N分贝
  // Fields for 系统参数
  systemParamCategory?: SystemParamCategoryType;       // 【随录参数/业务参数】
  systemParamName?: string;                            // 【参数名称】
  systemParamOperator?: SystemParamOperatorType;       // 【等于、不等于、包含、不包含、非空（具体根据字段类型调整）】
  systemParamValue?: string;                           // N（输入框，需要手动设置）
  // Fields for 大模型质检/服务规范 & 大模型质检/服务内容 & 大模型质检/服务分类
  llmModelConfig?: LlmModelConfigType;                 // 模型一、模型二
  llmCheckScene?: string;                              // 检查场景（不超过30字）
  llmBackgroundKnowledge?: LlmBackgroundKnowledgeItem[]; // 背景知识（最多5条，名称≤60字，描述≤2000字）
  llmCheckDimensions?: LlmCheckDimensionItem[];        // 检查维度（最多5条，名称≤60字，描述≤5000字）
  llmDimensionLogic?: LlmDimensionLogicType;           // 满足任一维度、满足以上所有维度
  llmServiceContents?: LlmServiceContentItem[];        // 服务内容（可添加多条，客户意图≤60字，坐席标准回复≤2000字）
  llmCategoryTags?: LlmServiceCategoryTagItem[];       // 标签类型（可添加多个标签类型，每条不超过30字）
  llmCategoryCheckLogic?: LlmServiceCategoryLogicType; // 命中任意标签、命中全部标签、命中指定标签
  llmSelectedCategoryTagIds?: string[];                // 命中指定标签时选中的标签ID列表（至少选1个，可多选）
  // Common Footer Fields
  applicableRole: ApplicableRoleType;
  precondition: string; // '无' or condition ID/name; Condition A cannot configure precondition
  detectionScope: DetectionScopeType;
  scopeStartSentence: number; // a
  scopeEndSentence: number;   // b
  minHitCount: number;
  isPublicCondition?: boolean;
  thresholdValue?: string;
}

export type LlmModelConfigType = '模型一' | '模型二';

export type LlmDimensionLogicType = '满足任一维度' | '满足以上所有维度';

export type LlmServiceCategoryLogicType = '命中任意标签' | '命中全部标签' | '命中指定标签';

export interface LlmBackgroundKnowledgeItem {
  id: string;
  name: string;
  description: string;
  collapsed?: boolean;
}

export interface LlmCheckDimensionItem {
  id: string;
  name: string;
  description: string;
  collapsed?: boolean;
}

export interface LlmServiceContentItem {
  id: string;
  customerIntent: string;
  agentStandardReply: string;
  collapsed?: boolean;
}

export interface LlmServiceCategoryTagItem {
  id: string;
  name: string;
}

export const LLM_PRESET_VARIABLES: string[] = [
  '${客户姓名}',
  '${坐席工号}',
  '${业务类型}',
  '${产品名称}',
  '${客户等级}',
  '${呼叫方向}',
  '${技能组名称}',
];

interface QualityRuleConditionCardProps {
  condition: RuleConditionItem;
  index: number;
  allConditions: RuleConditionItem[];
  onUpdate: (updated: RuleConditionItem) => void;
  onDelete: (id: string) => void;
  onAddToPublic: (condition: RuleConditionItem) => void;
}

export const QualityRuleConditionCard: React.FC<QualityRuleConditionCardProps> = ({
  condition,
  index,
  allConditions,
  onUpdate,
  onDelete,
  onAddToPublic,
}) => {
  const [keywordInput, setKeywordInput] = useState('');
  const [similarInput, setSimilarInput] = useState('');
  const [exceptionInput, setExceptionInput] = useState('');
  const [activeVarMenuDimId, setActiveVarMenuDimId] = useState<string | null>(null);
  const [customVarInput, setCustomVarInput] = useState('');
  const isFirstCondition = index === 0; // 条件A 无法配置前置条件

  const isSimilarityRule = condition.ruleType === '文字检查/文本相似度';
  const isContextRepeatRule = condition.ruleType === '文字检查/上下文重复';
  const isSilenceCheckRule = condition.ruleType === '语音检查/静音检查';
  const isSpeechRateRule = condition.ruleType === '语音检查/语速检测';
  const isInterruptionRule = condition.ruleType === '语音检查/抢话检查';
  const isRoleCheckRule = condition.ruleType === '语音检查/角色检查';
  const isAbnormalHangupRule = condition.ruleType === '语音检查/非正常挂机';
  const isAbnormalAnswerRule = condition.ruleType === '语音检查/非正常接听';
  const isRecordingDurationRule = condition.ruleType === '语音检查/录音时长检查';
  const isVolumeCheckRule = condition.ruleType === '语音检查/音量检测';
  const isSystemParamRule = condition.ruleType === '系统参数';
  const isLlmServiceSpecRule = condition.ruleType === '大模型质检/服务规范';
  const isLlmServiceContentRule = condition.ruleType === '大模型质检/服务内容';
  const isLlmServiceCategoryRule = condition.ruleType === '大模型质检/服务分类';
  const hideBottomFooter =
    isRoleCheckRule ||
    isAbnormalHangupRule ||
    isAbnormalAnswerRule ||
    isRecordingDurationRule ||
    isSystemParamRule ||
    isLlmServiceCategoryRule;

  // Available previous conditions for precondition selection (only conditions before current index)
  const previousConditions = allConditions.slice(0, index);

  // ============================================================================
  // 1. Keyword handlers for "文字检查/关键字"
  // ============================================================================
  const addKeywordsFromText = (rawText: string) => {
    const parts = rawText
      .split(/[,，\n]+/)
      .map(item => item.trim())
      .filter(Boolean);

    if (parts.length === 0) return;

    const existingSet = new Set(condition.keywords);
    const nextKeywords = [...condition.keywords];
    parts.forEach(kw => {
      if (!existingSet.has(kw)) {
        existingSet.add(kw);
        nextKeywords.push(kw);
      }
    });

    onUpdate({
      ...condition,
      keywords: nextKeywords,
    });
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (keywordInput.trim()) {
        addKeywordsFromText(keywordInput);
        setKeywordInput('');
      }
    } else if (e.key === 'Backspace' && keywordInput === '' && condition.keywords.length > 0) {
      const nextKeywords = condition.keywords.slice(0, -1);
      onUpdate({
        ...condition,
        keywords: nextKeywords,
      });
    }
  };

  const handleKeywordPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted && (pasted.includes(',') || pasted.includes('，') || pasted.includes('\n'))) {
      e.preventDefault();
      addKeywordsFromText(pasted);
    }
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    onUpdate({
      ...condition,
      keywords: condition.keywords.filter(k => k !== kwToRemove),
    });
  };

  // ============================================================================
  // 2. Similar Phrase handlers for "文字检查/相似问" ("文字检查/文本相似度")
  // ============================================================================
  const currentSimilarSentences = condition.similarSentences || [];

  const addSimilarSentence = (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed) return;

    if (!currentSimilarSentences.includes(trimmed)) {
      onUpdate({
        ...condition,
        similarSentences: [...currentSimilarSentences, trimmed],
      });
    }
  };

  const handleSimilarKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (similarInput.trim()) {
        addSimilarSentence(similarInput);
        setSimilarInput('');
      }
    }
  };

  const handleRemoveSimilarSentence = (indexToRemove: number) => {
    onUpdate({
      ...condition,
      similarSentences: currentSimilarSentences.filter((_, idx) => idx !== indexToRemove),
    });
  };

  // ============================================================================
  // 3. Exception Sentence handlers for "文字检查/上下文重复"
  // ============================================================================
  const currentExceptionSentences = condition.exceptionSentences || [];

  const addExceptionSentence = (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed) return;

    if (!currentExceptionSentences.includes(trimmed)) {
      onUpdate({
        ...condition,
        exceptionSentences: [...currentExceptionSentences, trimmed],
      });
    }
  };

  const handleExceptionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (exceptionInput.trim()) {
        addExceptionSentence(exceptionInput);
        setExceptionInput('');
      }
    }
  };

  const handleRemoveExceptionSentence = (indexToRemove: number) => {
    onUpdate({
      ...condition,
      exceptionSentences: currentExceptionSentences.filter((_, idx) => idx !== indexToRemove),
    });
  };

  // Handle Rule Type change
  const handleRuleTypeChange = (nextType: ConditionRuleType) => {
    const isNextSimilarity = nextType === '文字检查/文本相似度';
    const isNextContextRepeat = nextType === '文字检查/上下文重复';

    onUpdate({
      ...condition,
      ruleType: nextType,
      similarityThreshold:
        condition.similarityThreshold !== undefined ? condition.similarityThreshold : 85,
      singleSentenceEffective:
        condition.singleSentenceEffective !== undefined
          ? condition.singleSentenceEffective
          : true,
      similarSentences:
        isNextSimilarity && (!condition.similarSentences || condition.similarSentences.length === 0)
          ? ['我的银行卡丢了怎么办理挂失？', '帮我把名下的卡紧急挂失一下', '卡片找不到了怎么冻结止付？']
          : condition.similarSentences || [],
      repeatWindowSentences:
        condition.repeatWindowSentences !== undefined ? condition.repeatWindowSentences : 5,
      repeatSimilarityThreshold:
        condition.repeatSimilarityThreshold !== undefined
          ? condition.repeatSimilarityThreshold
          : 85,
      repeatViolationCount:
        condition.repeatViolationCount !== undefined ? condition.repeatViolationCount : 3,
      ignoreShortSentenceLength:
        condition.ignoreShortSentenceLength !== undefined
          ? condition.ignoreShortSentenceLength
          : 4,
      exceptionSentences:
        isNextContextRepeat &&
        (!condition.exceptionSentences || condition.exceptionSentences.length === 0)
          ? ['好的，明白了', '嗯，您请说', '非常感谢您的来电']
          : condition.exceptionSentences || [],
      silenceRoleRelation:
        condition.silenceRoleRelation !== undefined
          ? condition.silenceRoleRelation
          : '不同角色之间',
      silenceComparator:
        condition.silenceComparator !== undefined ? condition.silenceComparator : '大于',
      silenceDurationSeconds:
        condition.silenceDurationSeconds !== undefined ? condition.silenceDurationSeconds : 15,
      speechRateCheckMethod:
        condition.speechRateCheckMethod !== undefined
          ? condition.speechRateCheckMethod
          : '单句话语速',
      speechRateWordsPerMinute:
        condition.speechRateWordsPerMinute !== undefined
          ? condition.speechRateWordsPerMinute
          : 260,
      speechRateIgnoreShortWords:
        condition.speechRateIgnoreShortWords !== undefined
          ? condition.speechRateIgnoreShortWords
          : 5,
      interruptionDurationMs:
        condition.interruptionDurationMs !== undefined
          ? condition.interruptionDurationMs
          : 500,
      interruptionMinWords:
        condition.interruptionMinWords !== undefined ? condition.interruptionMinWords : 3,
      interruptionDelayMs:
        condition.interruptionDelayMs !== undefined ? condition.interruptionDelayMs : 300,
      roleCheckSentenceIndex:
        condition.roleCheckSentenceIndex !== undefined ? condition.roleCheckSentenceIndex : 1,
      roleCheckExpectedRole:
        condition.roleCheckExpectedRole !== undefined ? condition.roleCheckExpectedRole : '坐席',
      abnormalHangupComparator:
        condition.abnormalHangupComparator !== undefined
          ? condition.abnormalHangupComparator
          : '大于',
      abnormalHangupSeconds:
        condition.abnormalHangupSeconds !== undefined ? condition.abnormalHangupSeconds : 10,
      abnormalHangupLastRole:
        condition.abnormalHangupLastRole !== undefined
          ? condition.abnormalHangupLastRole
          : '任意',
      abnormalAnswerComparator:
        condition.abnormalAnswerComparator !== undefined
          ? condition.abnormalAnswerComparator
          : '大于',
      abnormalAnswerSeconds:
        condition.abnormalAnswerSeconds !== undefined ? condition.abnormalAnswerSeconds : 5,
      abnormalAnswerFirstRole:
        condition.abnormalAnswerFirstRole !== undefined
          ? condition.abnormalAnswerFirstRole
          : '坐席',
      recordingDurationComparator:
        condition.recordingDurationComparator !== undefined
          ? condition.recordingDurationComparator
          : '大于',
      recordingDurationSeconds:
        condition.recordingDurationSeconds !== undefined
          ? condition.recordingDurationSeconds
          : 180,
      volumeDetectionMethod:
        condition.volumeDetectionMethod !== undefined
          ? condition.volumeDetectionMethod
          : '音量范围检测',
      volumeComparator:
        condition.volumeComparator !== undefined ? condition.volumeComparator : '大于',
      volumeDecibels:
        condition.volumeDecibels !== undefined ? condition.volumeDecibels : 80,
      systemParamCategory:
        condition.systemParamCategory !== undefined
          ? condition.systemParamCategory
          : '随录参数',
      systemParamName:
        condition.systemParamName !== undefined ? condition.systemParamName : '呼叫方向',
      systemParamOperator:
        condition.systemParamOperator !== undefined ? condition.systemParamOperator : '等于',
      systemParamValue:
        condition.systemParamValue !== undefined ? condition.systemParamValue : '呼入',
      llmModelConfig:
        condition.llmModelConfig !== undefined ? condition.llmModelConfig : '模型一',
      llmCheckScene:
        condition.llmCheckScene !== undefined
          ? condition.llmCheckScene
          : '客服服务态度与言论合规检查',
      llmBackgroundKnowledge:
        condition.llmBackgroundKnowledge && condition.llmBackgroundKnowledge.length > 0
          ? condition.llmBackgroundKnowledge
          : [
              {
                id: `bg_${Date.now()}_1`,
                name: '',
                description: '',
                collapsed: false,
              },
            ],
      llmCheckDimensions:
        condition.llmCheckDimensions && condition.llmCheckDimensions.length > 0
          ? condition.llmCheckDimensions
          : [
              {
                id: `dim_${Date.now()}_1`,
                name: '不当言论',
                description:
                  '判断客服在对话中是否使用了暧昧话术。\n\n### 命中情况\n如果客服在对话过程中使用了暧昧话术，则判定为命中“其他不当言论”，否则判定为未命中。',
                collapsed: false,
              },
            ],
      llmDimensionLogic:
        condition.llmDimensionLogic !== undefined
          ? condition.llmDimensionLogic
          : '满足任一维度',
      llmServiceContents:
        condition.llmServiceContents && condition.llmServiceContents.length > 0
          ? condition.llmServiceContents
          : [
              {
                id: `sc_${Date.now()}_1`,
                customerIntent: '咨询信用卡账单分期手续费及办理方式',
                agentStandardReply:
                  '您好，我行信用卡账单分期可通过手机银行APP或人工坐席办理，具体分期期数及对应手续费率将根据您的用卡情况实时展示，请问需要为您查询当前可办理的分期方案吗？',
                collapsed: false,
              },
            ],
      llmCategoryTags:
        condition.llmCategoryTags && condition.llmCategoryTags.length > 0
          ? condition.llmCategoryTags
          : [
              { id: 'cat_tag_1', name: '账单分期咨询' },
              { id: 'cat_tag_2', name: '年费减免诉求' },
              { id: 'cat_tag_3', name: '卡片挂失补办' },
            ],
      llmCategoryCheckLogic:
        condition.llmCategoryCheckLogic !== undefined
          ? condition.llmCategoryCheckLogic
          : '命中任意标签',
      llmSelectedCategoryTagIds:
        condition.llmSelectedCategoryTagIds && condition.llmSelectedCategoryTagIds.length > 0
          ? condition.llmSelectedCategoryTagIds
          : ['cat_tag_1'],
    });
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-sm shadow-2xs overflow-hidden transition-all">
      {/* 1. Card Header: 条件A / 条件B ... + 加入公共条件 / 删除条件 */}
      <div className="h-10 bg-[#f7f9fc] border-b border-slate-200/70 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-[13px] font-medium text-slate-700">{condition.name}</span>
          {condition.isPublicCondition && (
            <span className="text-[11px] text-[#1677ff] bg-blue-50 px-1.5 py-0.5 rounded">
              已加入公共条件
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <button
            type="button"
            onClick={() => onAddToPublic(condition)}
            className="text-[#1677ff] hover:text-blue-700 hover:underline cursor-pointer transition-colors"
          >
            加入公共条件
          </button>
          <button
            type="button"
            onClick={() => onDelete(condition.id)}
            className="text-[#1677ff] hover:text-red-600 hover:underline cursor-pointer transition-colors"
          >
            删除条件
          </button>
        </div>
      </div>

      {/* 2. Card Body */}
      <div className="p-4 space-y-3.5">
        {isSimilarityRule ? (
          /* ====================================================================
           * 模式A：“文字检查/相似问” (文字检查/文本相似度) 条件配置界面
           * ==================================================================== */
          <>
            {/* Top Control Row: 规则类型 + 相似度达到 (0-100%) + 单句话内生效复选框 */}
            <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-slate-600">
              {/* 规则类型 */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 whitespace-nowrap">规则类型:</span>
                <select
                  value={condition.ruleType}
                  onChange={e => handleRuleTypeChange(e.target.value as ConditionRuleType)}
                  className="h-8 min-w-[165px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                >
                  {CONDITION_RULE_TYPES.map(rt => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>

              {/* 相似度达到：设置相似度比例，范围0-100 单位为% */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 whitespace-nowrap">相似度达到:</span>
                <div className="inline-flex items-center h-8 border border-slate-200 rounded overflow-hidden bg-white focus-within:border-[#1677ff]">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={
                      condition.similarityThreshold !== undefined
                        ? condition.similarityThreshold
                        : 85
                    }
                    onChange={e => {
                      const raw = Number(e.target.value);
                      const clamped = isNaN(raw) ? 0 : Math.min(100, Math.max(0, raw));
                      onUpdate({
                        ...condition,
                        similarityThreshold: clamped,
                      });
                    }}
                    className="w-16 h-full px-2.5 text-center bg-white text-xs text-slate-700 tabular-nums focus:outline-none"
                  />
                  <span className="px-2.5 bg-[#f8fafc] border-l border-slate-200 text-slate-500 h-full flex items-center font-mono">
                    %
                  </span>
                </div>
              </div>

              {/* 在相似度设置右侧添加一个复选框，复选框文本为：单句话内生效 */}
              <div className="flex items-center space-x-1.5">
                <label className="inline-flex items-center space-x-1.5 cursor-pointer select-none text-slate-600 hover:text-slate-800">
                  <input
                    type="checkbox"
                    checked={Boolean(condition.singleSentenceEffective)}
                    onChange={e =>
                      onUpdate({
                        ...condition,
                        singleSentenceEffective: e.target.checked,
                      })
                    }
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#1677ff] focus:ring-0 cursor-pointer accent-[#1677ff]"
                  />
                  <span>单句话内生效</span>
                </label>
                <span
                  title="勾选后仅在单句对话文本内计算语义相似度"
                  className="text-slate-400 hover:text-slate-600 cursor-help inline-flex items-center"
                >
                  <HelpCircle size={14} />
                </span>
              </div>
            </div>

            {/* Middle Area: 相似话术设置（单行文本输入框 + 回车后在下方增加一条话术文本，支持删除） */}
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-600 whitespace-nowrap">相似话术设置:</span>
                <input
                  type="text"
                  value={similarInput}
                  onChange={e => setSimilarInput(e.target.value)}
                  onKeyDown={handleSimilarKeyDown}
                  placeholder="请输入相似话术，输入完成后按回车（Enter）键添加一条相似话术"
                  className="flex-1 h-8 px-3 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#1677ff] transition-colors"
                />
              </div>

              {/* 已添加的相似话术列表（体现为一条条独立的话术文本行，而非关键词标签格式） */}
              {currentSimilarSentences.length > 0 && (
                <div className="border border-slate-200/80 rounded bg-[#fafbfd] divide-y divide-slate-100">
                  {currentSimilarSentences.map((sentence, sIdx) => (
                    <div
                      key={`${sIdx}_${sentence}`}
                      className="px-3.5 py-2 flex items-center justify-between text-xs text-slate-700 hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-3">
                        <span className="text-slate-400 font-mono tabular-nums w-5 flex-shrink-0">
                          {sIdx + 1}.
                        </span>
                        <span className="text-slate-700 break-all leading-relaxed">
                          {sentence}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSimilarSentence(sIdx)}
                        className="text-slate-400 hover:text-red-600 flex items-center space-x-1 flex-shrink-0 cursor-pointer transition-colors"
                        title="删除该条相似话术"
                      >
                        <Trash2 size={13} />
                        <span>删除</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : isContextRepeatRule ? (
          /* ====================================================================
           * 模式B：“文字检查/上下文重复” 条件配置界面（组件样式参考相似问）
           * ==================================================================== */
          <>
            {/* Row 1: 规则类型 */}
            <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 whitespace-nowrap">规则类型:</span>
                <select
                  value={condition.ruleType}
                  onChange={e => handleRuleTypeChange(e.target.value as ConditionRuleType)}
                  className="h-8 min-w-[165px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                >
                  {CONDITION_RULE_TYPES.map(rt => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: 检查逻辑：在N句以内重复，相似度大于N%（0-100，数越大相似度越高）。重复次数为N次时违规，当句子少于N个字时不检查。 */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-1.5 text-xs text-slate-700 bg-[#f8fafc] border border-slate-200/80 rounded px-3.5 py-2.5 leading-relaxed">
              <span className="text-slate-600 font-medium mr-1">检查逻辑:</span>
              <span>在</span>
              <input
                type="number"
                min={1}
                value={
                  condition.repeatWindowSentences !== undefined
                    ? condition.repeatWindowSentences
                    : 5
                }
                onChange={e =>
                  onUpdate({
                    ...condition,
                    repeatWindowSentences: Math.max(1, Number(e.target.value) || 1),
                  })
                }
                className="w-14 h-7 px-2 text-center bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
              />
              <span>句以内重复，相似度大于</span>
              <div className="inline-flex items-center h-7 border border-slate-200 rounded overflow-hidden bg-white focus-within:border-[#1677ff]">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={
                    condition.repeatSimilarityThreshold !== undefined
                      ? condition.repeatSimilarityThreshold
                      : 85
                  }
                  onChange={e => {
                    const raw = Number(e.target.value);
                    const clamped = isNaN(raw) ? 0 : Math.min(100, Math.max(0, raw));
                    onUpdate({
                      ...condition,
                      repeatSimilarityThreshold: clamped,
                    });
                  }}
                  className="w-14 h-full px-2 text-center bg-white text-xs text-slate-700 tabular-nums focus:outline-none"
                />
                <span className="px-2 bg-slate-50 border-l border-slate-200 text-slate-500 h-full flex items-center font-mono">
                  %
                </span>
              </div>
              <span className="text-slate-400">（0-100，数越大相似度越高）。</span>
              <span>重复次数为</span>
              <input
                type="number"
                min={1}
                value={
                  condition.repeatViolationCount !== undefined
                    ? condition.repeatViolationCount
                    : 3
                }
                onChange={e =>
                  onUpdate({
                    ...condition,
                    repeatViolationCount: Math.max(1, Number(e.target.value) || 1),
                  })
                }
                className="w-14 h-7 px-2 text-center bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
              />
              <span>次时违规，当句子少于</span>
              <input
                type="number"
                min={0}
                value={
                  condition.ignoreShortSentenceLength !== undefined
                    ? condition.ignoreShortSentenceLength
                    : 4
                }
                onChange={e =>
                  onUpdate({
                    ...condition,
                    ignoreShortSentenceLength: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="w-14 h-7 px-2 text-center bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
              />
              <span>个字时不检查。</span>
            </div>

            {/* Row 3: 例外句子（单行文本输入框，按Enter后在下方增加一条话术文本，支持删除，组件样式参考相似问） */}
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-600 whitespace-nowrap">例外句子:</span>
                <input
                  type="text"
                  value={exceptionInput}
                  onChange={e => setExceptionInput(e.target.value)}
                  onKeyDown={handleExceptionKeyDown}
                  placeholder="请输入例外句子，输入完成后按回车（Enter）键添加一条话术"
                  className="flex-1 h-8 px-3 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#1677ff] transition-colors"
                />
              </div>

              {currentExceptionSentences.length > 0 && (
                <div className="border border-slate-200/80 rounded bg-[#fafbfd] divide-y divide-slate-100">
                  {currentExceptionSentences.map((sentence, sIdx) => (
                    <div
                      key={`${sIdx}_${sentence}`}
                      className="px-3.5 py-2 flex items-center justify-between text-xs text-slate-700 hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-3">
                        <span className="text-slate-400 font-mono tabular-nums w-5 flex-shrink-0">
                          {sIdx + 1}.
                        </span>
                        <span className="text-slate-700 break-all leading-relaxed">
                          {sentence}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExceptionSentence(sIdx)}
                        className="text-slate-400 hover:text-red-600 flex items-center space-x-1 flex-shrink-0 cursor-pointer transition-colors"
                        title="删除该条例外句子"
                      >
                        <Trash2 size={13} />
                        <span>删除</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : isSilenceCheckRule ? (
          /* ====================================================================
           * 模式C：“语音检查/静音检查” 条件配置界面（组件样式参考上下文重复）
           * ==================================================================== */
          <>
            {/* Row 1: 规则类型 */}
            <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 whitespace-nowrap">规则类型:</span>
                <select
                  value={condition.ruleType}
                  onChange={e => handleRuleTypeChange(e.target.value as ConditionRuleType)}
                  className="h-8 min-w-[165px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                >
                  {CONDITION_RULE_TYPES.map(rt => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: 检查逻辑：【不同角色之间、不区分角色、相同角色】静音时长【大于、小于】N秒。 */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-2 text-xs text-slate-700 bg-[#f8fafc] border border-slate-200/80 rounded px-3.5 py-2.5 leading-relaxed">
              <span className="text-slate-600 font-medium mr-1">检查逻辑:</span>
              <select
                value={condition.silenceRoleRelation || '不同角色之间'}
                onChange={e =>
                  onUpdate({
                    ...condition,
                    silenceRoleRelation: e.target.value as SilenceRoleRelationType,
                  })
                }
                className="h-7 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
              >
                <option value="不同角色之间">不同角色之间</option>
                <option value="不区分角色">不区分角色</option>
                <option value="相同角色">相同角色</option>
              </select>
              <span>静音时长</span>
              <select
                value={condition.silenceComparator || '大于'}
                onChange={e =>
                  onUpdate({
                    ...condition,
                    silenceComparator: e.target.value as SilenceComparatorType,
                  })
                }
                className="h-7 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
              >
                <option value="大于">大于</option>
                <option value="小于">小于</option>
              </select>
              <input
                type="number"
                min={0}
                value={
                  condition.silenceDurationSeconds !== undefined
                    ? condition.silenceDurationSeconds
                    : 15
                }
                onChange={e =>
                  onUpdate({
                    ...condition,
                    silenceDurationSeconds: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="w-16 h-7 px-2 text-center bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
              />
              <span>秒。</span>
            </div>
          </>
        ) : isSpeechRateRule ? (
          /* ====================================================================
           * 模式D：“语音检查/语速检测”（语速检查）条件配置界面（组件样式参考静音检查）
           * ==================================================================== */
          <>
            {/* Row 1: 规则类型 + 检查方式（单句话语速、整个会话平均语速） */}
            <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 whitespace-nowrap">规则类型:</span>
                <select
                  value={condition.ruleType}
                  onChange={e => handleRuleTypeChange(e.target.value as ConditionRuleType)}
                  className="h-8 min-w-[165px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                >
                  {CONDITION_RULE_TYPES.map(rt => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>

              {/* 检查方式：单句话语速、整个会话平均语速 */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 whitespace-nowrap">检查方式:</span>
                <select
                  value={condition.speechRateCheckMethod || '单句话语速'}
                  onChange={e =>
                    onUpdate({
                      ...condition,
                      speechRateCheckMethod: e.target.value as SpeechRateCheckMethodType,
                    })
                  }
                  className="h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                >
                  <option value="单句话语速">单句话语速</option>
                  <option value="整个会话平均语速">整个会话平均语速</option>
                </select>
              </div>
            </div>

            {/* Row 2: 检查逻辑：语速每分钟超过N个字时命中，当一句话少于N字时不检测。 */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-2 text-xs text-slate-700 bg-[#f8fafc] border border-slate-200/80 rounded px-3.5 py-2.5 leading-relaxed">
              <span className="text-slate-600 font-medium mr-1">检查逻辑:</span>
              <span>语速每分钟超过</span>
              <input
                type="number"
                min={1}
                value={
                  condition.speechRateWordsPerMinute !== undefined
                    ? condition.speechRateWordsPerMinute
                    : 260
                }
                onChange={e =>
                  onUpdate({
                    ...condition,
                    speechRateWordsPerMinute: Math.max(1, Number(e.target.value) || 1),
                  })
                }
                className="w-16 h-7 px-2 text-center bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
              />
              <span>个字时命中，当一句话少于</span>
              <input
                type="number"
                min={0}
                value={
                  condition.speechRateIgnoreShortWords !== undefined
                    ? condition.speechRateIgnoreShortWords
                    : 5
                }
                onChange={e =>
                  onUpdate({
                    ...condition,
                    speechRateIgnoreShortWords: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="w-16 h-7 px-2 text-center bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
              />
              <span>字时不检测。</span>
            </div>
          </>
        ) : isInterruptionRule ? (
          /* ====================================================================
           * 模式E：“语音检查/抢话检查” 条件配置界面（组件样式参考静音检查）
           * ==================================================================== */
          <>
            {/* Row 1: 规则类型 */}
            <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 whitespace-nowrap">规则类型:</span>
                <select
                  value={condition.ruleType}
                  onChange={e => handleRuleTypeChange(e.target.value as ConditionRuleType)}
                  className="h-8 min-w-[165px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                >
                  {CONDITION_RULE_TYPES.map(rt => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: 检查逻辑：抢话时间≥N毫秒，抢话句子的字数≥N个字，抢话延迟判定N毫秒。 */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-2 text-xs text-slate-700 bg-[#f8fafc] border border-slate-200/80 rounded px-3.5 py-2.5 leading-relaxed">
              <span className="text-slate-600 font-medium mr-1">检查逻辑:</span>
              <span>抢话时间≥</span>
              <input
                type="number"
                min={0}
                value={
                  condition.interruptionDurationMs !== undefined
                    ? condition.interruptionDurationMs
                    : 500
                }
                onChange={e =>
                  onUpdate({
                    ...condition,
                    interruptionDurationMs: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="w-16 h-7 px-2 text-center bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
              />
              <span>毫秒，抢话句子的字数≥</span>
              <input
                type="number"
                min={1}
                value={
                  condition.interruptionMinWords !== undefined
                    ? condition.interruptionMinWords
                    : 3
                }
                onChange={e =>
                  onUpdate({
                    ...condition,
                    interruptionMinWords: Math.max(1, Number(e.target.value) || 1),
                  })
                }
                className="w-16 h-7 px-2 text-center bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
              />
              <span>个字，抢话延迟判定</span>
              <input
                type="number"
                min={0}
                value={
                  condition.interruptionDelayMs !== undefined
                    ? condition.interruptionDelayMs
                    : 300
                }
                onChange={e =>
                  onUpdate({
                    ...condition,
                    interruptionDelayMs: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="w-16 h-7 px-2 text-center bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
              />
              <span>毫秒。</span>
            </div>
          </>
        ) : isRoleCheckRule ? (
          /* ====================================================================
           * 模式F：“语音检查/角色检查” 条件配置界面（组件样式参考静音检查）
           * ==================================================================== */
          <>
            {/* Row 1: 规则类型 */}
            <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 whitespace-nowrap">规则类型:</span>
                <select
                  value={condition.ruleType}
                  onChange={e => handleRuleTypeChange(e.target.value as ConditionRuleType)}
                  className="h-8 min-w-[165px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                >
                  {CONDITION_RULE_TYPES.map(rt => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: 检查逻辑：检测第N句话的角色是否为【坐席、客户】。 */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-2 text-xs text-slate-700 bg-[#f8fafc] border border-slate-200/80 rounded px-3.5 py-2.5 leading-relaxed">
              <span className="text-slate-600 font-medium mr-1">检查逻辑:</span>
              <span>检测第</span>
              <input
                type="number"
                min={1}
                value={
                  condition.roleCheckSentenceIndex !== undefined
                    ? condition.roleCheckSentenceIndex
                    : 1
                }
                onChange={e =>
                  onUpdate({
                    ...condition,
                    roleCheckSentenceIndex: Math.max(1, Number(e.target.value) || 1),
                  })
                }
                className="w-16 h-7 px-2 text-center bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
              />
              <span>句话的角色是否为</span>
              <select
                value={condition.roleCheckExpectedRole || '坐席'}
                onChange={e =>
                  onUpdate({
                    ...condition,
                    roleCheckExpectedRole: e.target.value as RoleCheckTargetType,
                  })
                }
                className="h-7 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
              >
                <option value="坐席">坐席</option>
                <option value="客户">客户</option>
              </select>
              <span>。</span>
            </div>
          </>
        ) : isAbnormalHangupRule ? (
          /* ====================================================================
           * 模式G：“语音检查/非正常挂机” 条件配置界面（组件样式参考静音检查）
           * ==================================================================== */
          <>
            {/* Row 1: 规则类型 */}
            <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 whitespace-nowrap">规则类型:</span>
                <select
                  value={condition.ruleType}
                  onChange={e => handleRuleTypeChange(e.target.value as ConditionRuleType)}
                  className="h-8 min-w-[165px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                >
                  {CONDITION_RULE_TYPES.map(rt => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: 检查逻辑：最后一句话结束时间到挂机时间【大于、小于】N秒，最后一句话的角色为【任意、客户、坐席】。 */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-2 text-xs text-slate-700 bg-[#f8fafc] border border-slate-200/80 rounded px-3.5 py-2.5 leading-relaxed">
              <span className="text-slate-600 font-medium mr-1">检查逻辑:</span>
              <span>最后一句话结束时间到挂机时间</span>
              <select
                value={condition.abnormalHangupComparator || '大于'}
                onChange={e =>
                  onUpdate({
                    ...condition,
                    abnormalHangupComparator: e.target.value as SilenceComparatorType,
                  })
                }
                className="h-7 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
              >
                <option value="大于">大于</option>
                <option value="小于">小于</option>
              </select>
              <input
                type="number"
                min={0}
                value={
                  condition.abnormalHangupSeconds !== undefined
                    ? condition.abnormalHangupSeconds
                    : 10
                }
                onChange={e =>
                  onUpdate({
                    ...condition,
                    abnormalHangupSeconds: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="w-16 h-7 px-2 text-center bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
              />
              <span>秒，最后一句话的角色为</span>
              <select
                value={condition.abnormalHangupLastRole || '任意'}
                onChange={e =>
                  onUpdate({
                    ...condition,
                    abnormalHangupLastRole: e.target.value as CallBoundaryRoleType,
                  })
                }
                className="h-7 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
              >
                <option value="任意">任意</option>
                <option value="客户">客户</option>
                <option value="坐席">坐席</option>
              </select>
              <span>。</span>
            </div>
          </>
        ) : isAbnormalAnswerRule ? (
          /* ====================================================================
           * 模式H：“语音检查/非正常接听” 条件配置界面（组件样式参考静音检查）
           * ==================================================================== */
          <>
            {/* Row 1: 规则类型 */}
            <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 whitespace-nowrap">规则类型:</span>
                <select
                  value={condition.ruleType}
                  onChange={e => handleRuleTypeChange(e.target.value as ConditionRuleType)}
                  className="h-8 min-w-[165px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                >
                  {CONDITION_RULE_TYPES.map(rt => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: 检查逻辑：接通电话时间到说第一句话的时间【大于、小于】N秒，第一句话的角色为【任意、客户、坐席】。 */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-2 text-xs text-slate-700 bg-[#f8fafc] border border-slate-200/80 rounded px-3.5 py-2.5 leading-relaxed">
              <span className="text-slate-600 font-medium mr-1">检查逻辑:</span>
              <span>接通电话时间到说第一句话的时间</span>
              <select
                value={condition.abnormalAnswerComparator || '大于'}
                onChange={e =>
                  onUpdate({
                    ...condition,
                    abnormalAnswerComparator: e.target.value as SilenceComparatorType,
                  })
                }
                className="h-7 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
              >
                <option value="大于">大于</option>
                <option value="小于">小于</option>
              </select>
              <input
                type="number"
                min={0}
                value={
                  condition.abnormalAnswerSeconds !== undefined
                    ? condition.abnormalAnswerSeconds
                    : 5
                }
                onChange={e =>
                  onUpdate({
                    ...condition,
                    abnormalAnswerSeconds: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="w-16 h-7 px-2 text-center bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
              />
              <span>秒，第一句话的角色为</span>
              <select
                value={condition.abnormalAnswerFirstRole || '坐席'}
                onChange={e =>
                  onUpdate({
                    ...condition,
                    abnormalAnswerFirstRole: e.target.value as CallBoundaryRoleType,
                  })
                }
                className="h-7 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
              >
                <option value="任意">任意</option>
                <option value="客户">客户</option>
                <option value="坐席">坐席</option>
              </select>
              <span>。</span>
            </div>
          </>
        ) : isRecordingDurationRule ? (
          /* ====================================================================
           * 模式I：“语音检查/录音时长检查” 条件配置界面（组件样式参考静音检查）
           * ==================================================================== */
          <>
            {/* Row 1: 规则类型 */}
            <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 whitespace-nowrap">规则类型:</span>
                <select
                  value={condition.ruleType}
                  onChange={e => handleRuleTypeChange(e.target.value as ConditionRuleType)}
                  className="h-8 min-w-[165px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                >
                  {CONDITION_RULE_TYPES.map(rt => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: 检查逻辑：整通对话的时长【大于、小于】N秒。 */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-2 text-xs text-slate-700 bg-[#f8fafc] border border-slate-200/80 rounded px-3.5 py-2.5 leading-relaxed">
              <span className="text-slate-600 font-medium mr-1">检查逻辑:</span>
              <span>整通对话的时长</span>
              <select
                value={condition.recordingDurationComparator || '大于'}
                onChange={e =>
                  onUpdate({
                    ...condition,
                    recordingDurationComparator: e.target.value as SilenceComparatorType,
                  })
                }
                className="h-7 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
              >
                <option value="大于">大于</option>
                <option value="小于">小于</option>
              </select>
              <input
                type="number"
                min={0}
                value={
                  condition.recordingDurationSeconds !== undefined
                    ? condition.recordingDurationSeconds
                    : 180
                }
                onChange={e =>
                  onUpdate({
                    ...condition,
                    recordingDurationSeconds: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="w-18 h-7 px-2 text-center bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
              />
              <span>秒。</span>
            </div>
          </>
        ) : isVolumeCheckRule ? (
          /* ====================================================================
           * 模式J：“语音检查/音量检测” 条件配置界面（组件样式参考静音检查）
           * ==================================================================== */
          <>
            {/* Row 1: 规则类型 + 检测方式 */}
            <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 whitespace-nowrap">规则类型:</span>
                <select
                  value={condition.ruleType}
                  onChange={e => handleRuleTypeChange(e.target.value as ConditionRuleType)}
                  className="h-8 min-w-[165px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                >
                  {CONDITION_RULE_TYPES.map(rt => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-slate-600 whitespace-nowrap">检测方式:</span>
                <select
                  value={condition.volumeDetectionMethod || '音量范围检测'}
                  onChange={e =>
                    onUpdate({
                      ...condition,
                      volumeDetectionMethod: e.target.value as VolumeDetectionMethodType,
                    })
                  }
                  className="h-8 min-w-[150px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                >
                  <option value="音量范围检测">音量范围检测</option>
                  <option value="相邻句子音量波动">相邻句子音量波动</option>
                  <option value="最大音量跨度">最大音量跨度</option>
                </select>
              </div>
            </div>

            {/* Row 2: 检查逻辑（根据检测方式不同配置不同的监测逻辑） */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-2 text-xs text-slate-700 bg-[#f8fafc] border border-slate-200/80 rounded px-3.5 py-2.5 leading-relaxed">
              <span className="text-slate-600 font-medium mr-1">检查逻辑:</span>
              <span>
                {(condition.volumeDetectionMethod || '音量范围检测') === '相邻句子音量波动'
                  ? '相邻句子音量差距'
                  : (condition.volumeDetectionMethod || '音量范围检测') === '最大音量跨度'
                    ? '最大音量差距'
                    : '说话音量'}
              </span>
              <select
                value={condition.volumeComparator || '大于'}
                onChange={e =>
                  onUpdate({
                    ...condition,
                    volumeComparator: e.target.value as SilenceComparatorType,
                  })
                }
                className="h-7 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
              >
                <option value="大于">大于</option>
                <option value="小于">小于</option>
              </select>
              <input
                type="number"
                min={0}
                value={
                  condition.volumeDecibels !== undefined ? condition.volumeDecibels : 80
                }
                onChange={e =>
                  onUpdate({
                    ...condition,
                    volumeDecibels: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="w-16 h-7 px-2 text-center bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
              />
              <span>分贝。</span>
            </div>
          </>
        ) : isSystemParamRule ? (
          /* ====================================================================
           * 模式K：“系统参数” 条件配置界面（组件样式参考静音检查）
           * ==================================================================== */
          <>
            {/* Row 1: 规则类型 */}
            <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 whitespace-nowrap">规则类型:</span>
                <select
                  value={condition.ruleType}
                  onChange={e => handleRuleTypeChange(e.target.value as ConditionRuleType)}
                  className="h-8 min-w-[165px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                >
                  {CONDITION_RULE_TYPES.map(rt => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: 参数选择：【随录参数/业务参数】【参数名称】【等于、不等于、包含、不包含、非空（具体根据字段类型调整）】N */}
            {(() => {
              const currentCategory: SystemParamCategoryType =
                condition.systemParamCategory || '随录参数';
              const paramDefs = SYSTEM_PARAM_DEFINITIONS[currentCategory] || [];
              const currentParamDef =
                paramDefs.find(p => p.name === condition.systemParamName) || paramDefs[0];
              const currentOperators: SystemParamOperatorType[] = currentParamDef
                ? currentParamDef.operators
                : ['等于', '不等于', '包含', '不包含', '非空'];
              const currentOperator: SystemParamOperatorType =
                condition.systemParamOperator &&
                currentOperators.includes(condition.systemParamOperator)
                  ? condition.systemParamOperator
                  : currentOperators[0];

              return (
                <div className="flex flex-wrap items-center gap-y-2 gap-x-2 text-xs text-slate-700 bg-[#f8fafc] border border-slate-200/80 rounded px-3.5 py-2.5 leading-relaxed">
                  <span className="text-slate-600 font-medium mr-1">参数选择:</span>

                  {/* 【随录参数/业务参数】 */}
                  <select
                    value={currentCategory}
                    onChange={e => {
                      const nextCategory = e.target.value as SystemParamCategoryType;
                      const nextDefs = SYSTEM_PARAM_DEFINITIONS[nextCategory] || [];
                      const firstDef = nextDefs[0];
                      onUpdate({
                        ...condition,
                        systemParamCategory: nextCategory,
                        systemParamName: firstDef ? firstDef.name : '',
                        systemParamOperator: firstDef ? firstDef.operators[0] : '等于',
                        systemParamValue: firstDef ? firstDef.defaultVal : '',
                      });
                    }}
                    className="h-7 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                  >
                    <option value="随录参数">随录参数</option>
                    <option value="业务参数">业务参数</option>
                  </select>

                  {/* 【参数名称】 */}
                  <select
                    value={currentParamDef ? currentParamDef.name : ''}
                    onChange={e => {
                      const nextName = e.target.value;
                      const nextDef =
                        paramDefs.find(p => p.name === nextName) || paramDefs[0];
                      const nextOperator =
                        condition.systemParamOperator &&
                        nextDef &&
                        nextDef.operators.includes(condition.systemParamOperator)
                          ? condition.systemParamOperator
                          : nextDef
                            ? nextDef.operators[0]
                            : '等于';
                      onUpdate({
                        ...condition,
                        systemParamName: nextName,
                        systemParamOperator: nextOperator,
                        systemParamValue: nextDef ? nextDef.defaultVal : '',
                      });
                    }}
                    className="h-7 min-w-[130px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                  >
                    {paramDefs.map(def => (
                      <option key={def.name} value={def.name}>
                        {def.name}
                      </option>
                    ))}
                  </select>

                  {/* 【等于、不等于、包含、不包含、非空（具体根据字段类型调整）】 */}
                  <select
                    value={currentOperator}
                    onChange={e =>
                      onUpdate({
                        ...condition,
                        systemParamOperator: e.target.value as SystemParamOperatorType,
                      })
                    }
                    className="h-7 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                  >
                    {currentOperators.map(op => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>

                  {/* N（输入框，需要手动设置） */}
                  <input
                    type={currentParamDef?.fieldType === 'number' ? 'number' : 'text'}
                    placeholder="请输入参数值"
                    value={
                      condition.systemParamValue !== undefined
                        ? condition.systemParamValue
                        : currentParamDef?.defaultVal || ''
                    }
                    onChange={e =>
                      onUpdate({
                        ...condition,
                        systemParamValue: e.target.value,
                      })
                    }
                    className="w-36 h-7 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
                  />
                </div>
              );
            })()}
          </>
        ) : isLlmServiceSpecRule ? (
          /* ====================================================================
           * 模式L：“大模型质检/服务规范” 条件配置界面
           * ==================================================================== */
          (() => {
            const knowledgeList: LlmBackgroundKnowledgeItem[] =
              condition.llmBackgroundKnowledge && condition.llmBackgroundKnowledge.length > 0
                ? condition.llmBackgroundKnowledge
                : [
                    {
                      id: 'bg_default_1',
                      name: '',
                      description: '',
                      collapsed: false,
                    },
                  ];

            const dimensionList: LlmCheckDimensionItem[] =
              condition.llmCheckDimensions && condition.llmCheckDimensions.length > 0
                ? condition.llmCheckDimensions
                : [
                    {
                      id: 'dim_default_1',
                      name: '不当言论',
                      description:
                        '判断客服在对话中是否使用了暧昧话术。\n\n### 命中情况\n如果客服在对话过程中使用了暧昧话术，则判定为命中“其他不当言论”，否则判定为未命中。',
                      collapsed: false,
                    },
                  ];

            const handleUpdateKnowledge = (
              id: string,
              patch: Partial<LlmBackgroundKnowledgeItem>
            ) => {
              const next = knowledgeList.map(item =>
                item.id === id ? { ...item, ...patch } : item
              );
              onUpdate({ ...condition, llmBackgroundKnowledge: next });
            };

            const handleAddKnowledge = () => {
              if (knowledgeList.length >= 5) return;
              const next: LlmBackgroundKnowledgeItem[] = [
                ...knowledgeList,
                {
                  id: `bg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                  name: '',
                  description: '',
                  collapsed: false,
                },
              ];
              onUpdate({ ...condition, llmBackgroundKnowledge: next });
            };

            const handleDeleteKnowledge = (id: string) => {
              if (knowledgeList.length <= 1) {
                onUpdate({
                  ...condition,
                  llmBackgroundKnowledge: [
                    {
                      id: `bg_${Date.now()}_reset`,
                      name: '',
                      description: '',
                      collapsed: false,
                    },
                  ],
                });
                return;
              }
              onUpdate({
                ...condition,
                llmBackgroundKnowledge: knowledgeList.filter(item => item.id !== id),
              });
            };

            const handleUpdateDimension = (
              id: string,
              patch: Partial<LlmCheckDimensionItem>
            ) => {
              const next = dimensionList.map(item =>
                item.id === id ? { ...item, ...patch } : item
              );
              onUpdate({ ...condition, llmCheckDimensions: next });
            };

            const handleAddDimension = () => {
              if (dimensionList.length >= 5) return;
              const next: LlmCheckDimensionItem[] = [
                ...dimensionList,
                {
                  id: `dim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                  name: '',
                  description: '',
                  collapsed: false,
                },
              ];
              onUpdate({ ...condition, llmCheckDimensions: next });
            };

            const handleDeleteDimension = (id: string) => {
              if (dimensionList.length <= 1) {
                onUpdate({
                  ...condition,
                  llmCheckDimensions: [
                    {
                      id: `dim_${Date.now()}_reset`,
                      name: '',
                      description: '',
                      collapsed: false,
                    },
                  ],
                });
                return;
              }
              onUpdate({
                ...condition,
                llmCheckDimensions: dimensionList.filter(item => item.id !== id),
              });
            };

            const handleInsertVariableIntoDimension = (dimId: string, variableToken: string) => {
              const target = dimensionList.find(d => d.id === dimId);
              if (!target) return;
              const nextDesc = (target.description + variableToken).slice(0, 5000);
              handleUpdateDimension(dimId, { description: nextDesc });
              setActiveVarMenuDimId(null);
              setCustomVarInput('');
            };

            return (
              <div className="space-y-4">
                {/* Row 1: 规则类型 + 模型配置 + 检查场景 */}
                <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-slate-600">
                  {/* 规则类型 */}
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600 whitespace-nowrap">规则类型:</span>
                    <select
                      value={condition.ruleType}
                      onChange={e => handleRuleTypeChange(e.target.value as ConditionRuleType)}
                      className="h-8 min-w-[165px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                    >
                      {CONDITION_RULE_TYPES.map(rt => (
                        <option key={rt} value={rt}>
                          {rt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 模型配置 */}
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600 whitespace-nowrap">模型配置:</span>
                    <select
                      value={condition.llmModelConfig || '模型一'}
                      onChange={e =>
                        onUpdate({
                          ...condition,
                          llmModelConfig: e.target.value as LlmModelConfigType,
                        })
                      }
                      className="h-8 min-w-[130px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                    >
                      <option value="模型一">模型一</option>
                      <option value="模型二">模型二</option>
                    </select>
                  </div>

                  {/* 检查场景（文本输入，不超过30字） */}
                  <div className="flex items-center space-x-2 flex-1 min-w-[260px] max-w-[420px]">
                    <span className="text-slate-600 whitespace-nowrap">检查场景:</span>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        maxLength={30}
                        placeholder="请输入检查场景（不超过30字）"
                        value={condition.llmCheckScene ?? ''}
                        onChange={e =>
                          onUpdate({
                            ...condition,
                            llmCheckScene: e.target.value.slice(0, 30),
                          })
                        }
                        className="w-full h-8 pl-2.5 pr-12 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1677ff] transition-colors"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 tabular-nums pointer-events-none">
                        {(condition.llmCheckScene ?? '').length}/30
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 2: 背景知识（参考图片样式，最多可添加5条） */}
                <div className="flex items-start gap-x-3 pt-1">
                  <div className="w-24 shrink-0 pt-2 flex items-center space-x-1 text-xs text-slate-700">
                    <span>背景知识</span>
                    <span
                      title="提供服务质检场景相关的背景知识，可以提升模型识别效果（最多5条）"
                      className="text-slate-400 hover:text-slate-600 cursor-help"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2.5">
                    {knowledgeList.map((item, kIdx) => (
                      <div
                        key={item.id}
                        className="bg-[#f4f6f9] border border-slate-200/70 rounded px-4 py-3 space-y-2.5"
                      >
                        {/* Header: 知识点名称 + 删除 / 折叠按钮 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-slate-700">
                              知识点名称
                            </span>
                            {item.collapsed && item.name && (
                              <span className="text-xs text-slate-500 truncate max-w-[320px]">
                                （{item.name}）
                              </span>
                            )}
                            {knowledgeList.length > 1 && (
                              <span className="text-[11px] text-slate-400 tabular-nums">
                                #{kIdx + 1}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-slate-500">
                            <button
                              type="button"
                              onClick={() => handleDeleteKnowledge(item.id)}
                              title="删除该条背景知识"
                              className="p-1 text-slate-500 hover:text-red-600 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateKnowledge(item.id, {
                                  collapsed: !item.collapsed,
                                })
                              }
                              title={item.collapsed ? '展开知识点' : '收起知识点'}
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                            >
                              {item.collapsed ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronUp className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {!item.collapsed && (
                          <>
                            {/* 知识点名称输入框（不超过60字） */}
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={60}
                                placeholder="请输入知识点名称"
                                value={item.name}
                                onChange={e =>
                                  handleUpdateKnowledge(item.id, {
                                    name: e.target.value.slice(0, 60),
                                  })
                                }
                                className="w-full h-8 pl-3 pr-14 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1677ff] transition-colors"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 tabular-nums pointer-events-none">
                                {item.name.length}/60
                              </span>
                            </div>

                            {/* 知识点描述（不超过2000字） */}
                            <div className="space-y-1.5 pt-0.5">
                              <div className="text-xs font-medium text-slate-700">
                                知识点描述
                              </div>
                              <div className="bg-white border border-slate-200 rounded focus-within:border-[#1677ff] transition-colors">
                                <textarea
                                  rows={3}
                                  maxLength={2000}
                                  placeholder="请输入知识点描述"
                                  value={item.description}
                                  onChange={e =>
                                    handleUpdateKnowledge(item.id, {
                                      description: e.target.value.slice(0, 2000),
                                    })
                                  }
                                  className="w-full px-3 pt-2 pb-1 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none resize-y leading-relaxed"
                                />
                                <div className="flex justify-end px-3 pb-1.5 text-[11px] text-slate-400 tabular-nums">
                                  {item.description.length}/2000
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {/* + 添加知识点 1/5 */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-0.5 text-xs">
                      <button
                        type="button"
                        disabled={knowledgeList.length >= 5}
                        onClick={handleAddKnowledge}
                        className="text-[#1677ff] hover:text-blue-700 font-medium disabled:text-slate-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        + 添加知识点
                      </button>
                      <span className="text-slate-500 tabular-nums">
                        {knowledgeList.length}/5
                      </span>
                      <span className="text-slate-400">
                        提供服务质检场景相关的背景知识，可以提升模型识别效果
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 3: *检测维度（检查维度，最多可添加5条，支持自定义变量插入） */}
                <div className="flex items-start gap-x-3 pt-1">
                  <div className="w-24 shrink-0 pt-2 flex items-center space-x-1 text-xs text-slate-700">
                    <span>
                      <span className="text-red-500 mr-0.5">*</span>检测维度
                    </span>
                    <span
                      title="最多可添加五条检查维度，每条由维度名称（不超过60字）+维度描述（不超过5000字）组合，支持插入自定义变量"
                      className="text-slate-400 hover:text-slate-600 cursor-help"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2.5">
                    {dimensionList.map((dim, dIdx) => (
                      <div
                        key={dim.id}
                        className="bg-[#f4f6f9] border border-slate-200/70 rounded px-4 py-3 space-y-2.5"
                      >
                        {/* Header: *检测维度名称 + 删除 / 折叠按钮 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-slate-700">
                              <span className="text-red-500 mr-0.5">*</span>检测维度名称
                            </span>
                            {dim.collapsed && dim.name && (
                              <span className="text-xs text-slate-500 truncate max-w-[320px]">
                                （{dim.name}）
                              </span>
                            )}
                            {dimensionList.length > 1 && (
                              <span className="text-[11px] text-slate-400 tabular-nums">
                                #{dIdx + 1}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-slate-500">
                            <button
                              type="button"
                              onClick={() => handleDeleteDimension(dim.id)}
                              title="删除该条检测维度"
                              className="p-1 text-slate-500 hover:text-red-600 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateDimension(dim.id, {
                                  collapsed: !dim.collapsed,
                                })
                              }
                              title={dim.collapsed ? '展开检测维度' : '收起检测维度'}
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                            >
                              {dim.collapsed ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronUp className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {!dim.collapsed && (
                          <>
                            {/* *检测维度名称输入框（不超过60字） */}
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={60}
                                placeholder="请输入检测维度名称"
                                value={dim.name}
                                onChange={e =>
                                  handleUpdateDimension(dim.id, {
                                    name: e.target.value.slice(0, 60),
                                  })
                                }
                                className="w-full h-8 pl-3 pr-14 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1677ff] transition-colors"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 tabular-nums pointer-events-none">
                                {dim.name.length}/60
                              </span>
                            </div>

                            {/* *检测维度描述（不超过5000字，支持插入自定义变量） */}
                            <div className="space-y-1.5 pt-0.5">
                              <div className="text-xs font-medium text-slate-700">
                                <span className="text-red-500 mr-0.5">*</span>检测维度描述
                              </div>

                              <div className="bg-white border border-slate-200 rounded focus-within:border-[#1677ff] transition-colors">
                                {/* Top Shortcut Toolbar: 快捷操作: (?) $()自定义变量 */}
                                <div className="relative bg-[#f8fafc] border-b border-slate-200 px-3 py-1.5 flex items-center space-x-2">
                                  <span className="text-xs text-slate-500">快捷操作:</span>
                                  <span
                                    title="点击按钮可在维度描述中插入自定义变量"
                                    className="text-slate-400 hover:text-slate-600 cursor-help"
                                  >
                                    <HelpCircle className="w-3.5 h-3.5" />
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveVarMenuDimId(
                                        activeVarMenuDimId === dim.id ? null : dim.id
                                      )
                                    }
                                    className="px-2 py-0.5 bg-[#e8f1ff] hover:bg-blue-100 text-[#1677ff] rounded text-xs font-medium transition-colors cursor-pointer"
                                  >
                                    $()自定义变量
                                  </button>

                                  {/* Popover Menu for inserting custom variable */}
                                  {activeVarMenuDimId === dim.id && (
                                    <div className="absolute left-24 top-8 z-20 w-64 bg-white border border-slate-200 rounded shadow-md p-2.5 space-y-2">
                                      <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-slate-100">
                                        <span>选择或输入自定义变量</span>
                                        <button
                                          type="button"
                                          onClick={() => setActiveVarMenuDimId(null)}
                                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {LLM_PRESET_VARIABLES.map(v => (
                                          <button
                                            key={v}
                                            type="button"
                                            onClick={() =>
                                              handleInsertVariableIntoDimension(dim.id, v)
                                            }
                                            className="px-2 py-0.5 bg-slate-100 hover:bg-[#e8f1ff] hover:text-[#1677ff] text-slate-700 rounded text-[11px] transition-colors cursor-pointer"
                                          >
                                            {v}
                                          </button>
                                        ))}
                                      </div>
                                      <div className="flex items-center space-x-1.5 pt-1 border-t border-slate-100">
                                        <input
                                          type="text"
                                          placeholder="自定义变量名，如：订单号"
                                          value={customVarInput}
                                          onChange={e => setCustomVarInput(e.target.value)}
                                          onKeyDown={e => {
                                            if (e.key === 'Enter' && customVarInput.trim()) {
                                              e.preventDefault();
                                              handleInsertVariableIntoDimension(
                                                dim.id,
                                                `\${${customVarInput.trim()}}`
                                              );
                                            }
                                          }}
                                          className="flex-1 h-6 px-2 bg-white border border-slate-200 rounded text-[11px] text-slate-700 focus:outline-none focus:border-[#1677ff]"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (customVarInput.trim()) {
                                              handleInsertVariableIntoDimension(
                                                dim.id,
                                                `\${${customVarInput.trim()}}`
                                              );
                                            }
                                          }}
                                          className="h-6 px-2 bg-[#1677ff] hover:bg-blue-600 text-white rounded text-[11px] cursor-pointer"
                                        >
                                          插入
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Description Textarea */}
                                <textarea
                                  rows={4}
                                  maxLength={5000}
                                  placeholder="请输入检测维度描述"
                                  value={dim.description}
                                  onChange={e => {
                                    const val = e.target.value.slice(0, 5000);
                                    handleUpdateDimension(dim.id, { description: val });
                                    if (val.endsWith('/')) {
                                      setActiveVarMenuDimId(dim.id);
                                    }
                                  }}
                                  className="w-full px-3 pt-2.5 pb-1 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none resize-y leading-relaxed"
                                />

                                {/* Bottom bar: 输入“/”插入更多变量 + 93/5000 */}
                                <div className="flex items-center justify-between px-3 pb-2 pt-1 text-[11px] text-slate-400">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveVarMenuDimId(
                                        activeVarMenuDimId === dim.id ? null : dim.id
                                      )
                                    }
                                    className="text-slate-400 hover:text-[#1677ff] transition-colors cursor-pointer"
                                  >
                                    输入“/”插入更多变量
                                  </button>
                                  <span className="tabular-nums">
                                    {dim.description.length}/5000
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {/* + 添加质检维度 1/5 */}
                    <div className="flex items-center space-x-2.5 pt-0.5 text-xs">
                      <button
                        type="button"
                        disabled={dimensionList.length >= 5}
                        onClick={handleAddDimension}
                        className="text-[#1677ff] hover:text-blue-700 font-medium disabled:text-slate-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        + 添加质检维度
                      </button>
                      <span className="text-slate-500 tabular-nums">
                        {dimensionList.length}/5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 4: *维度逻辑关系 */}
                <div className="flex items-center gap-x-3 pt-1 text-xs">
                  <div className="w-24 shrink-0 flex items-center space-x-1 text-slate-700">
                    <span>
                      <span className="text-red-500 mr-0.5">*</span>维度逻辑关系
                    </span>
                    <span
                      title="配置多个质检维度之间的逻辑判定关系"
                      className="text-slate-400 hover:text-slate-600 cursor-help"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <label className="inline-flex items-center space-x-1.5 text-slate-700 cursor-pointer select-none">
                      <input
                        type="radio"
                        name={`dim_logic_${condition.id}`}
                        checked={
                          (condition.llmDimensionLogic || '满足任一维度') === '满足任一维度'
                        }
                        onChange={() =>
                          onUpdate({
                            ...condition,
                            llmDimensionLogic: '满足任一维度',
                          })
                        }
                        className="w-3.5 h-3.5 text-[#1677ff] border-slate-300 focus:ring-[#1677ff]"
                      />
                      <span>满足任一维度</span>
                      <span
                        title="任意一个检查维度命中时，即判定该条件命中"
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </span>
                    </label>

                    <label className="inline-flex items-center space-x-1.5 text-slate-700 cursor-pointer select-none">
                      <input
                        type="radio"
                        name={`dim_logic_${condition.id}`}
                        checked={condition.llmDimensionLogic === '满足以上所有维度'}
                        onChange={() =>
                          onUpdate({
                            ...condition,
                            llmDimensionLogic: '满足以上所有维度',
                          })
                        }
                        className="w-3.5 h-3.5 text-[#1677ff] border-slate-300 focus:ring-[#1677ff]"
                      />
                      <span>满足以上所有维度</span>
                      <span
                        title="全部检查维度同时命中时，才判定该条件命中"
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })()
        ) : isLlmServiceContentRule ? (
          /* ====================================================================
           * 模式M：“大模型质检/服务内容” 条件配置界面（组件样式参考大模型质检/服务规范）
           * ==================================================================== */
          (() => {
            const knowledgeList: LlmBackgroundKnowledgeItem[] =
              condition.llmBackgroundKnowledge && condition.llmBackgroundKnowledge.length > 0
                ? condition.llmBackgroundKnowledge
                : [
                    {
                      id: 'bg_default_1',
                      name: '',
                      description: '',
                      collapsed: false,
                    },
                  ];

            const serviceContentList: LlmServiceContentItem[] =
              condition.llmServiceContents && condition.llmServiceContents.length > 0
                ? condition.llmServiceContents
                : [
                    {
                      id: 'sc_default_1',
                      customerIntent: '咨询信用卡账单分期手续费及办理方式',
                      agentStandardReply:
                        '您好，我行信用卡账单分期可通过手机银行APP或人工坐席办理，具体分期期数及对应手续费率将根据您的用卡情况实时展示，请问需要为您查询当前可办理的分期方案吗？',
                      collapsed: false,
                    },
                  ];

            const handleUpdateKnowledge = (
              id: string,
              patch: Partial<LlmBackgroundKnowledgeItem>
            ) => {
              const next = knowledgeList.map(item =>
                item.id === id ? { ...item, ...patch } : item
              );
              onUpdate({ ...condition, llmBackgroundKnowledge: next });
            };

            const handleAddKnowledge = () => {
              if (knowledgeList.length >= 5) return;
              const next: LlmBackgroundKnowledgeItem[] = [
                ...knowledgeList,
                {
                  id: `bg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                  name: '',
                  description: '',
                  collapsed: false,
                },
              ];
              onUpdate({ ...condition, llmBackgroundKnowledge: next });
            };

            const handleDeleteKnowledge = (id: string) => {
              if (knowledgeList.length <= 1) {
                onUpdate({
                  ...condition,
                  llmBackgroundKnowledge: [
                    {
                      id: `bg_${Date.now()}_reset`,
                      name: '',
                      description: '',
                      collapsed: false,
                    },
                  ],
                });
                return;
              }
              onUpdate({
                ...condition,
                llmBackgroundKnowledge: knowledgeList.filter(item => item.id !== id),
              });
            };

            const handleUpdateServiceContent = (
              id: string,
              patch: Partial<LlmServiceContentItem>
            ) => {
              const next = serviceContentList.map(item =>
                item.id === id ? { ...item, ...patch } : item
              );
              onUpdate({ ...condition, llmServiceContents: next });
            };

            const handleAddServiceContent = () => {
              const next: LlmServiceContentItem[] = [
                ...serviceContentList,
                {
                  id: `sc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                  customerIntent: '',
                  agentStandardReply: '',
                  collapsed: false,
                },
              ];
              onUpdate({ ...condition, llmServiceContents: next });
            };

            const handleDeleteServiceContent = (id: string) => {
              if (serviceContentList.length <= 1) {
                onUpdate({
                  ...condition,
                  llmServiceContents: [
                    {
                      id: `sc_${Date.now()}_reset`,
                      customerIntent: '',
                      agentStandardReply: '',
                      collapsed: false,
                    },
                  ],
                });
                return;
              }
              onUpdate({
                ...condition,
                llmServiceContents: serviceContentList.filter(item => item.id !== id),
              });
            };

            return (
              <div className="space-y-4">
                {/* Row 1: 规则类型 + 模型配置 + 检查场景 */}
                <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-slate-600">
                  {/* 规则类型 */}
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600 whitespace-nowrap">规则类型:</span>
                    <select
                      value={condition.ruleType}
                      onChange={e => handleRuleTypeChange(e.target.value as ConditionRuleType)}
                      className="h-8 min-w-[165px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                    >
                      {CONDITION_RULE_TYPES.map(rt => (
                        <option key={rt} value={rt}>
                          {rt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 模型配置 */}
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600 whitespace-nowrap">模型配置:</span>
                    <select
                      value={condition.llmModelConfig || '模型一'}
                      onChange={e =>
                        onUpdate({
                          ...condition,
                          llmModelConfig: e.target.value as LlmModelConfigType,
                        })
                      }
                      className="h-8 min-w-[130px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                    >
                      <option value="模型一">模型一</option>
                      <option value="模型二">模型二</option>
                    </select>
                  </div>

                  {/* 检查场景（文本输入，不超过30字） */}
                  <div className="flex items-center space-x-2 flex-1 min-w-[260px] max-w-[420px]">
                    <span className="text-slate-600 whitespace-nowrap">检查场景:</span>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        maxLength={30}
                        placeholder="请输入检查场景（不超过30字）"
                        value={condition.llmCheckScene ?? ''}
                        onChange={e =>
                          onUpdate({
                            ...condition,
                            llmCheckScene: e.target.value.slice(0, 30),
                          })
                        }
                        className="w-full h-8 pl-2.5 pr-12 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1677ff] transition-colors"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 tabular-nums pointer-events-none">
                        {(condition.llmCheckScene ?? '').length}/30
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 2: 背景知识（最多可添加5条，每条由知识点名称≤60字 + 知识点描述≤2000字组成） */}
                <div className="flex items-start gap-x-3 pt-1">
                  <div className="w-24 shrink-0 pt-2 flex items-center space-x-1 text-xs text-slate-700">
                    <span>背景知识</span>
                    <span
                      title="提供服务质检场景相关的背景知识，可以提升模型识别效果（最多5条）"
                      className="text-slate-400 hover:text-slate-600 cursor-help"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2.5">
                    {knowledgeList.map((item, kIdx) => (
                      <div
                        key={item.id}
                        className="bg-[#f4f6f9] border border-slate-200/70 rounded px-4 py-3 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-slate-700">
                              知识点名称
                            </span>
                            {item.collapsed && item.name && (
                              <span className="text-xs text-slate-500 truncate max-w-[320px]">
                                （{item.name}）
                              </span>
                            )}
                            {knowledgeList.length > 1 && (
                              <span className="text-[11px] text-slate-400 tabular-nums">
                                #{kIdx + 1}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-slate-500">
                            <button
                              type="button"
                              onClick={() => handleDeleteKnowledge(item.id)}
                              title="删除该条背景知识"
                              className="p-1 text-slate-500 hover:text-red-600 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateKnowledge(item.id, {
                                  collapsed: !item.collapsed,
                                })
                              }
                              title={item.collapsed ? '展开知识点' : '收起知识点'}
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                            >
                              {item.collapsed ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronUp className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {!item.collapsed && (
                          <>
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={60}
                                placeholder="请输入知识点名称"
                                value={item.name}
                                onChange={e =>
                                  handleUpdateKnowledge(item.id, {
                                    name: e.target.value.slice(0, 60),
                                  })
                                }
                                className="w-full h-8 pl-3 pr-14 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1677ff] transition-colors"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 tabular-nums pointer-events-none">
                                {item.name.length}/60
                              </span>
                            </div>

                            <div className="space-y-1.5 pt-0.5">
                              <div className="text-xs font-medium text-slate-700">
                                知识点描述
                              </div>
                              <div className="bg-white border border-slate-200 rounded focus-within:border-[#1677ff] transition-colors">
                                <textarea
                                  rows={3}
                                  maxLength={2000}
                                  placeholder="请输入知识点描述"
                                  value={item.description}
                                  onChange={e =>
                                    handleUpdateKnowledge(item.id, {
                                      description: e.target.value.slice(0, 2000),
                                    })
                                  }
                                  className="w-full px-3 pt-2 pb-1 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none resize-y leading-relaxed"
                                />
                                <div className="flex justify-end px-3 pb-1.5 text-[11px] text-slate-400 tabular-nums">
                                  {item.description.length}/2000
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {/* + 添加知识点 1/5 */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-0.5 text-xs">
                      <button
                        type="button"
                        disabled={knowledgeList.length >= 5}
                        onClick={handleAddKnowledge}
                        className="text-[#1677ff] hover:text-blue-700 font-medium disabled:text-slate-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        + 添加知识点
                      </button>
                      <span className="text-slate-500 tabular-nums">
                        {knowledgeList.length}/5
                      </span>
                      <span className="text-slate-400">
                        提供服务质检场景相关的背景知识，可以提升模型识别效果
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 3: *服务内容（可添加多条服务内容，每条由客户意图≤60字 + 坐席标准回复≤2000字组合） */}
                <div className="flex items-start gap-x-3 pt-1">
                  <div className="w-24 shrink-0 pt-2 flex items-center space-x-1 text-xs text-slate-700">
                    <span>
                      <span className="text-red-500 mr-0.5">*</span>服务内容
                    </span>
                    <span
                      title="可添加多条服务内容，每条由客户意图（不超过60字）+坐席标准回复（不超过2000字）组合"
                      className="text-slate-400 hover:text-slate-600 cursor-help"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2.5">
                    {serviceContentList.map((scItem, sIdx) => (
                      <div
                        key={scItem.id}
                        className="bg-[#f4f6f9] border border-slate-200/70 rounded px-4 py-3 space-y-2.5"
                      >
                        {/* Header: *客户意图 + 删除 / 折叠按钮 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-slate-700">
                              <span className="text-red-500 mr-0.5">*</span>客户意图
                            </span>
                            {scItem.collapsed && scItem.customerIntent && (
                              <span className="text-xs text-slate-500 truncate max-w-[320px]">
                                （{scItem.customerIntent}）
                              </span>
                            )}
                            {serviceContentList.length > 1 && (
                              <span className="text-[11px] text-slate-400 tabular-nums">
                                #{sIdx + 1}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-slate-500">
                            <button
                              type="button"
                              onClick={() => handleDeleteServiceContent(scItem.id)}
                              title="删除该条服务内容"
                              className="p-1 text-slate-500 hover:text-red-600 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateServiceContent(scItem.id, {
                                  collapsed: !scItem.collapsed,
                                })
                              }
                              title={scItem.collapsed ? '展开服务内容' : '收起服务内容'}
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                            >
                              {scItem.collapsed ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronUp className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {!scItem.collapsed && (
                          <>
                            {/* *客户意图输入框（不超过60字） */}
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={60}
                                placeholder="请输入客户意图（不超过60字）"
                                value={scItem.customerIntent}
                                onChange={e =>
                                  handleUpdateServiceContent(scItem.id, {
                                    customerIntent: e.target.value.slice(0, 60),
                                  })
                                }
                                className="w-full h-8 pl-3 pr-14 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1677ff] transition-colors"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 tabular-nums pointer-events-none">
                                {scItem.customerIntent.length}/60
                              </span>
                            </div>

                            {/* *坐席标准回复（不超过2000字） */}
                            <div className="space-y-1.5 pt-0.5">
                              <div className="text-xs font-medium text-slate-700">
                                <span className="text-red-500 mr-0.5">*</span>坐席标准回复
                              </div>
                              <div className="bg-white border border-slate-200 rounded focus-within:border-[#1677ff] transition-colors">
                                <textarea
                                  rows={3}
                                  maxLength={2000}
                                  placeholder="请输入坐席标准回复（不超过2000字）"
                                  value={scItem.agentStandardReply}
                                  onChange={e =>
                                    handleUpdateServiceContent(scItem.id, {
                                      agentStandardReply: e.target.value.slice(0, 2000),
                                    })
                                  }
                                  className="w-full px-3 pt-2 pb-1 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none resize-y leading-relaxed"
                                />
                                <div className="flex justify-end px-3 pb-1.5 text-[11px] text-slate-400 tabular-nums">
                                  {scItem.agentStandardReply.length}/2000
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {/* + 添加服务内容 */}
                    <div className="flex items-center space-x-2.5 pt-0.5 text-xs">
                      <button
                        type="button"
                        onClick={handleAddServiceContent}
                        className="text-[#1677ff] hover:text-blue-700 font-medium transition-colors cursor-pointer"
                      >
                        + 添加服务内容
                      </button>
                      <span className="text-slate-400 tabular-nums">
                        已添加 {serviceContentList.length} 条
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        ) : isLlmServiceCategoryRule ? (
          /* ====================================================================
           * 模式N：“大模型质检/服务分类” 条件配置界面（组件样式参考大模型质检/服务规范）
           * ==================================================================== */
          (() => {
            const knowledgeList: LlmBackgroundKnowledgeItem[] =
              condition.llmBackgroundKnowledge && condition.llmBackgroundKnowledge.length > 0
                ? condition.llmBackgroundKnowledge
                : [
                    {
                      id: 'bg_default_1',
                      name: '',
                      description: '',
                      collapsed: false,
                    },
                  ];

            const categoryTagList: LlmServiceCategoryTagItem[] =
              condition.llmCategoryTags && condition.llmCategoryTags.length > 0
                ? condition.llmCategoryTags
                : [
                    { id: 'cat_tag_1', name: '账单分期咨询' },
                    { id: 'cat_tag_2', name: '年费减免诉求' },
                    { id: 'cat_tag_3', name: '卡片挂失补办' },
                  ];

            const currentCheckLogic: LlmServiceCategoryLogicType =
              condition.llmCategoryCheckLogic || '命中任意标签';

            const validTagIds = categoryTagList.map(t => t.id);
            const rawSelectedIds = (condition.llmSelectedCategoryTagIds || []).filter(id =>
              validTagIds.includes(id)
            );
            const selectedTagIds: string[] =
              rawSelectedIds.length > 0
                ? rawSelectedIds
                : categoryTagList[0]
                  ? [categoryTagList[0].id]
                  : [];

            const handleUpdateKnowledge = (
              id: string,
              patch: Partial<LlmBackgroundKnowledgeItem>
            ) => {
              const next = knowledgeList.map(item =>
                item.id === id ? { ...item, ...patch } : item
              );
              onUpdate({ ...condition, llmBackgroundKnowledge: next });
            };

            const handleAddKnowledge = () => {
              if (knowledgeList.length >= 5) return;
              const next: LlmBackgroundKnowledgeItem[] = [
                ...knowledgeList,
                {
                  id: `bg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                  name: '',
                  description: '',
                  collapsed: false,
                },
              ];
              onUpdate({ ...condition, llmBackgroundKnowledge: next });
            };

            const handleDeleteKnowledge = (id: string) => {
              if (knowledgeList.length <= 1) {
                onUpdate({
                  ...condition,
                  llmBackgroundKnowledge: [
                    {
                      id: `bg_${Date.now()}_reset`,
                      name: '',
                      description: '',
                      collapsed: false,
                    },
                  ],
                });
                return;
              }
              onUpdate({
                ...condition,
                llmBackgroundKnowledge: knowledgeList.filter(item => item.id !== id),
              });
            };

            const handleUpdateCategoryTag = (id: string, name: string) => {
              const next = categoryTagList.map(tag =>
                tag.id === id ? { ...tag, name: name.slice(0, 30) } : tag
              );
              onUpdate({ ...condition, llmCategoryTags: next });
            };

            const handleAddCategoryTag = () => {
              const newId = `cat_tag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
              const next: LlmServiceCategoryTagItem[] = [
                ...categoryTagList,
                { id: newId, name: '' },
              ];
              onUpdate({
                ...condition,
                llmCategoryTags: next,
                llmSelectedCategoryTagIds:
                  selectedTagIds.length > 0 ? selectedTagIds : [newId],
              });
            };

            const handleDeleteCategoryTag = (id: string) => {
              if (categoryTagList.length <= 1) {
                const resetId = `cat_tag_${Date.now()}_reset`;
                onUpdate({
                  ...condition,
                  llmCategoryTags: [{ id: resetId, name: '' }],
                  llmSelectedCategoryTagIds: [resetId],
                });
                return;
              }
              const nextTags = categoryTagList.filter(tag => tag.id !== id);
              const nextSelected = selectedTagIds.filter(selId => selId !== id);
              onUpdate({
                ...condition,
                llmCategoryTags: nextTags,
                llmSelectedCategoryTagIds:
                  nextSelected.length > 0 ? nextSelected : [nextTags[0].id],
              });
            };

            const handleToggleSelectedTag = (tagId: string) => {
              const exists = selectedTagIds.includes(tagId);
              if (exists) {
                // 至少选择一个标签
                if (selectedTagIds.length <= 1) return;
                onUpdate({
                  ...condition,
                  llmSelectedCategoryTagIds: selectedTagIds.filter(id => id !== tagId),
                });
              } else {
                onUpdate({
                  ...condition,
                  llmSelectedCategoryTagIds: [...selectedTagIds, tagId],
                });
              }
            };

            return (
              <div className="space-y-4">
                {/* Row 1: 规则类型 + 模型配置 + 检查场景 */}
                <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-slate-600">
                  {/* 规则类型 */}
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600 whitespace-nowrap">规则类型:</span>
                    <select
                      value={condition.ruleType}
                      onChange={e => handleRuleTypeChange(e.target.value as ConditionRuleType)}
                      className="h-8 min-w-[165px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                    >
                      {CONDITION_RULE_TYPES.map(rt => (
                        <option key={rt} value={rt}>
                          {rt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 模型配置 */}
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600 whitespace-nowrap">模型配置:</span>
                    <select
                      value={condition.llmModelConfig || '模型一'}
                      onChange={e =>
                        onUpdate({
                          ...condition,
                          llmModelConfig: e.target.value as LlmModelConfigType,
                        })
                      }
                      className="h-8 min-w-[130px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                    >
                      <option value="模型一">模型一</option>
                      <option value="模型二">模型二</option>
                    </select>
                  </div>

                  {/* 检查场景（文本输入，不超过30字） */}
                  <div className="flex items-center space-x-2 flex-1 min-w-[260px] max-w-[420px]">
                    <span className="text-slate-600 whitespace-nowrap">检查场景:</span>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        maxLength={30}
                        placeholder="请输入检查场景（不超过30字）"
                        value={condition.llmCheckScene ?? ''}
                        onChange={e =>
                          onUpdate({
                            ...condition,
                            llmCheckScene: e.target.value.slice(0, 30),
                          })
                        }
                        className="w-full h-8 pl-2.5 pr-12 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1677ff] transition-colors"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 tabular-nums pointer-events-none">
                        {(condition.llmCheckScene ?? '').length}/30
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 2: 背景知识（最多可添加5条，每条由知识点名称≤60字 + 知识点描述≤2000字组成） */}
                <div className="flex items-start gap-x-3 pt-1">
                  <div className="w-24 shrink-0 pt-2 flex items-center space-x-1 text-xs text-slate-700">
                    <span>背景知识</span>
                    <span
                      title="提供服务质检场景相关的背景知识，可以提升模型识别效果（最多5条）"
                      className="text-slate-400 hover:text-slate-600 cursor-help"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2.5">
                    {knowledgeList.map((item, kIdx) => (
                      <div
                        key={item.id}
                        className="bg-[#f4f6f9] border border-slate-200/70 rounded px-4 py-3 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-slate-700">
                              知识点名称
                            </span>
                            {item.collapsed && item.name && (
                              <span className="text-xs text-slate-500 truncate max-w-[320px]">
                                （{item.name}）
                              </span>
                            )}
                            {knowledgeList.length > 1 && (
                              <span className="text-[11px] text-slate-400 tabular-nums">
                                #{kIdx + 1}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-slate-500">
                            <button
                              type="button"
                              onClick={() => handleDeleteKnowledge(item.id)}
                              title="删除该条背景知识"
                              className="p-1 text-slate-500 hover:text-red-600 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateKnowledge(item.id, {
                                  collapsed: !item.collapsed,
                                })
                              }
                              title={item.collapsed ? '展开知识点' : '收起知识点'}
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                            >
                              {item.collapsed ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronUp className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {!item.collapsed && (
                          <>
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={60}
                                placeholder="请输入知识点名称"
                                value={item.name}
                                onChange={e =>
                                  handleUpdateKnowledge(item.id, {
                                    name: e.target.value.slice(0, 60),
                                  })
                                }
                                className="w-full h-8 pl-3 pr-14 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1677ff] transition-colors"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 tabular-nums pointer-events-none">
                                {item.name.length}/60
                              </span>
                            </div>

                            <div className="space-y-1.5 pt-0.5">
                              <div className="text-xs font-medium text-slate-700">
                                知识点描述
                              </div>
                              <div className="bg-white border border-slate-200 rounded focus-within:border-[#1677ff] transition-colors">
                                <textarea
                                  rows={3}
                                  maxLength={2000}
                                  placeholder="请输入知识点描述"
                                  value={item.description}
                                  onChange={e =>
                                    handleUpdateKnowledge(item.id, {
                                      description: e.target.value.slice(0, 2000),
                                    })
                                  }
                                  className="w-full px-3 pt-2 pb-1 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none resize-y leading-relaxed"
                                />
                                <div className="flex justify-end px-3 pb-1.5 text-[11px] text-slate-400 tabular-nums">
                                  {item.description.length}/2000
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {/* + 添加知识点 1/5 */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-0.5 text-xs">
                      <button
                        type="button"
                        disabled={knowledgeList.length >= 5}
                        onClick={handleAddKnowledge}
                        className="text-[#1677ff] hover:text-blue-700 font-medium disabled:text-slate-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        + 添加知识点
                      </button>
                      <span className="text-slate-500 tabular-nums">
                        {knowledgeList.length}/5
                      </span>
                      <span className="text-slate-400">
                        提供服务质检场景相关的背景知识，可以提升模型识别效果
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 3: *标签类型（可添加多个标签类型，每条标签类型输入不超过30字） */}
                <div className="flex items-start gap-x-3 pt-1">
                  <div className="w-24 shrink-0 pt-2 flex items-center space-x-1 text-xs text-slate-700">
                    <span>
                      <span className="text-red-500 mr-0.5">*</span>标签类型
                    </span>
                    <span
                      title="可添加多个标签类型，每条标签类型输入不超过30字"
                      className="text-slate-400 hover:text-slate-600 cursor-help"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    {categoryTagList.map((tag, tIdx) => (
                      <div
                        key={tag.id}
                        className="bg-[#f4f6f9] border border-slate-200/70 rounded px-4 py-2.5 flex items-center gap-x-3"
                      >
                        <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
                          <span className="text-red-500 mr-0.5">*</span>标签名称
                          {categoryTagList.length > 1 && (
                            <span className="ml-1 text-[11px] text-slate-400 tabular-nums">
                              #{tIdx + 1}
                            </span>
                          )}
                        </span>

                        <div className="relative flex-1">
                          <input
                            type="text"
                            maxLength={30}
                            placeholder="请输入标签类型名称（不超过30字）"
                            value={tag.name}
                            onChange={e => handleUpdateCategoryTag(tag.id, e.target.value)}
                            className="w-full h-8 pl-3 pr-14 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1677ff] transition-colors"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 tabular-nums pointer-events-none">
                            {tag.name.length}/30
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteCategoryTag(tag.id)}
                          title="删除该标签类型"
                          className="p-1 text-slate-500 hover:text-red-600 hover:bg-slate-200/60 rounded transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* + 添加标签类型 */}
                    <div className="flex items-center space-x-2.5 pt-0.5 text-xs">
                      <button
                        type="button"
                        onClick={handleAddCategoryTag}
                        className="text-[#1677ff] hover:text-blue-700 font-medium transition-colors cursor-pointer"
                      >
                        + 添加标签类型
                      </button>
                      <span className="text-slate-400 tabular-nums">
                        已添加 {categoryTagList.length} 个标签
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 4: *检查逻辑：命中任意标签、命中全部标签、命中指定标签（需从添加的标签中选择标签，至少选择一个，可多选） */}
                <div className="flex items-start gap-x-3 pt-1 text-xs">
                  <div className="w-24 shrink-0 pt-0.5 flex items-center space-x-1 text-slate-700">
                    <span>
                      <span className="text-red-500 mr-0.5">*</span>检查逻辑
                    </span>
                    <span
                      title="配置服务分类标签的命中判定逻辑"
                      className="text-slate-400 hover:text-slate-600 cursor-help"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-0.5">
                      {(
                        [
                          {
                            value: '命中任意标签' as LlmServiceCategoryLogicType,
                            tip: '命中上方配置的任意一个服务分类标签即判定命中',
                          },
                          {
                            value: '命中全部标签' as LlmServiceCategoryLogicType,
                            tip: '同时命中上方配置的全部服务分类标签才判定命中',
                          },
                          {
                            value: '命中指定标签' as LlmServiceCategoryLogicType,
                            tip: '从已添加的标签中指定一个或多个目标标签进行命中判定',
                          },
                        ]
                      ).map(opt => (
                        <label
                          key={opt.value}
                          className="inline-flex items-center space-x-1.5 text-slate-700 cursor-pointer select-none"
                        >
                          <input
                            type="radio"
                            name={`cat_logic_${condition.id}`}
                            checked={currentCheckLogic === opt.value}
                            onChange={() =>
                              onUpdate({
                                ...condition,
                                llmCategoryCheckLogic: opt.value,
                                llmSelectedCategoryTagIds:
                                  selectedTagIds.length > 0
                                    ? selectedTagIds
                                    : categoryTagList[0]
                                      ? [categoryTagList[0].id]
                                      : [],
                              })
                            }
                            className="w-3.5 h-3.5 text-[#1677ff] border-slate-300 focus:ring-[#1677ff]"
                          />
                          <span>{opt.value}</span>
                          <span
                            title={opt.tip}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </span>
                        </label>
                      ))}
                    </div>

                    {/* 当选择“命中指定标签”时，展示从已添加标签中选择的多选区域（至少选择一个，可多选） */}
                    {currentCheckLogic === '命中指定标签' && (
                      <div className="bg-[#f4f6f9] border border-slate-200/70 rounded px-4 py-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">
                            选择指定标签
                            <span className="text-slate-400 font-normal ml-1.5">
                              （从已添加的标签中选择，至少选择一个，可多选）
                            </span>
                          </span>
                          <span className="text-[11px] text-[#1677ff] bg-blue-50 px-2 py-0.5 rounded tabular-nums">
                            已选 {selectedTagIds.length}/{categoryTagList.length}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-0.5">
                          {categoryTagList.map((tag, idx) => {
                            const isChecked = selectedTagIds.includes(tag.id);
                            const isLastSelected = isChecked && selectedTagIds.length <= 1;
                            const displayLabel = tag.name.trim() || `未命名标签 #${idx + 1}`;
                            return (
                              <label
                                key={tag.id}
                                title={
                                  isLastSelected
                                    ? '至少需保留选择一个标签'
                                    : `点击${isChecked ? '取消选择' : '选择'}该标签`
                                }
                                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border text-xs transition-colors select-none ${
                                  isChecked
                                    ? 'bg-[#e8f1ff] border-[#1677ff]/60 text-[#1677ff] font-medium'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                } ${
                                  isLastSelected ? 'cursor-not-allowed' : 'cursor-pointer'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleSelectedTag(tag.id)}
                                  className="w-3.5 h-3.5 rounded text-[#1677ff] border-slate-300 focus:ring-[#1677ff]"
                                />
                                <span className="max-w-[220px] truncate">{displayLabel}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          /* ====================================================================
           * 模式I：“文字检查/关键字” 及其他默认条件配置界面
           * ==================================================================== */
          <>
            {/* Top Control Row: 规则类型 + 检测类型 + 分析方式 */}
            <div className="flex flex-wrap items-center gap-y-2.5 gap-x-5 text-xs text-slate-600">
              {/* 规则类型 */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 whitespace-nowrap">规则类型:</span>
                <select
                  value={condition.ruleType}
                  onChange={e => handleRuleTypeChange(e.target.value as ConditionRuleType)}
                  className="h-8 min-w-[165px] px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                >
                  {CONDITION_RULE_TYPES.map(rt => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>

              {/* 检测类型 */}
              <div className="flex items-center space-x-1.5">
                <div className="inline-flex items-center h-8 border border-slate-200 rounded overflow-hidden bg-white focus-within:border-[#1677ff]">
                  <span className="px-2.5 text-slate-500 bg-[#f8fafc] border-r border-slate-200 h-full flex items-center whitespace-nowrap">
                    检测类型
                  </span>
                  <select
                    value={condition.detectionType}
                    onChange={e =>
                      onUpdate({
                        ...condition,
                        detectionType: e.target.value as DetectionMatchType,
                      })
                    }
                    className="h-full px-2.5 bg-white text-xs text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="包含任意关键词">包含任意关键词</option>
                    <option value="包含全部上述关键词">包含全部上述关键词</option>
                    <option value="包含任意N个关键词">包含任意N个关键词</option>
                    <option value="全部不包含">全部不包含</option>
                  </select>
                </div>

                {condition.detectionType === '包含任意N个关键词' && (
                  <div className="inline-flex items-center space-x-1">
                    <span className="text-slate-500">N =</span>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, condition.keywords.length || 99)}
                      value={condition.matchNCount}
                      onChange={e =>
                        onUpdate({
                          ...condition,
                          matchNCount: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                      className="w-14 h-8 px-2 text-center bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
                    />
                  </div>
                )}

                <span className="text-slate-600 whitespace-nowrap">关键词</span>
                <span
                  title="检测类型支持：包含任意关键词、包含全部上述关键词、包含任意N个关键词、全部不包含"
                  className="text-slate-400 hover:text-slate-600 cursor-help inline-flex items-center"
                >
                  <HelpCircle size={14} />
                </span>
              </div>

              {/* 分析方式：下拉框（单句分析、多句分析） */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 whitespace-nowrap">分析方式:</span>
                <select
                  value={condition.analysisMethod}
                  onChange={e =>
                    onUpdate({
                      ...condition,
                      analysisMethod: e.target.value as AnalysisMethodType,
                    })
                  }
                  className="h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                >
                  <option value="单句分析">单句分析</option>
                  <option value="多句分析">多句分析</option>
                </select>
                <span
                  title="单句分析：在单句对话内独立检测关键词；多句分析：跨多句上下文联合检测关键词"
                  className="text-slate-400 hover:text-slate-600 cursor-help inline-flex items-center"
                >
                  <HelpCircle size={14} />
                </span>
              </div>
            </div>

            {/* Middle Area: Keyword Tag Input Box */}
            <div
              className="min-h-[82px] w-full border border-slate-200 rounded px-3 py-2.5 bg-white flex flex-wrap items-center content-start gap-2 focus-within:border-[#1677ff] transition-colors cursor-text"
              onClick={e => {
                const input = e.currentTarget.querySelector('input');
                if (input) input.focus();
              }}
            >
              {condition.keywords.map(kw => (
                <span
                  key={kw}
                  className="inline-flex items-center space-x-1.5 bg-[#3f51b5] text-white text-xs px-2.5 py-1 rounded-xs select-none"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleRemoveKeyword(kw);
                    }}
                    className="text-white/80 hover:text-white cursor-pointer"
                    title="移除关键词"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={keywordInput}
                onChange={e => {
                  const val = e.target.value;
                  if (val.endsWith(',') || val.endsWith('，')) {
                    const clean = val.slice(0, -1).trim();
                    if (clean) {
                      addKeywordsFromText(clean);
                    }
                    setKeywordInput('');
                  } else {
                    setKeywordInput(val);
                  }
                }}
                onKeyDown={handleKeywordKeyDown}
                onPaste={handleKeywordPaste}
                onBlur={() => {
                  if (keywordInput.trim()) {
                    addKeywordsFromText(keywordInput);
                    setKeywordInput('');
                  }
                }}
                placeholder="输入完成后请按回车，同时输入多个关键字用逗号隔开"
                className="flex-1 min-w-[280px] h-6 text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent"
              />
            </div>

            {/* Synonym Expansion Toggle on Right */}
            <div className="flex items-center justify-end space-x-2 pt-0.5">
              <span className="text-xs text-slate-600">同义词扩展</span>
              <button
                type="button"
                role="switch"
                aria-checked={condition.synonymExpansion}
                onClick={() =>
                  onUpdate({
                    ...condition,
                    synonymExpansion: !condition.synonymExpansion,
                  })
                }
                className={`w-9 h-5 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                  condition.synonymExpansion ? 'bg-[#1677ff]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                    condition.synonymExpansion ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </>
        )}
      </div>

      {/* 3. Card Footer: 适用角色、前置条件、检测范围（角色检查、非正常挂机、非正常接听、录音时长、系统参数不展示底部栏；大模型质检/服务内容不展示适用角色） */}
      {!hideBottomFooter && (
        <div className="border-t border-slate-100 px-4 py-2.5 bg-white flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
          {/* 适用角色：全部、坐席、客户 */}
          {!isLlmServiceContentRule && (
            <div className="flex items-center space-x-1.5">
              <span>适用角色:</span>
              <select
                value={condition.applicableRole}
                onChange={e =>
                  onUpdate({
                    ...condition,
                    applicableRole: e.target.value as ApplicableRoleType,
                  })
                }
                className="text-[#1677ff] font-medium bg-transparent hover:bg-blue-50/60 px-1 py-0.5 rounded focus:outline-none cursor-pointer"
              >
                <option value="全部">全部</option>
                <option value="坐席">坐席</option>
                <option value="客户">客户</option>
              </select>
            </div>
          )}

          {/* 前置条件：条件A无法配置前置条件 */}
          <div className="flex items-center space-x-1.5">
            <span>前置条件:</span>
            {isFirstCondition ? (
              <span
                className="text-slate-400 cursor-not-allowed select-none"
                title="条件A为首个基准条件，无法配置前置条件"
              >
                无（条件A无法配置前置条件）
              </span>
            ) : (
              <select
                value={condition.precondition}
                onChange={e =>
                  onUpdate({
                    ...condition,
                    precondition: e.target.value,
                  })
                }
                className="text-[#1677ff] font-medium bg-transparent hover:bg-blue-50/60 px-1 py-0.5 rounded focus:outline-none cursor-pointer"
              >
                <option value="无">无</option>
                {previousConditions.map(prevCond => (
                  <option key={prevCond.id} value={prevCond.name}>
                    {prevCond.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 检测范围：全文，指定范围（可以指定a-b句），前置条件命中之前（可以指定a-b句），前置条件命中之后（可以指定a-b句），前置条件命中前后（可以指定a-b句） */}
          <div className="flex items-center space-x-2">
            <span>检测范围:</span>
            <select
              value={condition.detectionScope}
              onChange={e =>
                onUpdate({
                  ...condition,
                  detectionScope: e.target.value as DetectionScopeType,
                })
              }
              className="text-[#1677ff] font-medium bg-transparent hover:bg-blue-50/60 px-1 py-0.5 rounded focus:outline-none cursor-pointer"
            >
              {DETECTION_SCOPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {condition.detectionScope !== '全文' && (
              <div className="inline-flex items-center space-x-1.5 text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                <span>第</span>
                <input
                  type="number"
                  min={1}
                  value={condition.scopeStartSentence}
                  onChange={e => {
                    const startVal = Math.max(1, Number(e.target.value) || 1);
                    onUpdate({
                      ...condition,
                      scopeStartSentence: startVal,
                      scopeEndSentence: Math.max(startVal, condition.scopeEndSentence),
                    });
                  }}
                  className="w-12 h-6 text-center bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
                />
                <span>-</span>
                <input
                  type="number"
                  min={condition.scopeStartSentence}
                  value={condition.scopeEndSentence}
                  onChange={e =>
                    onUpdate({
                      ...condition,
                      scopeEndSentence: Math.max(
                        condition.scopeStartSentence,
                        Number(e.target.value) || condition.scopeStartSentence
                      ),
                    })
                  }
                  className="w-12 h-6 text-center bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
                />
                <span>句</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
