import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Database,
  Link2,
  Trash2,
  Eye,
  PowerOff,
  Power,
  Send,
  Info,
} from 'lucide-react';
import {
  INITIAL_CATEGORIES,
  INITIAL_RULES,
  QualityRuleItem,
} from './QualityRuleConfigWorkbench';
import {
  INITIAL_SCORE_CATEGORIES,
  INITIAL_SCORE_ITEMS,
  QualityScoreItem,
} from './QualityScoreItemWorkbench';
import {
  DataMatchConditionBuilder,
  MatchConditionGroup,
  createDefaultConditionGroups,
  evaluateDailyVoiceDataCount,
} from './DataMatchConditionBuilder';

export type RoutineTaskStatus = '已发布' | '停用';
export type RoutineTaskType = '大模型' | '大小模型混用' | '传统';
export type RoutineTaskPriority = '高' | '中' | '低';
export type RoutineScoringStrategy = '加分' | '减分' | '不区分';
export type RoutineDataType = '语音';

export interface BoundQualityRuleEntry {
  rule: QualityRuleItem;
  boundScoreItem?: QualityScoreItem | null;
}

export interface RoutineQualityTask {
  id: string;
  name: string;
  status: RoutineTaskStatus;
  taskType: RoutineTaskType;
  priority: RoutineTaskPriority;
  scoringStrategy: RoutineScoringStrategy;
  dataType: RoutineDataType;
  conditionGroups: MatchConditionGroup[];
  rules: BoundQualityRuleEntry[];
  creator: string;
  createdAt: string;
  updatedAt: string;
}

function formatCurrentTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function isRuleAllowedForTaskType(rule: QualityRuleItem, taskType: RoutineTaskType): boolean {
  if (taskType === '大模型') {
    return rule.ruleMode === '大模型';
  }
  if (taskType === '大小模型混用') {
    return true;
  }
  // 传统：不能选择大模型相关的规则（排除大模型及大小模型混用）
  return rule.ruleMode === '传统模式';
}

function isScoreItemAllowedForStrategy(
  item: QualityScoreItem,
  strategy: RoutineScoringStrategy
): boolean {
  if (strategy === '加分') return item.scoreType === '加分';
  if (strategy === '减分') return item.scoreType === '减分';
  return true;
}

export interface ScoringStrategyRuleMeta {
  strategy: RoutineScoringStrategy;
  initialScore: number;
  minScore: number;
  maxScore: number;
  bindingRuleText: string;
  rangeShortText: string;
  detailDescription: string;
}

export const SCORING_STRATEGY_RULES: Record<
  RoutineScoringStrategy,
  ScoringStrategyRuleMeta
> = {
  加分: {
    strategy: '加分',
    initialScore: 0,
    minScore: 0,
    maxScore: 100,
    bindingRuleText: '仅可绑定「加分」评分项',
    rangeShortText: '初始0分 · 最高100分',
    detailDescription:
      '选择「加分」策略时，绑定评分项只能选择加分项；质检初始得分为 0 分，命中加分项后累加计分，最高加到 100 分封顶。',
  },
  减分: {
    strategy: '减分',
    initialScore: 100,
    minScore: 0,
    maxScore: 100,
    bindingRuleText: '仅可绑定「减分」评分项',
    rangeShortText: '初始100分 · 最低0分',
    detailDescription:
      '选择「减分」策略时，绑定评分项只能选择减分项；质检初始得分为 100 分，命中减分项后逐项扣分，最低减到 0 分为止。',
  },
  不区分: {
    strategy: '不区分',
    initialScore: 100,
    minScore: 0,
    maxScore: 100,
    bindingRuleText: '加分项与减分项均可绑定',
    rangeShortText: '初始100分 · 范围0~100分',
    detailDescription:
      '选择「不区分」策略时，加分项与减分项均可选择绑定；质检初始得分为 100 分，加分最高只能加到 100 分，扣分最低只能减到 0 分。',
  },
};

const INITIAL_ROUTINE_TASKS: RoutineQualityTask[] = [
  {
    id: 'RQ20261119001',
    name: '电销外呼每日全量合规质检',
    status: '已发布',
    taskType: '大小模型混用',
    priority: '高',
    scoringStrategy: '减分',
    dataType: '语音',
    conditionGroups: [
      {
        id: 'init_grp_1',
        conditions: [
          { id: 'init_r1', field: '呼叫类型', operator: '=', values: ['呼出'] },
          { id: 'init_r2', field: '业务线', operator: '=', values: ['电销部'] },
        ],
      },
      {
        id: 'init_grp_2',
        conditions: [
          { id: 'init_r3', field: '呼叫类型', operator: '=', values: ['呼入'] },
          { id: 'init_r4', field: '业务线', operator: '=', values: ['服务部'] },
        ],
      },
    ],
    rules: [
      {
        rule: INITIAL_RULES[6], // 理财产品收益承诺违禁词检测
        boundScoreItem: INITIAL_SCORE_ITEMS[3], // 违规承诺保本保收益 (-20)
      },
      {
        rule: INITIAL_RULES[7], // 非柜面限额解除反诈核实规范
        boundScoreItem: INITIAL_SCORE_ITEMS[5], // 未按规定核验客户身份信息 (-15)
      },
    ],
    creator: '张颖',
    createdAt: '2026-11-18 10:15:20',
    updatedAt: '2026-11-19 09:20:00',
  },
  {
    id: 'RQ20261119002',
    name: '高情绪投诉安抚大模型专项质检',
    status: '已发布',
    taskType: '大模型',
    priority: '高',
    scoringStrategy: '加分',
    dataType: '语音',
    conditionGroups: [
      {
        id: 'init_grp_3',
        conditions: [
          { id: 'init_r5', field: '呼叫类型', operator: '=', values: ['呼入'] },
          { id: 'init_r6', field: '满意度评价', operator: '=', values: ['不满意', '一般'] },
        ],
      },
    ],
    rules: [
      {
        rule: INITIAL_RULES[8], // 大模型服务态度与情绪安抚质检
        boundScoreItem: INITIAL_SCORE_ITEMS[6], // 高情绪客户安抚化解出色 (+10)
      },
    ],
    creator: '陈明',
    createdAt: '2026-11-17 16:40:12',
    updatedAt: '2026-11-18 14:12:35',
  },
  {
    id: 'RQ20261119003',
    name: '第三方快捷支付与POS规范常规抽检',
    status: '停用',
    taskType: '传统',
    priority: '中',
    scoringStrategy: '不区分',
    dataType: '语音',
    conditionGroups: [
      {
        id: 'init_grp_4',
        conditions: [
          { id: 'init_r7', field: '技能组名称', operator: '=', values: ['信用卡综合组'] },
          { id: 'init_r8', field: '通话时长(秒)', operator: '>', values: ['60'] },
        ],
      },
    ],
    rules: [
      {
        rule: INITIAL_RULES[3], // POS/聚合码办理
        boundScoreItem: INITIAL_SCORE_ITEMS[1], // 服务态度生硬或使用禁语 (-10)
      },
      {
        rule: INITIAL_RULES[4], // 支付宝绑卡/支付
        boundScoreItem: INITIAL_SCORE_ITEMS[4], // 账单分期费率解答准确 (+3)
      },
    ],
    creator: '王伟',
    createdAt: '2026-11-15 11:05:48',
    updatedAt: '2026-11-16 17:30:10',
  },
];

