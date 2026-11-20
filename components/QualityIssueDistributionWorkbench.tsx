import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Send,
  Users,
  UserCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  QualityResultRecord,
  QUALITY_INSPECTORS,
} from './qualityResultData';

interface QualityIssueDistributionWorkbenchProps {
  records: QualityResultRecord[];
  onDistribute: (recordIds: string[], inspectorName: string) => void;
}

const QualityIssueDistributionWorkbench: React.FC<QualityIssueDistributionWorkbenchProps> = ({
  records,
  onDistribute,
}) => {
  const [activeTab, setActiveTab] = useState<'待分发' | '已分发'>('待分发');

  // Pending tab filters & pagination
  const [isPendingSearchExpanded, setIsPendingSearchExpanded] = useState<boolean>(true);
  const [pSerialNo, setPSerialNo] = useState<string>('');
  const [pCallStart, setPCallStart] = useState<string>('');
  const [pCallEnd, setPCallEnd] = useState<string>('');
  const [pMinScore, setPMinScore] = useState<string>('');
  const [pMaxScore, setPMaxScore] = useState<string>('');
  const [pAppellant, setPAppellant] = useState<string>('');
  const [pAppealStart, setPAppealStart] = useState<string>('');
  const [pAppealEnd, setPAppealEnd] = useState<string>('');
  const [appliedPendingFilters, setAppliedPendingFilters] = useState({
    serialNo: '',
    callStart: '',
    callEnd: '',
    minScore: '',
    maxScore: '',
    appellant: '',
    appealStart: '',
    appealEnd: '',
  });
  const [pendingSelectedIds, setPendingSelectedIds] = useState<string[]>([]);
  const [pendingPage, setPendingPage] = useState<number>(1);
  const [pendingPageSize, setPendingPageSize] = useState<number>(10);
  const [pendingJumpInput, setPendingJumpInput] = useState<string>('1');

  // Distributed tab filters & pagination
  const [isDoneSearchExpanded, setIsDoneSearchExpanded] = useState<boolean>(true);
  const [dSerialNo, setDSerialNo] = useState<string>('');
  const [dAppellant, setDAppellant] = useState<string>('');
  const [dAppealStart, setDAppealStart] = useState<string>('');
  const [dAppealEnd, setDAppealEnd] = useState<string>('');
  const [dDistributor, setDDistributor] = useState<string>('');
  const [dDistStart, setDDistStart] = useState<string>('');
  const [dDistEnd, setDDistEnd] = useState<string>('');
  const [appliedDoneFilters, setAppliedDoneFilters] = useState({
    serialNo: '',
    appellant: '',
    appealStart: '',
    appealEnd: '',
    distributor: '',
    distStart: '',
    distEnd: '',
  });
  const [donePage, setDonePage] = useState<number>(1);
  const [donePageSize, setDonePageSize] = useState<number>(10);
  const [doneJumpInput, setDoneJumpInput] = useState<string>('1');

  // Inspector picker modal state
  const [assignModal, setAssignModal] = useState<{
    open: boolean;
    targetIds: string[];
    searchQuery: string;
    selectedInspectorId: string;
  }>({
    open: false,
    targetIds: [],
    searchQuery: '',
    selectedInspectorId: QUALITY_INSPECTORS[0]?.id || '',
  });

  // Toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
  };
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // Split records by distribution status (exclude 未申诉)
  const allPendingRecords = useMemo(
    () => records.filter(r => r.status !== '未申诉' && r.distributionStatus === '待分发'),
    [records]
  );
  const allDistributedRecords = useMemo(
    () => records.filter(r => r.status !== '未申诉' && r.distributionStatus === '已分发'),
    [records]
  );

  // Filtered pending records
  const filteredPending = useMemo(() => {
    return allPendingRecords.filter(r => {
      const f = appliedPendingFilters;
      if (f.serialNo && !r.serialNo.toLowerCase().includes(f.serialNo.toLowerCase())) {
        return false;
      }
      const callDate = r.callTime.slice(0, 10);
      if (f.callStart && callDate < f.callStart) return false;
      if (f.callEnd && callDate > f.callEnd) return false;

      if (f.minScore !== '') {
        const min = Number(f.minScore);
        if (!isNaN(min) && r.machineScore < min) return false;
      }
      if (f.maxScore !== '') {
        const max = Number(f.maxScore);
        if (!isNaN(max) && r.machineScore > max) return false;
      }

      if (f.appellant && !r.appellant.toLowerCase().includes(f.appellant.toLowerCase())) {
        return false;
      }
      const appealDate = r.appealTime.slice(0, 10);
      if (f.appealStart && appealDate < f.appealStart) return false;
      if (f.appealEnd && appealDate > f.appealEnd) return false;

      return true;
    });
  }, [allPendingRecords, appliedPendingFilters]);

  const pendingTotalCount = filteredPending.length;
  const pendingTotalPages = Math.max(1, Math.ceil(pendingTotalCount / pendingPageSize));
  const safePendingPage = Math.min(pendingPage, pendingTotalPages);
  const pagedPending = useMemo(() => {
    const start = (safePendingPage - 1) * pendingPageSize;
    return filteredPending.slice(start, start + pendingPageSize);
  }, [filteredPending, safePendingPage, pendingPageSize]);

  const allPendingPageChecked =
    pagedPending.length > 0 && pagedPending.every(r => pendingSelectedIds.includes(r.id));

  const handleToggleSelectAllPending = () => {
    if (allPendingPageChecked) {
      const pageSet = new Set(pagedPending.map(r => r.id));
      setPendingSelectedIds(prev => prev.filter(id => !pageSet.has(id)));
    } else {
      const merged = new Set([...pendingSelectedIds, ...pagedPending.map(r => r.id)]);
      setPendingSelectedIds(Array.from(merged));
    }
  };

  const handleToggleRowPending = (id: string) => {
    setPendingSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filtered distributed records
  const filteredDone = useMemo(() => {
    return allDistributedRecords.filter(r => {
      const f = appliedDoneFilters;
      if (f.serialNo && !r.serialNo.toLowerCase().includes(f.serialNo.toLowerCase())) {
        return false;
      }
      if (f.appellant && !r.appellant.toLowerCase().includes(f.appellant.toLowerCase())) {
        return false;
      }
      const appealDate = r.appealTime.slice(0, 10);
      if (f.appealStart && appealDate < f.appealStart) return false;
      if (f.appealEnd && appealDate > f.appealEnd) return false;

      if (f.distributor && !r.distributor.toLowerCase().includes(f.distributor.toLowerCase())) {
        return false;
      }
      const distDate = r.distributedAt ? r.distributedAt.slice(0, 10) : '';
      if (f.distStart && (!distDate || distDate < f.distStart)) return false;
      if (f.distEnd && (!distDate || distDate > f.distEnd)) return false;

      return true;
    });
  }, [allDistributedRecords, appliedDoneFilters]);

  const doneTotalCount = filteredDone.length;
  const doneTotalPages = Math.max(1, Math.ceil(doneTotalCount / donePageSize));
  const safeDonePage = Math.min(donePage, doneTotalPages);
  const pagedDone = useMemo(() => {
    const start = (safeDonePage - 1) * donePageSize;
    return filteredDone.slice(start, start + donePageSize);
  }, [filteredDone, safeDonePage, donePageSize]);

  // Handlers
  const handlePendingSearch = () => {
    setAppliedPendingFilters({
      serialNo: pSerialNo.trim(),
      callStart: pCallStart,
      callEnd: pCallEnd,
      minScore: pMinScore.trim(),
      maxScore: pMaxScore.trim(),
      appellant: pAppellant.trim(),
      appealStart: pAppealStart,
      appealEnd: pAppealEnd,
    });
    setPendingPage(1);
    setPendingJumpInput('1');
  };

  const handlePendingReset = () => {
    setPSerialNo('');
    setPCallStart('');
    setPCallEnd('');
    setPMinScore('');
    setPMaxScore('');
    setPAppellant('');
    setPAppealStart('');
    setPAppealEnd('');
    setAppliedPendingFilters({
      serialNo: '',
      callStart: '',
      callEnd: '',
      minScore: '',
      maxScore: '',
      appellant: '',
      appealStart: '',
      appealEnd: '',
    });
    setPendingPage(1);
    setPendingJumpInput('1');
  };

  const handleDoneSearch = () => {
    setAppliedDoneFilters({
      serialNo: dSerialNo.trim(),
      appellant: dAppellant.trim(),
      appealStart: dAppealStart,
      appealEnd: dAppealEnd,
      distributor: dDistributor.trim(),
      distStart: dDistStart,
      distEnd: dDistEnd,
    });
    setDonePage(1);
    setDoneJumpInput('1');
  };

  const handleDoneReset = () => {
    setDSerialNo('');
    setDAppellant('');
    setDAppealStart('');
    setDAppealEnd('');
    setDDistributor('');
    setDDistStart('');
    setDDistEnd('');
    setAppliedDoneFilters({
      serialNo: '',
      appellant: '',
      appealStart: '',
      appealEnd: '',
      distributor: '',
      distStart: '',
      distEnd: '',
    });
    setDonePage(1);
    setDoneJumpInput('1');
  };

  const handleOpenAssignModal = (ids: string[]) => {
    if (ids.length === 0) {
      showToast('请先勾选至少一条待分发的申诉问题录音', 'error');
      return;
    }
    setAssignModal({
      open: true,
      targetIds: ids,
      searchQuery: '',
      selectedInspectorId: QUALITY_INSPECTORS[0]?.id || '',
    });
  };

  const filteredInspectors = useMemo(() => {
    const q = assignModal.searchQuery.trim().toLowerCase();
    if (!q) return QUALITY_INSPECTORS;
    return QUALITY_INSPECTORS.filter(
      insp =>
        insp.name.toLowerCase().includes(q) ||
        insp.employeeNo.toLowerCase().includes(q) ||
        insp.specialty.toLowerCase().includes(q)
    );
  }, [assignModal.searchQuery]);

  const handleConfirmAssign = () => {
    const chosen = QUALITY_INSPECTORS.find(i => i.id === assignModal.selectedInspectorId);
    if (!chosen) {
      showToast('请选择一位质检员进行复核指派', 'error');
      return;
    }

    onDistribute(assignModal.targetIds, chosen.name);
    setPendingSelectedIds(prev => prev.filter(id => !assignModal.targetIds.includes(id)));
    setAssignModal(prev => ({ ...prev, open: false }));
    showToast(
      `已成功将 ${assignModal.targetIds.length} 条申诉问题录音分发给质检员「${chosen.name}」复核`
    );
  };

  return (
    <div className="h-full w-full flex bg-[#f2f4f8] overflow-hidden select-none relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg text-xs flex items-center space-x-2 border border-slate-700">
          {toast.type === 'error' ? (
            <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col bg-white m-2.5 rounded-sm shadow-xs border border-slate-200/80 overflow-hidden min-w-0">
        {/* Top Header + Tabs */}
        <div className="px-5 pt-3 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-3">
              <h1 className="text-[15px] font-bold text-slate-800">问题分发</h1>
              <span className="text-xs text-slate-400">
                质检组长收到坐席申诉的问题录音，可将问题录音指派给质检员进行人工复核
              </span>
            </div>
          </div>

          {/* Tabs: 待分发 / 已分发 */}
          <div className="flex items-center space-x-6 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('待分发')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === '待分发'
                  ? 'border-[#1677ff] text-[#1677ff] font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>待分发</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
                  activeTab === '待分发'
                    ? 'bg-blue-50 text-[#1677ff]'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {allPendingRecords.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('已分发')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === '已分发'
                  ? 'border-[#1677ff] text-[#1677ff] font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>已分发</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
                  activeTab === '已分发'
                    ? 'bg-blue-50 text-[#1677ff]'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {allDistributedRecords.length}
              </span>
            </button>
          </div>
        </div>

        {/* ====================================================================
         * TAB 1: 待分发
         * ==================================================================== */}
        {activeTab === '待分发' ? (
          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            {/* Pending Query Bar */}
            <div className="bg-[#f9fafc] border border-slate-100 rounded-md px-5 py-4 mb-4 flex-shrink-0">
              {isPendingSearchExpanded ? (
                <div className="flex flex-wrap items-center gap-y-3 gap-x-5">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      流水号
                    </label>
                    <input
                      type="text"
                      value={pSerialNo}
                      onChange={e => setPSerialNo(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handlePendingSearch()}
                      placeholder="请输入流水号"
                      className="w-44 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#1677ff]"
                    />
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      通话时间
                    </label>
                    <input
                      type="date"
                      value={pCallStart}
                      onChange={e => setPCallStart(e.target.value)}
                      className="w-34 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                    />
                    <span className="text-xs text-slate-400">至</span>
                    <input
                      type="date"
                      value={pCallEnd}
                      onChange={e => setPCallEnd(e.target.value)}
                      className="w-34 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                    />
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      评分
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={pMinScore}
                      onChange={e => setPMinScore(e.target.value)}
                      placeholder="最低分"
                      className="w-20 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] tabular-nums"
                    />
                    <span className="text-xs text-slate-400">~</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={pMaxScore}
                      onChange={e => setPMaxScore(e.target.value)}
                      placeholder="最高分"
                      className="w-20 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] tabular-nums"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      申诉人
                    </label>
                    <input
                      type="text"
                      value={pAppellant}
                      onChange={e => setPAppellant(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handlePendingSearch()}
                      placeholder="请输入申诉人"
                      className="w-32 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#1677ff]"
                    />
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      申诉时间
                    </label>
                    <input
                      type="date"
                      value={pAppealStart}
                      onChange={e => setPAppealStart(e.target.value)}
                      className="w-34 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                    />
                    <span className="text-xs text-slate-400">至</span>
                    <input
                      type="date"
                      value={pAppealEnd}
                      onChange={e => setPAppealEnd(e.target.value)}
                      className="w-34 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                    />
                  </div>

                  <div className="flex items-center space-x-2 ml-auto">
                    <button
                      type="button"
                      onClick={handlePendingSearch}
                      className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors cursor-pointer shadow-2xs"
                    >
                      查询
                    </button>
                    <button
                      type="button"
                      onClick={handlePendingReset}
                      className="h-8 px-4 bg-white hover:bg-blue-50 text-[#1677ff] border border-[#1677ff] text-xs font-medium rounded transition-colors cursor-pointer"
                    >
                      重置
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPendingSearchExpanded(false)}
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
                    已折叠查询条件栏（可按流水号、通话时间、评分、申诉人、申诉时间筛选）
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPendingSearchExpanded(true)}
                    className="text-xs text-[#1677ff] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <ChevronDown size={14} />
                    <span>展开查询</span>
                  </button>
                </div>
              )}
            </div>

            {/* Action Toolbar Row: 批量分发 */}
            <div className="flex items-center space-x-3 mb-3.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => handleOpenAssignModal(pendingSelectedIds)}
                className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors cursor-pointer shadow-2xs flex items-center space-x-1.5"
              >
                <Users size={14} />
                <span>
                  批量分发{pendingSelectedIds.length > 0 ? ` (${pendingSelectedIds.length})` : ''}
                </span>
              </button>
              <span className="text-xs text-slate-400">
                勾选多条待复核问题录音可点击「批量分发」统一指派给指定质检员
              </span>
            </div>

            {/* Pending Table */}
            <div className="flex-1 overflow-auto border border-slate-100 rounded-t-sm custom-scrollbar">
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 z-10 bg-[#dbe7fb] text-slate-700 text-xs font-semibold select-none">
                  <tr>
                    <th className="w-11 py-2.5 text-center border-r border-white">
                      <input
                        type="checkbox"
                        checked={allPendingPageChecked}
                        onChange={handleToggleSelectAllPending}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-[#1677ff] accent-[#1677ff] cursor-pointer"
                      />
                    </th>
                    <th className="py-2.5 px-4 text-center border-r border-white min-w-[230px]">
                      流水号
                    </th>
                    <th className="py-2.5 px-4 text-center border-r border-white w-[170px]">
                      通话时间
                    </th>
                    <th className="py-2.5 px-4 text-center border-r border-white w-[110px]">
                      评分
                    </th>
                    <th className="py-2.5 px-4 text-center border-r border-white w-[170px]">
                      申诉时间
                    </th>
                    <th className="py-2.5 px-4 text-center border-r border-white w-[120px]">
                      申诉人
                    </th>
                    <th className="py-2.5 px-4 text-center w-[120px]">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[12.5px] text-slate-700 bg-white">
                  {pagedPending.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400 text-xs">
                        暂无待分发的申诉问题录音
                      </td>
                    </tr>
                  ) : (
                    pagedPending.map(rec => {
                      const checked = pendingSelectedIds.includes(rec.id);
                      return (
                        <tr
                          key={rec.id}
                          className={`hover:bg-[#f5f8ff] transition-colors ${
                            checked ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <td className="py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleRowPending(rec.id)}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-[#1677ff] accent-[#1677ff] cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-800">
                            {rec.serialNo}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-600 tabular-nums">
                            {rec.callTime}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-xs font-semibold border tabular-nums ${
                                rec.machineScore >= 80
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : rec.machineScore >= 60
                                  ? 'bg-blue-50 text-[#1677ff] border-blue-200'
                                  : 'bg-rose-50 text-rose-600 border-rose-200'
                              }`}
                            >
                              {rec.machineScore} 分
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-600 tabular-nums">
                            {rec.appealTime}
                          </td>
                          <td className="py-3.5 px-4 text-center text-xs font-medium text-slate-700">
                            {rec.appellant}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleOpenAssignModal([rec.id])}
                              className="text-[#1677ff] hover:text-blue-700 hover:underline cursor-pointer inline-flex items-center space-x-1 text-xs font-medium"
                            >
                              <Send size={12} />
                              <span>分发</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pending Pagination */}
            <div className="h-11 bg-[#efefef] px-4 flex items-center justify-end space-x-3 text-xs text-slate-600 flex-shrink-0 rounded-b-sm">
              <span className="tabular-nums">共 {pendingTotalCount} 条</span>
              <select
                value={pendingPageSize}
                onChange={e => {
                  setPendingPageSize(Number(e.target.value));
                  setPendingPage(1);
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
                  disabled={safePendingPage <= 1}
                  onClick={() => setPendingPage(p => Math.max(1, p - 1))}
                  className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 rounded text-slate-500 hover:border-[#1677ff] hover:text-[#1677ff] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: pendingTotalPages }, (_, idx) => idx + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPendingPage(pageNum)}
                    className={`min-w-[28px] h-7 px-1.5 flex items-center justify-center rounded text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                      safePendingPage === pageNum
                        ? 'bg-[#1677ff] text-white border border-[#1677ff]'
                        : 'bg-white text-slate-600 border border-slate-300 hover:border-[#1677ff] hover:text-[#1677ff]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safePendingPage >= pendingTotalPages}
                  onClick={() => setPendingPage(p => Math.min(pendingTotalPages, p + 1))}
                  className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 rounded text-slate-500 hover:border-[#1677ff] hover:text-[#1677ff] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="flex items-center space-x-1.5">
                <span>前往</span>
                <input
                  type="text"
                  value={pendingJumpInput}
                  onChange={e => setPendingJumpInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const num = parseInt(pendingJumpInput, 10);
                      if (!isNaN(num)) {
                        const target = Math.min(Math.max(1, num), pendingTotalPages);
                        setPendingPage(target);
                        setPendingJumpInput(String(target));
                      }
                    }
                  }}
                  className="w-11 h-7 text-center bg-white border border-slate-300 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
                />
                <span>页</span>
              </div>
            </div>
          </div>
        ) : (
          /* ==================================================================
           * TAB 2: 已分发
           * ================================================================== */
          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            {/* Distributed Query Bar */}
            <div className="bg-[#f9fafc] border border-slate-100 rounded-md px-5 py-4 mb-4 flex-shrink-0">
              {isDoneSearchExpanded ? (
                <div className="flex flex-wrap items-center gap-y-3 gap-x-5">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      流水号
                    </label>
                    <input
                      type="text"
                      value={dSerialNo}
                      onChange={e => setDSerialNo(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleDoneSearch()}
                      placeholder="请输入流水号"
                      className="w-44 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#1677ff]"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      申诉人
                    </label>
                    <input
                      type="text"
                      value={dAppellant}
                      onChange={e => setDAppellant(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleDoneSearch()}
                      placeholder="请输入申诉人"
                      className="w-32 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#1677ff]"
                    />
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      申诉时间
                    </label>
                    <input
                      type="date"
                      value={dAppealStart}
                      onChange={e => setDAppealStart(e.target.value)}
                      className="w-34 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                    />
                    <span className="text-xs text-slate-400">至</span>
                    <input
                      type="date"
                      value={dAppealEnd}
                      onChange={e => setDAppealEnd(e.target.value)}
                      className="w-34 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      分发人
                    </label>
                    <input
                      type="text"
                      value={dDistributor}
                      onChange={e => setDDistributor(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleDoneSearch()}
                      placeholder="请输入分发人"
                      className="w-32 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#1677ff]"
                    />
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      分发时间
                    </label>
                    <input
                      type="date"
                      value={dDistStart}
                      onChange={e => setDDistStart(e.target.value)}
                      className="w-34 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                    />
                    <span className="text-xs text-slate-400">至</span>
                    <input
                      type="date"
                      value={dDistEnd}
                      onChange={e => setDDistEnd(e.target.value)}
                      className="w-34 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                    />
                  </div>

                  <div className="flex items-center space-x-2 ml-auto">
                    <button
                      type="button"
                      onClick={handleDoneSearch}
                      className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors cursor-pointer shadow-2xs"
                    >
                      查询
                    </button>
                    <button
                      type="button"
                      onClick={handleDoneReset}
                      className="h-8 px-4 bg-white hover:bg-blue-50 text-[#1677ff] border border-[#1677ff] text-xs font-medium rounded transition-colors cursor-pointer"
                    >
                      重置
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDoneSearchExpanded(false)}
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
                    已折叠查询条件栏（可按流水号、申诉人、申诉时间、分发人、分发时间筛选）
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDoneSearchExpanded(true)}
                    className="text-xs text-[#1677ff] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <ChevronDown size={14} />
                    <span>展开查询</span>
                  </button>
                </div>
              )}
            </div>

            {/* Distributed Table */}
            <div className="flex-1 overflow-auto border border-slate-100 rounded-t-sm custom-scrollbar">
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 z-10 bg-[#dbe7fb] text-slate-700 text-xs font-semibold select-none">
                  <tr>
                    <th className="py-2.5 px-4 text-center border-r border-white min-w-[220px]">
                      流水号
                    </th>
                    <th className="py-2.5 px-4 text-center border-r border-white w-[160px]">
                      通话时间
                    </th>
                    <th className="py-2.5 px-4 text-center border-r border-white w-[95px]">
                      评分
                    </th>
                    <th className="py-2.5 px-4 text-center border-r border-white w-[160px]">
                      申诉时间
                    </th>
                    <th className="py-2.5 px-4 text-center border-r border-white w-[105px]">
                      申诉人
                    </th>
                    <th className="py-2.5 px-4 text-center border-r border-white w-[160px]">
                      分发时间
                    </th>
                    <th className="py-2.5 px-4 text-center border-r border-white w-[105px]">
                      分发人
                    </th>
                    <th className="py-2.5 px-4 text-center w-[110px]">复核人</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[12.5px] text-slate-700 bg-white">
                  {pagedDone.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-slate-400 text-xs">
                        暂无已分发的申诉问题录音记录
                      </td>
                    </tr>
                  ) : (
                    pagedDone.map(rec => (
                      <tr key={rec.id} className="hover:bg-[#f5f8ff] transition-colors">
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-800">
                          {rec.serialNo}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-600 tabular-nums">
                          {rec.callTime}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-xs font-semibold border tabular-nums ${
                              rec.machineScore >= 80
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : rec.machineScore >= 60
                                ? 'bg-blue-50 text-[#1677ff] border-blue-200'
                                : 'bg-rose-50 text-rose-600 border-rose-200'
                            }`}
                          >
                            {rec.machineScore} 分
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-600 tabular-nums">
                          {rec.appealTime}
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs font-medium text-slate-700">
                          {rec.appellant}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-600 tabular-nums">
                          {rec.distributedAt}
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs text-slate-700">
                          {rec.distributor}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-blue-50 text-[#1677ff] border border-blue-200 rounded text-xs font-medium">
                            <UserCheck size={11} />
                            <span>{rec.reviewer}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Distributed Pagination */}
            <div className="h-11 bg-[#efefef] px-4 flex items-center justify-end space-x-3 text-xs text-slate-600 flex-shrink-0 rounded-b-sm">
              <span className="tabular-nums">共 {doneTotalCount} 条</span>
              <select
                value={donePageSize}
                onChange={e => {
                  setDonePageSize(Number(e.target.value));
                  setDonePage(1);
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
                  disabled={safeDonePage <= 1}
                  onClick={() => setDonePage(p => Math.max(1, p - 1))}
                  className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 rounded text-slate-500 hover:border-[#1677ff] hover:text-[#1677ff] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: doneTotalPages }, (_, idx) => idx + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setDonePage(pageNum)}
                    className={`min-w-[28px] h-7 px-1.5 flex items-center justify-center rounded text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                      safeDonePage === pageNum
                        ? 'bg-[#1677ff] text-white border border-[#1677ff]'
                        : 'bg-white text-slate-600 border border-slate-300 hover:border-[#1677ff] hover:text-[#1677ff]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safeDonePage >= doneTotalPages}
                  onClick={() => setDonePage(p => Math.min(doneTotalPages, p + 1))}
                  className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 rounded text-slate-500 hover:border-[#1677ff] hover:text-[#1677ff] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="flex items-center space-x-1.5">
                <span>前往</span>
                <input
                  type="text"
                  value={doneJumpInput}
                  onChange={e => setDoneJumpInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const num = parseInt(doneJumpInput, 10);
                      if (!isNaN(num)) {
                        const target = Math.min(Math.max(1, num), doneTotalPages);
                        setDonePage(target);
                        setDoneJumpInput(String(target));
                      }
                    }
                  }}
                  className="w-11 h-7 text-center bg-white border border-slate-300 rounded text-xs text-slate-700 tabular-nums focus:outline-none focus:border-[#1677ff]"
                />
                <span>页</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================
       * 选择质检员弹窗（分发 / 批量分发）
       * ======================================================================== */}
      {assignModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl w-[620px] max-w-[94vw] max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="h-12 px-5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <UserCheck size={16} className="text-[#1677ff]" />
                <h3 className="text-sm font-bold text-slate-800">选择复核质检员</h3>
                <span className="text-xs px-2 py-0.5 bg-blue-50 text-[#1677ff] border border-blue-200 rounded">
                  待分发 {assignModal.targetIds.length} 条问题录音
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAssignModal(prev => ({ ...prev, open: false }))}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Inspector */}
            <div className="px-5 py-3 bg-[#f9fafc] border-b border-slate-100 flex items-center space-x-3 flex-shrink-0">
              <div className="relative flex-1">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={assignModal.searchQuery}
                  onChange={e =>
                    setAssignModal(prev => ({ ...prev, searchQuery: e.target.value }))
                  }
                  placeholder="按质检员姓名、工号或擅长业务筛选..."
                  className="w-full h-8 pl-8 pr-3 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-[#1677ff]"
                />
              </div>
            </div>

            {/* Inspector Table */}
            <div className="flex-1 overflow-y-auto px-5 py-3 custom-scrollbar">
              <table className="w-full border-collapse text-left border border-slate-100">
                <thead className="sticky top-0 bg-[#dbe7fb] text-slate-700 text-xs font-semibold">
                  <tr>
                    <th className="w-12 py-2.5 text-center border-r border-white">选择</th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[95px]">工号</th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[100px]">
                      质检员
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white">擅长质检方向</th>
                    <th className="py-2.5 px-3 text-center w-[95px]">当前待复核</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 bg-white">
                  {filteredInspectors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        未找到匹配的质检员
                      </td>
                    </tr>
                  ) : (
                    filteredInspectors.map(insp => {
                      const selected = assignModal.selectedInspectorId === insp.id;
                      return (
                        <tr
                          key={insp.id}
                          onClick={() =>
                            setAssignModal(prev => ({
                              ...prev,
                              selectedInspectorId: insp.id,
                            }))
                          }
                          className={`hover:bg-[#f5f8ff] cursor-pointer transition-colors ${
                            selected ? 'bg-blue-50/70' : ''
                          }`}
                        >
                          <td className="py-3 text-center">
                            <input
                              type="radio"
                              name="pick-inspector"
                              checked={selected}
                              onChange={() =>
                                setAssignModal(prev => ({
                                  ...prev,
                                  selectedInspectorId: insp.id,
                                }))
                              }
                              className="accent-[#1677ff] cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-600">
                            {insp.employeeNo}
                          </td>
                          <td className="py-3 px-3 text-center font-semibold text-slate-800">
                            {insp.name}
                          </td>
                          <td className="py-3 px-3 text-center text-slate-600">
                            {insp.specialty}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-600 tabular-nums">
                            {insp.pendingCount} 条
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="h-12 px-5 border-t border-slate-200 bg-[#f9fafc] flex items-center justify-end space-x-2.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setAssignModal(prev => ({ ...prev, open: false }))}
                className="h-8 px-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 text-xs rounded cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmAssign}
                className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded cursor-pointer"
              >
                确认分发
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityIssueDistributionWorkbench;
