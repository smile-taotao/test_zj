import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Folder,
} from 'lucide-react';

export interface ScoreCategoryItem {
  id: string;
  name: string;
}

export type ScoreDirectionType = '加分' | '减分';

export interface QualityScoreItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  scoreType: ScoreDirectionType; // 加分 | 减分
  scoreValue: number;            // 分值
  creator: string;
  updatedAt: string;
  referenceCount: number;
}

export const INITIAL_SCORE_CATEGORIES: ScoreCategoryItem[] = [
  { id: 'scat_1', name: '服务规范' },
  { id: 'scat_2', name: '合规风控' },
  { id: 'scat_3', name: '业务解答' },
  { id: 'scat_4', name: '沟通技巧' },
  { id: 'scat_5', name: '身份核验' },
  { id: 'scat_6', name: '投诉安抚' },
  { id: 'scat_7', name: '营销推介' },
  { id: 'scat_8', name: '话务礼仪' },
];

export const INITIAL_SCORE_ITEMS: QualityScoreItem[] = [
  {
    id: 'SI20261118001',
    name: '首问礼貌用语规范达标',
    categoryId: 'scat_1',
    categoryName: '服务规范',
    scoreType: '加分',
    scoreValue: 5,
    creator: '张颖',
    updatedAt: '2026-11-18 09:30:12',
    referenceCount: 18,
  },
  {
    id: 'SI20261118002',
    name: '服务态度生硬或使用禁语',
    categoryId: 'scat_1',
    categoryName: '服务规范',
    scoreType: '减分',
    scoreValue: 10,
    creator: '张颖',
    updatedAt: '2026-11-18 09:25:40',
    referenceCount: 24,
  },
  {
    id: 'SI20261118003',
    name: '理财产品风险揭示完整',
    categoryId: 'scat_2',
    categoryName: '合规风控',
    scoreType: '加分',
    scoreValue: 5,
    creator: '陈明',
    updatedAt: '2026-11-17 17:42:08',
    referenceCount: 15,
  },
  {
    id: 'SI20261118004',
    name: '违规承诺保本保收益',
    categoryId: 'scat_2',
    categoryName: '合规风控',
    scoreType: '减分',
    scoreValue: 20,
    creator: '陈明',
    updatedAt: '2026-11-17 16:18:55',
    referenceCount: 31,
  },
  {
    id: 'SI20261118005',
    name: '账单分期费率解答准确',
    categoryId: 'scat_3',
    categoryName: '业务解答',
    scoreType: '加分',
    scoreValue: 3,
    creator: '王伟',
    updatedAt: '2026-11-17 14:10:22',
    referenceCount: 12,
  },
  {
    id: 'SI20261118006',
    name: '未按规定核验客户身份信息',
    categoryId: 'scat_5',
    categoryName: '身份核验',
    scoreType: '减分',
    scoreValue: 15,
    creator: '刘芳',
    updatedAt: '2026-11-16 18:05:19',
    referenceCount: 27,
  },
  {
    id: 'SI20261118007',
    name: '高情绪客户安抚化解出色',
    categoryId: 'scat_6',
    categoryName: '投诉安抚',
    scoreType: '加分',
    scoreValue: 10,
    creator: '李娜',
    updatedAt: '2026-11-16 11:32:47',
    referenceCount: 9,
  },
  {
    id: 'SI20261118008',
    name: '抢话插话或长时间静音冷场',
    categoryId: 'scat_8',
    categoryName: '话务礼仪',
    scoreType: '减分',
    scoreValue: 5,
    creator: '张颖',
    updatedAt: '2026-11-15 15:48:03',
    referenceCount: 19,
  },
  {
    id: 'SI20261118009',
    name: '主动提示替代线上办理渠道',
    categoryId: 'scat_4',
    categoryName: '沟通技巧',
    scoreType: '加分',
    scoreValue: 5,
    creator: '王伟',
    updatedAt: '2026-11-15 10:20:14',
    referenceCount: 14,
  },
  {
    id: 'SI20261118010',
    name: '精准营销推荐匹配客户需求',
    categoryId: 'scat_7',
    categoryName: '营销推介',
    scoreType: '加分',
    scoreValue: 8,
    creator: '李娜',
    updatedAt: '2026-11-14 16:35:29',
    referenceCount: 11,
  },
  {
    id: 'SI20261118011',
    name: '未告知业务办理收费标准或风险',
    categoryId: 'scat_3',
    categoryName: '业务解答',
    scoreType: '减分',
    scoreValue: 10,
    creator: '陈明',
    updatedAt: '2026-11-14 14:12:08',
    referenceCount: 22,
  },
  {
    id: 'SI20261118012',
    name: '推诿扯皮或消极敷衍客户诉求',
    categoryId: 'scat_6',
    categoryName: '投诉安抚',
    scoreType: '减分',
    scoreValue: 15,
    creator: '刘芳',
    updatedAt: '2026-11-13 17:50:44',
    referenceCount: 29,
  },
];

function formatCurrentTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

const QualityScoreItemWorkbench: React.FC = () => {
  // 1. Level-1 Categories State (仅支持一级分类，支持新增、编辑、删除和修改)
  const [categories, setCategories] = useState<ScoreCategoryItem[]>(INITIAL_SCORE_CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [activeMenuCategoryId, setActiveMenuCategoryId] = useState<string | null>(null);

  // 2. Score Items State
  const [scoreItems, setScoreItems] = useState<QualityScoreItem[]>(INITIAL_SCORE_ITEMS);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // 3. Query Filter Form State
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(true);
  const [queryName, setQueryName] = useState<string>('');
  const [queryCreator, setQueryCreator] = useState<string>('');
  const [queryUpdatedDate, setQueryUpdatedDate] = useState<string>('');
  const [queryCategoryId, setQueryCategoryId] = useState<string>('');

  const [appliedFilters, setAppliedFilters] = useState<{
    name: string;
    creator: string;
    updatedDate: string;
    categoryId: string;
  }>({
    name: '',
    creator: '',
    updatedDate: '',
    categoryId: '',
  });

  // 4. Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [jumpPageInput, setJumpPageInput] = useState<string>('1');

  // 5. Category Modal State (Add / Edit Level-1 Category)
  const [categoryModal, setCategoryModal] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    targetId: string;
    name: string;
    error: string;
  }>({
    open: false,
    mode: 'add',
    targetId: '',
    name: '',
    error: '',
  });

  // 6. Score Item Modal State (Add / Edit Score Item)
  const [scoreModal, setScoreModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    targetId: string;
    name: string;
    categoryId: string;
    scoreType: ScoreDirectionType;
    scoreValue: string;
    error: string;
  }>({
    open: false,
    mode: 'create',
    targetId: '',
    name: '',
    categoryId: INITIAL_SCORE_CATEGORIES[0]?.id || '',
    scoreType: '减分',
    scoreValue: '5',
    error: '',
  });

  // 7. Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    type: 'category' | 'score-item';
    id: string;
    title: string;
  }>({
    open: false,
    type: 'score-item',
    id: '',
    title: '',
  });

  // 8. Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2600);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setActiveMenuCategoryId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================================================
  // Category Handlers (仅支持一级分类：新增、编辑、删除、修改)
  // ============================================================================
  const openAddCategoryModal = () => {
    setActiveMenuCategoryId(null);
    setCategoryModal({
      open: true,
      mode: 'add',
      targetId: '',
      name: '',
      error: '',
    });
  };

  const openEditCategoryModal = (cat: ScoreCategoryItem) => {
    setActiveMenuCategoryId(null);
    setCategoryModal({
      open: true,
      mode: 'edit',
      targetId: cat.id,
      name: cat.name,
      error: '',
    });
  };

  const handleSaveCategoryModal = () => {
    const trimmed = categoryModal.name.trim();
    if (!trimmed) {
      setCategoryModal(prev => ({ ...prev, error: '请输入分类名称' }));
      return;
    }
    const duplicate = categories.some(
      c => c.name === trimmed && c.id !== categoryModal.targetId
    );
    if (duplicate) {
      setCategoryModal(prev => ({ ...prev, error: '该分类名称已存在，请勿重复添加' }));
      return;
    }

    if (categoryModal.mode === 'add') {
      const newCat: ScoreCategoryItem = {
        id: `scat_${Date.now()}`,
        name: trimmed,
      };
      setCategories(prev => [...prev, newCat]);
      showToast(`已新增分类「${trimmed}」`);
    } else {
      setCategories(prev =>
        prev.map(c => (c.id === categoryModal.targetId ? { ...c, name: trimmed } : c))
      );
      setScoreItems(prev =>
        prev.map(item =>
          item.categoryId === categoryModal.targetId
            ? { ...item, categoryName: trimmed }
            : item
        )
      );
      showToast(`已修改分类名称为「${trimmed}」`);
    }

    setCategoryModal(prev => ({ ...prev, open: false }));
  };

  const handleSelectLeftCategory = (categoryId: string) => {
    const nextId = selectedCategoryId === categoryId ? '' : categoryId;
    setSelectedCategoryId(nextId);
    setQueryCategoryId(nextId);
    setAppliedFilters(prev => ({ ...prev, categoryId: nextId }));
    setCurrentPage(1);
    setJumpPageInput('1');
  };

  // ============================================================================
  // Filter & Search Handlers
  // ============================================================================
  const handleSearch = () => {
    setSelectedCategoryId(queryCategoryId);
    setAppliedFilters({
      name: queryName.trim(),
      creator: queryCreator.trim(),
      updatedDate: queryUpdatedDate,
      categoryId: queryCategoryId,
    });
    setCurrentPage(1);
    setJumpPageInput('1');
  };

  const handleResetFilters = () => {
    setQueryName('');
    setQueryCreator('');
    setQueryUpdatedDate('');
    setQueryCategoryId('');
    setSelectedCategoryId('');
    setAppliedFilters({
      name: '',
      creator: '',
      updatedDate: '',
      categoryId: '',
    });
    setCurrentPage(1);
    setJumpPageInput('1');
  };

  // Filtered Score Items
  const filteredItems = useMemo(() => {
    return scoreItems.filter(item => {
      if (appliedFilters.name && !item.name.toLowerCase().includes(appliedFilters.name.toLowerCase())) {
        return false;
      }
      if (
        appliedFilters.creator &&
        !item.creator.toLowerCase().includes(appliedFilters.creator.toLowerCase())
      ) {
        return false;
      }
      if (appliedFilters.updatedDate && !item.updatedAt.startsWith(appliedFilters.updatedDate)) {
        return false;
      }
      const activeCatId = selectedCategoryId || appliedFilters.categoryId;
      if (activeCatId && item.categoryId !== activeCatId) {
        return false;
      }
      return true;
    });
  }, [scoreItems, appliedFilters, selectedCategoryId]);

  // Pagination calculation
  const totalCount = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedItems = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, safeCurrentPage, pageSize]);

  // Selection helpers
  const allCurrentPageSelected =
    pagedItems.length > 0 && pagedItems.every(item => selectedRowIds.includes(item.id));

  const handleToggleSelectAll = () => {
    if (allCurrentPageSelected) {
      const pageIds = new Set(pagedItems.map(i => i.id));
      setSelectedRowIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const merged = new Set([...selectedRowIds, ...pagedItems.map(i => i.id)]);
      setSelectedRowIds(Array.from(merged));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedRowIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // ============================================================================
  // Create / Edit Score Item Modal Handlers
  // ============================================================================
  const handleOpenCreateScoreModal = () => {
    const defaultCategoryId =
      selectedCategoryId || categories[0]?.id || '';
    setScoreModal({
      open: true,
      mode: 'create',
      targetId: '',
      name: '',
      categoryId: defaultCategoryId,
      scoreType: '减分',
      scoreValue: '5',
      error: '',
    });
  };

  const handleOpenEditScoreModal = (item: QualityScoreItem) => {
    setScoreModal({
      open: true,
      mode: 'edit',
      targetId: item.id,
      name: item.name,
      categoryId: item.categoryId,
      scoreType: item.scoreType,
      scoreValue: String(item.scoreValue),
      error: '',
    });
  };

  const handleSaveScoreModal = () => {
    const trimmedName = scoreModal.name.trim();
    if (!trimmedName) {
      setScoreModal(prev => ({ ...prev, error: '请输入评分项名称' }));
      return;
    }
    if (!scoreModal.categoryId) {
      setScoreModal(prev => ({ ...prev, error: '请选择所属分类' }));
      return;
    }
    const parsedScore = Number(scoreModal.scoreValue);
    if (isNaN(parsedScore) || parsedScore <= 0) {
      setScoreModal(prev => ({ ...prev, error: '请输入大于 0 的有效分值' }));
      return;
    }

    const targetCategory = categories.find(c => c.id === scoreModal.categoryId);
    const categoryName = targetCategory ? targetCategory.name : '未分类';
    const nowStr = formatCurrentTimestamp();

    if (scoreModal.mode === 'create') {
      const newItem: QualityScoreItem = {
        id: `SI${Date.now()}`,
        name: trimmedName,
        categoryId: scoreModal.categoryId,
        categoryName,
        scoreType: scoreModal.scoreType,
        scoreValue: parsedScore,
        creator: '当前管理员',
        updatedAt: nowStr,
        referenceCount: 0,
      };
      setScoreItems(prev => [newItem, ...prev]);
      showToast(`已新增评分项「${trimmedName}」`);
    } else {
      setScoreItems(prev =>
        prev.map(item =>
          item.id === scoreModal.targetId
            ? {
                ...item,
                name: trimmedName,
                categoryId: scoreModal.categoryId,
                categoryName,
                scoreType: scoreModal.scoreType,
                scoreValue: parsedScore,
                updatedAt: nowStr,
              }
            : item
        )
      );
      showToast(`已更新评分项「${trimmedName}」`);
    }

    setScoreModal(prev => ({ ...prev, open: false }));
  };

  // ============================================================================
  // Confirm Delete Handler
  // ============================================================================
  const handleConfirmDelete = () => {
    if (deleteConfirm.type === 'category') {
      setCategories(prev => prev.filter(c => c.id !== deleteConfirm.id));
      if (selectedCategoryId === deleteConfirm.id) {
        setSelectedCategoryId('');
      }
      if (queryCategoryId === deleteConfirm.id) {
        setQueryCategoryId('');
      }
      showToast(`已删除分类「${deleteConfirm.title}」`);
    } else {
      setScoreItems(prev => prev.filter(item => item.id !== deleteConfirm.id));
      setSelectedRowIds(prev => prev.filter(id => id !== deleteConfirm.id));
      showToast(`已删除评分项「${deleteConfirm.title}」`);
    }
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

      {/* ============================================================================
       * 1. 左侧面板：“分类”（仅支持一级分类，支持对分类的新增、编辑、删除和修改）
       * ============================================================================ */}
      <div
        ref={menuContainerRef}
        className="w-[225px] bg-white border-r border-slate-200 flex flex-col h-full flex-shrink-0"
      >
        {/* Left Header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
          <span className="text-[14px] font-bold text-slate-800 tracking-tight">分类</span>
          <button
            type="button"
            onClick={openAddCategoryModal}
            className="px-3 py-1 text-xs font-medium text-[#1677ff] bg-[#e8f2ff] hover:bg-[#d4e7ff] border border-[#b7d6ff] rounded transition-colors cursor-pointer"
          >
            添加
          </button>
        </div>

        {/* Single-Level Category List */}
        <div className="flex-1 overflow-y-auto py-1.5 custom-scrollbar">
          {/* 全部评分项 entry */}
          <div
            onClick={() => handleSelectLeftCategory('')}
            className={`flex items-center justify-between px-3.5 py-2 cursor-pointer text-[13px] transition-colors ${
              selectedCategoryId === ''
                ? 'bg-[#e8f2ff] text-[#1677ff] font-medium'
                : 'text-slate-700 hover:bg-[#f5f7fa]'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
              <Folder
                size={14}
                className={selectedCategoryId === '' ? 'text-[#1677ff]' : 'text-slate-400'}
              />
              <span className="truncate">全部分类</span>
            </div>
            <span className="text-[11px] text-slate-400 tabular-nums">
              {scoreItems.length}
            </span>
          </div>

          {categories.map(category => {
            const isSelected = selectedCategoryId === category.id;
            const count = scoreItems.filter(i => i.categoryId === category.id).length;

            return (
              <div key={category.id} className="relative">
                <div
                  onClick={() => handleSelectLeftCategory(category.id)}
                  className={`group flex items-center justify-between px-3.5 py-2 cursor-pointer text-[13px] transition-colors ${
                    isSelected
                      ? 'bg-[#e8f2ff] text-[#1677ff] font-medium'
                      : 'text-slate-700 hover:bg-[#f5f7fa]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isSelected ? 'bg-[#1677ff]' : 'bg-slate-300'
                      }`}
                    />
                    <span className="truncate">{category.name}</span>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <span className="text-[11px] text-slate-400 tabular-nums mr-0.5">
                      {count}
                    </span>

                    {/* More Actions Button (...) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setActiveMenuCategoryId(prev =>
                            prev === category.id ? null : category.id
                          );
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title="分类操作"
                      >
                        <MoreHorizontal size={15} />
                      </button>

                      {activeMenuCategoryId === category.id && (
                        <div
                          onClick={e => e.stopPropagation()}
                          className="absolute right-0 top-7 w-28 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-40 text-xs text-slate-700"
                        >
                          <button
                            type="button"
                            onClick={() => openEditCategoryModal(category)}
                            className="w-full px-3 py-1.5 text-left hover:bg-blue-50 hover:text-[#1677ff] flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Edit3 size={13} />
                            <span>编辑修改</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuCategoryId(null);
                              setDeleteConfirm({
                                open: true,
                                type: 'category',
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
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================================
       * 2. 右侧面板：“评分项管理”
       * ============================================================================ */}
      <div className="flex-1 flex flex-col bg-white m-2.5 rounded-sm shadow-xs border border-slate-200/80 overflow-hidden min-w-0">
        {/* Top Title Header */}
        <div className="h-12 px-5 flex items-center justify-between border-b border-slate-200 flex-shrink-0">
          <h1 className="text-[15px] font-bold text-slate-800">评分项管理</h1>
          {(selectedCategoryId || appliedFilters.categoryId) && (
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span>
                当前筛选分类：
                <strong className="text-[#1677ff] font-medium ml-1">
                  {categories.find(
                    c => c.id === (selectedCategoryId || appliedFilters.categoryId)
                  )?.name || '全部'}
                </strong>
              </span>
              <button
                type="button"
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
          {/* Query Filter Area: 评分项名称、创建人、更新时间、分类，查询 重置 */}
          <div className="bg-[#f9fafc] border border-slate-100 rounded-md px-5 py-4 mb-4 flex-shrink-0">
            {isSearchExpanded ? (
              <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
                {/* 评分项名称 */}
                <div className="flex items-center space-x-2.5">
                  <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                    评分项名称
                  </label>
                  <input
                    type="text"
                    value={queryName}
                    onChange={e => setQueryName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="评分项名称"
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

                {/* 分类 */}
                <div className="flex items-center space-x-2.5">
                  <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                    分类
                  </label>
                  <select
                    value={queryCategoryId}
                    onChange={e => setQueryCategoryId(e.target.value)}
                    className="w-44 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] transition-colors cursor-pointer"
                  >
                    <option value="">请选择</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
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
                  已折叠查询条件栏（点击右侧展开可按评分项名称、创建人、更新时间、分类筛选）
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
              onClick={handleOpenCreateScoreModal}
              className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors cursor-pointer shadow-2xs"
            >
              新建规则
            </button>
            {selectedRowIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setScoreItems(prev => prev.filter(i => !selectedRowIds.includes(i.id)));
                  showToast(`已批量删除 ${selectedRowIds.length} 条评分项`);
                  setSelectedRowIds([]);
                }}
                className="h-8 px-3.5 bg-[#fff1f0] hover:bg-red-100 text-red-500 border border-[#ffccc7] text-xs font-medium rounded transition-colors cursor-pointer"
              >
                批量删除 ({selectedRowIds.length})
              </button>
            )}
          </div>

          {/* Table Container: 评分项名称、分类、类别（加分、减分）、分值、创建人、更新时间、引用数、操作（编辑、删除） */}
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
                  <th className="py-2.5 px-3 text-center border-r border-white min-w-[200px]">
                    评分项名称
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-white w-[140px]">
                    分类
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-white w-[120px]">
                    类别
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-white w-[100px]">
                    分值
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
                {pagedItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400 text-xs">
                      暂无符合条件的评分项，请点击左上角「新建规则」或重置筛选条件
                    </td>
                  </tr>
                ) : (
                  pagedItems.map(item => {
                    const isChecked = selectedRowIds.includes(item.id);
                    const isAddScore = item.scoreType === '加分';
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
                        <td className="py-3.5 px-3 text-center text-slate-800 font-normal leading-snug">
                          {item.name}
                        </td>
                        <td className="py-3.5 px-3 text-center text-slate-700 leading-snug">
                          {item.categoryName}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              isAddScore
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : 'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}
                          >
                            {item.scoreType}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono text-xs tabular-nums font-medium">
                          <span className={isAddScore ? 'text-emerald-600' : 'text-amber-600'}>
                            {isAddScore ? `+${item.scoreValue}` : `-${item.scoreValue}`} 分
                          </span>
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
                              onClick={() => handleOpenEditScoreModal(item)}
                              className="text-[#1677ff] hover:text-blue-700 hover:underline cursor-pointer"
                            >
                              编辑
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirm({
                                  open: true,
                                  type: 'score-item',
                                  id: item.id,
                                  title: item.name,
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
       * 弹窗 1：新增 / 编辑 一级分类弹窗
       * ============================================================================ */}
      {categoryModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="h-11 px-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                {categoryModal.mode === 'add' ? '新增分类' : '编辑分类'}
              </h3>
              <button
                type="button"
                onClick={() => setCategoryModal(prev => ({ ...prev, open: false }))}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-medium text-slate-700">
                  <span className="text-red-500 mr-0.5">*</span>分类名称
                </label>
                <input
                  type="text"
                  maxLength={30}
                  placeholder="请输入一级分类名称（不超过30字）"
                  value={categoryModal.name}
                  onChange={e =>
                    setCategoryModal(prev => ({
                      ...prev,
                      name: e.target.value,
                      error: '',
                    }))
                  }
                  onKeyDown={e => e.key === 'Enter' && handleSaveCategoryModal()}
                  className="w-full h-8 px-3 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                />
              </div>

              {categoryModal.error && (
                <div className="flex items-center space-x-1.5 text-red-500 text-xs">
                  <AlertCircle size={13} />
                  <span>{categoryModal.error}</span>
                </div>
              )}
            </div>

            <div className="h-12 px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setCategoryModal(prev => ({ ...prev, open: false }))}
                className="h-8 px-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveCategoryModal}
                className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white rounded text-xs font-medium cursor-pointer"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
       * 弹窗 2：新增 / 编辑 评分项窗口
       * 配置评分项名称、分类，设置加分还是减分，设置分值
       * ============================================================================ */}
      {scoreModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="h-11 px-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                {scoreModal.mode === 'create' ? '新增评分项' : '编辑评分项'}
              </h3>
              <button
                type="button"
                onClick={() => setScoreModal(prev => ({ ...prev, open: false }))}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* 评分项名称 */}
              <div className="space-y-1.5">
                <label className="block font-medium text-slate-700">
                  <span className="text-red-500 mr-0.5">*</span>评分项名称
                </label>
                <input
                  type="text"
                  maxLength={60}
                  placeholder="请输入评分项名称"
                  value={scoreModal.name}
                  onChange={e =>
                    setScoreModal(prev => ({
                      ...prev,
                      name: e.target.value,
                      error: '',
                    }))
                  }
                  className="w-full h-8 px-3 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                />
              </div>

              {/* 分类 */}
              <div className="space-y-1.5">
                <label className="block font-medium text-slate-700">
                  <span className="text-red-500 mr-0.5">*</span>分类
                </label>
                <select
                  value={scoreModal.categoryId}
                  onChange={e =>
                    setScoreModal(prev => ({
                      ...prev,
                      categoryId: e.target.value,
                      error: '',
                    }))
                  }
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] cursor-pointer"
                >
                  <option value="">请选择分类</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 类别：加分 / 减分 */}
              <div className="space-y-1.5">
                <label className="block font-medium text-slate-700">
                  <span className="text-red-500 mr-0.5">*</span>类别
                </label>
                <div className="flex items-center space-x-6 pt-1">
                  <label className="inline-flex items-center space-x-2 text-slate-700 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="score_direction_type"
                      checked={scoreModal.scoreType === '加分'}
                      onChange={() =>
                        setScoreModal(prev => ({ ...prev, scoreType: '加分', error: '' }))
                      }
                      className="w-3.5 h-3.5 text-[#1677ff] border-slate-300 focus:ring-[#1677ff]"
                    />
                    <span>加分</span>
                  </label>

                  <label className="inline-flex items-center space-x-2 text-slate-700 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="score_direction_type"
                      checked={scoreModal.scoreType === '减分'}
                      onChange={() =>
                        setScoreModal(prev => ({ ...prev, scoreType: '减分', error: '' }))
                      }
                      className="w-3.5 h-3.5 text-[#1677ff] border-slate-300 focus:ring-[#1677ff]"
                    />
                    <span>减分</span>
                  </label>
                </div>
              </div>

              {/* 分值 */}
              <div className="space-y-1.5">
                <label className="block font-medium text-slate-700">
                  <span className="text-red-500 mr-0.5">*</span>分值
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    placeholder="请输入分值"
                    value={scoreModal.scoreValue}
                    onChange={e =>
                      setScoreModal(prev => ({
                        ...prev,
                        scoreValue: e.target.value,
                        error: '',
                      }))
                    }
                    className="w-36 h-8 px-3 bg-white border border-slate-200 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
                  />
                  <span className="text-slate-500">分</span>
                </div>
              </div>

              {scoreModal.error && (
                <div className="flex items-center space-x-1.5 text-red-500 text-xs">
                  <AlertCircle size={13} />
                  <span>{scoreModal.error}</span>
                </div>
              )}
            </div>

            <div className="h-12 px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setScoreModal(prev => ({ ...prev, open: false }))}
                className="h-8 px-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveScoreModal}
                className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white rounded text-xs font-medium cursor-pointer"
              >
                确定
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
              确定要删除{deleteConfirm.type === 'category' ? '分类' : '评分项'}「
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

export default QualityScoreItemWorkbench;
