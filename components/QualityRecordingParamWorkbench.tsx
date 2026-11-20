import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

export type RecordingParamDataType =
  | '字符串'
  | '全文本'
  | '整数'
  | '浮点数'
  | '枚举值'
  | '布尔'
  | '时间';

export const RECORDING_PARAM_DATA_TYPES: RecordingParamDataType[] = [
  '字符串',
  '全文本',
  '整数',
  '浮点数',
  '枚举值',
  '布尔',
  '时间',
];

export interface EnumOptionItem {
  id: string;
  label: string;
}

export interface RecordingParamItem {
  id: string;
  paramName: string;
  fieldCode: string;
  fieldType: RecordingParamDataType;
  enumOptions?: EnumOptionItem[];
  creator: string;
  updatedAt: string;
  referenceCount: number;
}

const INITIAL_RECORDING_PARAMS: RecordingParamItem[] = [
  {
    id: 'RP20261118001',
    paramName: '呼叫方向',
    fieldCode: 'call_direction',
    fieldType: '枚举值',
    enumOptions: [
      { id: 'enum_1', label: '呼入' },
      { id: 'enum_2', label: '呼出' },
    ],
    creator: '张颖',
    updatedAt: '2026-11-18 10:15:20',
    referenceCount: 26,
  },
  {
    id: 'RP20261118002',
    paramName: '主叫号码',
    fieldCode: 'caller_number',
    fieldType: '字符串',
    creator: '张颖',
    updatedAt: '2026-11-18 09:48:11',
    referenceCount: 19,
  },
  {
    id: 'RP20261118003',
    paramName: '被叫号码',
    fieldCode: 'callee_number',
    fieldType: '字符串',
    creator: '张颖',
    updatedAt: '2026-11-18 09:46:05',
    referenceCount: 14,
  },
  {
    id: 'RP20261118004',
    paramName: '坐席工号',
    fieldCode: 'agent_id',
    fieldType: '字符串',
    creator: '陈明',
    updatedAt: '2026-11-17 17:30:42',
    referenceCount: 32,
  },
  {
    id: 'RP20261118005',
    paramName: '技能组名称',
    fieldCode: 'skill_group_name',
    fieldType: '枚举值',
    enumOptions: [
      { id: 'enum_sg_1', label: 'VIP专席组' },
      { id: 'enum_sg_2', label: '信用卡综合组' },
      { id: 'enum_sg_3', label: '财富顾问组' },
    ],
    creator: '陈明',
    updatedAt: '2026-11-17 16:12:30',
    referenceCount: 21,
  },
  {
    id: 'RP20261118006',
    paramName: '挂机方',
    fieldCode: 'hangup_party',
    fieldType: '枚举值',
    enumOptions: [
      { id: 'enum_hp_1', label: '坐席挂机' },
      { id: 'enum_hp_2', label: '客户挂机' },
      { id: 'enum_hp_3', label: '系统超时释放' },
    ],
    creator: '王伟',
    updatedAt: '2026-11-17 14:25:18',
    referenceCount: 28,
  },
  {
    id: 'RP20261118007',
    paramName: '满意度评价',
    fieldCode: 'satisfaction_rating',
    fieldType: '枚举值',
    enumOptions: [
      { id: 'enum_sr_1', label: '非常满意' },
      { id: 'enum_sr_2', label: '满意' },
      { id: 'enum_sr_3', label: '一般' },
      { id: 'enum_sr_4', label: '不满意' },
    ],
    creator: '刘芳',
    updatedAt: '2026-11-16 18:40:09',
    referenceCount: 35,
  },
  {
    id: 'RP20261118008',
    paramName: '排队时长(秒)',
    fieldCode: 'queue_duration_sec',
    fieldType: '整数',
    creator: '李娜',
    updatedAt: '2026-11-16 15:10:52',
    referenceCount: 16,
  },
  {
    id: 'RP20261118009',
    paramName: '是否首次进线',
    fieldCode: 'is_first_inbound',
    fieldType: '布尔',
    creator: '王伟',
    updatedAt: '2026-11-15 11:22:37',
    referenceCount: 11,
  },
  {
    id: 'RP20261118010',
    paramName: '进线接入时间',
    fieldCode: 'call_start_time',
    fieldType: '时间',
    creator: '张颖',
    updatedAt: '2026-11-15 09:05:14',
    referenceCount: 8,
  },
];

function formatCurrentTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

