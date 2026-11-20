import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft,
  Search,
  Check,
  Send,
  Link2,
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

export type RoutineTaskStatusType = '已发布' | '停用';
export type RoutineTaskType = '大模型' | '大小模型混用' | '传统';
export type RoutineTaskPriorityType = '高' | '中' | '低';
export type RoutineScoreStrategyType = '加分' | '减分' | '不区分';

export type MatchOperatorType = '=' | '!=' | '包含' | '不包含' | '>' | '<';

export interface MatchConditionRow {
  id: string;
  field: string;
  operator: MatchOperatorType;
  values: string[];
}

export interface MatchOrGroup {
  id: string;
  andConditions: MatchConditionRow[];
}

export interface BoundRoutineRuleItem {
  ruleId: string;
  ruleName: string;
  categoryPath: string;
  ruleMode: string;
  creator: string;
  updatedAt: string;
  scoreItemId?: string;
  scoreItemName?: string;
  scoreItemType?: '加分' | '减分';
  scoreItemValue?: number;
}

export interface RoutineInspectionTask {
  id: string;
  name: string;
  status: RoutineTaskStatusType;
  taskType: RoutineTaskType;
  priority: RoutineTaskPriorityType;
  scoreStrategy: RoutineScoreStrategyType;
  dataType: '语音';
  matchOrGroups: MatchOrGroup[];
  rules: BoundRoutineRuleItem[];
  creator: string;
  createdAt: string;
  updatedAt: string;
}

const MATCH_FIELD_OPTIONS: {
  field: string;
  presetOptions?: string[];
}[] = [
  { field: '呼叫类型', presetOptions: ['呼入', '呼出'] },
  { field: '业务线', presetOptions: ['电销部', '服务部', '信用卡中心', '财富管理部', '个贷中心'] },
  { field: '技能组', presetOptions: ['VIP专席组', '投诉处理组', '账单分期组', '综合客服组'] },
  { field: '客户等级', presetOptions: ['普通客户', '金卡客户', '白金卡客户', '钻石卡客户'] },
  { field: '挂机方', presetOptions: ['坐席挂机', '客户挂机', '系统超时释放'] },
  { field: '坐席工号' },
  { field: '通话时长(秒)' },
];

const INITIAL_ROUTINE_TASKS: RoutineInspectionTask[] = [
  {
    id: 'RT20261118001',
    name: '每日呼出电销与服务合规常规质检',
    status: '已发布',
    taskType: '大小模型混用',
    priority: '高',
    scoreStrategy: '减分',
    dataType: '语音',
    matchOrGroups: [
      {
        id: 'or_init_1',
        andConditions: [
          { id: 'and_init_1', field: '呼叫类型', operator: '=', values: ['呼出'] },
          { id: 'and_init_2', field: '业务线', operator: '=', values: ['电销部'] },
        ],
      },
      {
        id: 'or_init_2',
        andConditions: [
          { id: 'and_init_3', field: '呼叫类型', operator: '=', values: ['呼入'] },
          { id: 'and_init_4', field: '业务线', operator: '=', values: ['服务部'] },
        ],
      },
    ],
    rules: [
      {
        ruleId: '1996062143932358657',
        ruleName: '理财产品收益承诺违禁词检测',
        categoryPath: '财富管理>承诺保本禁语',
        ruleMode: '大小模型混用',
        creator: '陈静6012',
        updatedAt: '2025-12-02 16:28:40',
        scoreItemId: 'SI20261118004',
        scoreItemName: '违规承诺保本保收益',
        scoreItemType: '减分',
        scoreItemValue: 20,
      },
      {
        ruleId: '1996062144018291204',
        ruleName: '非柜面限额解除反诈核实规范',
        categoryPath: '借记卡>非柜面限额解除',
        ruleMode: '大小模型混用',
        creator: '王五6018',
        updatedAt: '2025-12-02 09:15:22',
        scoreItemId: 'SI20261118006',
        scoreItemName: '未按规定核验客户身份信息',
        scoreItemType: '减分',
        scoreItemValue: 15,
      },
    ],
    creator: '张颖',
    createdAt: '2026-11-18 09:10:00',
    updatedAt: '2026-11-18 09:10:00',
  },
  {
    id: 'RT20261118002',
    name: '高情绪投诉大模型情绪安抚专项质检',
    status: '已发布',
    taskType: '大模型',
    priority: '高',
    scoreStrategy: '加分',
    dataType: '语音',
    matchOrGroups: [
      {
        id: 'or_init_3',
        andConditions: [
          { id: 'and_init_5', field: '呼叫类型', operator: '=', values: ['呼入'] },
          { id: 'and_init_6', field: '技能组', operator: '=', values: ['投诉处理组'] },
        ],
      },
    ],
    rules: [
      {
        ruleId: '1996062145102938112',
        ruleName: '大模型服务态度与情绪安抚质检',
        categoryPath: '投诉>升级投诉安抚话术',
        ruleMode: '大模型',
        creator: '陈静6012',
        updatedAt: '2025-12-03 14:20:05',
        scoreItemId: 'SI20261118007',
        scoreItemName: '高情绪客户安抚化解出色',
        scoreItemType: '加分',
        scoreItemValue: 10,
      },
    ],
    creator: '陈明',
    createdAt: '2026-11-17 16:40:18',
    updatedAt: '2026-11-17 16:40:18',
  },
  {
    id: 'RT20261118003',
    name: '第三方快捷支付绑卡传统规则每日巡检',
    status: '停用',
    taskType: '传统',
    priority: '中',
    scoreStrategy: '不区分',
    dataType: '语音',
    matchOrGroups: [
      {
        id: 'or_init_4',
        andConditions: [
          { id: 'and_init_7', field: '呼叫类型', operator: '=', values: ['呼入'] },
        ],
      },
    ],
    rules: [
      {
        ruleId: '1996062144263708673',
        ruleName: '支付宝绑卡/支付',
        categoryPath: '第三方平台>快捷支付解绑',
        ruleMode: '传统模式',
        creator: '赵六6027',
        updatedAt: '2025-12-03 11:41:15',
        scoreItemId: 'SI20261118005',
        scoreItemName: '账单分期费率解答准确',
        scoreItemType: '加分',
        scoreItemValue: 3,
      },
    ],
    creator: '王伟',
    createdAt: '2026-11-16 11:20:45',
    updatedAt: '2026-11-16 15:02:10',
  },
];

function formatCurrentTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function estimateMatchedCount(orGroups: MatchOrGroup[]): number {
  if (!orGroups || orGroups.length === 0) return 0;
  let total = 0;
  orGroups.forEach((group, gIdx) => {
    const validCount = group.andConditions.filter(c => c.values.length > 0).length;
    const base = 1860 - validCount * 340 + gIdx * 215;
    total += Math.max(128, base);
  });
  return total;
}

const QualityRoutineInspectionWorkbench: React.FC = () => {
  // Page view mode: 'list' (常规质检列表页) | 'wizard' (三步创建/查看编辑常规任务页)
  const [viewMode, setViewMode] = useState<'list' | 'wizard'>('list');

  // Tasks List State
  const [tasks, setTasks] = useState<RoutineInspectionTask[]>(INITIAL_ROUTINE_TASKS);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Query Filter State
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [jumpPageInput, setJumpPageInput] = useState<string>('1');

  // Wizard / Task Form State (三步创建/编辑)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formTaskType, setFormTaskType] = useState<RoutineTaskType>('大小模型混用');
  const [formPriority, setFormPriority] = useState<RoutineTaskPriorityType>('高');
  const [formScoreStrategy, setFormScoreStrategy] = useState<RoutineScoreStrategyType>('减分');
  const [formDataType] = useState<'语音'>('语音');
  const [formMatchOrGroups, setFormMatchOrGroups] = useState<MatchOrGroup[]>([]);
  const [formRules, setFormRules] = useState<BoundRoutineRuleItem[]>([]);
  const [formError, setFormError] = useState<string>('');

  // Tag input state per AND condition row (keyed by condition id)
  const [tagDrafts, setTagDrafts] = useState<Record<string, string>>({});

  // Data match count preview state in Step 2
  const [dataQueryResult, setDataQueryResult] = useState<{
    queried: boolean;
    count: number;
    queriedAt: string;
  } | null>(null);

  // Rule Picker Modal State (Step 3 - 添加规则)
  const [rulePickerOpen, setRulePickerOpen] = useState<boolean>(false);
  const [rulePickerNameQuery, setRulePickerNameQuery] = useState<string>('');
  const [rulePickerCatQuery, setRulePickerCatQuery] = useState<string>('');
  const [rulePickerApplied, setRulePickerApplied] = useState({ name: '', cat: '' });
  const [rulePickerCheckedIds, setRulePickerCheckedIds] = useState<string[]>([]);

  // Score Item Picker Modal State (Step 3 - 绑定评分项)
  const [scorePickerModal, setScorePickerModal] = useState<{
    open: boolean;
    targetRuleId: string;
    targetRuleName: string;
    selectedScoreItemId: string;
  }>({
    open: false,
    targetRuleId: '',
    targetRuleName: '',
    selectedScoreItemId: '',
  });
  const [scorePickerNameQuery, setScorePickerNameQuery] = useState<string>('');
  const [scorePickerCatQuery, setScorePickerCatQuery] = useState<string>('');

  // Delete Confirmation Modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string;
    title: string;
  }>({
    open: false,
    id: '',
    title: '',
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // ============================================================================
  // List Filter & Pagination Handlers
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
      if (appliedFilters.strategy && task.scoreStrategy !== appliedFilters.strategy) {
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
        !task.updatedAt.startsWith(appliedFilters.updatedDate) &&
        !task.createdAt.startsWith(appliedFilters.updatedDate)
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
    pagedTasks.length > 0 && pagedTasks.every(t => selectedTaskIds.includes(t.id));

  const handleToggleSelectAll = () => {
    if (allCurrentPageSelected) {
      const pageIds = new Set(pagedTasks.map(t => t.id));
      setSelectedTaskIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const merged = new Set([...selectedTaskIds, ...pagedTasks.map(t => t.id)]);
      setSelectedTaskIds(Array.from(merged));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // ============================================================================
  // Task Status Toggle & Delete
  // ============================================================================
  const handleToggleTaskStatus = (task: RoutineInspectionTask) => {
    const nextStatus: RoutineTaskStatusType =
      task.status === '已发布' ? '停用' : '已发布';
    const nowStr = formatCurrentTimestamp();
    setTasks(prev =>
      prev.map(item =>
        item.id === task.id
          ? { ...item, status: nextStatus, updatedAt: nowStr }
          : item
      )
    );
    showToast(`任务「${task.name}」已${nextStatus === '停用' ? '停用' : '发布启用'}`);
  };

  const handleConfirmDeleteTask = () => {
    setTasks(prev => prev.filter(item => item.id !== deleteConfirm.id));
    setSelectedTaskIds(prev => prev.filter(id => id !== deleteConfirm.id));
    showToast(`已删除常规任务「${deleteConfirm.title}」`);
    setDeleteConfirm({ open: false, id: '', title: '' });
  };

  // ============================================================================
  // Enter 3-Step Wizard (Create / View-Edit)
  // ============================================================================
  const handleOpenCreateWizard = () => {
    setEditingTaskId(null);
    setWizardStep(1);
    setFormName('');
    setFormTaskType('大小模型混用');
    setFormPriority('高');
    setFormScoreStrategy('减分');
    setFormMatchOrGroups([
      {
        id: `or_${Date.now()}_1`,
        andConditions: [
          {
            id: `and_${Date.now()}_1`,
            field: '呼叫类型',
            operator: '=',
            values: ['呼出'],
          },
          {
            id: `and_${Date.now()}_2`,
            field: '业务线',
            operator: '=',
            values: ['电销部'],
          },
        ],
      },
      {
        id: `or_${Date.now()}_2`,
        andConditions: [
          {
            id: `and_${Date.now()}_3`,
            field: '呼叫类型',
            operator: '=',
            values: ['呼入'],
          },
          {
            id: `and_${Date.now()}_4`,
            field: '业务线',
            operator: '=',
            values: ['服务部'],
          },
        ],
      },
    ]);
    setFormRules([]);
    setTagDrafts({});
    setDataQueryResult(null);
    setFormError('');
    setViewMode('wizard');
  };

  const handleOpenViewTaskWizard = (task: RoutineInspectionTask) => {
    setEditingTaskId(task.id);
    setWizardStep(1);
    setFormName(task.name);
    setFormTaskType(task.taskType);
    setFormPriority(task.priority);
    setFormScoreStrategy(task.scoreStrategy);
    setFormMatchOrGroups(
      task.matchOrGroups.map(g => ({
        ...g,
        andConditions: g.andConditions.map(c => ({ ...c, values: [...c.values] })),
      }))
    );
    setFormRules(task.rules.map(r => ({ ...r })));
    setTagDrafts({});
    setDataQueryResult(null);
    setFormError('');
    setViewMode('wizard');
  };

  // ============================================================================
  // Step 2: AND / OR Match Conditions Handlers
  // ============================================================================
  const handleAddOrGroup = () => {
    const newGroup: MatchOrGroup = {
      id: `or_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      andConditions: [
        {
          id: `and_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          field: '呼叫类型',
          operator: '=',
          values: ['呼入'],
        },
      ],
    };
    setFormMatchOrGroups(prev => [...prev, newGroup]);
    setDataQueryResult(null);
  };

  const handleDeleteOrGroup = (groupId: string) => {
    setFormMatchOrGroups(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(g => g.id !== groupId);
    });
    setDataQueryResult(null);
  };

  const handleAddAndCondition = (groupId: string) => {
    setFormMatchOrGroups(prev =>
      prev.map(g =>
        g.id === groupId
          ? {
              ...g,
              andConditions: [
                ...g.andConditions,
                {
                  id: `and_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                  field: '业务线',
                  operator: '=',
                  values: [],
                },
              ],
            }
          : g
      )
    );
    setDataQueryResult(null);
  };

  const handleDeleteAndCondition = (groupId: string, condId: string) => {
    setFormMatchOrGroups(prev =>
      prev.map(g => {
        if (g.id !== groupId) return g;
        if (g.andConditions.length <= 1) return g;
        return {
          ...g,
          andConditions: g.andConditions.filter(c => c.id !== condId),
        };
      })
    );
    setDataQueryResult(null);
  };

  const handleUpdateAndCondition = (
    groupId: string,
    condId: string,
    patch: Partial<MatchConditionRow>
  ) => {
    setFormMatchOrGroups(prev =>
      prev.map(g =>
        g.id === groupId
          ? {
              ...g,
              andConditions: g.andConditions.map(c =>
                c.id === condId ? { ...c, ...patch } : c
              ),
            }
          : g
      )
    );
    setDataQueryResult(null);
  };

  const handleAddTagToCondition = (groupId: string, condId: string, rawVal: string) => {
    const trimmed = rawVal.trim();
    if (!trimmed) return;
    setFormMatchOrGroups(prev =>
      prev.map(g =>
        g.id === groupId
          ? {
              ...g,
              andConditions: g.andConditions.map(c => {
                if (c.id !== condId) return c;
                if (c.values.includes(trimmed)) return c;
                return { ...c, values: [...c.values, trimmed] };
              }),
            }
          : g
      )
    );
    setTagDrafts(prev => ({ ...prev, [condId]: '' }));
    setDataQueryResult(null);
  };

  const handleRemoveTagFromCondition = (
    groupId: string,
    condId: string,
    tagValue: string
  ) => {
    setFormMatchOrGroups(prev =>
      prev.map(g =>
        g.id === groupId
          ? {
              ...g,
              andConditions: g.andConditions.map(c =>
                c.id === condId
                  ? { ...c, values: c.values.filter(v => v !== tagValue) }
                  : c
              ),
            }
          : g
      )
    );
    setDataQueryResult(null);
  };

  const handleQueryTodayMatchedCount = () => {
    const count = estimateMatchedCount(formMatchOrGroups);
    setDataQueryResult({
      queried: true,
      count,
      queriedAt: formatCurrentTimestamp(),
    });
  };

  // ============================================================================
  // Step 3: Rule Picker & Score Item Binding Handlers
  // ============================================================================
  // Filter eligible rules from INITIAL_RULES based on formTaskType
  // - 大模型: 只能选择大模型相关的规则 (ruleMode === '大模型')
  // - 大小模型混用: 能选择全部规则
  // - 传统: 不能选择大模型相关的规则 (ruleMode === '传统模式')
  const eligibleRulesForTaskType = useMemo(() => {
    return INITIAL_RULES.filter(rule => {
      if (formTaskType === '大模型') {
        return rule.ruleMode === '大模型';
      }
      if (formTaskType === '传统') {
        return rule.ruleMode === '传统模式';
      }
      return true; // 大小模型混用
    });
  }, [formTaskType]);

  const filteredPickerRules = useMemo(() => {
    return eligibleRulesForTaskType.filter(rule => {
      if (
        rulePickerApplied.name &&
        !rule.name.toLowerCase().includes(rulePickerApplied.name.toLowerCase())
      ) {
        return false;
      }
      if (rulePickerApplied.cat) {
        if (rulePickerApplied.cat.includes(':')) {
          const [catId, subId] = rulePickerApplied.cat.split(':');
          if (rule.categoryId !== catId || rule.subCategoryId !== subId) return false;
        } else if (rule.categoryId !== rulePickerApplied.cat) {
          return false;
        }
      }
      return true;
    });
  }, [eligibleRulesForTaskType, rulePickerApplied]);

  const handleOpenRulePicker = () => {
    setRulePickerNameQuery('');
    setRulePickerCatQuery('');
    setRulePickerApplied({ name: '', cat: '' });
    setRulePickerCheckedIds(formRules.map(r => r.ruleId));
    setRulePickerOpen(true);
  };

  const handleConfirmRulePicker = () => {
    const existingMap = new Map<string, BoundRoutineRuleItem>();
    formRules.forEach(r => existingMap.set(r.ruleId, r));

    const nextRules: BoundRoutineRuleItem[] = [];
    rulePickerCheckedIds.forEach(rId => {
      const existing = existingMap.get(rId);
      if (existing) {
        nextRules.push(existing);
      } else {
        const source = INITIAL_RULES.find(r => r.id === rId);
        if (source) {
          nextRules.push({
            ruleId: source.id,
            ruleName: source.name,
            categoryPath: source.categoryPath,
            ruleMode: source.ruleMode,
            creator: source.creator,
            updatedAt: source.updatedAt,
          });
        }
      }
    });

    setFormRules(nextRules);
    setRulePickerOpen(false);
    setFormError('');
  };

  // Eligible score items filtered by formScoreStrategy:
  // - 加分 -> 只能选择加分的评分项
  // - 减分 -> 只能选择减分的评分项
  // - 不区分 -> 可选择全部评分项
  const eligibleScoreItemsForStrategy = useMemo(() => {
    return INITIAL_SCORE_ITEMS.filter(item => {
      if (formScoreStrategy === '加分') return item.scoreType === '加分';
      if (formScoreStrategy === '减分') return item.scoreType === '减分';
      return true;
    });
  }, [formScoreStrategy]);

  const filteredPickerScoreItems = useMemo(() => {
    return eligibleScoreItemsForStrategy.filter(item => {
      if (
        scorePickerNameQuery.trim() &&
        !item.name.toLowerCase().includes(scorePickerNameQuery.trim().toLowerCase())
      ) {
        return false;
      }
      if (scorePickerCatQuery && item.categoryId !== scorePickerCatQuery) {
        return false;
      }
      return true;
    });
  }, [eligibleScoreItemsForStrategy, scorePickerNameQuery, scorePickerCatQuery]);

  const handleOpenScorePicker = (rule: BoundRoutineRuleItem) => {
    setScorePickerNameQuery('');
    setScorePickerCatQuery('');
    setScorePickerModal({
      open: true,
      targetRuleId: rule.ruleId,
      targetRuleName: rule.ruleName,
      selectedScoreItemId: rule.scoreItemId || '',
    });
  };

  const handleConfirmBindScoreItem = () => {
    if (!scorePickerModal.selectedScoreItemId) return;
    const picked: QualityScoreItem | undefined = INITIAL_SCORE_ITEMS.find(
      s => s.id === scorePickerModal.selectedScoreItemId
    );
    if (!picked) return;

    setFormRules(prev =>
      prev.map(r =>
        r.ruleId === scorePickerModal.targetRuleId
          ? {
              ...r,
              scoreItemId: picked.id,
              scoreItemName: picked.name,
              scoreItemType: picked.scoreType,
              scoreItemValue: picked.scoreValue,
            }
          : r
      )
    );
    setScorePickerModal(prev => ({ ...prev, open: false }));
    showToast(`已为规则「${scorePickerModal.targetRuleName}」绑定评分项「${picked.name}」`);
  };

  // ============================================================================
  // Step Navigation & Publish Task
  // ============================================================================
  const handleNextStep = () => {
    if (wizardStep === 1) {
      if (!formName.trim()) {
        setFormError('请输入任务名称');
        return;
      }
      setFormError('');
      setWizardStep(2);
    } else if (wizardStep === 2) {
      const hasAnyCondition = formMatchOrGroups.some(g =>
        g.andConditions.some(c => c.values.length > 0)
      );
      if (!hasAnyCondition) {
        setFormError('请至少配置一条有效的数据匹配条件');
        return;
      }
      setFormError('');
      setWizardStep(3);
    }
  };

  const handleChangeTaskType = (nextType: RoutineTaskType) => {
    setFormTaskType(nextType);
    // Filter out incompatible rules if switching to 大模型 or 传统
    setFormRules(prev =>
      prev.filter(r => {
        if (nextType === '大模型') return r.ruleMode === '大模型';
        if (nextType === '传统') return r.ruleMode === '传统模式';
        return true;
      })
    );
  };

  const handleChangeScoreStrategy = (nextStrategy: RoutineScoreStrategyType) => {
    setFormScoreStrategy(nextStrategy);
    // Clear incompatible bound score items when switching strategy
    setFormRules(prev =>
      prev.map(r => {
        if (!r.scoreItemType) return r;
        if (nextStrategy === '加分' && r.scoreItemType !== '加分') {
          return {
            ...r,
            scoreItemId: undefined,
            scoreItemName: undefined,
            scoreItemType: undefined,
            scoreItemValue: undefined,
          };
        }
        if (nextStrategy === '减分' && r.scoreItemType !== '减分') {
          return {
            ...r,
            scoreItemId: undefined,
            scoreItemName: undefined,
            scoreItemType: undefined,
            scoreItemValue: undefined,
          };
        }
        return r;
      })
    );
  };

  const handlePublishTask = () => {
    if (!formName.trim()) {
      setFormError('请先在第一步填写任务名称');
      setWizardStep(1);
      return;
    }
    if (formRules.length === 0) {
      setFormError('请至少添加一条质检规则后再发布任务');
      return;
    }

    const nowStr = formatCurrentTimestamp();
    if (editingTaskId) {
      setTasks(prev =>
        prev.map(t =>
          t.id === editingTaskId
            ? {
                ...t,
                name: formName.trim(),
                status: '已发布',
                taskType: formTaskType,
                priority: formPriority,
                scoreStrategy: formScoreStrategy,
                dataType: formDataType,
                matchOrGroups: formMatchOrGroups,
                rules: formRules,
                updatedAt: nowStr,
              }
            : t
        )
      );
      showToast(`常规质检任务「${formName.trim()}」已发布启用`);
    } else {
      const nextNum = String(tasks.length + 1).padStart(3, '0');
      const newTask: RoutineInspectionTask = {
        id: `RT20261119${nextNum}`,
        name: formName.trim(),
        status: '已发布',
        taskType: formTaskType,
        priority: formPriority,
        scoreStrategy: formScoreStrategy,
        dataType: formDataType,
        matchOrGroups: formMatchOrGroups,
        rules: formRules,
        creator: '当前管理员',
        createdAt: nowStr,
        updatedAt: nowStr,
      };
      setTasks(prev => [newTask, ...prev]);
      showToast(`常规质检任务「${formName.trim()}」已发布启用`);
    }

    setViewMode('list');
  };

  // ============================================================================
  // RENDER: List View vs 3-Step Creation/View Wizard
  // ============================================================================
  return (
    <div className="h-full w-full flex bg-[#f2f4f8] overflow-hidden select-none relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg text-xs flex items-center space-x-2 border border-slate-700">
          <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {viewMode === 'list' ? (
        /* ============================================================================
         * 1. 常规质检列表页
         * ============================================================================ */
        <div className="flex-1 flex flex-col bg-white m-2.5 rounded-sm shadow-xs border border-slate-200/80 overflow-hidden min-w-0">
          {/* Top Title Header */}
          <div className="h-12 px-5 flex items-center justify-between border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <h1 className="text-[15px] font-bold text-slate-800">常规质检</h1>
              <span className="text-xs text-slate-400">
                定时质检任务：每天按照配置的质检规则对筛选条件命中的新增数据进行自动质检
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            {/* Query Filter Area: 任务名称、任务状态（已发布、停用）、评分策略（加分、减分、不区分）、创建人、更新时间 */}
            <div className="bg-[#f9fafc] border border-slate-100 rounded-md px-5 py-4 mb-4 flex-shrink-0">
              {isSearchExpanded ? (
                <div className="flex flex-wrap items-center gap-y-3 gap-x-5">
                  {/* 任务名称 */}
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      任务名称
                    </label>
                    <input
                      type="text"
                      value={queryName}
                      onChange={e => setQueryName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      placeholder="任务名称"
                      className="w-44 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#1677ff] transition-colors"
                    />
                  </div>

                  {/* 任务状态：已发布、停用 */}
                  <div className="flex items-center space-x-2">
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

                  {/* 评分策略：加分、减分、不区分 */}
                  <div className="flex items-center space-x-2">
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
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      创建人
                    </label>
                    <input
                      type="text"
                      value={queryCreator}
                      onChange={e => setQueryCreator(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      placeholder="创建人"
                      className="w-32 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#1677ff] transition-colors"
                    />
                  </div>

                  {/* 更新时间 */}
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      更新时间
                    </label>
                    <input
                      type="date"
                      value={queryUpdatedDate}
                      onChange={e => setQueryUpdatedDate(e.target.value)}
                      className="w-38 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors"
                    />
                  </div>

                  {/* 查询 / 重置 / 隐藏 */}
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

            {/* Action Toolbar Row: 新建常规任务 button */}
            <div className="flex items-center space-x-2.5 mb-3.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleOpenCreateWizard}
                className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors cursor-pointer shadow-2xs"
              >
                新建常规任务
              </button>
              {selectedTaskIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setTasks(prev => prev.filter(t => !selectedTaskIds.includes(t.id)));
                    showToast(`已批量删除 ${selectedTaskIds.length} 条常规任务`);
                    setSelectedTaskIds([]);
                  }}
                  className="h-8 px-3.5 bg-[#fff1f0] hover:bg-red-100 text-red-500 border border-[#ffccc7] text-xs font-medium rounded transition-colors cursor-pointer"
                >
                  批量删除 ({selectedTaskIds.length})
                </button>
              )}
            </div>

            {/* Table Container: 任务ID、任务名称、任务状态、评分策略、质检规则、创建人、创建时间、操作（停用、查看、删除） */}
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
                    <th className="py-2.5 px-3 text-center border-r border-white w-[150px]">
                      任务ID
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white min-w-[200px]">
                      任务名称
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[100px]">
                      任务状态
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[100px]">
                      评分策略
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white min-w-[200px]">
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
                      const isChecked = selectedTaskIds.includes(task.id);
                      const isPublished = task.status === '已发布';
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
                          <td className="py-3.5 px-3 text-center text-slate-800 font-normal leading-snug">
                            <div className="flex items-center justify-center space-x-1.5">
                              <span>{task.name}</span>
                              <span className="text-[10.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                                {task.taskType}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                isPublished
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}
                            >
                              {task.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                task.scoreStrategy === '加分'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                  : task.scoreStrategy === '减分'
                                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                    : 'bg-blue-50 text-[#1677ff] border border-blue-200'
                              }`}
                            >
                              {task.scoreStrategy}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            {task.rules.length === 0 ? (
                              <span className="text-slate-400 text-xs">未配置规则</span>
                            ) : (
                              <div className="flex items-center justify-center space-x-1.5">
                                <span className="px-1.5 py-0.5 bg-blue-50 text-[#1677ff] rounded text-[11px] font-medium tabular-nums shrink-0">
                                  {task.rules.length} 条
                                </span>
                                <span
                                  title={task.rules.map(r => r.ruleName).join('、')}
                                  className="text-xs text-slate-600 truncate max-w-[180px]"
                                >
                                  {task.rules.map(r => r.ruleName).join('、')}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-700">
                            {task.creator}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-700 tabular-nums leading-snug">
                            {task.createdAt}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <div className="inline-flex items-center justify-center space-x-3 text-xs">
                              <button
                                type="button"
                                onClick={() => handleToggleTaskStatus(task)}
                                className={`hover:underline cursor-pointer ${
                                  isPublished
                                    ? 'text-amber-600 hover:text-amber-700'
                                    : 'text-emerald-600 hover:text-emerald-700'
                                }`}
                              >
                                {isPublished ? '停用' : '启用'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenViewTaskWizard(task)}
                                className="text-[#1677ff] hover:text-blue-700 hover:underline cursor-pointer"
                              >
                                查看
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirm({
                                    open: true,
                                    id: task.id,
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
         * 2. 新建/查看常规任务页面（全屏三步创建）
         * ============================================================================ */
        <div className="flex-1 flex flex-col bg-white m-2.5 rounded-sm shadow-xs border border-slate-200/80 overflow-hidden min-w-0">
          {/* Top Header Bar */}
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
                {editingTaskId ? '常规任务配置' : '新建常规任务'}
              </h1>
              {formName && (
                <span className="text-xs text-slate-500 truncate max-w-[260px]">
                  {formName}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span>执行频率：每天定时扫描新增数据</span>
            </div>
          </div>

          {/* 3-Step Indicator Bar */}
          <div className="px-6 py-4 bg-[#f9fafc] border-b border-slate-200/80 flex items-center justify-center flex-shrink-0">
            <div className="flex items-center w-full max-w-3xl">
              {[
                { step: 1 as const, label: '设置任务信息' },
                { step: 2 as const, label: '数据选择' },
                { step: 3 as const, label: '选择质检规则' },
              ].map((s, idx) => {
                const isCurrent = wizardStep === s.step;
                const isDone = wizardStep > s.step;
                return (
                  <React.Fragment key={s.step}>
                    <button
                      type="button"
                      onClick={() => {
                        if (s.step <= wizardStep || formName.trim()) {
                          setFormError('');
                          setWizardStep(s.step);
                        }
                      }}
                      className="flex items-center space-x-2.5 cursor-pointer group"
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                          isCurrent
                            ? 'bg-[#1677ff] text-white shadow-xs'
                            : isDone
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white border border-slate-300 text-slate-500 group-hover:border-[#1677ff]'
                        }`}
                      >
                        {isDone ? <Check size={14} /> : s.step}
                      </span>
                      <span
                        className={`text-[13px] font-medium whitespace-nowrap ${
                          isCurrent
                            ? 'text-[#1677ff] font-semibold'
                            : isDone
                              ? 'text-slate-700'
                              : 'text-slate-500'
                        }`}
                      >
                        {s.label}
                      </span>
                    </button>
                    {idx < 2 && (
                      <div
                        className={`flex-1 h-[1.5px] mx-4 ${
                          wizardStep > s.step ? 'bg-emerald-400' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Step Content Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#f7f9fc] custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-5">
              {formError && (
                <div className="bg-[#fff2f0] border border-[#ffccc7] text-red-600 px-4 py-2.5 rounded text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={14} />
                    <span>{formError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormError('')}
                    className="text-red-400 hover:text-red-600 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* =================================================================
               * 第一步：设置任务信息
               * ================================================================= */}
              {wizardStep === 1 && (
                <div className="bg-white border border-slate-200/90 rounded-sm shadow-2xs p-6 space-y-6">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <span className="w-1 h-3.5 bg-[#1677ff] rounded-full"></span>
                    <h2 className="text-[14px] font-bold text-slate-800">
                      第一步：设置任务信息
                    </h2>
                  </div>

                  <div className="space-y-5 max-w-2xl text-xs">
                    {/* 任务名称 */}
                    <div className="flex items-center">
                      <label className="w-28 text-slate-700 font-medium flex-shrink-0">
                        <span className="text-red-500 mr-0.5">*</span>任务名称:
                      </label>
                      <input
                        type="text"
                        maxLength={60}
                        placeholder="请输入常规质检任务名称，如：每日信用卡电销合规质检"
                        value={formName}
                        onChange={e => {
                          setFormName(e.target.value);
                          setFormError('');
                        }}
                        className="flex-1 h-8 px-3 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                      />
                    </div>

                    {/* 任务类型：大模型、大小模型混用、传统 */}
                    <div className="flex items-start">
                      <label className="w-28 text-slate-700 font-medium pt-1.5 flex-shrink-0">
                        <span className="text-red-500 mr-0.5">*</span>任务类型:
                      </label>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-4 pt-1">
                          {(
                            [
                              { value: '大模型', desc: '仅可选大模型质检规则' },
                              { value: '大小模型混用', desc: '可选择全部质检规则' },
                              { value: '传统', desc: '仅可选非大模型传统规则' },
                            ] as { value: RoutineTaskType; desc: string }[]
                          ).map(opt => {
                            const selected = formTaskType === opt.value;
                            return (
                              <label
                                key={opt.value}
                                className={`flex items-center space-x-2 px-3.5 py-2 rounded border cursor-pointer transition-colors select-none ${
                                  selected
                                    ? 'bg-[#e8f2ff] border-[#1677ff] text-[#1677ff] font-medium'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="routine_task_type"
                                  checked={selected}
                                  onChange={() => handleChangeTaskType(opt.value)}
                                  className="w-3.5 h-3.5 text-[#1677ff] border-slate-300 focus:ring-[#1677ff]"
                                />
                                <span>{opt.value}</span>
                                <span
                                  className={`text-[11px] ${
                                    selected ? 'text-blue-500' : 'text-slate-400'
                                  }`}
                                >
                                  ({opt.desc})
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 优先级：高、中、低 */}
                    <div className="flex items-center">
                      <label className="w-28 text-slate-700 font-medium flex-shrink-0">
                        <span className="text-red-500 mr-0.5">*</span>优先级:
                      </label>
                      <div className="flex items-center space-x-6">
                        {(['高', '中', '低'] as RoutineTaskPriorityType[]).map(level => (
                          <label
                            key={level}
                            className="inline-flex items-center space-x-2 text-slate-700 cursor-pointer select-none"
                          >
                            <input
                              type="radio"
                              name="routine_priority"
                              checked={formPriority === level}
                              onChange={() => setFormPriority(level)}
                              className="w-3.5 h-3.5 text-[#1677ff] border-slate-300 focus:ring-[#1677ff]"
                            />
                            <span>{level}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 评分策略：加分、减分、不区分 */}
                    <div className="flex items-start">
                      <label className="w-28 text-slate-700 font-medium pt-1 flex-shrink-0">
                        <span className="text-red-500 mr-0.5">*</span>评分策略:
                      </label>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center space-x-6 pt-0.5">
                          {(['加分', '减分', '不区分'] as RoutineScoreStrategyType[]).map(
                            strategy => (
                              <label
                                key={strategy}
                                className="inline-flex items-center space-x-2 text-slate-700 cursor-pointer select-none"
                              >
                                <input
                                  type="radio"
                                  name="routine_score_strategy"
                                  checked={formScoreStrategy === strategy}
                                  onChange={() => handleChangeScoreStrategy(strategy)}
                                  className="w-3.5 h-3.5 text-[#1677ff] border-slate-300 focus:ring-[#1677ff]"
                                />
                                <span>{strategy}</span>
                              </label>
                            )
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {formScoreStrategy === '加分'
                            ? '当前策略为“加分”：第三步绑定评分项时仅可选择加分类型的评分项。'
                            : formScoreStrategy === '减分'
                              ? '当前策略为“减分”：第三步绑定评分项时仅可选择减分类型的评分项。'
                              : '当前策略为“不区分”：第三步绑定评分项时可选择全部加分与减分评分项。'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================================
               * 第二步：数据选择（数据类型：语音；数据匹配条件：AND/OR逻辑参考图片；先查询当天数据量）
               * ================================================================= */}
              {wizardStep === 2 && (
                <div className="bg-white border border-slate-200/90 rounded-sm shadow-2xs p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-1 h-3.5 bg-[#1677ff] rounded-full"></span>
                      <h2 className="text-[14px] font-bold text-slate-800">
                        第二步：数据选择
                      </h2>
                    </div>
                  </div>

                  {/* 数据类型：目前只有一个单选项为 语音 */}
                  <div className="flex items-center text-xs">
                    <label className="w-24 text-slate-700 font-medium flex-shrink-0">
                      <span className="text-red-500 mr-0.5">*</span>数据类型:
                    </label>
                    <label className="inline-flex items-center space-x-2 px-3 py-1.5 rounded border border-[#1677ff] bg-[#e8f2ff] text-[#1677ff] font-medium cursor-pointer">
                      <input
                        type="radio"
                        checked={formDataType === '语音'}
                        readOnly
                        className="w-3.5 h-3.5 text-[#1677ff]"
                      />
                      <span>语音</span>
                    </label>
                  </div>

                  {/* 质检匹配条件（参考图片样式：多组 OR 容器 + 容器内 AND 行 + tag 输入框） */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700">
                        质检匹配条件
                      </span>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={handleQueryTodayMatchedCount}
                          className="h-7 px-3 bg-white hover:bg-blue-50 text-[#1677ff] border border-[#1677ff] rounded text-xs font-medium inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <Search size={12} />
                          <span>查询当天匹配数据量</span>
                        </button>
                      </div>
                    </div>

                    {/* 当天匹配数据量查询结果提示 */}
                    {dataQueryResult && dataQueryResult.queried && (
                      <div className="bg-[#f0f7ff] border border-[#bae0ff] rounded px-4 py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 text-slate-700">
                          <CheckCircle2 size={14} className="text-[#1677ff] flex-shrink-0" />
                          <span>
                            按当前筛选条件查询结果：当天满足条件的语音数据量为
                            <strong className="text-[#1677ff] font-bold text-sm mx-1.5 tabular-nums">
                              {dataQueryResult.count.toLocaleString()}
                            </strong>
                            条
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          查询时间：{dataQueryResult.queriedAt}
                        </span>
                      </div>
                    )}

                    {/* OR Groups List */}
                    <div className="space-y-3">
                      {formMatchOrGroups.map((group, gIdx) => (
                        <React.Fragment key={group.id}>
                          <div className="bg-[#f7f8fa] border border-slate-200/80 rounded p-4 space-y-3 relative">
                            {formMatchOrGroups.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteOrGroup(group.id)}
                                title="删除该组(OR)条件"
                                className="absolute right-3 top-3 text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}

                            {/* AND Rows inside OR Group */}
                            <div className="space-y-2.5 pr-6">
                              {group.andConditions.map(cond => {
                                const fieldDef = MATCH_FIELD_OPTIONS.find(
                                  f => f.field === cond.field
                                );
                                const draftValue = tagDrafts[cond.id] || '';
                                return (
                                  <div
                                    key={cond.id}
                                    className="flex items-start gap-2.5 text-xs"
                                  >
                                    {/* Field Select */}
                                    <select
                                      value={cond.field}
                                      onChange={e => {
                                        const nextField = e.target.value;
                                        const nextDef = MATCH_FIELD_OPTIONS.find(
                                          f => f.field === nextField
                                        );
                                        handleUpdateAndCondition(group.id, cond.id, {
                                          field: nextField,
                                          values: nextDef?.presetOptions
                                            ? [nextDef.presetOptions[0]]
                                            : [],
                                        });
                                      }}
                                      className="w-36 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] cursor-pointer flex-shrink-0"
                                    >
                                      {MATCH_FIELD_OPTIONS.map(opt => (
                                        <option key={opt.field} value={opt.field}>
                                          {opt.field}
                                        </option>
                                      ))}
                                    </select>

                                    {/* Operator Select */}
                                    <select
                                      value={cond.operator}
                                      onChange={e =>
                                        handleUpdateAndCondition(group.id, cond.id, {
                                          operator: e.target.value as MatchOperatorType,
                                        })
                                      }
                                      className="w-24 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] cursor-pointer flex-shrink-0"
                                    >
                                      <option value="=">=</option>
                                      <option value="!=">!=</option>
                                      <option value="包含">包含</option>
                                      <option value="不包含">不包含</option>
                                      <option value=">">&gt;</option>
                                      <option value="<">&lt;</option>
                                    </select>

                                    {/* Value Tag Box (matches screenshot: tag chips + Enter input / preset options) */}
                                    <div className="flex-1 max-w-md bg-white border border-slate-200 rounded px-2.5 py-1.5 min-h-[34px] focus-within:border-[#1677ff] transition-colors">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        {cond.values.map(val => (
                                          <span
                                            key={val}
                                            className="inline-flex items-center space-x-1 px-2 py-0.5 bg-[#f1f3f5] border border-slate-200/80 rounded text-xs text-slate-700"
                                          >
                                            <span>{val}</span>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleRemoveTagFromCondition(
                                                  group.id,
                                                  cond.id,
                                                  val
                                                )
                                              }
                                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                            >
                                              <X size={11} />
                                            </button>
                                          </span>
                                        ))}

                                        {fieldDef?.presetOptions && (
                                          <select
                                            value=""
                                            onChange={e => {
                                              if (e.target.value) {
                                                handleAddTagToCondition(
                                                  group.id,
                                                  cond.id,
                                                  e.target.value
                                                );
                                              }
                                            }}
                                            className="h-6 text-[11px] text-slate-500 bg-transparent focus:outline-none cursor-pointer"
                                          >
                                            <option value="">+ 选择枚举值</option>
                                            {fieldDef.presetOptions
                                              .filter(opt => !cond.values.includes(opt))
                                              .map(opt => (
                                                <option key={opt} value={opt}>
                                                  {opt}
                                                </option>
                                              ))}
                                          </select>
                                        )}
                                      </div>

                                      <input
                                        type="text"
                                        placeholder="输入完成后请按回车"
                                        value={draftValue}
                                        onChange={e =>
                                          setTagDrafts(prev => ({
                                            ...prev,
                                            [cond.id]: e.target.value,
                                          }))
                                        }
                                        onKeyDown={e => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTagToCondition(
                                              group.id,
                                              cond.id,
                                              draftValue
                                            );
                                          }
                                        }}
                                        className="w-full mt-1 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none bg-transparent"
                                      />
                                    </div>

                                    {group.andConditions.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteAndCondition(group.id, cond.id)
                                        }
                                        title="删除该条(AND)条件"
                                        className="mt-1.5 text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* 新增(AND)条件 link button */}
                            <div>
                              <button
                                type="button"
                                onClick={() => handleAddAndCondition(group.id)}
                                className="text-xs text-[#1677ff] hover:text-blue-700 font-medium cursor-pointer"
                              >
                                新增(AND)条件
                              </button>
                            </div>
                          </div>

                          {/* OR Divider */}
                          {gIdx < formMatchOrGroups.length - 1 && (
                            <div className="relative flex items-center py-1">
                              <div className="w-full border-t border-dashed border-slate-300"></div>
                              <span className="absolute left-6 px-2.5 py-0.5 bg-slate-200 text-slate-600 rounded-full text-[11px] font-medium leading-none">
                                or
                              </span>
                            </div>
                          )}
                        </React.Fragment>
                      ))}

                      {/* Bottom OR Divider + 新增(OR)条件 button */}
                      <div className="relative flex items-center py-1">
                        <div className="w-full border-t border-dashed border-slate-300"></div>
                        <span className="absolute left-6 px-2.5 py-0.5 bg-slate-200 text-slate-600 rounded-full text-[11px] font-medium leading-none">
                          or
                        </span>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={handleAddOrGroup}
                          className="text-xs text-[#1677ff] hover:text-blue-700 font-medium cursor-pointer"
                        >
                          新增(OR)条件
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================================
               * 第三步：选择质检规则 & 绑定评分项
               * ================================================================= */}
              {wizardStep === 3 && (
                <div className="bg-white border border-slate-200/90 rounded-sm shadow-2xs p-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-1 h-3.5 bg-[#1677ff] rounded-full"></span>
                      <h2 className="text-[14px] font-bold text-slate-800">
                        第三步：选择质检规则
                      </h2>
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded">
                        任务类型：
                        <strong className="text-slate-800 ml-0.5">{formTaskType}</strong>
                      </span>
                      <span className="px-2.5 py-1 bg-blue-50 text-[#1677ff] rounded">
                        评分策略：
                        <strong className="ml-0.5">{formScoreStrategy}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Toolbar: 添加规则 */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleOpenRulePicker}
                      className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded inline-flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Plus size={14} />
                      <span>添加规则</span>
                    </button>
                    <span className="text-xs text-slate-400">
                      已添加 {formRules.length} 条质检规则
                    </span>
                  </div>

                  {/* Added Quality Rules Table: 规则ID、规则名称、规则分类、创建人、更新时间、已绑定评分项、操作（绑定评分项） */}
                  <div className="border border-slate-200/80 rounded-sm overflow-hidden">
                    <table className="w-full border-collapse text-left">
                      <thead className="bg-[#dbe7fb] text-slate-700 text-xs font-semibold">
                        <tr>
                          <th className="py-2.5 px-3 text-center border-r border-white w-[160px]">
                            规则ID
                          </th>
                          <th className="py-2.5 px-3 text-center border-r border-white min-w-[180px]">
                            规则名称
                          </th>
                          <th className="py-2.5 px-3 text-center border-r border-white w-[160px]">
                            规则分类
                          </th>
                          <th className="py-2.5 px-3 text-center border-r border-white w-[100px]">
                            创建人
                          </th>
                          <th className="py-2.5 px-3 text-center border-r border-white w-[150px]">
                            更新时间
                          </th>
                          <th className="py-2.5 px-3 text-center border-r border-white min-w-[180px]">
                            已绑定评分项
                          </th>
                          <th className="py-2.5 px-3 text-center w-[150px]">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[12.5px] text-slate-700 bg-white">
                        {formRules.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                              暂未添加质检规则，请点击上方「添加规则」按钮选择适用于「{formTaskType}」的质检规则
                            </td>
                          </tr>
                        ) : (
                          formRules.map(rule => (
                            <tr key={rule.ruleId} className="hover:bg-[#f5f8ff] transition-colors">
                              <td className="py-3 px-3 text-center font-mono text-xs text-slate-600 tabular-nums">
                                {rule.ruleId}
                              </td>
                              <td className="py-3 px-3 text-center text-slate-800">
                                <div className="flex items-center justify-center space-x-1.5">
                                  <span>{rule.ruleName}</span>
                                  <span className="text-[10.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                                    {rule.ruleMode}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center text-slate-600">
                                {rule.categoryPath}
                              </td>
                              <td className="py-3 px-3 text-center text-slate-600">
                                {rule.creator}
                              </td>
                              <td className="py-3 px-3 text-center font-mono text-xs text-slate-600 tabular-nums">
                                {rule.updatedAt}
                              </td>
                              <td className="py-3 px-3 text-center">
                                {rule.scoreItemName ? (
                                  <span
                                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium ${
                                      rule.scoreItemType === '加分'
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                                    }`}
                                  >
                                    <span>{rule.scoreItemName}</span>
                                    <span className="font-mono tabular-nums">
                                      ({rule.scoreItemType === '加分' ? '+' : '-'}
                                      {rule.scoreItemValue}分)
                                    </span>
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400">未绑定评分项</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <div className="inline-flex items-center space-x-3 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenScorePicker(rule)}
                                    className="text-[#1677ff] hover:text-blue-700 hover:underline inline-flex items-center space-x-1 cursor-pointer"
                                  >
                                    <Link2 size={12} />
                                    <span>绑定评分项</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormRules(prev =>
                                        prev.filter(r => r.ruleId !== rule.ruleId)
                                      )
                                    }
                                    className="text-slate-400 hover:text-red-600 hover:underline cursor-pointer"
                                  >
                                    移除
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Wizard Action Footer */}
          <div className="h-14 px-6 bg-white border-t border-slate-200 flex items-center justify-between flex-shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="h-8 px-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs font-medium cursor-pointer"
            >
              取消
            </button>

            <div className="flex items-center space-x-3">
              {wizardStep > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setFormError('');
                    setWizardStep(s => (s === 3 ? 2 : 1));
                  }}
                  className="h-8 px-4 bg-white hover:bg-blue-50 text-[#1677ff] border border-[#1677ff] rounded text-xs font-medium cursor-pointer"
                >
                  上一步
                </button>
              )}

              {wizardStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="h-8 px-5 bg-[#1677ff] hover:bg-blue-600 text-white rounded text-xs font-medium cursor-pointer shadow-2xs"
                >
                  下一步
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublishTask}
                  className="h-8 px-5 bg-[#1677ff] hover:bg-blue-600 text-white rounded text-xs font-medium inline-flex items-center space-x-1.5 cursor-pointer shadow-2xs"
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
       * 弹窗 1：选择质检规则窗口（Step 3 点击【添加规则】打开）
       * 按规则名称、规则分类查询；按任务类型过滤规则
       * ============================================================================ */}
      {rulePickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="h-11 px-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                <h3 className="text-sm font-bold text-slate-800">选择质检规则</h3>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-[#1677ff]">
                  任务类型：{formTaskType}（
                  {formTaskType === '大模型'
                    ? '仅显示大模型规则'
                    : formTaskType === '传统'
                      ? '仅显示传统规则，不含大模型规则'
                      : '显示全部规则'}
                  ）
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

            <div className="p-4 space-y-3 flex-1 overflow-hidden flex flex-col">
              {/* Filter Bar: 规则名称 + 规则分类 */}
              <div className="bg-[#f9fafc] border border-slate-100 rounded px-4 py-3 flex flex-wrap items-center gap-4 text-xs flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <label className="text-slate-700 font-medium whitespace-nowrap">
                    质检名称
                  </label>
                  <input
                    type="text"
                    placeholder="请输入规则名称"
                    value={rulePickerNameQuery}
                    onChange={e => setRulePickerNameQuery(e.target.value)}
                    onKeyDown={e =>
                      e.key === 'Enter' &&
                      setRulePickerApplied({
                        name: rulePickerNameQuery.trim(),
                        cat: rulePickerCatQuery,
                      })
                    }
                    className="w-44 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-slate-700 font-medium whitespace-nowrap">
                    规则分类
                  </label>
                  <select
                    value={rulePickerCatQuery}
                    onChange={e => setRulePickerCatQuery(e.target.value)}
                    className="w-48 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                  >
                    <option value="">全部</option>
                    {INITIAL_CATEGORIES.map(cat => (
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

                <div className="flex items-center space-x-2 ml-auto">
                  <button
                    type="button"
                    onClick={() =>
                      setRulePickerApplied({
                        name: rulePickerNameQuery.trim(),
                        cat: rulePickerCatQuery,
                      })
                    }
                    className="h-8 px-3.5 bg-[#1677ff] hover:bg-blue-600 text-white rounded text-xs font-medium cursor-pointer"
                  >
                    查询
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRulePickerNameQuery('');
                      setRulePickerCatQuery('');
                      setRulePickerApplied({ name: '', cat: '' });
                    }}
                    className="h-8 px-3.5 bg-white hover:bg-blue-50 text-[#1677ff] border border-[#1677ff] rounded text-xs font-medium cursor-pointer"
                  >
                    重置
                  </button>
                </div>
              </div>

              {/* Rules Table: 规则ID、规则名称、规则分类、创建人、更新时间 */}
              <div className="flex-1 overflow-auto border border-slate-100 rounded custom-scrollbar">
                <table className="w-full border-collapse text-left">
                  <thead className="sticky top-0 z-10 bg-[#dbe7fb] text-slate-700 text-xs font-semibold">
                    <tr>
                      <th className="w-10 py-2.5 text-center border-r border-white">
                        <input
                          type="checkbox"
                          checked={
                            filteredPickerRules.length > 0 &&
                            filteredPickerRules.every(r =>
                              rulePickerCheckedIds.includes(r.id)
                            )
                          }
                          onChange={() => {
                            const allChecked =
                              filteredPickerRules.length > 0 &&
                              filteredPickerRules.every(r =>
                                rulePickerCheckedIds.includes(r.id)
                              );
                            if (allChecked) {
                              const ids = new Set(filteredPickerRules.map(r => r.id));
                              setRulePickerCheckedIds(prev =>
                                prev.filter(id => !ids.has(id))
                              );
                            } else {
                              setRulePickerCheckedIds(prev =>
                                Array.from(
                                  new Set([...prev, ...filteredPickerRules.map(r => r.id)])
                                )
                              );
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-[#1677ff] cursor-pointer accent-[#1677ff]"
                        />
                      </th>
                      <th className="py-2.5 px-3 text-center border-r border-white w-[160px]">
                        规则ID
                      </th>
                      <th className="py-2.5 px-3 text-center border-r border-white min-w-[180px]">
                        规则名称
                      </th>
                      <th className="py-2.5 px-3 text-center border-r border-white w-[160px]">
                        规则分类
                      </th>
                      <th className="py-2.5 px-3 text-center border-r border-white w-[100px]">
                        创建人
                      </th>
                      <th className="py-2.5 px-3 text-center w-[150px]">更新时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 bg-white">
                    {filteredPickerRules.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          暂无符合条件的质检规则
                        </td>
                      </tr>
                    ) : (
                      filteredPickerRules.map(rule => {
                        const checked = rulePickerCheckedIds.includes(rule.id);
                        return (
                          <tr
                            key={rule.id}
                            onClick={() =>
                              setRulePickerCheckedIds(prev =>
                                prev.includes(rule.id)
                                  ? prev.filter(id => id !== rule.id)
                                  : [...prev, rule.id]
                              )
                            }
                            className={`hover:bg-[#f5f8ff] cursor-pointer transition-colors ${
                              checked ? 'bg-blue-50/40' : ''
                            }`}
                          >
                            <td
                              className="py-3 text-center"
                              onClick={e => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setRulePickerCheckedIds(prev =>
                                    prev.includes(rule.id)
                                      ? prev.filter(id => id !== rule.id)
                                      : [...prev, rule.id]
                                  )
                                }
                                className="w-3.5 h-3.5 rounded border-slate-300 text-[#1677ff] cursor-pointer accent-[#1677ff]"
                              />
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-slate-600 tabular-nums">
                              {rule.id}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-800">
                              <span>{rule.name}</span>
                              <span className="ml-1.5 text-[10.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                                {rule.ruleMode}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center text-slate-600">
                              {rule.categoryPath}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-600">
                              {rule.creator}
                            </td>
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
            </div>

            <div className="h-12 px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0 text-xs">
              <span className="text-slate-500 tabular-nums">
                已勾选 {rulePickerCheckedIds.length} 条规则
              </span>
              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => setRulePickerOpen(false)}
                  className="h-8 px-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRulePicker}
                  className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white rounded text-xs font-medium cursor-pointer"
                >
                  确认添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
       * 弹窗 2：选择评分项窗口（Step 3 点击规则的【绑定评分项】打开）
       * 来源于评分项管理，按任务评分策略（加分/减分/不区分）过滤
       * ============================================================================ */}
      {scorePickerModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[82vh]">
            <div className="h-11 px-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                <h3 className="text-sm font-bold text-slate-800">
                  绑定评分项 - {scorePickerModal.targetRuleName}
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-[#1677ff]">
                  评分策略：{formScoreStrategy}（
                  {formScoreStrategy === '加分'
                    ? '仅可选加分评分项'
                    : formScoreStrategy === '减分'
                      ? '仅可选减分评分项'
                      : '可选全部评分项'}
                  ）
                </span>
              </div>
              <button
                type="button"
                onClick={() => setScorePickerModal(prev => ({ ...prev, open: false }))}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-hidden flex flex-col">
              {/* Filter Bar */}
              <div className="bg-[#f9fafc] border border-slate-100 rounded px-4 py-2.5 flex flex-wrap items-center gap-4 text-xs flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <label className="text-slate-700 font-medium">评分项名称</label>
                  <input
                    type="text"
                    placeholder="搜索评分项名称"
                    value={scorePickerNameQuery}
                    onChange={e => setScorePickerNameQuery(e.target.value)}
                    className="w-44 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-slate-700 font-medium">分类</label>
                  <select
                    value={scorePickerCatQuery}
                    onChange={e => setScorePickerCatQuery(e.target.value)}
                    className="w-36 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                  >
                    <option value="">全部分类</option>
                    {INITIAL_SCORE_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Score Items Table */}
              <div className="flex-1 overflow-auto border border-slate-100 rounded custom-scrollbar">
                <table className="w-full border-collapse text-left">
                  <thead className="sticky top-0 z-10 bg-[#dbe7fb] text-slate-700 text-xs font-semibold">
                    <tr>
                      <th className="w-10 py-2.5 text-center border-r border-white">选择</th>
                      <th className="py-2.5 px-3 text-center border-r border-white min-w-[180px]">
                        评分项名称
                      </th>
                      <th className="py-2.5 px-3 text-center border-r border-white w-[110px]">
                        分类
                      </th>
                      <th className="py-2.5 px-3 text-center border-r border-white w-[90px]">
                        类别
                      </th>
                      <th className="py-2.5 px-3 text-center border-r border-white w-[90px]">
                        分值
                      </th>
                      <th className="py-2.5 px-3 text-center w-[100px]">创建人</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 bg-white">
                    {filteredPickerScoreItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          暂无符合当前评分策略的评分项
                        </td>
                      </tr>
                    ) : (
                      filteredPickerScoreItems.map(item => {
                        const isSelected = scorePickerModal.selectedScoreItemId === item.id;
                        const isAdd = item.scoreType === '加分';
                        return (
                          <tr
                            key={item.id}
                            onClick={() =>
                              setScorePickerModal(prev => ({
                                ...prev,
                                selectedScoreItemId: item.id,
                              }))
                            }
                            className={`hover:bg-[#f5f8ff] cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            <td className="py-3 text-center">
                              <input
                                type="radio"
                                name="score_item_picker_radio"
                                checked={isSelected}
                                onChange={() =>
                                  setScorePickerModal(prev => ({
                                    ...prev,
                                    selectedScoreItemId: item.id,
                                  }))
                                }
                                className="w-3.5 h-3.5 text-[#1677ff] cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-3 text-center text-slate-800 font-medium">
                              {item.name}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-600">
                              {item.categoryName}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  isAdd
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                                }`}
                              >
                                {item.scoreType}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-mono tabular-nums font-medium">
                              <span className={isAdd ? 'text-emerald-600' : 'text-amber-600'}>
                                {isAdd ? `+${item.scoreValue}` : `-${item.scoreValue}`} 分
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center text-slate-600">
                              {item.creator}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="h-12 px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setScorePickerModal(prev => ({ ...prev, open: false }))}
                className="h-8 px-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                disabled={!scorePickerModal.selectedScoreItemId}
                onClick={handleConfirmBindScoreItem}
                className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                确认绑定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
       * 弹窗 3：删除确认弹窗
       * ============================================================================ */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="h-11 px-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">确认删除</h3>
              <button
                type="button"
                onClick={() => setDeleteConfirm(prev => ({ ...prev, open: false }))}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 text-xs text-slate-600 leading-relaxed">
              确定要删除常规质检任务「
              <span className="font-semibold text-slate-800">{deleteConfirm.title}</span>
              」吗？删除后不可恢复。
            </div>

            <div className="h-11 px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirm(prev => ({ ...prev, open: false }))}
                className="h-7 px-3.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTask}
                className="h-7 px-3.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs cursor-pointer"
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

export default QualityRoutineInspectionWorkbench;