const RoutineQualityWorkbench: React.FC = () => {
  // Page mode: list | create | view
  const [pageMode, setPageMode] = useState<'list' | 'create' | 'view'>('list');

  // Task list state
  const [tasks, setTasks] = useState<RoutineQualityTask[]>(INITIAL_ROUTINE_TASKS);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Query filter inputs
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(true);
  const [queryName, setQueryName] = useState<string>('');
  const [queryStatus, setQueryStatus] = useState<string>('');
  const [queryStrategy, setQueryStrategy] = useState<string>('');
  const [queryCreator, setQueryCreator] = useState<string>('');
  const [queryUpdatedDate, setQueryUpdatedDate] = useState<string>('');

  const [appliedFilters, setAppliedFilters] = useState({
    name: '',
    status: '',
    strategy: '',
    creator: '',
    updatedDate: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [jumpPageInput, setJumpPageInput] = useState<string>('1');

  // Delete confirm modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    ids: string[];
    title: string;
  }>({
    open: false,
    ids: [],
    title: '',
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
  };
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // ============================================================================
  // 3-Step Create / View Form State
  // ============================================================================
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);

  // Step 1 fields
  const [formName, setFormName] = useState<string>('');
  const [formTaskType, setFormTaskType] = useState<RoutineTaskType>('大小模型混用');
  const [formPriority, setFormPriority] = useState<RoutineTaskPriority>('高');
  const [formScoringStrategy, setFormScoringStrategy] = useState<RoutineScoringStrategy>('减分');

  // Step 2 fields
  const [formDataType, setFormDataType] = useState<RoutineDataType>('语音');
  const [formConditionGroups, setFormConditionGroups] = useState<MatchConditionGroup[]>(
    createDefaultConditionGroups()
  );
  const [dailyQueryResult, setDailyQueryResult] = useState<{
    queried: boolean;
    matchedCount: number;
    totalCount: number;
    breakdown: { label: string; count: number }[];
    queryTime: string;
  } | null>(null);

  // Step 3 fields
  const [formRules, setFormRules] = useState<BoundQualityRuleEntry[]>([]);

  // Rule Picker Modal State (fixed size + pagination)
  const [rulePickerOpen, setRulePickerOpen] = useState<boolean>(false);
  const [rulePickerSearchName, setRulePickerSearchName] = useState<string>('');
  const [rulePickerSearchCategoryId, setRulePickerSearchCategoryId] = useState<string>('');
  const [rulePickerCheckedIds, setRulePickerCheckedIds] = useState<string[]>([]);
  const [rulePickerPage, setRulePickerPage] = useState<number>(1);
  const [rulePickerPageSize, setRulePickerPageSize] = useState<number>(5);
  const [rulePickerJumpInput, setRulePickerJumpInput] = useState<string>('1');

  // Score Item Binding Modal State (fixed size + pagination)
  const [scorePickerState, setScorePickerState] = useState<{
    open: boolean;
    targetRuleId: string;
    targetRuleName: string;
    selectedScoreItemId: string;
    searchName: string;
    searchCategoryId: string;
  }>({
    open: false,
    targetRuleId: '',
    targetRuleName: '',
    selectedScoreItemId: '',
    searchName: '',
    searchCategoryId: '',
  });
  const [scorePickerPage, setScorePickerPage] = useState<number>(1);
  const [scorePickerPageSize, setScorePickerPageSize] = useState<number>(5);
  const [scorePickerJumpInput, setScorePickerJumpInput] = useState<string>('1');

  // ============================================================================
  // List Query, Filter & Pagination
  // ============================================================================
  const handleSearch = () => {
    setAppliedFilters({
      name: queryName.trim(),
      status: queryStatus,
      strategy: queryStrategy,
      creator: queryCreator.trim(),
      updatedDate: queryUpdatedDate,
    });
    setCurrentPage(1);
    setJumpPageInput('1');
  };

  const handleResetFilters = () => {
    setQueryName('');
    setQueryStatus('');
    setQueryStrategy('');
    setQueryCreator('');
    setQueryUpdatedDate('');
    setAppliedFilters({
      name: '',
      status: '',
      strategy: '',
      creator: '',
      updatedDate: '',
    });
    setCurrentPage(1);
    setJumpPageInput('1');
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (
        appliedFilters.name &&
        !task.name.toLowerCase().includes(appliedFilters.name.toLowerCase())
      ) {
        return false;
      }
      if (appliedFilters.status && task.status !== appliedFilters.status) {
        return false;
      }
      if (appliedFilters.strategy && task.scoringStrategy !== appliedFilters.strategy) {
        return false;
      }
      if (
        appliedFilters.creator &&
        !task.creator.toLowerCase().includes(appliedFilters.creator.toLowerCase())
      ) {
        return false;
      }
      if (
        appliedFilters.updatedDate &&
        !task.updatedAt.startsWith(appliedFilters.updatedDate)
      ) {
        return false;
      }
      return true;
    });
  }, [tasks, appliedFilters]);

  const totalCount = filteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedTasks = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, safeCurrentPage, pageSize]);

  const allCurrentPageSelected =
    pagedTasks.length > 0 && pagedTasks.every(t => selectedRowIds.includes(t.id));

  const handleToggleSelectAll = () => {
    if (allCurrentPageSelected) {
      const pageIds = new Set(pagedTasks.map(t => t.id));
      setSelectedRowIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const merged = new Set([...selectedRowIds, ...pagedTasks.map(t => t.id)]);
      setSelectedRowIds(Array.from(merged));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedRowIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleTaskStatus = (task: RoutineQualityTask) => {
    const nextStatus: RoutineTaskStatus = task.status === '已发布' ? '停用' : '已发布';
    const now = formatCurrentTimestamp();
    setTasks(prev =>
      prev.map(t =>
        t.id === task.id ? { ...t, status: nextStatus, updatedAt: now } : t
      )
    );
    showToast(`任务「${task.name}」已${nextStatus === '停用' ? '停用' : '重新发布启用'}`);
  };

  const handleConfirmDelete = () => {
    const deleteSet = new Set(deleteConfirm.ids);
    setTasks(prev => prev.filter(t => !deleteSet.has(t.id)));
    setSelectedRowIds(prev => prev.filter(id => !deleteSet.has(id)));
    showToast(`已删除「${deleteConfirm.title}」`);
    setDeleteConfirm({ open: false, ids: [], title: '' });
  };

  // ============================================================================
  // Enter Create / View Page Handlers
  // ============================================================================
  const handleStartCreateTask = () => {
    setPageMode('create');
    setViewingTaskId(null);
    setActiveStep(1);
    setFormName('');
    setFormTaskType('大小模型混用');
    setFormPriority('高');
    setFormScoringStrategy('减分');
    setFormDataType('语音');
    setFormConditionGroups(createDefaultConditionGroups());
    setDailyQueryResult(null);
    setFormRules([]);
  };

  const handleViewTask = (task: RoutineQualityTask) => {
    setPageMode('view');
    setViewingTaskId(task.id);
    setActiveStep(1);
    setFormName(task.name);
    setFormTaskType(task.taskType);
    setFormPriority(task.priority);
    setFormScoringStrategy(task.scoringStrategy);
    setFormDataType(task.dataType);
    setFormConditionGroups(JSON.parse(JSON.stringify(task.conditionGroups)));
    const evalRes = evaluateDailyVoiceDataCount(task.conditionGroups);
    setDailyQueryResult({
      queried: true,
      matchedCount: evalRes.matchedCount,
      totalCount: evalRes.totalCount,
      breakdown: evalRes.breakdown,
      queryTime: task.updatedAt,
    });
    setFormRules([...task.rules]);
  };

  const handleTaskTypeChange = (nextType: RoutineTaskType) => {
    setFormTaskType(nextType);
    // Filter out incompatible rules if task type changed
    setFormRules(prev => {
      const compatible = prev.filter(entry => isRuleAllowedForTaskType(entry.rule, nextType));
      if (compatible.length < prev.length) {
        showToast(
          `任务类型切换为「${nextType}」，已自动移除 ${prev.length - compatible.length} 条不匹配的质检规则`
        );
      }
      return compatible;
    });
  };

  const handleScoringStrategyChange = (nextStrategy: RoutineScoringStrategy) => {
    setFormScoringStrategy(nextStrategy);
    setFormRules(prev =>
      prev.map(entry => {
        if (
          entry.boundScoreItem &&
          !isScoreItemAllowedForStrategy(entry.boundScoreItem, nextStrategy)
        ) {
          return { ...entry, boundScoreItem: null };
        }
        return entry;
      })
    );
  };

  const handleQueryDailyDataCount = () => {
    const res = evaluateDailyVoiceDataCount(formConditionGroups);
    setDailyQueryResult({
      queried: true,
      matchedCount: res.matchedCount,
      totalCount: res.totalCount,
      breakdown: res.breakdown,
      queryTime: formatCurrentTimestamp(),
    });
  };

  const handleNextStep = () => {
    if (pageMode === 'view') {
      setActiveStep(prev => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
      return;
    }

    if (activeStep === 1) {
      if (!formName.trim()) {
        showToast('请输入任务名称', 'error');
        return;
      }
      setActiveStep(2);
      return;
    }

    if (activeStep === 2) {
      setActiveStep(3);
    }
  };

  const handlePublishTask = () => {
    if (!formName.trim()) {
      showToast('请输入任务名称', 'error');
      setActiveStep(1);
      return;
    }
    if (formRules.length === 0) {
      showToast('请至少添加一条质检规则后再发布任务', 'error');
      return;
    }

    const now = formatCurrentTimestamp();
    const randomSuffix = String(Math.floor(100 + Math.random() * 900));
    const datePart = now.slice(0, 10).replace(/-/g, '');
    const newTask: RoutineQualityTask = {
      id: `RQ${datePart}${randomSuffix}`,
      name: formName.trim(),
      status: '已发布',
      taskType: formTaskType,
      priority: formPriority,
      scoringStrategy: formScoringStrategy,
      dataType: formDataType,
      conditionGroups: formConditionGroups,
      rules: formRules,
      creator: '当前坐席',
      createdAt: now,
      updatedAt: now,
    };

    setTasks(prev => [newTask, ...prev]);
    setPageMode('list');
    setCurrentPage(1);
    setJumpPageInput('1');
    showToast(`常规质检任务「${newTask.name}」已发布并正式启用`);
  };

  // ============================================================================
  // Step 3: Rule Selection Modal & Score Item Binding Modal Logic
  // ============================================================================
  const eligibleRulesForPicker = useMemo(() => {
    return INITIAL_RULES.filter(rule => {
      if (!isRuleAllowedForTaskType(rule, formTaskType)) return false;
      if (
        rulePickerSearchName.trim() &&
        !rule.name.toLowerCase().includes(rulePickerSearchName.trim().toLowerCase())
      ) {
        return false;
      }
      if (rulePickerSearchCategoryId && rule.categoryId !== rulePickerSearchCategoryId) {
        return false;
      }
      return true;
    });
  }, [formTaskType, rulePickerSearchName, rulePickerSearchCategoryId]);

  const rulePickerTotalCount = eligibleRulesForPicker.length;
  const rulePickerTotalPages = Math.max(1, Math.ceil(rulePickerTotalCount / rulePickerPageSize));
  const safeRulePickerPage = Math.min(rulePickerPage, rulePickerTotalPages);
  const pagedRulesForPicker = useMemo(() => {
    const start = (safeRulePickerPage - 1) * rulePickerPageSize;
    return eligibleRulesForPicker.slice(start, start + rulePickerPageSize);
  }, [eligibleRulesForPicker, safeRulePickerPage, rulePickerPageSize]);

  const handleOpenRulePicker = () => {
    setRulePickerSearchName('');
    setRulePickerSearchCategoryId('');
    setRulePickerCheckedIds(formRules.map(r => r.rule.id));
    setRulePickerPage(1);
    setRulePickerJumpInput('1');
    setRulePickerOpen(true);
  };

  const handleToggleRulePickerCheck = (ruleId: string) => {
    setRulePickerCheckedIds(prev =>
      prev.includes(ruleId) ? prev.filter(id => id !== ruleId) : [...prev, ruleId]
    );
  };

  const handleConfirmAddRules = () => {
    const existingMap = new Map<string, BoundQualityRuleEntry>(
      formRules.map(entry => [entry.rule.id, entry])
    );

    const nextEntries: BoundQualityRuleEntry[] = [];
    rulePickerCheckedIds.forEach(ruleId => {
      const existing = existingMap.get(ruleId);
      if (existing) {
        nextEntries.push(existing);
      } else {
        const found = INITIAL_RULES.find(r => r.id === ruleId);
        if (found) {
          nextEntries.push({ rule: found, boundScoreItem: null });
        }
      }
    });

    setFormRules(nextEntries);
    setRulePickerOpen(false);
    showToast(`已更新质检规则列表（共 ${nextEntries.length} 条）`);
  };

  const handleRemoveAddedRule = (ruleId: string) => {
    setFormRules(prev => prev.filter(entry => entry.rule.id !== ruleId));
  };

  const handleOpenScoreItemPicker = (entry: BoundQualityRuleEntry) => {
    setScorePickerState({
      open: true,
      targetRuleId: entry.rule.id,
      targetRuleName: entry.rule.name,
      selectedScoreItemId: entry.boundScoreItem?.id || '',
      searchName: '',
      searchCategoryId: '',
    });
    setScorePickerPage(1);
    setScorePickerJumpInput('1');
  };

  const eligibleScoreItemsForPicker = useMemo(() => {
    return INITIAL_SCORE_ITEMS.filter(item => {
      if (!isScoreItemAllowedForStrategy(item, formScoringStrategy)) return false;
      if (
        scorePickerState.searchName.trim() &&
        !item.name.toLowerCase().includes(scorePickerState.searchName.trim().toLowerCase())
      ) {
        return false;
      }
      if (
        scorePickerState.searchCategoryId &&
        item.categoryId !== scorePickerState.searchCategoryId
      ) {
        return false;
      }
      return true;
    });
  }, [
    formScoringStrategy,
    scorePickerState.searchName,
    scorePickerState.searchCategoryId,
  ]);

  const scorePickerTotalCount = eligibleScoreItemsForPicker.length;
  const scorePickerTotalPages = Math.max(
    1,
    Math.ceil(scorePickerTotalCount / scorePickerPageSize)
  );
  const safeScorePickerPage = Math.min(scorePickerPage, scorePickerTotalPages);
  const pagedScoreItemsForPicker = useMemo(() => {
    const start = (safeScorePickerPage - 1) * scorePickerPageSize;
    return eligibleScoreItemsForPicker.slice(start, start + scorePickerPageSize);
  }, [eligibleScoreItemsForPicker, safeScorePickerPage, scorePickerPageSize]);

  const handleConfirmBindScoreItem = () => {
    if (!scorePickerState.selectedScoreItemId) {
      showToast('请选择一条评分项', 'error');
      return;
    }
    const chosen = INITIAL_SCORE_ITEMS.find(
      s => s.id === scorePickerState.selectedScoreItemId
    );
    if (!chosen) return;

    setFormRules(prev =>
      prev.map(entry =>
        entry.rule.id === scorePickerState.targetRuleId
          ? { ...entry, boundScoreItem: chosen }
          : entry
      )
    );
    setScorePickerState(prev => ({ ...prev, open: false }));
    showToast(`规则「${scorePickerState.targetRuleName}」已绑定评分项「${chosen.name}」`);
  };

  const activeStrategyRule = SCORING_STRATEGY_RULES[formScoringStrategy];
  const boundScoreSummary = useMemo(() => {
    let totalPlus = 0;
    let totalMinus = 0;
    let boundCount = 0;
    formRules.forEach(entry => {
      if (entry.boundScoreItem) {
        boundCount += 1;
        if (entry.boundScoreItem.scoreType === '加分') {
          totalPlus += entry.boundScoreItem.scoreValue;
        } else {
          totalMinus += entry.boundScoreItem.scoreValue;
        }
      }
    });
    const minPossible = Math.max(
      activeStrategyRule.minScore,
      activeStrategyRule.initialScore - totalMinus
    );
    const maxPossible = Math.min(
      activeStrategyRule.maxScore,
      activeStrategyRule.initialScore + totalPlus
    );
    return { totalPlus, totalMinus, boundCount, minPossible, maxPossible };
  }, [formRules, activeStrategyRule]);

  const isReadOnly = pageMode === 'view';

  return (
    <div className="h-full w-full flex bg-[#f2f4f8] overflow-hidden select-none relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg text-xs flex items-center space-x-2 border border-slate-700">
          {toastMessage.type === 'error' ? (
            <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {pageMode === 'list' ? (
        /* ============================================================================
         * 1. 常规质检任务列表页
         * ============================================================================ */
        <div className="flex-1 flex flex-col bg-white m-2.5 rounded-sm shadow-xs border border-slate-200/80 overflow-hidden min-w-0">
          {/* Top Title Header */}
          <div className="h-12 px-5 flex items-center justify-between border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <h1 className="text-[15px] font-bold text-slate-800">常规质检</h1>
              <span className="text-xs text-slate-400">
                定时质检任务，每日按配置的质检规则对筛选条件命中的新增数据进行自动质检
              </span>
            </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            {/* Query Filter Area */}
            <div className="bg-[#f9fafc] border border-slate-100 rounded-md px-5 py-4 mb-4 flex-shrink-0">
              {isSearchExpanded ? (
                <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
                  {/* 任务名称 */}
                  <div className="flex items-center space-x-2.5">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      任务名称
                    </label>
                    <input
                      type="text"
                      value={queryName}
                      onChange={e => setQueryName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      placeholder="任务名称"
                      className="w-40 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#1677ff] transition-colors"
                    />
                  </div>

                  {/* 任务状态 */}
                  <div className="flex items-center space-x-2.5">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      任务状态
                    </label>
                    <select
                      value={queryStatus}
                      onChange={e => setQueryStatus(e.target.value)}
                      className="w-32 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                    >
                      <option value="">请选择</option>
                      <option value="已发布">已发布</option>
                      <option value="停用">停用</option>
                    </select>
                  </div>

                  {/* 评分策略 */}
                  <div className="flex items-center space-x-2.5">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      评分策略
                    </label>
                    <select
                      value={queryStrategy}
                      onChange={e => setQueryStrategy(e.target.value)}
                      className="w-32 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                    >
                      <option value="">请选择</option>
                      <option value="加分">加分</option>
                      <option value="减分">减分</option>
                      <option value="不区分">不区分</option>
                    </select>
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
                      className="w-36 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#1677ff] transition-colors"
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
                      className="w-40 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors"
                    />
                  </div>

                  {/* Right Query / Reset / Hide */}
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
                    已折叠查询条件栏（点击右侧展开可按任务名称、任务状态、评分策略、创建人、更新时间筛选）
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

            {/* Action Toolbar Row */}
            <div className="flex items-center space-x-2.5 mb-3.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleStartCreateTask}
                className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors cursor-pointer shadow-2xs flex items-center space-x-1.5"
              >
                <Plus size={14} />
                <span>新建常规任务</span>
              </button>
              {selectedRowIds.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setDeleteConfirm({
                      open: true,
                      ids: selectedRowIds,
                      title: `选中的 ${selectedRowIds.length} 条常规任务`,
                    })
                  }
                  className="h-8 px-3.5 bg-[#fff1f0] hover:bg-red-100 text-red-500 border border-[#ffccc7] text-xs font-medium rounded transition-colors cursor-pointer"
                >
                  批量删除 ({selectedRowIds.length})
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
                    <th className="py-2.5 px-3 text-center border-r border-white w-[145px]">
                      任务ID
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white min-w-[180px]">
                      任务名称
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[100px]">
                      任务状态
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[170px]">
                      评分策略
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white min-w-[240px]">
                      质检规则
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[100px]">
                      创建人
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[160px]">
                      创建时间
                    </th>
                    <th className="py-2.5 px-3 text-center w-[150px]">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[12.5px] text-slate-700 bg-white">
                  {pagedTasks.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-slate-400 text-xs">
                        暂无符合条件的常规质检任务，请点击左上角「新建常规任务」或重置筛选条件
                      </td>
                    </tr>
                  ) : (
                    pagedTasks.map(task => {
                      const isChecked = selectedRowIds.includes(task.id);
                      const strategyMeta = SCORING_STRATEGY_RULES[task.scoringStrategy];
                      return (
                        <tr
                          key={task.id}
                          className={`hover:bg-[#f5f8ff] transition-colors ${
                            isChecked ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <td className="py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleSelectRow(task.id)}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-[#1677ff] focus:ring-0 cursor-pointer accent-[#1677ff]"
                            />
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-700 tabular-nums">
                            {task.id}
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-800 font-medium leading-snug">
                            <button
                              type="button"
                              onClick={() => handleViewTask(task)}
                              className="hover:text-[#1677ff] hover:underline cursor-pointer"
                            >
                              {task.name}
                            </button>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                task.status === '已发布'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  task.status === '已发布' ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                              />
                              {task.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <div className="flex flex-col items-center space-y-1">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                  task.scoringStrategy === '加分'
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                    : task.scoringStrategy === '减分'
                                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                                    : 'bg-blue-50 text-[#1677ff] border-blue-200'
                                }`}
                              >
                                {task.scoringStrategy}
                              </span>
                              <span className="text-[10.5px] text-slate-400">
                                {strategyMeta.rangeShortText}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-left">
                            <div className="flex flex-wrap items-center gap-1">
                              {task.rules.slice(0, 2).map(entry => (
                                <span
                                  key={entry.rule.id}
                                  title={entry.rule.name}
                                  className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] max-w-[150px] truncate border border-slate-200/70"
                                >
                                  {entry.rule.name}
                                </span>
                              ))}
                              {task.rules.length > 2 && (
                                <span className="px-1.5 py-0.5 bg-blue-50 text-[#1677ff] rounded text-[11px] font-medium">
                                  +{task.rules.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-700">
                            {task.creator}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-600 tabular-nums">
                            {task.createdAt}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <div className="inline-flex items-center justify-center space-x-2.5 text-xs">
                              <button
                                type="button"
                                onClick={() => handleToggleTaskStatus(task)}
                                className={`hover:underline cursor-pointer inline-flex items-center space-x-0.5 ${
                                  task.status === '已发布'
                                    ? 'text-amber-600 hover:text-amber-700'
                                    : 'text-emerald-600 hover:text-emerald-700'
                                }`}
                              >
                                {task.status === '已发布' ? (
                                  <>
                                    <PowerOff size={12} />
                                    <span>停用</span>
                                  </>
                                ) : (
                                  <>
                                    <Power size={12} />
                                    <span>启用</span>
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleViewTask(task)}
                                className="text-[#1677ff] hover:text-blue-700 hover:underline cursor-pointer inline-flex items-center space-x-0.5"
                              >
                                <Eye size={12} />
                                <span>查看</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirm({
                                    open: true,
                                    ids: [task.id],
                                    title: task.name,
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
         * 2. 新建 / 查看常规任务页面（白底全页展开 · 三步向导）
         * ============================================================================ */
        <div className="flex-1 flex flex-col bg-white w-full h-full overflow-hidden min-w-0">
          {/* Subpage Top Bar */}
          <div className="h-12 px-6 flex items-center justify-between border-b border-slate-200 flex-shrink-0 bg-white">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setPageMode('list')}
                className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-[#1677ff] transition-colors cursor-pointer"
              >
                <ArrowLeft size={15} />
                <span>返回列表</span>
              </button>
              <span className="text-slate-300">|</span>
              <h1 className="text-[15px] font-bold text-slate-800">
                {isReadOnly ? '查看常规任务' : '新建常规任务'}
              </h1>
              {isReadOnly && viewingTaskId && (
                <span className="text-xs font-mono text-slate-400">({viewingTaskId})</span>
              )}
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span>当前进度：第 {activeStep} / 3 步</span>
            </div>
          </div>

          {/* Full-Width White Step Indicator Bar */}
          <div className="px-8 py-4 bg-white border-b border-slate-200/80 flex-shrink-0">
            <div className="w-full flex items-center justify-between">
              {[
                { step: 1 as const, title: '设置任务信息', desc: '任务名称、类型、优先级与评分策略约束' },
                { step: 2 as const, title: '数据选择', desc: '数据类型、匹配条件与当日数据量试算' },
                { step: 3 as const, title: '选择质检规则', desc: '添加适用规则并绑定评分项' },
              ].map((item, index) => {
                const isCurrent = activeStep === item.step;
                const isCompleted = activeStep > item.step;
                const canJump = isReadOnly || item.step <= activeStep;

                return (
                  <React.Fragment key={item.step}>
                    <button
                      type="button"
                      disabled={!canJump}
                      onClick={() => canJump && setActiveStep(item.step)}
                      className={`flex items-center space-x-3 text-left px-3 py-1.5 rounded-md transition-colors ${
                        isCurrent ? 'bg-blue-50/70' : ''
                      } ${canJump ? 'cursor-pointer hover:bg-slate-50' : 'cursor-not-allowed opacity-60'}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0 transition-colors ${
                          isCurrent
                            ? 'bg-[#1677ff] text-white border-[#1677ff] shadow-xs'
                            : isCompleted
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-white text-slate-400 border-slate-300'
                        }`}
                      >
                        {isCompleted ? '✓' : item.step}
                      </div>
                      <div>
                        <div
                          className={`text-xs font-semibold ${
                            isCurrent
                              ? 'text-[#1677ff]'
                              : isCompleted
                              ? 'text-slate-800'
                              : 'text-slate-500'
                          }`}
                        >
                          第{item.step === 1 ? '一' : item.step === 2 ? '二' : '三'}步：{item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                    </button>

                    {index < 2 && (
                      <div
                        className={`flex-1 h-[1px] mx-6 ${
                          activeStep > item.step ? 'bg-emerald-400' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Full-Width Pure White Step Body Area */}
          <div className="flex-1 overflow-y-auto px-8 py-6 bg-white custom-scrollbar">
            {/* ==================== STEP 1: 设置任务信息 ==================== */}
            {activeStep === 1 && (
              <div className="w-full space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-1 h-3.5 bg-[#1677ff] rounded-full"></span>
                    <h2 className="text-[14px] font-bold text-slate-800">基础任务信息与评分策略设置</h2>
                  </div>
                  <span className="text-xs text-slate-400">带 * 为必填项，评分策略将决定后续可绑定的评分项及计分边界</span>
                </div>

                <div className="space-y-6 text-xs max-w-4xl">
                  {/* 任务名称 */}
                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <label className="text-right font-medium text-slate-700">
                      <span className="text-red-500 mr-1">*</span>任务名称：
                    </label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="请输入常规质检任务名称，例如：电销外呼每日合规抽检"
                      className="w-full max-w-lg h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#1677ff] disabled:bg-slate-50"
                    />
                  </div>

                  {/* 任务类型 */}
                  <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                    <label className="text-right font-medium text-slate-700 pt-2">
                      <span className="text-red-500 mr-1">*</span>任务类型：
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        {(['大模型', '大小模型混用', '传统'] as RoutineTaskType[]).map(type => {
                          const active = formTaskType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => handleTaskTypeChange(type)}
                              className={`h-8 px-5 rounded border text-xs font-medium transition-all cursor-pointer disabled:cursor-default ${
                                active
                                  ? 'bg-blue-50 text-[#1677ff] border-[#1677ff] shadow-2xs'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11.5px] text-slate-400">
                        {formTaskType === '大模型' && '规则选择约束：仅可选择「大模型」类型质检规则'}
                        {formTaskType === '大小模型混用' && '规则选择约束：可选择全部质检规则（含大模型、大小模型混用及传统模式规则）'}
                        {formTaskType === '传统' && '规则选择约束：仅可选择「传统模式」质检规则，不可选择大模型相关规则'}
                      </p>
                    </div>
                  </div>

                  {/* 优先级 */}
                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <label className="text-right font-medium text-slate-700">
                      <span className="text-red-500 mr-1">*</span>优先级：
                    </label>
                    <div className="flex items-center space-x-3">
                      {(['高', '中', '低'] as RoutineTaskPriority[]).map(prio => {
                        const active = formPriority === prio;
                        return (
                          <label
                            key={prio}
                            className={`inline-flex items-center space-x-1.5 px-4 py-1.5 rounded border text-xs cursor-pointer transition-colors ${
                              active
                                ? 'bg-blue-50/70 border-[#1677ff] text-[#1677ff] font-medium'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            } ${isReadOnly ? 'pointer-events-none' : ''}`}
                          >
                            <input
                              type="radio"
                              name="task-priority"
                              disabled={isReadOnly}
                              checked={active}
                              onChange={() => setFormPriority(prio)}
                              className="accent-[#1677ff]"
                            />
                            <span>{prio}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* 评分策略（含明确初始分、上下限及绑定评分项约束） */}
                  <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                    <label className="text-right font-medium text-slate-700 pt-2">
                      <span className="text-red-500 mr-1">*</span>评分策略：
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        {(['加分', '减分', '不区分'] as RoutineScoringStrategy[]).map(strategy => {
                          const active = formScoringStrategy === strategy;
                          return (
                            <label
                              key={strategy}
                              className={`inline-flex items-center space-x-1.5 px-4 py-1.5 rounded border text-xs cursor-pointer transition-colors ${
                                active
                                  ? 'bg-blue-50/70 border-[#1677ff] text-[#1677ff] font-medium'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              } ${isReadOnly ? 'pointer-events-none' : ''}`}
                            >
                              <input
                                type="radio"
                                name="scoring-strategy"
                                disabled={isReadOnly}
                                checked={active}
                                onChange={() => handleScoringStrategyChange(strategy)}
                                className="accent-[#1677ff]"
                              />
                              <span>{strategy}</span>
                            </label>
                          );
                        })}
                      </div>

                      {/* Structured Constraint Card */}
                      <div className="bg-[#f8fafd] border border-slate-200/90 rounded p-4 space-y-3">
                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                          <Info size={14} className="text-[#1677ff]" />
                          <span>当前评分策略约束规则（{activeStrategyRule.strategy}）</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-white border border-slate-200/80 rounded px-3 py-2.5">
                            <div className="text-[11px] text-slate-400">初始得分</div>
                            <div className="text-sm font-bold text-[#1677ff] font-mono mt-0.5">
                              {activeStrategyRule.initialScore} 分
                            </div>
                          </div>
                          <div className="bg-white border border-slate-200/80 rounded px-3 py-2.5">
                            <div className="text-[11px] text-slate-400">得分边界限制</div>
                            <div className="text-sm font-bold text-slate-800 mt-0.5">
                              {activeStrategyRule.strategy === '加分' && '最高加到 100 分'}
                              {activeStrategyRule.strategy === '减分' && '最低减到 0 分'}
                              {activeStrategyRule.strategy === '不区分' && '0 ~ 100 分封顶保底'}
                            </div>
                          </div>
                          <div className="bg-white border border-slate-200/80 rounded px-3 py-2.5">
                            <div className="text-[11px] text-slate-400">绑定评分项约束</div>
                            <div className="text-xs font-semibold text-slate-800 mt-1">
                              {activeStrategyRule.bindingRuleText}
                            </div>
                          </div>
                        </div>
                        <p className="text-[11.5px] text-slate-500 leading-relaxed">
                          {activeStrategyRule.detailDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== STEP 2: 数据选择 ==================== */}
            {activeStep === 2 && (
              <div className="w-full space-y-6">
                {/* 数据类型选择 */}
                <div className="pb-6 border-b border-slate-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="w-1 h-3.5 bg-[#1677ff] rounded-full"></span>
                    <h2 className="text-[14px] font-bold text-slate-800">数据类型</h2>
                  </div>
                  <div className="flex items-center space-x-4 text-xs">
                    <span className="text-slate-600 font-medium">选择数据类型：</span>
                    <label className="inline-flex items-center space-x-2 px-4 py-1.5 bg-blue-50/80 border border-[#1677ff] text-[#1677ff] rounded font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="data-type"
                        checked={formDataType === '语音'}
                        onChange={() => setFormDataType('语音')}
                        disabled={isReadOnly}
                        className="accent-[#1677ff]"
                      />
                      <span>语音</span>
                    </label>
                    <span className="text-[11.5px] text-slate-400">
                      当前仅支持「语音」通联数据，后续将扩展文本、工单等数据类型
                    </span>
                  </div>
                </div>

                {/* 数据匹配条件（AND/OR逻辑 + 试算当日数据量） */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-1 h-3.5 bg-[#1677ff] rounded-full"></span>
                      <h2 className="text-[14px] font-bold text-slate-800">数据匹配条件</h2>
                      <span className="text-xs text-slate-400">
                        组内条件为 AND（且）关系，组间条件为 OR（或）关系
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleQueryDailyDataCount}
                      className="h-8 px-4 bg-[#e8f2ff] hover:bg-[#d4e7ff] text-[#1677ff] border border-[#b7d6ff] text-xs font-medium rounded transition-colors cursor-pointer flex items-center space-x-1.5"
                    >
                      <Database size={13} />
                      <span>查询当天满足条件的数据量</span>
                    </button>
                  </div>

                  {/* Daily Volume Query Result Banner */}
                  {dailyQueryResult && (
                    <div className="mb-4 px-4 py-3 bg-[#f0f7ff] border border-[#bae0ff] rounded flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-2.5">
                        <Search size={14} className="text-[#1677ff]" />
                        <span className="text-slate-700">
                          当天满足当前筛选条件的语音数据量：
                        </span>
                        <span className="text-[15px] font-bold text-[#1677ff] font-mono tabular-nums">
                          {dailyQueryResult.matchedCount.toLocaleString()} 条
                        </span>
                        <span className="text-slate-400">
                          （当日总语音量 {dailyQueryResult.totalCount.toLocaleString()} 条）
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {dailyQueryResult.breakdown.map(item => (
                          <span
                            key={item.label}
                            className="px-2 py-0.5 bg-white border border-blue-200 text-slate-600 rounded text-[11px]"
                          >
                            {item.label}：{item.count.toLocaleString()} 条
                          </span>
                        ))}
                        <span className="text-[11px] text-slate-400 font-mono">
                          统计时间：{dailyQueryResult.queryTime}
                        </span>
                      </div>
                    </div>
                  )}

                  <DataMatchConditionBuilder
                    groups={formConditionGroups}
                    onChange={next => {
                      setFormConditionGroups(next);
                      setDailyQueryResult(null);
                    }}
                    readOnly={isReadOnly}
                  />
                </div>
              </div>
            )}

            {/* ==================== STEP 3: 选择质检规则 ==================== */}
            {activeStep === 3 && (
              <div className="w-full space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-1 h-3.5 bg-[#1677ff] rounded-full"></span>
                    <h2 className="text-[14px] font-bold text-slate-800">已选质检规则列表</h2>
                    <span className="text-xs text-slate-400">
                      共 {formRules.length} 条规则
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 text-xs bg-[#f8fafd] border border-slate-200/80 px-3 py-1.5 rounded">
                      <span className="text-slate-500">任务类型：</span>
                      <span className="font-semibold text-[#1677ff]">{formTaskType}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500">评分策略：</span>
                      <span className="font-semibold text-slate-800">{formScoringStrategy}</span>
                      <span className="text-slate-400">（{activeStrategyRule.rangeShortText}）</span>
                    </div>

                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={handleOpenRulePicker}
                        className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors cursor-pointer flex items-center space-x-1.5 shadow-2xs"
                      >
                        <Plus size={14} />
                        <span>添加规则</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Scoring Constraint & Bound Score Preview Banner */}
                <div className="px-4 py-2.5 bg-[#f0f7ff] border border-[#bae0ff] rounded flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <Info size={14} className="text-[#1677ff] flex-shrink-0" />
                    <span>{activeStrategyRule.detailDescription}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11.5px] font-medium">
                    <span className="text-slate-600">
                      已绑定评分项：<strong className="text-[#1677ff]">{boundScoreSummary.boundCount}</strong> / {formRules.length}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-600">
                      理论得分区间（封顶100/保底0）：
                      <strong className="text-[#1677ff] font-mono ml-1">
                        {boundScoreSummary.minPossible} ~ {boundScoreSummary.maxPossible} 分
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Added Rules Table */}
                <div className="border border-slate-100 rounded overflow-hidden">
                  <table className="w-full border-collapse text-left">
                    <thead className="bg-[#dbe7fb] text-slate-700 text-xs font-semibold">
                      <tr>
                        <th className="py-2.5 px-3 text-center border-r border-white w-[170px]">
                          规则ID
                        </th>
                        <th className="py-2.5 px-3 text-center border-r border-white min-w-[240px]">
                          规则名称
                        </th>
                        <th className="py-2.5 px-3 text-center border-r border-white min-w-[160px]">
                          规则分类
                        </th>
                        <th className="py-2.5 px-3 text-center border-r border-white w-[100px]">
                          创建人
                        </th>
                        <th className="py-2.5 px-3 text-center border-r border-white w-[160px]">
                          更新时间
                        </th>
                        <th className="py-2.5 px-3 text-center w-[220px]">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[12.5px] text-slate-700 bg-white">
                      {formRules.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-14 text-center text-slate-400 text-xs">
                            暂未添加质检规则，请点击右上角「添加规则」按钮选择质检规则
                          </td>
                        </tr>
                      ) : (
                        formRules.map(entry => {
                          const { rule, boundScoreItem } = entry;
                          return (
                            <tr key={rule.id} className="hover:bg-[#f5f8ff] transition-colors">
                              <td className="py-3 px-3 text-center font-mono text-xs text-slate-700 tabular-nums">
                                {rule.id}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <div className="font-medium text-slate-800">{rule.name}</div>
                                <div className="mt-1 flex items-center justify-center space-x-1.5">
                                  <span className="text-[10.5px] px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded">
                                    {rule.ruleMode}
                                  </span>
                                  {boundScoreItem ? (
                                    <span
                                      className={`text-[10.5px] px-2 py-0.2 rounded border ${
                                        boundScoreItem.scoreType === '加分'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : 'bg-amber-50 text-amber-700 border-amber-200'
                                      }`}
                                    >
                                      已绑定：{boundScoreItem.name} (
                                      {boundScoreItem.scoreType === '加分' ? '+' : '-'}
                                      {boundScoreItem.scoreValue}分)
                                    </span>
                                  ) : (
                                    <span className="text-[10.5px] px-2 py-0.2 rounded bg-slate-50 text-slate-400 border border-slate-200">
                                      未绑定评分项
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center text-xs text-slate-600">
                                {rule.categoryPath}
                              </td>
                              <td className="py-3 px-3 text-center text-xs text-slate-700">
                                {rule.creator}
                              </td>
                              <td className="py-3 px-3 text-center font-mono text-xs text-slate-600 tabular-nums">
                                {rule.updatedAt}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <div className="inline-flex items-center justify-center space-x-3 text-xs">
                                  {!isReadOnly ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenScoreItemPicker(entry)}
                                        className="text-[#1677ff] hover:text-blue-700 hover:underline cursor-pointer inline-flex items-center space-x-1 font-medium"
                                      >
                                        <Link2 size={12} />
                                        <span>
                                          {boundScoreItem ? '更换评分项' : '绑定评分项'}
                                        </span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveAddedRule(rule.id)}
                                        className="text-slate-400 hover:text-red-600 hover:underline cursor-pointer inline-flex items-center space-x-0.5"
                                      >
                                        <Trash2 size={12} />
                                        <span>移除</span>
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-slate-400">
                                      {boundScoreItem
                                        ? `${boundScoreItem.scoreType} ${boundScoreItem.scoreValue}分`
                                        : '未绑定'}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Persistent White Bottom Action Footer */}
          <div className="h-14 px-8 border-t border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
            <button
              type="button"
              onClick={() => setPageMode('list')}
              className="h-8 px-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 text-xs font-medium rounded transition-colors cursor-pointer"
            >
              {isReadOnly ? '返回列表' : '取消'}
            </button>

            <div className="flex items-center space-x-3">
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStep(prev => (prev - 1) as 1 | 2 | 3)}
                  className="h-8 px-5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium rounded transition-colors cursor-pointer"
                >
                  上一步
                </button>
              )}

              {activeStep < 3 && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="h-8 px-5 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors cursor-pointer shadow-2xs"
                >
                  下一步
                </button>
              )}

              {activeStep === 3 && !isReadOnly && (
                <button
                  type="button"
                  onClick={handlePublishTask}
                  className="h-8 px-5 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors cursor-pointer shadow-2xs flex items-center space-x-1.5"
                >
                  <Send size={13} />
                  <span>发布任务</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
       * 3. 质检规则选择弹窗（第三步：固定尺寸 + 分页）
       * ============================================================================ */}
      {rulePickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl w-[900px] h-[600px] max-w-[94vw] max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="h-12 px-5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-800">选择质检规则</h3>
                <span className="text-[11px] px-2 py-0.5 bg-blue-50 text-[#1677ff] rounded border border-blue-200">
                  当前任务类型：{formTaskType}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRulePickerOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scope Hint Banner */}
            <div className="px-5 py-2.5 bg-[#f0f7ff] border-b border-[#bae0ff] text-xs text-slate-700 flex items-center space-x-2 flex-shrink-0">
              <Info size={14} className="text-[#1677ff] flex-shrink-0" />
              <span>
                {formTaskType === '大模型' &&
                  '任务类型为「大模型」，当前列表已自动过滤，仅支持选择「大模型」相关质检规则。'}
                {formTaskType === '大小模型混用' &&
                  '任务类型为「大小模型混用」，可自由勾选全部类型的质检规则。'}
                {formTaskType === '传统' &&
                  '任务类型为「传统」，当前列表已自动排除大模型相关规则，仅支持选择「传统模式」质检规则。'}
              </span>
            </div>

            {/* Search Filter Bar */}
            <div className="px-5 py-3 bg-[#f9fafc] border-b border-slate-100 flex flex-wrap items-center gap-4 flex-shrink-0 text-xs">
              <div className="flex items-center space-x-2">
                <label className="font-medium text-slate-700">规则名称</label>
                <input
                  type="text"
                  value={rulePickerSearchName}
                  onChange={e => {
                    setRulePickerSearchName(e.target.value);
                    setRulePickerPage(1);
                    setRulePickerJumpInput('1');
                  }}
                  placeholder="请输入规则名称"
                  className="w-48 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-[#1677ff]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <label className="font-medium text-slate-700">规则分类</label>
                <select
                  value={rulePickerSearchCategoryId}
                  onChange={e => {
                    setRulePickerSearchCategoryId(e.target.value);
                    setRulePickerPage(1);
                    setRulePickerJumpInput('1');
                  }}
                  className="w-44 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-[#1677ff] cursor-pointer"
                >
                  <option value="">全部分类</option>
                  {INITIAL_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setRulePickerSearchName('');
                  setRulePickerSearchCategoryId('');
                  setRulePickerPage(1);
                  setRulePickerJumpInput('1');
                }}
                className="h-8 px-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs cursor-pointer"
              >
                重置
              </button>
            </div>

            {/* Rule Table (Scrollable inside fixed modal height) */}
            <div className="flex-1 overflow-auto px-5 pt-3 pb-2 custom-scrollbar">
              <table className="w-full border-collapse text-left border border-slate-100">
                <thead className="sticky top-0 bg-[#dbe7fb] text-slate-700 text-xs font-semibold">
                  <tr>
                    <th className="w-11 py-2.5 text-center border-r border-white">选择</th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[160px]">
                      规则ID
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white">
                      规则名称
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[170px]">
                      规则分类
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[95px]">
                      创建人
                    </th>
                    <th className="py-2.5 px-3 text-center w-[155px]">更新时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 bg-white">
                  {pagedRulesForPicker.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        当前筛选条件下暂无可选的质检规则
                      </td>
                    </tr>
                  ) : (
                    pagedRulesForPicker.map(rule => {
                      const checked = rulePickerCheckedIds.includes(rule.id);
                      return (
                        <tr
                          key={rule.id}
                          onClick={() => handleToggleRulePickerCheck(rule.id)}
                          className={`hover:bg-[#f5f8ff] cursor-pointer transition-colors ${
                            checked ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <td
                            className="py-3 text-center"
                            onClick={e => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleRulePickerCheck(rule.id)}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-[#1677ff] accent-[#1677ff] cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-600 tabular-nums">
                            {rule.id}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-medium text-slate-800">{rule.name}</span>
                            <span className="ml-1.5 text-[10.5px] px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded">
                              {rule.ruleMode}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center text-slate-600">
                            {rule.categoryPath}
                          </td>
                          <td className="py-3 px-3 text-center">{rule.creator}</td>
                          <td className="py-3 px-3 text-center font-mono text-slate-600 tabular-nums">
                            {rule.updatedAt}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Rule Picker Modal Pagination Bar */}
            <div className="h-10 mx-5 mb-2 bg-[#efefef] px-3 flex items-center justify-end space-x-2.5 text-xs text-slate-600 flex-shrink-0 rounded-sm">
              <span className="tabular-nums">共 {rulePickerTotalCount} 条</span>

              <select
                value={rulePickerPageSize}
                onChange={e => {
                  setRulePickerPageSize(Number(e.target.value));
                  setRulePickerPage(1);
                  setRulePickerJumpInput('1');
                }}
                className="h-6 px-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] cursor-pointer"
              >
                <option value={5}>5条/页</option>
                <option value={10}>10条/页</option>
                <option value={20}>20条/页</option>
              </select>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  disabled={safeRulePickerPage <= 1}
                  onClick={() => {
                    const next = Math.max(1, safeRulePickerPage - 1);
                    setRulePickerPage(next);
                    setRulePickerJumpInput(String(next));
                  }}
                  className="w-6 h-6 flex items-center justify-center bg-white border border-slate-300 rounded text-slate-500 hover:border-[#1677ff] hover:text-[#1677ff] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft size={13} />
                </button>

                {Array.from({ length: rulePickerTotalPages }, (_, idx) => idx + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => {
                      setRulePickerPage(pageNum);
                      setRulePickerJumpInput(String(pageNum));
                    }}
                    className={`min-w-[24px] h-6 px-1.5 flex items-center justify-center rounded text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                      safeRulePickerPage === pageNum
                        ? 'bg-[#1677ff] text-white border border-[#1677ff]'
                        : 'bg-white text-slate-600 border border-slate-300 hover:border-[#1677ff] hover:text-[#1677ff]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={safeRulePickerPage >= rulePickerTotalPages}
                  onClick={() => {
                    const next = Math.min(rulePickerTotalPages, safeRulePickerPage + 1);
                    setRulePickerPage(next);
                    setRulePickerJumpInput(String(next));
                  }}
                  className="w-6 h-6 flex items-center justify-center bg-white border border-slate-300 rounded text-slate-500 hover:border-[#1677ff] hover:text-[#1677ff] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronRight size={13} />
                </button>
              </div>

              <div className="flex items-center space-x-1">
                <span>前往</span>
                <input
                  type="text"
                  value={rulePickerJumpInput}
                  onChange={e => setRulePickerJumpInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const num = parseInt(rulePickerJumpInput, 10);
                      if (!isNaN(num)) {
                        const target = Math.min(Math.max(1, num), rulePickerTotalPages);
                        setRulePickerPage(target);
                        setRulePickerJumpInput(String(target));
                      }
                    }
                  }}
                  className="w-9 h-6 text-center bg-white border border-slate-300 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
                />
                <span>页</span>
              </div>
            </div>

            <div className="h-12 px-5 border-t border-slate-200 bg-[#f9fafc] flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-slate-500">
                已勾选 <strong className="text-[#1677ff]">{rulePickerCheckedIds.length}</strong> 条规则
              </span>
              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => setRulePickerOpen(false)}
                  className="h-8 px-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 text-xs rounded cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddRules}
                  className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded cursor-pointer"
                >
                  确认添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
       * 4. 评分项选择弹窗（第三步：固定尺寸 + 分页）
       * ============================================================================ */}
      {scorePickerState.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl w-[840px] h-[580px] max-w-[94vw] max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="h-12 px-5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-800">绑定评分项</h3>
                <span className="text-xs text-slate-400">
                  规则：{scorePickerState.targetRuleName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setScorePickerState(prev => ({ ...prev, open: false }))}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Strategy Scope Hint */}
            <div className="px-5 py-2.5 bg-[#f0f7ff] border-b border-[#bae0ff] text-xs text-slate-700 flex items-center space-x-2 flex-shrink-0">
              <Info size={14} className="text-[#1677ff] flex-shrink-0" />
              <span>
                评分项来源于「评分项管理」。当前评分策略为「{formScoringStrategy}」（{activeStrategyRule.rangeShortText}）：
                {activeStrategyRule.bindingRuleText}。
              </span>
            </div>

            {/* Filter Bar */}
            <div className="px-5 py-3 bg-[#f9fafc] border-b border-slate-100 flex flex-wrap items-center gap-4 flex-shrink-0 text-xs">
              <div className="flex items-center space-x-2">
                <label className="font-medium text-slate-700">评分项名称</label>
                <input
                  type="text"
                  value={scorePickerState.searchName}
                  onChange={e => {
                    setScorePickerState(prev => ({ ...prev, searchName: e.target.value }));
                    setScorePickerPage(1);
                    setScorePickerJumpInput('1');
                  }}
                  placeholder="请输入评分项名称"
                  className="w-44 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-[#1677ff]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="font-medium text-slate-700">所属分类</label>
                <select
                  value={scorePickerState.searchCategoryId}
                  onChange={e => {
                    setScorePickerState(prev => ({
                      ...prev,
                      searchCategoryId: e.target.value,
                    }));
                    setScorePickerPage(1);
                    setScorePickerJumpInput('1');
                  }}
                  className="w-40 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-[#1677ff] cursor-pointer"
                >
                  <option value="">全部分类</option>
                  {INITIAL_SCORE_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => {
                  setScorePickerState(prev => ({
                    ...prev,
                    searchName: '',
                    searchCategoryId: '',
                  }));
                  setScorePickerPage(1);
                  setScorePickerJumpInput('1');
                }}
                className="h-8 px-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs cursor-pointer"
              >
                重置
              </button>
            </div>

            {/* Score Items Table (Scrollable inside fixed modal height) */}
            <div className="flex-1 overflow-auto px-5 pt-3 pb-2 custom-scrollbar">
              <table className="w-full border-collapse text-left border border-slate-100">
                <thead className="sticky top-0 bg-[#dbe7fb] text-slate-700 text-xs font-semibold">
                  <tr>
                    <th className="w-12 py-2.5 text-center border-r border-white">选择</th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[135px]">
                      ID
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white">
                      评分项名称
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[110px]">
                      所属分类
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[90px]">
                      加减分
                    </th>
                    <th className="py-2.5 px-3 text-center w-[80px]">分值</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 bg-white">
                  {pagedScoreItemsForPicker.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        暂无符合当前评分策略的评分项
                      </td>
                    </tr>
                  ) : (
                    pagedScoreItemsForPicker.map(item => {
                      const selected = scorePickerState.selectedScoreItemId === item.id;
                      return (
                        <tr
                          key={item.id}
                          onClick={() =>
                            setScorePickerState(prev => ({
                              ...prev,
                              selectedScoreItemId: item.id,
                            }))
                          }
                          className={`hover:bg-[#f5f8ff] cursor-pointer transition-colors ${
                            selected ? 'bg-blue-50/60' : ''
                          }`}
                        >
                          <td className="py-3 text-center">
                            <input
                              type="radio"
                              name="score-item-pick"
                              checked={selected}
                              onChange={() =>
                                setScorePickerState(prev => ({
                                  ...prev,
                                  selectedScoreItemId: item.id,
                                }))
                              }
                              className="accent-[#1677ff] cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-600 tabular-nums">
                            {item.id}
                          </td>
                          <td className="py-3 px-3 text-center font-medium text-slate-800">
                            {item.name}
                          </td>
                          <td className="py-3 px-3 text-center text-slate-600">
                            {item.categoryName}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                                item.scoreType === '加分'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {item.scoreType}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-semibold tabular-nums">
                            {item.scoreType === '加分' ? '+' : '-'}
                            {item.scoreValue}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Score Item Picker Modal Pagination Bar */}
            <div className="h-10 mx-5 mb-2 bg-[#efefef] px-3 flex items-center justify-end space-x-2.5 text-xs text-slate-600 flex-shrink-0 rounded-sm">
              <span className="tabular-nums">共 {scorePickerTotalCount} 条</span>

              <select
                value={scorePickerPageSize}
                onChange={e => {
                  setScorePickerPageSize(Number(e.target.value));
                  setScorePickerPage(1);
                  setScorePickerJumpInput('1');
                }}
                className="h-6 px-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] cursor-pointer"
              >
                <option value={5}>5条/页</option>
                <option value={10}>10条/页</option>
                <option value={20}>20条/页</option>
              </select>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  disabled={safeScorePickerPage <= 1}
                  onClick={() => {
                    const next = Math.max(1, safeScorePickerPage - 1);
                    setScorePickerPage(next);
                    setScorePickerJumpInput(String(next));
                  }}
                  className="w-6 h-6 flex items-center justify-center bg-white border border-slate-300 rounded text-slate-500 hover:border-[#1677ff] hover:text-[#1677ff] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft size={13} />
                </button>

                {Array.from({ length: scorePickerTotalPages }, (_, idx) => idx + 1).map(
                  pageNum => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setScorePickerPage(pageNum);
                        setScorePickerJumpInput(String(pageNum));
                      }}
                      className={`min-w-[24px] h-6 px-1.5 flex items-center justify-center rounded text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                        safeScorePickerPage === pageNum
                          ? 'bg-[#1677ff] text-white border border-[#1677ff]'
                          : 'bg-white text-slate-600 border border-slate-300 hover:border-[#1677ff] hover:text-[#1677ff]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}

                <button
                  type="button"
                  disabled={safeScorePickerPage >= scorePickerTotalPages}
                  onClick={() => {
                    const next = Math.min(scorePickerTotalPages, safeScorePickerPage + 1);
                    setScorePickerPage(next);
                    setScorePickerJumpInput(String(next));
                  }}
                  className="w-6 h-6 flex items-center justify-center bg-white border border-slate-300 rounded text-slate-500 hover:border-[#1677ff] hover:text-[#1677ff] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronRight size={13} />
                </button>
              </div>

              <div className="flex items-center space-x-1">
                <span>前往</span>
                <input
                  type="text"
                  value={scorePickerJumpInput}
                  onChange={e => setScorePickerJumpInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const num = parseInt(scorePickerJumpInput, 10);
                      if (!isNaN(num)) {
                        const target = Math.min(Math.max(1, num), scorePickerTotalPages);
                        setScorePickerPage(target);
                        setScorePickerJumpInput(String(target));
                      }
                    }
                  }}
                  className="w-9 h-6 text-center bg-white border border-slate-300 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
                />
                <span>页</span>
              </div>
            </div>

            <div className="h-12 px-5 border-t border-slate-200 bg-[#f9fafc] flex items-center justify-end space-x-2.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setScorePickerState(prev => ({ ...prev, open: false }))}
                className="h-8 px-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 text-xs rounded cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmBindScoreItem}
                className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded cursor-pointer"
              >
                确认绑定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
       * 5. 删除确认弹窗
       * ============================================================================ */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-sm p-5 border border-slate-200">
            <div className="flex items-start space-x-3">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-slate-800">确认删除常规任务</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  确定要删除「<span className="font-medium text-slate-800">{deleteConfirm.title}</span>」吗？删除后将无法恢复。
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2.5 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ open: false, ids: [], title: '' })}
                className="h-8 px-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 text-xs rounded cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="h-8 px-4 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineQualityWorkbench;
