import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  Play,
  FolderPlus,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft,
  Save
} from 'lucide-react';
import {
  QualityRuleConditionCard,
  RuleConditionItem,
} from './QualityRuleConditionCard';

export interface SubCategory {
  id: string;
  name: string;
}

export interface RuleCategory {
  id: string;
  name: string;
  children: SubCategory[];
}

export type BaseRuleModeType = '传统模式' | '大模型' | '大小模型混用';

export type CheckLogicType =
  | '条件全部满足'
  | '条件任一满足'
  | '条件任一不满足'
  | '自定义逻辑';

export interface QualityRuleItem {
  id: string;
  name: string;
  categoryId: string;
  subCategoryId: string;
  categoryPath: string;
  ruleMode: BaseRuleModeType;
  description: string;
  creator: string;
  updatedAt: string;
  updater: string;
  referenceCount: number;
  checkLogic: CheckLogicType;
  customLogicExpression: string;
  conditions: RuleConditionItem[];
  scoreType: '扣分' | '加分';
  scoreValue: number;
}

export const INITIAL_CATEGORIES: RuleCategory[] = [
  {
    id: 'cat_1',
    name: '信用卡',
    children: [
      { id: 'sub_1_1', name: '账单分期规范' },
      { id: 'sub_1_2', name: '盗刷挂失核查' },
      { id: 'sub_1_3', name: '年费减免解释' },
    ],
  },
  {
    id: 'cat_2',
    name: '借记卡',
    children: [
      { id: 'sub_2_1', name: '非柜面限额解除' },
      { id: 'sub_2_2', name: '开户反诈核实' },
      { id: 'sub_2_3', name: '密码重置规范' },
    ],
  },
  {
    id: 'cat_3',
    name: '财富管理',
    children: [
      { id: 'sub_3_1', name: '风险揭示必读' },
      { id: 'sub_3_2', name: '承诺保本禁语' },
      { id: 'sub_3_3', name: '适当性匹配核验' },
    ],
  },
  {
    id: 'cat_4',
    name: '手机号',
    children: [
      { id: 'sub_4_1', name: '预留号码变更' },
      { id: 'sub_4_2', name: '短信验证码安全' },
    ],
  },
  {
    id: 'cat_5',
    name: '储蓄',
    children: [
      { id: 'sub_5_1', name: '大额存单支取' },
      { id: 'sub_5_2', name: '存款利率解答' },
    ],
  },
  {
    id: 'cat_6',
    name: '贷款',
    children: [
      { id: 'sub_6_1', name: '房贷提前还款' },
      { id: 'sub_6_2', name: '征信异议处理' },
    ],
  },
  {
    id: 'cat_7',
    name: '直销银行',
    children: [
      { id: 'sub_7_1', name: '电子账户销户' },
    ],
  },
  {
    id: 'cat_8',
    name: '手机银行',
    children: [
      { id: 'sub_8_1', name: '转账报错处理' },
      { id: 'sub_8_2', name: '人脸识别异常' },
    ],
  },
  {
    id: 'cat_9',
    name: '个人网银',
    children: [
      { id: 'sub_9_1', name: 'U盾驱动故障' },
    ],
  },
  {
    id: 'cat_10',
    name: '微信银行',
    children: [
      { id: 'sub_10_1', name: '动账提醒绑定' },
    ],
  },
  {
    id: 'cat_11',
    name: '微信小程序',
    children: [
      { id: 'sub_11_1', name: '小程序授权异常' },
    ],
  },
  {
    id: 'cat_12',
    name: '对公业务',
    children: [
      { id: 'sub_12_1', name: '银企对账规范' },
    ],
  },
  {
    id: 'cat_13',
    name: '查询网点',
    children: [
      { id: 'sub_13_1', name: '营业时间告知' },
    ],
  },
  {
    id: 'cat_14',
    name: '咨询',
    children: [
      { id: 'sub_14_1', name: '首问负责制规范' },
      { id: 'sub_14_2', name: '标准礼貌用语' },
    ],
  },
  {
    id: 'cat_15',
    name: '外呼',
    children: [
      { id: 'sub_15_1', name: '外呼身份亮明' },
      { id: 'sub_15_2', name: '高频骚扰防控' },
    ],
  },
  {
    id: 'cat_16',
    name: '投诉',
    children: [
      { id: 'sub_16_1', name: '银保监敏感词监测' },
      { id: 'sub_16_2', name: '升级投诉安抚话术' },
    ],
  },
  {
    id: 'cat_17',
    name: '表扬',
    children: [
      { id: 'sub_17_1', name: '客户致谢回应' },
    ],
  },
  {
    id: 'cat_18',
    name: '建议',
    children: [
      { id: 'sub_18_1', name: '建议反馈记录' },
    ],
  },
  {
    id: 'cat_19',
    name: '其他',
    children: [
      { id: 'sub_19_1', name: '转接规范话术' },
    ],
  },
  {
    id: 'cat_20',
    name: '第三方平台',
    children: [
      { id: 'sub_20_1', name: '第三方平台' },
      { id: 'sub_20_2', name: '快捷支付解绑' },
    ],
  },
];

// Helper to create a default condition item (条件A, 条件B, 条件C...)
function createDefaultCondition(index: number, initialKeywords?: string[]): RuleConditionItem {
  const letter = String.fromCharCode(65 + index); // 0 -> A, 1 -> B, 2 -> C...
  return {
    id: `cond_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 6)}`,
    name: `条件${letter}`,
    ruleType: '文字检查/关键字',
    keywords: initialKeywords || ['卡丢了需要挂失', '帮我卡挂失', '我要挂失银行卡'],
    analysisMethod: '单句分析',
    detectionType: '包含任意关键词',
    matchNCount: 1,
    synonymExpansion: false,
    similarityThreshold: 85,
    singleSentenceEffective: true,
    similarSentences: [
      '我的银行卡丢了怎么办理挂失？',
      '帮我把名下的卡紧急挂失一下',
      '卡片找不到了怎么冻结止付？',
    ],
    repeatWindowSentences: 5,
    repeatSimilarityThreshold: 85,
    repeatViolationCount: 3,
    ignoreShortSentenceLength: 4,
    exceptionSentences: ['好的，明白了', '嗯，您请说', '非常感谢您的来电'],
    silenceRoleRelation: '不同角色之间',
    silenceComparator: '大于',
    silenceDurationSeconds: 15,
    speechRateCheckMethod: '单句话语速',
    speechRateWordsPerMinute: 260,
    speechRateIgnoreShortWords: 5,
    interruptionDurationMs: 500,
    interruptionMinWords: 3,
    interruptionDelayMs: 300,
    roleCheckSentenceIndex: 1,
    roleCheckExpectedRole: '坐席',
    abnormalHangupComparator: '大于',
    abnormalHangupSeconds: 10,
    abnormalHangupLastRole: '任意',
    abnormalAnswerComparator: '大于',
    abnormalAnswerSeconds: 5,
    abnormalAnswerFirstRole: '坐席',
    recordingDurationComparator: '大于',
    recordingDurationSeconds: 180,
    volumeDetectionMethod: '音量范围检测',
    volumeComparator: '大于',
    volumeDecibels: 80,
    systemParamCategory: '随录参数',
    systemParamName: '呼叫方向',
    systemParamOperator: '等于',
    systemParamValue: '呼入',
    llmModelConfig: '模型一',
    llmCheckScene: '客服服务态度与言论合规检查',
    llmBackgroundKnowledge: [
      {
        id: `bg_${Date.now()}_${index}`,
        name: '',
        description: '',
        collapsed: false,
      },
    ],
    llmCheckDimensions: [
      {
        id: `dim_${Date.now()}_${index}`,
        name: '不当言论',
        description:
          '判断客服在对话中是否使用了暧昧话术。\n\n### 命中情况\n如果客服在对话过程中使用了暧昧话术，则判定为命中“其他不当言论”，否则判定为未命中。',
        collapsed: false,
      },
    ],
    llmDimensionLogic: '满足任一维度',
    llmServiceContents: [
      {
        id: `sc_${Date.now()}_${index}`,
        customerIntent: '咨询信用卡账单分期手续费及办理方式',
        agentStandardReply:
          '您好，我行信用卡账单分期可通过手机银行APP或人工坐席办理，具体分期期数及对应手续费率将根据您的用卡情况实时展示，请问需要为您查询当前可办理的分期方案吗？',
        collapsed: false,
      },
    ],
    llmCategoryTags: [
      { id: `cat_tag_${index}_1`, name: '账单分期咨询' },
      { id: `cat_tag_${index}_2`, name: '年费减免诉求' },
      { id: `cat_tag_${index}_3`, name: '卡片挂失补办' },
    ],
    llmCategoryCheckLogic: '命中任意标签',
    llmSelectedCategoryTagIds: [`cat_tag_${index}_1`],
    applicableRole: '客户',
    precondition: '无',
    detectionScope: '全文',
    scopeStartSentence: 1,
    scopeEndSentence: 10,
    minHitCount: 1,
  };
}

// Re-index condition names sequentially as 条件A, 条件B, 条件C...
function reindexConditions(list: RuleConditionItem[]): RuleConditionItem[] {
  return list.map((item, idx) => {
    const letter = String.fromCharCode(65 + idx);
    return {
      ...item,
      name: `条件${letter}`,
      // Condition A (idx === 0) can never configure a precondition
      precondition: idx === 0 ? '无' : item.precondition,
    };
  });
}

export const INITIAL_RULES: QualityRuleItem[] = [
  {
    id: '1996062144846716929',
    name: '其他第三方绑卡/支付',
    categoryId: 'cat_20',
    subCategoryId: 'sub_20_1',
    categoryPath: '第三方平台>第三方平台',
    ruleMode: '大小模型混用',
    description: '适用于除支付宝、微信外其他第三方支付渠道绑卡异常时的身份核实与风控提示规范。',
    creator: '赵六6027',
    updatedAt: '2025-12-03 11:41:15',
    updater: '赵六6027',
    referenceCount: 14,
    checkLogic: '条件全部满足',
    customLogicExpression: '',
    scoreType: '扣分',
    scoreValue: 10,
    conditions: [
      createDefaultCondition(0, ['卡丢了需要挂失', '帮我卡挂失', '我要挂失银行卡']),
      {
        ...createDefaultCondition(1),
        ruleType: '文字检查/文本相似度',
        similarityThreshold: 85,
        similarSentences: [
          '我的银行卡无法绑定第三方支付平台是怎么回事？',
          '为什么我的卡不能在拼多多/抖音上快捷支付？',
          '请问如何解除第三方支付渠道绑卡限制？',
        ],
        applicableRole: '客户',
        precondition: '条件A',
        detectionScope: '前置条件命中之后',
        scopeStartSentence: 1,
        scopeEndSentence: 5,
      },
      {
        ...createDefaultCondition(2),
        ruleType: '文字检查/上下文重复',
        repeatWindowSentences: 5,
        repeatSimilarityThreshold: 85,
        repeatViolationCount: 3,
        ignoreShortSentenceLength: 4,
        exceptionSentences: ['好的，明白了', '嗯，您请说', '请稍等片刻，正在为您核实'],
        applicableRole: '坐席',
        precondition: '条件A',
        detectionScope: '全文',
        scopeStartSentence: 1,
        scopeEndSentence: 10,
      },
      {
        ...createDefaultCondition(3),
        ruleType: '语音检查/静音检查',
        silenceRoleRelation: '不同角色之间',
        silenceComparator: '大于',
        silenceDurationSeconds: 15,
        applicableRole: '全部',
        precondition: '条件A',
        detectionScope: '全文',
        scopeStartSentence: 1,
        scopeEndSentence: 10,
      },
    ],
  },
  {
    id: '1996062142871199745',
    name: '服务建议',
    categoryId: 'cat_18',
    subCategoryId: 'sub_18_1',
    categoryPath: '建议>建议反馈记录',
    ruleMode: '大模型',
    description: '聚焦于软性服务体验建议，检测坐席是否明确告知客户反馈回访时效。',
    creator: '赵六6027',
    updatedAt: '2025-12-03 11:41:15',
    updater: '王五6018',
    referenceCount: 8,
    checkLogic: '条件任一满足',
    customLogicExpression: '',
    scoreType: '扣分',
    scoreValue: 5,
    conditions: [
      createDefaultCondition(0, ['感谢您的宝贵建议', '3个工作日', '专人回访']),
    ],
  },
  {
    id: '1996062143005417473',
    name: '电子渠道操作建议',
    categoryId: 'cat_18',
    subCategoryId: 'sub_18_1',
    categoryPath: '建议>建议反馈记录',
    ruleMode: '大小模型混用',
    description: '聚焦于手机银行及网银工具可用性问题，核查坐席是否提供替代操作路径。',
    creator: '赵六6027',
    updatedAt: '2025-12-03 11:41:15',
    updater: '赵六6027',
    referenceCount: 6,
    checkLogic: '条件全部满足',
    customLogicExpression: '',
    scoreType: '加分',
    scoreValue: 5,
    conditions: [
      createDefaultCondition(0, ['为您记录', '升级优化', '替代操作方式']),
    ],
  },
  {
    id: '1996062144129490945',
    name: 'POS/聚合码办理',
    categoryId: 'cat_20',
    subCategoryId: 'sub_20_1',
    categoryPath: '第三方平台>第三方平台',
    ruleMode: '传统模式',
    description: '适用于商户收款码及POS机办理咨询，必须告知营业执照及结算账户费率标准。',
    creator: '赵六6027',
    updatedAt: '2025-12-03 11:41:15',
    updater: '李四6009',
    referenceCount: 19,
    checkLogic: '条件全部满足',
    customLogicExpression: '',
    scoreType: '扣分',
    scoreValue: 15,
    conditions: [
      createDefaultCondition(0, ['营业执照', '结算费率', '上门核实']),
    ],
  },
  {
    id: '1996062144263708673',
    name: '支付宝绑卡/支付',
    categoryId: 'cat_20',
    subCategoryId: 'sub_20_2',
    categoryPath: '第三方平台>快捷支付解绑',
    ruleMode: '传统模式',
    description: '适用于银行卡绑定支付宝快捷支付报错或限额提额指引。',
    creator: '赵六6027',
    updatedAt: '2025-12-03 11:41:15',
    updater: '赵六6027',
    referenceCount: 23,
    checkLogic: '条件任一满足',
    customLogicExpression: '',
    scoreType: '扣分',
    scoreValue: 10,
    conditions: [
      createDefaultCondition(0, ['单笔限额', '日累计限额', '手机银行一键绑卡']),
    ],
  },
  {
    id: '1996062143731032065',
    name: '转信用卡',
    categoryId: 'cat_19',
    subCategoryId: 'sub_19_1',
    categoryPath: '其他>转接规范话术',
    ruleMode: '传统模式',
    description: '适用于需由信用卡专席处理的业务转接前征询客户同意的话术检测。',
    creator: '赵六6027',
    updatedAt: '2025-12-03 11:41:15',
    updater: '张敏6031',
    referenceCount: 31,
    checkLogic: '条件全部满足',
    customLogicExpression: '',
    scoreType: '扣分',
    scoreValue: 10,
    conditions: [
      createDefaultCondition(0, ['为您转接信用卡专席', '请稍候', '不要挂机']),
    ],
  },
  {
    id: '1996062143932358657',
    name: '理财产品收益承诺违禁词检测',
    categoryId: 'cat_3',
    subCategoryId: 'sub_3_2',
    categoryPath: '财富管理>承诺保本禁语',
    ruleMode: '大小模型混用',
    description: '严禁坐席向客户推介理财产品时使用保本、稳赚不赔、零风险等违规词汇。',
    creator: '陈静6012',
    updatedAt: '2025-12-02 16:28:40',
    updater: '陈静6012',
    referenceCount: 42,
    checkLogic: '条件任一满足',
    customLogicExpression: '',
    scoreType: '扣分',
    scoreValue: 20,
    conditions: [
      createDefaultCondition(0, ['保本保息', '稳赚不赔', '绝对安全', '零风险']),
    ],
  },
  {
    id: '1996062144018291204',
    name: '非柜面限额解除反诈核实规范',
    categoryId: 'cat_2',
    subCategoryId: 'sub_2_1',
    categoryPath: '借记卡>非柜面限额解除',
    ruleMode: '大小模型混用',
    description: '客户要求解除非柜面限额时，坐席必须履行断卡行动反诈核实询问义务。',
    creator: '王五6018',
    updatedAt: '2025-12-02 09:15:22',
    updater: '赵六6027',
    referenceCount: 17,
    checkLogic: '条件全部满足',
    customLogicExpression: '',
    scoreType: '扣分',
    scoreValue: 15,
    conditions: [
      createDefaultCondition(0, ['是否认识收款人', '转账用途', '线上人脸核验']),
    ],
  },
  {
    id: '1996062145102938112',
    name: '大模型服务态度与情绪安抚质检',
    categoryId: 'cat_16',
    subCategoryId: 'sub_16_2',
    categoryPath: '投诉>升级投诉安抚话术',
    ruleMode: '大模型',
    description: '通过大模型深度语义理解，识别坐席在高情绪投诉场景下是否具备共情安抚表达。',
    creator: '陈静6012',
    updatedAt: '2025-12-03 14:20:05',
    updater: '陈静6012',
    referenceCount: 22,
    checkLogic: '条件全部满足',
    customLogicExpression: '',
    scoreType: '加分',
    scoreValue: 10,
    conditions: [
      {
        ...createDefaultCondition(0),
        ruleType: '大模型质检/服务规范',
      },
    ],
  },
  {
    id: '1996062145102938115',
    name: '大模型信用卡账单分期合规解答',
    categoryId: 'cat_1',
    subCategoryId: 'sub_1_1',
    categoryPath: '信用卡>账单分期规范',
    ruleMode: '大模型',
    description: '基于大模型服务内容核验，判断坐席是否准确完整说明账单分期手续费及提前还款规则。',
    creator: '王五6018',
    updatedAt: '2025-12-03 15:08:30',
    updater: '王五6018',
    referenceCount: 15,
    checkLogic: '条件全部满足',
    customLogicExpression: '',
    scoreType: '扣分',
    scoreValue: 10,
    conditions: [
      {
        ...createDefaultCondition(0),
        ruleType: '大模型质检/服务内容',
      },
    ],
  },
];

export default function QualityRuleConfigWorkbench() {
  // Page View Mode: 'list' (列表页) or 'detail' (进入规则配置页面：上下分栏)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  // Categories State
  const [categories, setCategories] = useState<RuleCategory[]>(INITIAL_CATEGORIES);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>(['cat_1', 'cat_3', 'cat_20']);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>('');
  const [activeMenuKey, setActiveMenuKey] = useState<string | null>(null);

  // Category Modal State (Add / Edit Category)
  const [categoryModal, setCategoryModal] = useState<{
    open: boolean;
    mode: 'add-root' | 'add-sub' | 'edit-root' | 'edit-sub';
    parentId?: string;
    targetId?: string;
    initialName: string;
  }>({
    open: false,
    mode: 'add-root',
    initialName: '',
  });
  const [categoryNameInput, setCategoryNameInput] = useState('');
  const [categoryParentInput, setCategoryParentInput] = useState<string>('');

  // Rules State
  const [rules, setRules] = useState<QualityRuleItem[]>(INITIAL_RULES);
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);

  // Query Filter Inputs
  const [queryName, setQueryName] = useState('');
  const [queryCreator, setQueryCreator] = useState('');
  const [queryUpdatedDate, setQueryUpdatedDate] = useState('');
  const [queryCategoryFilter, setQueryCategoryFilter] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);

  // Applied Filter State
  const [appliedFilters, setAppliedFilters] = useState({
    name: '',
    creator: '',
    updatedDate: '',
    categoryFilter: '',
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jumpPageInput, setJumpPageInput] = useState('1');

  // Step 1: 基础信息填写/编辑弹窗 (Triggered on clicking 【新建规则】 in list view, or 【编辑】 in detail view's 基础信息 section)
  const [baseInfoModal, setBaseInfoModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit-in-detail';
  }>({ open: false, mode: 'create' });

  const [baseFormName, setBaseFormName] = useState('');
  const [baseFormCategoryId, setBaseFormCategoryId] = useState('cat_1');
  const [baseFormSubCategoryId, setBaseFormSubCategoryId] = useState('sub_1_1');
  const [baseFormRuleMode, setBaseFormRuleMode] = useState<BaseRuleModeType>('传统模式');
  const [baseFormDescription, setBaseFormDescription] = useState('');

  // Step 2 & 3 & 4: Active Rule Being Configured in Detail Page (规则配置页面)
  const [editingRule, setEditingRule] = useState<QualityRuleItem | null>(null);
  // 3、基础信息默认为不展示状态（默认折叠）
  const [isBaseInfoExpanded, setIsBaseInfoExpanded] = useState<boolean>(false);

  // Rule Test Modal State
  const [testModal, setTestModal] = useState<{
    open: boolean;
    rule: QualityRuleItem | null;
  }>({ open: false, rule: null });
  const [testTranscript, setTestTranscript] = useState('');
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    hit: boolean;
    matchedKeywords: string[];
    explanation: string;
    scoreDelta: string;
  } | null>(null);

  // Delete Confirmation Modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    type: 'rule' | 'category-root' | 'category-sub';
    id: string;
    parentId?: string;
    title: string;
  } | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2600);
  };

  // Close category action menu when clicking outside
  const menuContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setActiveMenuKey(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle category expand
  const toggleExpandCategory = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategoryIds(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  // Select category from left tree
  const handleSelectCategoryNode = (catId: string, subId: string = '') => {
    if (viewMode === 'detail') {
      setViewMode('list');
    }
    if (selectedCategoryId === catId && selectedSubCategoryId === subId) {
      setSelectedCategoryId('');
      setSelectedSubCategoryId('');
      setQueryCategoryFilter('');
      setAppliedFilters(prev => ({ ...prev, categoryFilter: '' }));
    } else {
      setSelectedCategoryId(catId);
      setSelectedSubCategoryId(subId);
      const filterVal = subId ? `${catId}:${subId}` : catId;
      setQueryCategoryFilter(filterVal);
      setAppliedFilters(prev => ({ ...prev, categoryFilter: filterVal }));
      if (!expandedCategoryIds.includes(catId)) {
        setExpandedCategoryIds(prev => [...prev, catId]);
      }
    }
    setCurrentPage(1);
  };

  // Category CRUD Handlers
  const openAddRootCategoryModal = () => {
    setCategoryNameInput('');
    setCategoryParentInput('');
    setCategoryModal({
      open: true,
      mode: 'add-root',
      initialName: '',
    });
    setActiveMenuKey(null);
  };

  const openAddSubCategoryModal = (parentCat: RuleCategory) => {
    setCategoryNameInput('');
    setCategoryParentInput(parentCat.id);
    setCategoryModal({
      open: true,
      mode: 'add-sub',
      parentId: parentCat.id,
      initialName: '',
    });
    setActiveMenuKey(null);
  };

  const openEditCategoryModal = (
    mode: 'edit-root' | 'edit-sub',
    targetId: string,
    currentName: string,
    parentId?: string
  ) => {
    setCategoryNameInput(currentName);
    setCategoryParentInput(parentId || '');
    setCategoryModal({
      open: true,
      mode,
      targetId,
      parentId,
      initialName: currentName,
    });
    setActiveMenuKey(null);
  };

  const handleSaveCategoryModal = () => {
    const trimmed = categoryNameInput.trim();
    if (!trimmed) return;

    if (categoryModal.mode === 'add-root') {
      if (categoryParentInput) {
        const newSubId = `sub_${Date.now()}`;
        setCategories(prev =>
          prev.map(cat =>
            cat.id === categoryParentInput
              ? { ...cat, children: [...cat.children, { id: newSubId, name: trimmed }] }
              : cat
          )
        );
        if (!expandedCategoryIds.includes(categoryParentInput)) {
          setExpandedCategoryIds(prev => [...prev, categoryParentInput]);
        }
        showToast(`已新增二级分类「${trimmed}」`);
      } else {
        const newCatId = `cat_${Date.now()}`;
        setCategories(prev => [
          ...prev,
          {
            id: newCatId,
            name: trimmed,
            children: [{ id: `sub_${Date.now()}_1`, name: `${trimmed}通用规则` }],
          },
        ]);
        showToast(`已新增一级分类「${trimmed}」`);
      }
    } else if (categoryModal.mode === 'add-sub' && categoryModal.parentId) {
      const newSubId = `sub_${Date.now()}`;
      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryModal.parentId
            ? { ...cat, children: [...cat.children, { id: newSubId, name: trimmed }] }
            : cat
        )
      );
      if (!expandedCategoryIds.includes(categoryModal.parentId)) {
        setExpandedCategoryIds(prev => [...prev, categoryModal.parentId!]);
      }
      showToast(`已新增二级分类「${trimmed}」`);
    } else if (categoryModal.mode === 'edit-root' && categoryModal.targetId) {
      setCategories(prev =>
        prev.map(cat => (cat.id === categoryModal.targetId ? { ...cat, name: trimmed } : cat))
      );
      setRules(prev =>
        prev.map(r => {
          if (r.categoryId === categoryModal.targetId) {
            const parts = r.categoryPath.split('>');
            return { ...r, categoryPath: `${trimmed}>${parts[1] || trimmed}` };
          }
          return r;
        })
      );
      showToast(`分类名称已修改为「${trimmed}」`);
    } else if (
      categoryModal.mode === 'edit-sub' &&
      categoryModal.parentId &&
      categoryModal.targetId
    ) {
      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryModal.parentId
            ? {
                ...cat,
                children: cat.children.map(sub =>
                  sub.id === categoryModal.targetId ? { ...sub, name: trimmed } : sub
                ),
              }
            : cat
        )
      );
      setRules(prev =>
        prev.map(r => {
          if (r.subCategoryId === categoryModal.targetId) {
            const parts = r.categoryPath.split('>');
            return { ...r, categoryPath: `${parts[0]}>${trimmed}` };
          }
          return r;
        })
      );
      showToast(`二级分类已修改为「${trimmed}」`);
    }

    setCategoryModal({ open: false, mode: 'add-root', initialName: '' });
  };

  // Query & Reset
  const handleSearch = () => {
    setAppliedFilters({
      name: queryName.trim(),
      creator: queryCreator.trim(),
      updatedDate: queryUpdatedDate.trim(),
      categoryFilter: queryCategoryFilter,
    });
    if (!queryCategoryFilter) {
      setSelectedCategoryId('');
      setSelectedSubCategoryId('');
    } else if (queryCategoryFilter.includes(':')) {
      const [cId, sId] = queryCategoryFilter.split(':');
      setSelectedCategoryId(cId);
      setSelectedSubCategoryId(sId);
    } else {
      setSelectedCategoryId(queryCategoryFilter);
      setSelectedSubCategoryId('');
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setQueryName('');
    setQueryCreator('');
    setQueryUpdatedDate('');
    setQueryCategoryFilter('');
    setSelectedCategoryId('');
    setSelectedSubCategoryId('');
    setAppliedFilters({
      name: '',
      creator: '',
      updatedDate: '',
      categoryFilter: '',
    });
    setCurrentPage(1);
  };

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      if (
        appliedFilters.name &&
        !rule.name.toLowerCase().includes(appliedFilters.name.toLowerCase()) &&
        !rule.id.includes(appliedFilters.name)
      ) {
        return false;
      }
      if (
        appliedFilters.creator &&
        !rule.creator.toLowerCase().includes(appliedFilters.creator.toLowerCase())
      ) {
        return false;
      }
      if (appliedFilters.updatedDate && !rule.updatedAt.startsWith(appliedFilters.updatedDate)) {
        return false;
      }
      if (appliedFilters.categoryFilter) {
        if (appliedFilters.categoryFilter.includes(':')) {
          const [catId, subId] = appliedFilters.categoryFilter.split(':');
          if (rule.categoryId !== catId || rule.subCategoryId !== subId) return false;
        } else {
          if (rule.categoryId !== appliedFilters.categoryFilter) return false;
        }
      }
      return true;
    });
  }, [rules, appliedFilters]);

  // Pagination Math
  const totalCount = filteredRules.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedRules = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredRules.slice(start, start + pageSize);
  }, [filteredRules, safeCurrentPage, pageSize]);

  // ============================================================================
  // 1. 点击【新建规则】，弹出基础信息填写窗口
  // ============================================================================
  const handleClickCreateRuleBtn = () => {
    const defaultCat = categories.find(c => c.id === selectedCategoryId) || categories[0];
    const defaultSub =
      defaultCat?.children.find(s => s.id === selectedSubCategoryId) ||
      defaultCat?.children[0];

    setBaseFormName('');
    setBaseFormCategoryId(defaultCat?.id || '');
    setBaseFormSubCategoryId(defaultSub?.id || '');
    setBaseFormRuleMode('传统模式');
    setBaseFormDescription('');
    setBaseInfoModal({ open: true, mode: 'create' });
  };

  // 3. 在规则配置页面点击基础信息区域的【编辑】按钮，弹出基础信息编辑窗口
  const handleClickEditBaseInfoInDetail = () => {
    if (!editingRule) return;
    setBaseFormName(editingRule.name);
    setBaseFormCategoryId(editingRule.categoryId);
    setBaseFormSubCategoryId(editingRule.subCategoryId);
    setBaseFormRuleMode(editingRule.ruleMode);
    setBaseFormDescription(editingRule.description);
    setBaseInfoModal({ open: true, mode: 'edit-in-detail' });
  };

  // 2. 点击基础信息弹窗【确认】后：
  // - 若是新建：创建规则草稿并进入规则配置详情页面（基础信息默认不展示/折叠，条件配置默认仅展示检查逻辑与添加质检条件按钮）
  // - 若是详情页编辑：更新当前规则的基础信息
  const handleConfirmBaseInfoModal = () => {
    if (!baseFormName.trim()) {
      showToast('请填写规则名称');
      return;
    }

    const catObj = categories.find(c => c.id === baseFormCategoryId) || categories[0];
    const subObj =
      catObj?.children.find(s => s.id === baseFormSubCategoryId) || catObj?.children[0];
    const catPath = `${catObj?.name || '未分类'}>${subObj?.name || '通用'}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (baseInfoModal.mode === 'create') {
      const randomSuffix = Math.floor(100000000 + Math.random() * 900000000);
      const newRule: QualityRuleItem = {
        id: `1996062145${randomSuffix}`,
        name: baseFormName.trim(),
        categoryId: catObj?.id || '',
        subCategoryId: subObj?.id || '',
        categoryPath: catPath,
        ruleMode: baseFormRuleMode,
        description: baseFormDescription.trim(),
        creator: '赵六6027',
        updatedAt: nowStr,
        updater: '赵六6027',
        referenceCount: 0,
        checkLogic: '条件全部满足',
        customLogicExpression: '',
        conditions: [], // 初始进入时只展示检查逻辑字段与“添加质检条件”按钮
        scoreType: '扣分',
        scoreValue: 10,
      };

      setRules(prev => [newRule, ...prev]);
      setEditingRule(newRule);
      setIsBaseInfoExpanded(false); // 3、基础信息默认为不展示状态
      setBaseInfoModal({ open: false, mode: 'create' });
      setViewMode('detail');
      showToast(`已创建规则「${newRule.name}」，请配置质检条件`);
    } else if (baseInfoModal.mode === 'edit-in-detail' && editingRule) {
      const updatedRule: QualityRuleItem = {
        ...editingRule,
        name: baseFormName.trim(),
        categoryId: catObj?.id || editingRule.categoryId,
        subCategoryId: subObj?.id || editingRule.subCategoryId,
        categoryPath: catPath,
        ruleMode: baseFormRuleMode,
        description: baseFormDescription.trim(),
        updatedAt: nowStr,
        updater: '赵六6027',
      };
      setEditingRule(updatedRule);
      setRules(prev => prev.map(r => (r.id === updatedRule.id ? updatedRule : r)));
      setBaseInfoModal({ open: false, mode: 'create' });
      showToast('基础信息已更新');
    }
  };

  // 从列表点击【编辑】进入规则配置页面
  const handleEnterRuleDetail = (rule: QualityRuleItem) => {
    setEditingRule({
      ...rule,
      conditions: reindexConditions(rule.conditions || []),
    });
    setIsBaseInfoExpanded(false); // 基础信息默认为不展示状态
    setViewMode('detail');
  };

  // 5. 点击“添加质检条件”按钮：默认新增规则类型为“文字检查/关键字”的质检条件，名称依次为条件A、条件B、条件C...
  const handleAddCondition = () => {
    if (!editingRule) return;
    const nextIndex = editingRule.conditions.length;
    const newCond = createDefaultCondition(nextIndex);
    const updatedConditions = reindexConditions([...editingRule.conditions, newCond]);
    setEditingRule({
      ...editingRule,
      conditions: updatedConditions,
    });
  };

  const handleUpdateCondition = (updatedCond: RuleConditionItem) => {
    if (!editingRule) return;
    const nextList = editingRule.conditions.map(c =>
      c.id === updatedCond.id ? updatedCond : c
    );
    setEditingRule({
      ...editingRule,
      conditions: reindexConditions(nextList),
    });
  };

  const handleDeleteCondition = (condId: string) => {
    if (!editingRule) return;
    const filtered = editingRule.conditions.filter(c => c.id !== condId);
    setEditingRule({
      ...editingRule,
      conditions: reindexConditions(filtered),
    });
    showToast('已删除该质检条件');
  };

  const handleAddToPublicCondition = (cond: RuleConditionItem) => {
    if (!editingRule) return;
    const nextList = editingRule.conditions.map(c =>
      c.id === cond.id ? { ...c, isPublicCondition: true } : c
    );
    setEditingRule({
      ...editingRule,
      conditions: nextList,
    });
    showToast(`已将「${cond.name}」加入公共条件库`);
  };

  // 保存规则配置详情并返回或留在当前页
  const handleSaveRuleDetail = (returnToList: boolean = true) => {
    if (!editingRule) return;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const saved: QualityRuleItem = {
      ...editingRule,
      updatedAt: nowStr,
      updater: '赵六6027',
    };
    setEditingRule(saved);
    setRules(prev => {
      const exists = prev.some(r => r.id === saved.id);
      return exists ? prev.map(r => (r.id === saved.id ? saved : r)) : [saved, ...prev];
    });
    showToast(`规则「${saved.name}」配置已保存`);
    if (returnToList) {
      setViewMode('list');
    }
  };

  // Copy Rule
  const handleCopyRule = (rule: QualityRuleItem) => {
    const randomSuffix = Math.floor(100000000 + Math.random() * 900000000);
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const copied: QualityRuleItem = {
      ...rule,
      id: `1996062146${randomSuffix}`,
      name: `${rule.name}_副本`,
      updatedAt: nowStr,
      updater: '赵六6027',
      referenceCount: 0,
    };
    setRules(prev => [copied, ...prev]);
    showToast(`已复制规则「${copied.name}」`);
  };

  // Test Rule
  const handleOpenTestRule = (rule: QualityRuleItem) => {
    const allKeywords = rule.conditions.flatMap(c => c.keywords);
    const sampleHitText =
      allKeywords.length > 0
        ? `客户：你好，${allKeywords[0]}，请问现在怎么处理？\n坐席：您好，请不要着急，我马上为您核实身份并办理紧急挂失。\n客户：好的，麻烦快一点。`
        : `客户：你好，我的银行卡无法向第三方平台支付。\n坐席：您好，正在为您核实账户状态，请稍候。`;
    setTestTranscript(sampleHitText);
    setTestResult(null);
    setTestModal({ open: true, rule });
  };

  const handleRunRuleTest = () => {
    if (!testModal.rule) return;
    const rule = testModal.rule;
    const allKeywords = rule.conditions.flatMap(c => c.keywords);
    const matched = allKeywords.filter(kw => testTranscript.includes(kw));
    const isHit = matched.length > 0 || testTranscript.length > 35;

    setTestResult({
      tested: true,
      hit: isHit,
      matchedKeywords: matched,
      explanation: isHit
        ? `检测到对话文本满足【${rule.checkLogic}】判定逻辑（命中条件关键词：${
            matched.length > 0 ? matched.join('、') : '上下文语义特征匹配'
          }）。`
        : `当前测试对话未触发规则【${rule.name}】配置的质检条件。`,
      scoreDelta: isHit
        ? `${rule.scoreType === '扣分' ? '-' : '+'}${rule.scoreValue} 分`
        : '0 分（未触发）',
    });
  };

  // Confirm Delete Execution
  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'rule') {
      setRules(prev => prev.filter(r => r.id !== deleteConfirm.id));
      setSelectedRuleIds(prev => prev.filter(id => id !== deleteConfirm.id));
      showToast(`已删除规则「${deleteConfirm.title}」`);
    } else if (deleteConfirm.type === 'category-root') {
      setCategories(prev => prev.filter(c => c.id !== deleteConfirm.id));
      if (selectedCategoryId === deleteConfirm.id) {
        setSelectedCategoryId('');
        setSelectedSubCategoryId('');
        setAppliedFilters(prev => ({ ...prev, categoryFilter: '' }));
      }
      showToast(`已删除一级分类「${deleteConfirm.title}」`);
    } else if (deleteConfirm.type === 'category-sub' && deleteConfirm.parentId) {
      setCategories(prev =>
        prev.map(c =>
          c.id === deleteConfirm.parentId
            ? { ...c, children: c.children.filter(s => s.id !== deleteConfirm.id) }
            : c
        )
      );
      if (selectedSubCategoryId === deleteConfirm.id) {
        setSelectedSubCategoryId('');
        setAppliedFilters(prev => ({ ...prev, categoryFilter: '' }));
      }
      showToast(`已删除二级分类「${deleteConfirm.title}」`);
    }
    setDeleteConfirm(null);
  };

  // Checkbox selection helpers
  const allCurrentPageSelected =
    pagedRules.length > 0 && pagedRules.every(r => selectedRuleIds.includes(r.id));

  const handleToggleSelectAll = () => {
    if (allCurrentPageSelected) {
      const pageIds = new Set(pagedRules.map(r => r.id));
      setSelectedRuleIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const merged = new Set([...selectedRuleIds, ...pagedRules.map(r => r.id)]);
      setSelectedRuleIds(Array.from(merged));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedRuleIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="h-full w-full flex bg-[#f2f4f8] overflow-hidden select-none relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg text-xs flex items-center space-x-2 border border-slate-700">
          <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Left Panel: 规则分类 (Only shown in list view; hidden in full-screen condition configuration page) */}
      {viewMode === 'list' && (
        <div
          ref={menuContainerRef}
          className="w-[225px] bg-white border-r border-slate-200 flex flex-col h-full flex-shrink-0"
        >
          {/* Left Header */}
          <div className="h-12 px-4 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
            <span className="text-[14px] font-bold text-slate-800 tracking-tight">规则分类</span>
            <button
              onClick={openAddRootCategoryModal}
              className="px-3 py-1 text-xs font-medium text-[#1677ff] bg-[#e8f2ff] hover:bg-[#d4e7ff] border border-[#b7d6ff] rounded transition-colors cursor-pointer"
            >
              添加
            </button>
          </div>

          {/* Category Tree List */}
          <div className="flex-1 overflow-y-auto py-1.5 custom-scrollbar">
            {categories.map(category => {
              const isExpanded = expandedCategoryIds.includes(category.id);
              const isRootSelected =
                selectedCategoryId === category.id && !selectedSubCategoryId;
              const menuKey = `root_${category.id}`;

              return (
                <div key={category.id} className="relative">
                  {/* Level 1 Row */}
                  <div
                    onClick={() => handleSelectCategoryNode(category.id, '')}
                    className={`group flex items-center justify-between px-3.5 py-2 cursor-pointer text-[13px] transition-colors ${
                      isRootSelected
                        ? 'bg-[#f0f4fa] text-[#1677ff] font-medium'
                        : 'text-slate-700 hover:bg-[#f5f7fa]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={e => toggleExpandCategory(category.id, e)}
                        className="w-4 h-4 rounded-full bg-[#9ca3af] hover:bg-slate-600 text-white flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer"
                        title={isExpanded ? '收起子分类' : '展开子分类'}
                      >
                        <span className="text-[11px] font-bold leading-none -mt-[0.5px]">
                          {isExpanded ? '-' : '+'}
                        </span>
                      </button>
                      <span className="truncate">{category.name}</span>
                    </div>

                    {/* More Actions Button (...) */}
                    <div className="relative flex-shrink-0">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setActiveMenuKey(prev => (prev === menuKey ? null : menuKey));
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title="分类操作"
                      >
                        <MoreHorizontal size={15} />
                      </button>

                      {activeMenuKey === menuKey && (
                        <div
                          onClick={e => e.stopPropagation()}
                          className="absolute right-0 top-7 w-32 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-40 text-xs text-slate-700"
                        >
                          <button
                            type="button"
                            onClick={() => openAddSubCategoryModal(category)}
                            className="w-full px-3 py-1.5 text-left hover:bg-blue-50 hover:text-[#1677ff] flex items-center space-x-1.5 cursor-pointer"
                          >
                            <FolderPlus size={13} />
                            <span>新增子分类</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              openEditCategoryModal('edit-root', category.id, category.name)
                            }
                            className="w-full px-3 py-1.5 text-left hover:bg-blue-50 hover:text-[#1677ff] flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Edit3 size={13} />
                            <span>编辑修改</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuKey(null);
                              setDeleteConfirm({
                                open: true,
                                type: 'category-root',
                                id: category.id,
                                title: category.name,
                              });
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-red-50 text-red-600 flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Trash2 size={13} />
                            <span>删除分类</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Level 2 Subcategories */}
                  {isExpanded && category.children.length > 0 && (
                    <div className="bg-[#fafbfc]">
                      {category.children.map(sub => {
                        const isSubSelected =
                          selectedCategoryId === category.id &&
                          selectedSubCategoryId === sub.id;
                        const subMenuKey = `sub_${sub.id}`;

                        return (
                          <div
                            key={sub.id}
                            onClick={() => handleSelectCategoryNode(category.id, sub.id)}
                            className={`group flex items-center justify-between pl-9 pr-3.5 py-1.5 cursor-pointer text-[12.5px] transition-colors relative ${
                              isSubSelected
                                ? 'bg-[#e8f2ff] text-[#1677ff] font-medium'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className="truncate">{sub.name}</span>

                            <div className="relative flex-shrink-0">
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  setActiveMenuKey(prev =>
                                    prev === subMenuKey ? null : subMenuKey
                                  );
                                }}
                                className="p-0.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                                title="子分类操作"
                              >
                                <MoreHorizontal size={14} />
                              </button>

                              {activeMenuKey === subMenuKey && (
                                <div
                                  onClick={e => e.stopPropagation()}
                                  className="absolute right-0 top-6 w-28 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-40 text-xs text-slate-700"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditCategoryModal(
                                        'edit-sub',
                                        sub.id,
                                        sub.name,
                                        category.id
                                      )
                                    }
                                    className="w-full px-3 py-1.5 text-left hover:bg-blue-50 hover:text-[#1677ff] flex items-center space-x-1.5 cursor-pointer"
                                  >
                                    <Edit3 size={12} />
                                    <span>编辑修改</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuKey(null);
                                      setDeleteConfirm({
                                        open: true,
                                        type: 'category-sub',
                                        id: sub.id,
                                        parentId: category.id,
                                        title: sub.name,
                                      });
                                    }}
                                    className="w-full px-3 py-1.5 text-left hover:bg-red-50 text-red-600 flex items-center space-x-1.5 cursor-pointer"
                                  >
                                    <Trash2 size={12} />
                                    <span>删除</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Right / Main Panel: Either 规则配置列表页 OR 全屏规则条件配置详情页 */}
      {viewMode === 'list' ? (
        <div className="flex-1 flex flex-col bg-white m-2.5 rounded-sm shadow-xs border border-slate-200/80 overflow-hidden min-w-0">
          {/* Top Title Header */}
          <div className="h-12 px-5 flex items-center justify-between border-b border-slate-200 flex-shrink-0">
            <h1 className="text-[15px] font-bold text-slate-800">规则配置</h1>
            {(selectedCategoryId || appliedFilters.categoryFilter) && (
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span>
                  当前筛选分类：
                  <strong className="text-[#1677ff] font-medium ml-1">
                    {(() => {
                      const cat = categories.find(c => c.id === selectedCategoryId);
                      if (!cat) return '全部';
                      const sub = cat.children.find(s => s.id === selectedSubCategoryId);
                      return sub ? `${cat.name} > ${sub.name}` : cat.name;
                    })()}
                  </strong>
                </span>
                <button
                  onClick={handleResetFilters}
                  className="text-slate-400 hover:text-slate-600 underline cursor-pointer"
                >
                  清除筛选
                </button>
              </div>
            )}
          </div>

          {/* Main Right Content Container */}
          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            {/* Query Filter Area */}
            <div className="bg-[#f9fafc] border border-slate-100 rounded-md px-5 py-4 mb-4 flex-shrink-0">
              {isSearchExpanded ? (
                <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
                  {/* 规则名称 */}
                  <div className="flex items-center space-x-2.5">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      规则名称
                    </label>
                    <input
                      type="text"
                      value={queryName}
                      onChange={e => setQueryName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      placeholder="规则名称"
                      className="w-44 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#1677ff] transition-colors"
                    />
                  </div>

                  {/* 创建人 */}
                  <div className="flex items-center space-x-2.5">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      创建人
                    </label>
                    <input
                      type="text"
                      value={queryCreator}
                      onChange={e => setQueryCreator(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      placeholder="创建人"
                      className="w-40 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#1677ff] transition-colors"
                    />
                  </div>

                  {/* 更新时间 */}
                  <div className="flex items-center space-x-2.5">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      更新时间
                    </label>
                    <input
                      type="date"
                      value={queryUpdatedDate}
                      onChange={e => setQueryUpdatedDate(e.target.value)}
                      className="w-44 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors"
                    />
                  </div>

                  {/* 规则分类 */}
                  <div className="flex items-center space-x-2.5">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      规则分类
                    </label>
                    <select
                      value={queryCategoryFilter}
                      onChange={e => setQueryCategoryFilter(e.target.value)}
                      className="w-48 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors"
                    >
                      <option value="">请选择</option>
                      {categories.map(cat => (
                        <optgroup key={cat.id} label={cat.name}>
                          <option value={cat.id}>{cat.name}（全部）</option>
                          {cat.children.map(sub => (
                            <option key={sub.id} value={`${cat.id}:${sub.id}`}>
                              {cat.name} &gt; {sub.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* Right Query / Reset / Hide Buttons */}
                  <div className="flex items-center space-x-2 ml-auto">
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors cursor-pointer shadow-2xs"
                    >
                      查询
                    </button>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="h-8 px-4 bg-white hover:bg-blue-50 text-[#1677ff] border border-[#1677ff] text-xs font-medium rounded transition-colors cursor-pointer"
                    >
                      重置
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSearchExpanded(false)}
                      className="h-8 px-2 text-xs text-slate-500 hover:text-slate-700 flex items-center space-x-1 cursor-pointer"
                    >
                      <ChevronUp size={14} />
                      <span>隐藏</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    已折叠查询条件栏（点击右侧展开可按规则名称、创建人、更新时间、规则分类筛选）
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSearchExpanded(true)}
                    className="text-xs text-[#1677ff] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <ChevronDown size={14} />
                    <span>展开查询</span>
                  </button>
                </div>
              )}
            </div>

            {/* Action Toolbar Row: 新建规则 button */}
            <div className="flex items-center space-x-2.5 mb-3.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleClickCreateRuleBtn}
                className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors cursor-pointer shadow-2xs"
              >
                新建规则
              </button>
              {selectedRuleIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setRules(prev => prev.filter(r => !selectedRuleIds.includes(r.id)));
                    showToast(`已批量删除 ${selectedRuleIds.length} 条规则`);
                    setSelectedRuleIds([]);
                  }}
                  className="h-8 px-3.5 bg-[#fff1f0] hover:bg-red-100 text-red-500 border border-[#ffccc7] text-xs font-medium rounded transition-colors cursor-pointer"
                >
                  批量删除 ({selectedRuleIds.length})
                </button>
              )}
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-auto border border-slate-100 rounded-t-sm custom-scrollbar">
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 z-10 bg-[#dbe7fb] text-slate-700 text-xs font-semibold select-none">
                  <tr>
                    <th className="w-11 py-2.5 text-center border-r border-white">
                      <input
                        type="checkbox"
                        checked={allCurrentPageSelected}
                        onChange={handleToggleSelectAll}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-[#1677ff] focus:ring-0 cursor-pointer accent-[#1677ff]"
                      />
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[165px]">
                      规则ID
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white min-w-[170px]">
                      规则名称
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[160px]">
                      规则分类
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[110px]">
                      创建人
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[150px]">
                      更新时间
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[110px]">
                      更新人
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[90px]">
                      引用数
                    </th>
                    <th className="py-2.5 px-3 text-center w-[170px]">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[12.5px] text-slate-700 bg-white">
                  {pagedRules.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-slate-400 text-xs">
                        暂无符合条件的质检规则，请点击左上角「新建规则」或重置筛选条件
                      </td>
                    </tr>
                  ) : (
                    pagedRules.map(rule => {
                      const isChecked = selectedRuleIds.includes(rule.id);
                      return (
                        <tr
                          key={rule.id}
                          className={`hover:bg-[#f5f8ff] transition-colors ${
                            isChecked ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <td className="py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleSelectRow(rule.id)}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-[#1677ff] focus:ring-0 cursor-pointer accent-[#1677ff]"
                            />
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-700 tabular-nums break-all leading-snug">
                            {rule.id}
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-800 font-normal leading-snug">
                            {rule.name}
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-700 leading-snug">
                            {rule.categoryPath}
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-700">
                            {rule.creator}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-700 tabular-nums leading-snug">
                            {rule.updatedAt}
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-700">
                            {rule.updater}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono tabular-nums text-slate-700">
                            {rule.referenceCount}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <div className="inline-flex items-center justify-center space-x-2.5 text-xs">
                              <button
                                type="button"
                                onClick={() => handleEnterRuleDetail(rule)}
                                className="text-[#1677ff] hover:text-blue-700 hover:underline cursor-pointer"
                              >
                                编辑
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenTestRule(rule)}
                                className="text-[#1677ff] hover:text-blue-700 hover:underline cursor-pointer"
                              >
                                测试
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyRule(rule)}
                                className="text-[#1677ff] hover:text-blue-700 hover:underline cursor-pointer"
                              >
                                复制
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirm({
                                    open: true,
                                    type: 'rule',
                                    id: rule.id,
                                    title: rule.name,
                                  })
                                }
                                className="text-slate-400 hover:text-red-600 hover:underline cursor-pointer transition-colors"
                              >
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Pagination Bar */}
            <div className="h-11 bg-[#efefef] px-4 flex items-center justify-end space-x-3 text-xs text-slate-600 flex-shrink-0 rounded-b-sm">
              <span className="tabular-nums">共 {totalCount} 条</span>

              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-7 px-2 bg-white border border-slate-300 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] cursor-pointer"
              >
                <option value={10}>10条/页</option>
                <option value={20}>20条/页</option>
                <option value={50}>50条/页</option>
              </select>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 rounded text-slate-500 hover:border-[#1677ff] hover:text-[#1677ff] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[28px] h-7 px-1.5 flex items-center justify-center rounded text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                      safeCurrentPage === pageNum
                        ? 'bg-[#1677ff] text-white border border-[#1677ff]'
                        : 'bg-white text-slate-600 border border-slate-300 hover:border-[#1677ff] hover:text-[#1677ff]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 rounded text-slate-500 hover:border-[#1677ff] hover:text-[#1677ff] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="flex items-center space-x-1.5">
                <span>前往</span>
                <input
                  type="text"
                  value={jumpPageInput}
                  onChange={e => setJumpPageInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const num = parseInt(jumpPageInput, 10);
                      if (!isNaN(num)) {
                        const target = Math.min(Math.max(1, num), totalPages);
                        setCurrentPage(target);
                        setJumpPageInput(String(target));
                      }
                    }
                  }}
                  className="w-11 h-7 text-center bg-white border border-slate-300 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
                />
                <span>页</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================================
         * 2. 规则配置详情页面（分为上下两个区域：上为基础信息，下为条件配置）
         * ============================================================================ */
        editingRule && (
          <div className="flex-1 flex flex-col bg-white m-2.5 rounded-sm shadow-xs border border-slate-200/80 overflow-hidden min-w-0">
            {/* Detail Top Bar */}
            <div className="h-12 px-5 flex items-center justify-between border-b border-slate-200 flex-shrink-0 bg-white">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-[#1677ff] transition-colors cursor-pointer"
                >
                  <ArrowLeft size={15} />
                  <span>返回列表</span>
                </button>
                <span className="text-slate-300">|</span>
                <h1 className="text-[15px] font-bold text-slate-800">
                  规则配置
                </h1>
                <span className="text-xs text-slate-500">
                  {editingRule.name}
                </span>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => handleOpenTestRule(editingRule)}
                  className="h-8 px-3.5 bg-white hover:bg-blue-50 text-[#1677ff] border border-[#1677ff] text-xs font-medium rounded transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <Play size={12} />
                  <span>规则测试</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveRuleDetail(true)}
                  className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors cursor-pointer flex items-center space-x-1.5 shadow-2xs"
                >
                  <Save size={13} />
                  <span>保存规则</span>
                </button>
              </div>
            </div>

            {/* Scrollable Upper & Lower Sections */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#f7f9fc] custom-scrollbar">
              {/* =================================================================
               * 上区域：基础信息（默认为不展示/折叠状态，有【编辑】按钮，支持折叠和展开）
               * ================================================================= */}
              <div className="bg-white border border-slate-200/90 rounded-sm shadow-2xs overflow-hidden">
                <div className="h-11 px-4 bg-white border-b border-slate-100 flex items-center justify-between">
                  <div
                    onClick={() => setIsBaseInfoExpanded(prev => !prev)}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <span className="w-1 h-3.5 bg-[#1677ff] rounded-full"></span>
                    <span className="text-[13.5px] font-bold text-slate-800">
                      基础信息
                    </span>
                    <span className="text-xs text-slate-400 font-normal ml-2">
                      {!isBaseInfoExpanded
                        ? `（${editingRule.name} · ${editingRule.categoryPath} · ${editingRule.ruleMode}）`
                        : ''}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <button
                      type="button"
                      onClick={handleClickEditBaseInfoInDetail}
                      className="px-3 py-1 bg-[#e8f2ff] hover:bg-[#d4e7ff] text-[#1677ff] border border-[#b7d6ff] rounded font-medium transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <Edit3 size={12} />
                      <span>编辑</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBaseInfoExpanded(prev => !prev)}
                      className="text-slate-500 hover:text-[#1677ff] flex items-center space-x-1 cursor-pointer"
                    >
                      {isBaseInfoExpanded ? (
                        <>
                          <ChevronUp size={14} />
                          <span>收起</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} />
                          <span>展开</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsible Content (Defaults to hidden: isBaseInfoExpanded === false) */}
                {isBaseInfoExpanded && (
                  <div className="p-4 bg-[#fafbfd] grid grid-cols-3 gap-y-3 gap-x-6 text-xs">
                    <div>
                      <span className="text-slate-400">规则名称：</span>
                      <span className="text-slate-800 font-medium">
                        {editingRule.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">规则分类：</span>
                      <span className="text-slate-800 font-medium">
                        {editingRule.categoryPath}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">规则类型：</span>
                      <span className="text-[#1677ff] font-medium">
                        {editingRule.ruleMode}
                      </span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-slate-400">规则描述：</span>
                      <span className="text-slate-700">
                        {editingRule.description || '暂无描述'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* =================================================================
               * 下区域：条件配置
               * 4、默认展示字段：检查逻辑（条件全部满足、条件任一满足、条件任一不满足、自定义逻辑）
               * 5、下方有“添加质检条件”按钮，点击新增默认为“文字检查/关键字”的条件A、条件B、条件C...
               * ================================================================= */}
              <div className="bg-white border border-slate-200/90 rounded-sm shadow-2xs p-5 space-y-5">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <span className="w-1 h-3.5 bg-[#1677ff] rounded-full"></span>
                  <span className="text-[13.5px] font-bold text-slate-800">
                    条件配置
                  </span>
                </div>

                {/* 检查逻辑 Field Row */}
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center space-x-2.5">
                    <label className="text-slate-700 font-medium whitespace-nowrap">
                      检查逻辑:
                    </label>
                    <select
                      value={editingRule.checkLogic}
                      onChange={e =>
                        setEditingRule({
                          ...editingRule,
                          checkLogic: e.target.value as CheckLogicType,
                        })
                      }
                      className="h-8 w-52 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                    >
                      <option value="条件全部满足">条件全部满足</option>
                      <option value="条件任一满足">条件任一满足</option>
                      <option value="条件任一不满足">条件任一不满足</option>
                      <option value="自定义逻辑">自定义逻辑</option>
                    </select>
                  </div>

                  {/* 当选择自定义逻辑时，出现一个输入框来定义条件之间的逻辑 */}
                  {editingRule.checkLogic === '自定义逻辑' && (
                    <div className="flex items-center space-x-2 flex-1 min-w-[280px] max-w-xl">
                      <input
                        type="text"
                        value={editingRule.customLogicExpression}
                        onChange={e =>
                          setEditingRule({
                            ...editingRule,
                            customLogicExpression: e.target.value,
                          })
                        }
                        placeholder="请输入自定义条件逻辑表达式，如：(条件A && 条件B) || 条件C"
                        className="w-full h-8 px-3 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#1677ff]"
                      />
                    </div>
                  )}
                </div>

                {/* 已添加的质检条件列表 (条件A, 条件B, 条件C...) */}
                {editingRule.conditions.length > 0 && (
                  <div className="space-y-4">
                    {editingRule.conditions.map((cond, idx) => (
                      <QualityRuleConditionCard
                        key={cond.id}
                        condition={cond}
                        index={idx}
                        allConditions={editingRule.conditions}
                        onUpdate={handleUpdateCondition}
                        onDelete={handleDeleteCondition}
                        onAddToPublic={handleAddToPublicCondition}
                      />
                    ))}
                  </div>
                )}

                {/* 添加质检条件 Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleAddCondition}
                    className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors cursor-pointer inline-flex items-center space-x-1.5 shadow-2xs"
                  >
                    <Plus size={14} />
                    <span>添加质检条件</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* =======================================================================
       * 弹窗1：基础信息填写/编辑窗口（点击【新建规则】或详情页基础信息【编辑】触发）
       * 包含：规则名称、规则分类、规则类型（传统模式、大模型、大小模型混用）、描述，取消，确认
       * ======================================================================= */}
      {baseInfoModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                {baseInfoModal.mode === 'create' ? '新建规则 - 基础信息' : '编辑基础信息'}
              </h3>
              <button
                type="button"
                onClick={() => setBaseInfoModal({ open: false, mode: 'create' })}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* 规则名称 */}
              <div>
                <label className="block text-slate-700 font-medium mb-1.5">
                  规则名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={baseFormName}
                  onChange={e => setBaseFormName(e.target.value)}
                  placeholder="请输入规则名称"
                  autoFocus
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-[#1677ff]"
                />
              </div>

              {/* 规则分类（支持二级分类选择） */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">
                    规则分类（一级） <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={baseFormCategoryId}
                    onChange={e => {
                      const nextCatId = e.target.value;
                      setBaseFormCategoryId(nextCatId);
                      const nextCat = categories.find(c => c.id === nextCatId);
                      setBaseFormSubCategoryId(nextCat?.children[0]?.id || '');
                    }}
                    className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-[#1677ff]"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">
                    规则分类（二级） <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={baseFormSubCategoryId}
                    onChange={e => setBaseFormSubCategoryId(e.target.value)}
                    className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-[#1677ff]"
                  >
                    {(
                      categories.find(c => c.id === baseFormCategoryId)?.children || []
                    ).map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 规则类型（传统模式、大模型、大小模型混用） */}
              <div>
                <label className="block text-slate-700 font-medium mb-1.5">
                  规则类型 <span className="text-red-500">*</span>
                </label>
                <select
                  value={baseFormRuleMode}
                  onChange={e =>
                    setBaseFormRuleMode(e.target.value as BaseRuleModeType)
                  }
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-[#1677ff]"
                >
                  <option value="传统模式">传统模式</option>
                  <option value="大模型">大模型</option>
                  <option value="大小模型混用">大小模型混用</option>
                </select>
              </div>

              {/* 描述 */}
              <div>
                <label className="block text-slate-700 font-medium mb-1.5">
                  描述
                </label>
                <textarea
                  rows={3}
                  value={baseFormDescription}
                  onChange={e => setBaseFormDescription(e.target.value)}
                  placeholder="请输入规则描述信息"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-[#1677ff]"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2.5 text-xs">
              <button
                type="button"
                onClick={() => setBaseInfoModal({ open: false, mode: 'create' })}
                className="px-4 py-1.5 bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmBaseInfoModal}
                className="px-4 py-1.5 bg-[#1677ff] hover:bg-blue-600 text-white rounded font-medium cursor-pointer"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗2: Add / Edit Rule Category */}
      {categoryModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                {categoryModal.mode === 'add-root' && '添加规则分类'}
                {categoryModal.mode === 'add-sub' && '新增二级规则分类'}
                {categoryModal.mode === 'edit-root' && '编辑一级分类'}
                {categoryModal.mode === 'edit-sub' && '编辑二级分类'}
              </h3>
              <button
                onClick={() =>
                  setCategoryModal({ open: false, mode: 'add-root', initialName: '' })
                }
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {(categoryModal.mode === 'add-root' || categoryModal.mode === 'add-sub') && (
                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">
                    所属上级分类
                  </label>
                  <select
                    value={categoryParentInput}
                    disabled={categoryModal.mode === 'add-sub'}
                    onChange={e => setCategoryParentInput(e.target.value)}
                    className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-[#1677ff] disabled:bg-slate-50"
                  >
                    <option value="">无（作为一级分类）</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-medium mb-1.5">
                  分类名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryNameInput}
                  onChange={e => setCategoryNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveCategoryModal()}
                  placeholder="请输入规则分类名称"
                  autoFocus
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-[#1677ff]"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  setCategoryModal({ open: false, mode: 'add-root', initialName: '' })
                }
                className="px-4 py-1.5 bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveCategoryModal}
                className="px-4 py-1.5 bg-[#1677ff] hover:bg-blue-600 text-white rounded font-medium cursor-pointer"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗3: Rule Simulation Test (测试) */}
      {testModal.open && testModal.rule && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Play size={15} className="text-[#1677ff]" />
                <h3 className="text-sm font-bold text-slate-800">
                  质检规则在线测试 - {testModal.rule.name}
                </h3>
              </div>
              <button
                onClick={() => setTestModal({ open: false, rule: null })}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="bg-slate-50 border border-slate-200/80 rounded p-3 space-y-1 text-slate-600">
                <div>
                  <span className="text-slate-400">所属分类：</span>
                  <span className="font-medium text-slate-700">
                    {testModal.rule.categoryPath}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">规则类型：</span>
                  <span className="text-[#1677ff] font-medium">
                    {testModal.rule.ruleMode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">检查逻辑：</span>
                  <span>
                    {testModal.rule.checkLogic}
                    {testModal.rule.checkLogic === '自定义逻辑' &&
                    testModal.rule.customLogicExpression
                      ? ` (${testModal.rule.customLogicExpression})`
                      : ''}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1.5">
                  模拟对话文本（可修改对话内容验证规则命中结果）
                </label>
                <textarea
                  rows={4}
                  value={testTranscript}
                  onChange={e => setTestTranscript(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded text-slate-700 leading-relaxed focus:outline-none focus:border-[#1677ff]"
                />
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded border ${
                    testResult.hit
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span>
                      测试结果：{testResult.hit ? '规则命中 (HIT)' : '未命中 (MISS)'}
                    </span>
                    <span className="font-mono tabular-nums">
                      评分影响：{testResult.scoreDelta}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {testResult.explanation}
                  </p>
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2 text-xs">
              <button
                type="button"
                onClick={() => setTestModal({ open: false, rule: null })}
                className="px-4 py-1.5 bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-50 cursor-pointer"
              >
                关闭
              </button>
              <button
                type="button"
                onClick={handleRunRuleTest}
                className="px-4 py-1.5 bg-[#1677ff] hover:bg-blue-600 text-white rounded font-medium flex items-center space-x-1 cursor-pointer"
              >
                <Play size={12} />
                <span>执行规则测试</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗4: Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="p-5 flex items-start space-x-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <h4 className="text-sm font-bold text-slate-800 mb-1">确认删除</h4>
                <p className="text-slate-600 leading-relaxed">
                  确定要删除「
                  <span className="font-semibold text-slate-800">
                    {deleteConfirm.title}
                  </span>
                  」吗？删除后将无法恢复。
                </p>
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2 text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-medium cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