const QualityRecordingParamWorkbench: React.FC = () => {
  // 1. Recording Parameters State
  const [params, setParams] = useState<RecordingParamItem[]>(INITIAL_RECORDING_PARAMS);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // 2. Query Filter Form State
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(true);
  const [queryParamName, setQueryParamName] = useState<string>('');
  const [queryFieldCode, setQueryFieldCode] = useState<string>('');
  const [queryFieldType, setQueryFieldType] = useState<string>('');
  const [queryCreator, setQueryCreator] = useState<string>('');
  const [queryUpdatedDate, setQueryUpdatedDate] = useState<string>('');

  const [appliedFilters, setAppliedFilters] = useState<{
    paramName: string;
    fieldCode: string;
    fieldType: string;
    creator: string;
    updatedDate: string;
  }>({
    paramName: '',
    fieldCode: '',
    fieldType: '',
    creator: '',
    updatedDate: '',
  });

  // 3. Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [jumpPageInput, setJumpPageInput] = useState<string>('1');

  // 4. Add / Edit Modal State
  const [paramModal, setParamModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    targetId: string;
    paramName: string;
    fieldCode: string;
    fieldType: RecordingParamDataType;
    enumOptions: EnumOptionItem[];
    error: string;
  }>({
    open: false,
    mode: 'create',
    targetId: '',
    paramName: '',
    fieldCode: '',
    fieldType: '字符串',
    enumOptions: [
      { id: 'enum_init_1', label: '' },
    ],
    error: '',
  });

  // 5. Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string;
    title: string;
  }>({
    open: false,
    id: '',
    title: '',
  });

  // 6. Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2600);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // ============================================================================
  // Filter & Search Handlers
  // ============================================================================
  const handleSearch = () => {
    setAppliedFilters({
      paramName: queryParamName.trim(),
      fieldCode: queryFieldCode.trim(),
      fieldType: queryFieldType,
      creator: queryCreator.trim(),
      updatedDate: queryUpdatedDate,
    });
    setCurrentPage(1);
    setJumpPageInput('1');
  };

  const handleResetFilters = () => {
    setQueryParamName('');
    setQueryFieldCode('');
    setQueryFieldType('');
    setQueryCreator('');
    setQueryUpdatedDate('');
    setAppliedFilters({
      paramName: '',
      fieldCode: '',
      fieldType: '',
      creator: '',
      updatedDate: '',
    });
    setCurrentPage(1);
    setJumpPageInput('1');
  };

  const filteredParams = useMemo(() => {
    return params.filter(item => {
      if (
        appliedFilters.paramName &&
        !item.paramName.toLowerCase().includes(appliedFilters.paramName.toLowerCase())
      ) {
        return false;
      }
      if (
        appliedFilters.fieldCode &&
        !item.fieldCode.toLowerCase().includes(appliedFilters.fieldCode.toLowerCase())
      ) {
        return false;
      }
      if (appliedFilters.fieldType && item.fieldType !== appliedFilters.fieldType) {
        return false;
      }
      if (
        appliedFilters.creator &&
        !item.creator.toLowerCase().includes(appliedFilters.creator.toLowerCase())
      ) {
        return false;
      }
      if (
        appliedFilters.updatedDate &&
        !item.updatedAt.startsWith(appliedFilters.updatedDate)
      ) {
        return false;
      }
      return true;
    });
  }, [params, appliedFilters]);

  // Pagination calculation
  const totalCount = filteredParams.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedParams = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredParams.slice(start, start + pageSize);
  }, [filteredParams, safeCurrentPage, pageSize]);

  // Selection helpers
  const allCurrentPageSelected =
    pagedParams.length > 0 && pagedParams.every(item => selectedRowIds.includes(item.id));

  const handleToggleSelectAll = () => {
    if (allCurrentPageSelected) {
      const pageIds = new Set(pagedParams.map(i => i.id));
      setSelectedRowIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const merged = new Set([...selectedRowIds, ...pagedParams.map(i => i.id)]);
      setSelectedRowIds(Array.from(merged));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedRowIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // ============================================================================
  // Add / Edit Modal Handlers (with Enum Items CRUD support)
  // ============================================================================
  const handleOpenCreateModal = () => {
    setParamModal({
      open: true,
      mode: 'create',
      targetId: '',
      paramName: '',
      fieldCode: '',
      fieldType: '字符串',
      enumOptions: [
        { id: `enum_${Date.now()}_1`, label: '' },
      ],
      error: '',
    });
  };

  const handleOpenEditModal = (item: RecordingParamItem) => {
    setParamModal({
      open: true,
      mode: 'edit',
      targetId: item.id,
      paramName: item.paramName,
      fieldCode: item.fieldCode,
      fieldType: item.fieldType,
      enumOptions:
        item.enumOptions && item.enumOptions.length > 0
          ? item.enumOptions.map(opt => ({ ...opt }))
          : [{ id: `enum_${Date.now()}_1`, label: '' }],
      error: '',
    });
  };

  const handleAddEnumOption = () => {
    setParamModal(prev => ({
      ...prev,
      enumOptions: [
        ...prev.enumOptions,
        {
          id: `enum_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          label: '',
        },
      ],
      error: '',
    }));
  };

  const handleUpdateEnumOption = (id: string, label: string) => {
    setParamModal(prev => ({
      ...prev,
      enumOptions: prev.enumOptions.map(opt =>
        opt.id === id ? { ...opt, label } : opt
      ),
      error: '',
    }));
  };

  const handleDeleteEnumOption = (id: string) => {
    setParamModal(prev => {
      if (prev.enumOptions.length <= 1) {
        return {
          ...prev,
          enumOptions: [{ id: `enum_${Date.now()}_reset`, label: '' }],
          error: '',
        };
      }
      return {
        ...prev,
        enumOptions: prev.enumOptions.filter(opt => opt.id !== id),
        error: '',
      };
    });
  };

  const handleSaveParamModal = () => {
    const trimmedName = paramModal.paramName.trim();
    const trimmedCode = paramModal.fieldCode.trim();

    if (!trimmedName) {
      setParamModal(prev => ({ ...prev, error: '请输入参数名称（必填）' }));
      return;
    }
    if (!trimmedCode) {
      setParamModal(prev => ({ ...prev, error: '请输入字段编码（必填）' }));
      return;
    }

    const duplicateCode = params.some(
      p =>
        p.fieldCode.toLowerCase() === trimmedCode.toLowerCase() &&
        p.id !== paramModal.targetId
    );
    if (duplicateCode) {
      setParamModal(prev => ({ ...prev, error: '该字段编码已存在，请使用唯一字段编码' }));
      return;
    }

    let validEnumOptions: EnumOptionItem[] | undefined = undefined;
    if (paramModal.fieldType === '枚举值') {
      const cleaned = paramModal.enumOptions
        .map(opt => ({ ...opt, label: opt.label.trim() }))
        .filter(opt => opt.label.length > 0);

      if (cleaned.length === 0) {
        setParamModal(prev => ({
          ...prev,
          error: '字段类型为“枚举值”时，请至少添加并填写一个枚举项',
        }));
        return;
      }
      validEnumOptions = cleaned;
    }

    const nowStr = formatCurrentTimestamp();

    if (paramModal.mode === 'create') {
      const nextNum = String(params.length + 1).padStart(3, '0');
      const newItem: RecordingParamItem = {
        id: `RP20261118${nextNum}`,
        paramName: trimmedName,
        fieldCode: trimmedCode,
        fieldType: paramModal.fieldType,
        enumOptions: validEnumOptions,
        creator: '当前管理员',
        updatedAt: nowStr,
        referenceCount: 0,
      };
      setParams(prev => [newItem, ...prev]);
      showToast(`已新增随录参数「${trimmedName}」`);
    } else {
      setParams(prev =>
        prev.map(item =>
          item.id === paramModal.targetId
            ? {
                ...item,
                paramName: trimmedName,
                fieldCode: trimmedCode,
                fieldType: paramModal.fieldType,
                enumOptions: validEnumOptions,
                updatedAt: nowStr,
              }
            : item
        )
      );
      showToast(`已更新随录参数「${trimmedName}」`);
    }

    setParamModal(prev => ({ ...prev, open: false }));
  };

  const handleConfirmDelete = () => {
    setParams(prev => prev.filter(item => item.id !== deleteConfirm.id));
    setSelectedRowIds(prev => prev.filter(id => id !== deleteConfirm.id));
    showToast(`已删除随录参数「${deleteConfirm.title}」`);
    setDeleteConfirm(prev => ({ ...prev, open: false }));
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

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col bg-white m-2.5 rounded-sm shadow-xs border border-slate-200/80 overflow-hidden min-w-0">
        {/* Top Title Header */}
        <div className="h-12 px-5 flex items-center justify-between border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <h1 className="text-[15px] font-bold text-slate-800">随录参数</h1>
            <span className="text-xs text-slate-400">
              维护管理参数变量，应用于质检规则的「系统参数」条件配置
            </span>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 flex flex-col p-5 overflow-hidden">
          {/* Query Filter Area: 参数名称、字段编码、字段类型、创建人、更新时间，查询 重置 */}
          <div className="bg-[#f9fafc] border border-slate-100 rounded-md px-5 py-4 mb-4 flex-shrink-0">
            {isSearchExpanded ? (
              <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
                {/* 参数名称 */}
                <div className="flex items-center space-x-2.5">
                  <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                    参数名称
                  </label>
                  <input
                    type="text"
                    value={queryParamName}
                    onChange={e => setQueryParamName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="参数名称"
                    className="w-40 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#1677ff] transition-colors"
                  />
                </div>

                {/* 字段编码 */}
                <div className="flex items-center space-x-2.5">
                  <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                    字段编码
                  </label>
                  <input
                    type="text"
                    value={queryFieldCode}
                    onChange={e => setQueryFieldCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="字段编码"
                    className="w-40 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#1677ff] transition-colors"
                  />
                </div>

                {/* 字段类型 */}
                <div className="flex items-center space-x-2.5">
                  <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                    字段类型
                  </label>
                  <select
                    value={queryFieldType}
                    onChange={e => setQueryFieldType(e.target.value)}
                    className="w-36 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                  >
                    <option value="">请选择</option>
                    {RECORDING_PARAM_DATA_TYPES.map(dt => (
                      <option key={dt} value={dt}>
                        {dt}
                      </option>
                    ))}
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
                  已折叠查询条件栏（点击右侧展开可按参数名称、字段编码、字段类型、创建人、更新时间筛选）
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
              onClick={handleOpenCreateModal}
              className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors cursor-pointer shadow-2xs"
            >
              新建规则
            </button>
            {selectedRowIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setParams(prev => prev.filter(i => !selectedRowIds.includes(i.id)));
                  showToast(`已批量删除 ${selectedRowIds.length} 条随录参数`);
                  setSelectedRowIds([]);
                }}
                className="h-8 px-3.5 bg-[#fff1f0] hover:bg-red-100 text-red-500 border border-[#ffccc7] text-xs font-medium rounded transition-colors cursor-pointer"
              >
                批量删除 ({selectedRowIds.length})
              </button>
            )}
          </div>

          {/* Table Container: ID、参数名称、字段编码、字段类型、创建人、更新时间、引用数、操作（编辑、删除） */}
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
                    ID
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-white min-w-[160px]">
                    参数名称
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-white min-w-[160px]">
                    字段编码
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-white min-w-[180px]">
                    字段类型
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-white w-[120px]">
                    创建人
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-white w-[165px]">
                    更新时间
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-white w-[100px]">
                    引用数
                  </th>
                  <th className="py-2.5 px-3 text-center w-[140px]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[12.5px] text-slate-700 bg-white">
                {pagedParams.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400 text-xs">
                      暂无符合条件的随录参数，请点击左上角「新建规则」或重置筛选条件
                    </td>
                  </tr>
                ) : (
                  pagedParams.map(item => {
                    const isChecked = selectedRowIds.includes(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-[#f5f8ff] transition-colors ${
                          isChecked ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="py-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelectRow(item.id)}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-[#1677ff] focus:ring-0 cursor-pointer accent-[#1677ff]"
                          />
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-700 tabular-nums">
                          {item.id}
                        </td>
                        <td className="py-3.5 px-3 text-center text-slate-800 font-normal leading-snug">
                          {item.paramName}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-600">
                          {item.fieldCode}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex flex-wrap items-center justify-center gap-1.5">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                              {item.fieldType}
                            </span>
                            {item.fieldType === '枚举值' &&
                              item.enumOptions &&
                              item.enumOptions.length > 0 && (
                                <span
                                  title={`枚举项：${item.enumOptions.map(o => o.label).join('、')}`}
                                  className="text-[11px] text-[#1677ff] bg-blue-50 px-1.5 py-0.5 rounded max-w-[180px] truncate"
                                >
                                  ({item.enumOptions.map(o => o.label).join('/')})
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center text-slate-700">
                          {item.creator}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-700 tabular-nums leading-snug">
                          {item.updatedAt}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono tabular-nums text-slate-700">
                          {item.referenceCount}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex items-center justify-center space-x-3 text-xs">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="text-[#1677ff] hover:text-blue-700 hover:underline cursor-pointer"
                            >
                              编辑
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirm({
                                  open: true,
                                  id: item.id,
                                  title: item.paramName,
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

      {/* ============================================================================
       * 弹窗 1：新增 / 编辑 随录参数窗口
       * 配置参数名称（必填）、字段编码（必填）、字段类型（必填）
       * 当选择枚举值时，需添加枚举项，支持对枚举项进行增删改
       * ============================================================================ */}
      {paramModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="h-11 px-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-bold text-slate-800">
                {paramModal.mode === 'create' ? '新增随录参数' : '编辑随录参数'}
              </h3>
              <button
                type="button"
                onClick={() => setParamModal(prev => ({ ...prev, open: false }))}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto custom-scrollbar flex-1">
              {/* 参数名称（必填） */}
              <div className="space-y-1.5">
                <label className="block font-medium text-slate-700">
                  <span className="text-red-500 mr-0.5">*</span>参数名称
                </label>
                <input
                  type="text"
                  maxLength={50}
                  placeholder="请输入参数名称，如：呼叫方向"
                  value={paramModal.paramName}
                  onChange={e =>
                    setParamModal(prev => ({
                      ...prev,
                      paramName: e.target.value,
                      error: '',
                    }))
                  }
                  className="w-full h-8 px-3 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                />
              </div>

              {/* 字段编码（必填） */}
              <div className="space-y-1.5">
                <label className="block font-medium text-slate-700">
                  <span className="text-red-500 mr-0.5">*</span>字段编码
                </label>
                <input
                  type="text"
                  maxLength={50}
                  placeholder="请输入字段编码，如：call_direction"
                  value={paramModal.fieldCode}
                  onChange={e =>
                    setParamModal(prev => ({
                      ...prev,
                      fieldCode: e.target.value,
                      error: '',
                    }))
                  }
                  className="w-full h-8 px-3 bg-white border border-slate-200 rounded text-xs font-mono text-slate-700 focus:outline-none focus:border-[#1677ff]"
                />
              </div>

              {/* 字段类型（必填）：字符串、全文本、整数、浮点数、枚举值、布尔、时间 */}
              <div className="space-y-1.5">
                <label className="block font-medium text-slate-700">
                  <span className="text-red-500 mr-0.5">*</span>字段类型
                </label>
                <select
                  value={paramModal.fieldType}
                  onChange={e => {
                    const nextType = e.target.value as RecordingParamDataType;
                    setParamModal(prev => ({
                      ...prev,
                      fieldType: nextType,
                      enumOptions:
                        nextType === '枚举值' && prev.enumOptions.length === 0
                          ? [{ id: `enum_${Date.now()}_1`, label: '' }]
                          : prev.enumOptions,
                      error: '',
                    }));
                  }}
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] cursor-pointer"
                >
                  {RECORDING_PARAM_DATA_TYPES.map(dt => (
                    <option key={dt} value={dt}>
                      {dt}
                    </option>
                  ))}
                </select>
              </div>

              {/* 当选择“枚举值”时，需添加枚举项，支持对枚举项进行增删改 */}
              {paramModal.fieldType === '枚举值' && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-medium text-slate-700">
                      <span className="text-red-500 mr-0.5">*</span>枚举项配置
                    </label>
                    <button
                      type="button"
                      onClick={handleAddEnumOption}
                      className="inline-flex items-center space-x-1 text-[#1677ff] hover:text-blue-700 font-medium cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>添加枚举项</span>
                    </button>
                  </div>

                  <div className="bg-[#f8fafc] border border-slate-200/80 rounded p-3 space-y-2">
                    {paramModal.enumOptions.map((opt, idx) => (
                      <div key={opt.id} className="flex items-center space-x-2">
                        <span className="text-slate-400 w-14 text-[11px] tabular-nums flex-shrink-0">
                          枚举项 #{idx + 1}
                        </span>
                        <input
                          type="text"
                          maxLength={40}
                          placeholder={`请输入枚举值名称（如：${
                            idx === 0 ? '呼入' : idx === 1 ? '呼出' : '选项值'
                          }）`}
                          value={opt.label}
                          onChange={e => handleUpdateEnumOption(opt.id, e.target.value)}
                          className="flex-1 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteEnumOption(opt.id)}
                          title="删除该枚举项"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-200/50 rounded transition-colors cursor-pointer flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {paramModal.error && (
                <div className="flex items-center space-x-1.5 text-red-500 text-xs">
                  <AlertCircle size={13} />
                  <span>{paramModal.error}</span>
                </div>
              )}
            </div>

            <div className="h-12 px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setParamModal(prev => ({ ...prev, open: false }))}
                className="h-8 px-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveParamModal}
                className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white rounded text-xs font-medium cursor-pointer"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
       * 弹窗 2：删除确认弹窗
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
              确定要删除随录参数「
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
                onClick={handleConfirmDelete}
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

export default QualityRecordingParamWorkbench;
