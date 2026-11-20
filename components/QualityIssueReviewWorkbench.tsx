import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  ArrowLeft,
  UserCheck,
} from 'lucide-react';
import { QualityResultRecord } from './qualityResultData';
import SpecialQualityDetailView from './SpecialQualityDetailView';

interface QualityIssueReviewWorkbenchProps {
  records: QualityResultRecord[];
  onSubmitRuleReview: (
    recordId: string,
    payload: {
      ruleId: string;
      decision: '通过' | '驳回';
      reviewScore: number;
      reason: string;
    }
  ) => void;
}

const QualityIssueReviewWorkbench: React.FC<QualityIssueReviewWorkbenchProps> = ({
  records,
  onSubmitRuleReview,
}) => {
  const [activeTab, setActiveTab] = useState<'待复核' | '已复核'>('待复核');
  const [detailState, setDetailState] = useState<{
    recordId: string;
    mode: 'issue_review' | 'issue_review_readonly';
  } | null>(null);

  // 待复核 Tab 筛选条件与分页
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
  const [pendingPage, setPendingPage] = useState<number>(1);
  const [pendingPageSize, setPendingPageSize] = useState<number>(10);
  const [pendingJumpInput, setPendingJumpInput] = useState<string>('1');

  // 已复核 Tab 筛选条件与分页
  const [isDoneSearchExpanded, setIsDoneSearchExpanded] = useState<boolean>(true);
  const [dSerialNo, setDSerialNo] = useState<string>('');
  const [dAppellant, setDAppellant] = useState<string>('');
  const [dAppealStart, setDAppealStart] = useState<string>('');
  const [dAppealEnd, setDAppealEnd] = useState<string>('');
  const [dReviewer, setDReviewer] = useState<string>('');
  const [dDecisionStatus, setDDecisionStatus] = useState<string>('');
  const [dReviewStart, setDReviewStart] = useState<string>('');
  const [dReviewEnd, setDReviewEnd] = useState<string>('');
  const [appliedDoneFilters, setAppliedDoneFilters] = useState({
    serialNo: '',
    appellant: '',
    appealStart: '',
    appealEnd: '',
    reviewer: '',
    decisionStatus: '',
    reviewStart: '',
    reviewEnd: '',
  });
  const [donePage, setDonePage] = useState<number>(1);
  const [donePageSize, setDonePageSize] = useState<number>(10);
  const [doneJumpInput, setDoneJumpInput] = useState<string>('1');

  // Toast
  const [toastText, setToastText] = useState<string | null>(null);
  useEffect(() => {
    if (!toastText) return;
    const t = setTimeout(() => setToastText(null), 2600);
    return () => clearTimeout(t);
  }, [toastText]);

  // Split records into 待复核 vs 已复核
  const allPendingReviewRecords = useMemo(
    () =>
      records.filter(
        r => r.distributionStatus === '已分发' && r.status === '已申诉未复核'
      ),
    [records]
  );

  const allDoneReviewRecords = useMemo(
    () =>
      records.filter(
        r => r.status === '已申诉已通过' || r.status === '已申诉已驳回'
      ),
    [records]
  );

  // Filtered 待复核
  const filteredPending = useMemo(() => {
    return allPendingReviewRecords.filter(r => {
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
      const appealDate = r.appealTime ? r.appealTime.slice(0, 10) : '';
      if (f.appealStart && (!appealDate || appealDate < f.appealStart)) return false;
      if (f.appealEnd && (!appealDate || appealDate > f.appealEnd)) return false;

      return true;
    });
  }, [allPendingReviewRecords, appliedPendingFilters]);

  const pendingTotalCount = filteredPending.length;
  const pendingTotalPages = Math.max(1, Math.ceil(pendingTotalCount / pendingPageSize));
  const safePendingPage = Math.min(pendingPage, pendingTotalPages);
  const pagedPending = useMemo(() => {
    const start = (safePendingPage - 1) * pendingPageSize;
    return filteredPending.slice(start, start + pendingPageSize);
  }, [filteredPending, safePendingPage, pendingPageSize]);

  // Filtered 已复核
  const filteredDone = useMemo(() => {
    return allDoneReviewRecords.filter(r => {
      const f = appliedDoneFilters;
      if (f.serialNo && !r.serialNo.toLowerCase().includes(f.serialNo.toLowerCase())) {
        return false;
      }
      if (f.appellant && !r.appellant.toLowerCase().includes(f.appellant.toLowerCase())) {
        return false;
      }
      const appealDate = r.appealTime ? r.appealTime.slice(0, 10) : '';
      if (f.appealStart && (!appealDate || appealDate < f.appealStart)) return false;
      if (f.appealEnd && (!appealDate || appealDate > f.appealEnd)) return false;

      if (f.reviewer && !r.reviewer.toLowerCase().includes(f.reviewer.toLowerCase())) {
        return false;
      }
      const displayStatus = r.status === '已申诉已通过' ? '已通过' : '已驳回';
      if (f.decisionStatus && displayStatus !== f.decisionStatus) return false;

      const reviewDate = r.reviewTime ? r.reviewTime.slice(0, 10) : '';
      if (f.reviewStart && (!reviewDate || reviewDate < f.reviewStart)) return false;
      if (f.reviewEnd && (!reviewDate || reviewDate > f.reviewEnd)) return false;

      return true;
    });
  }, [allDoneReviewRecords, appliedDoneFilters]);

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
      reviewer: dReviewer.trim(),
      decisionStatus: dDecisionStatus,
      reviewStart: dReviewStart,
      reviewEnd: dReviewEnd,
    });
    setDonePage(1);
    setDoneJumpInput('1');
  };

  const handleDoneReset = () => {
    setDSerialNo('');
    setDAppellant('');
    setDAppealStart('');
    setDAppealEnd('');
    setDReviewer('');
    setDDecisionStatus('');
    setDReviewStart('');
    setDReviewEnd('');
    setAppliedDoneFilters({
      serialNo: '',
      appellant: '',
      appealStart: '',
      appealEnd: '',
      reviewer: '',
      decisionStatus: '',
      reviewStart: '',
      reviewEnd: '',
    });
    setDonePage(1);
    setDoneJumpInput('1');
  };

  const detailRecord = useMemo(
    () => (detailState ? records.find(r => r.id === detailState.recordId) || null : null),
    [records, detailState]
  );

  // ============================================================================
  // 复核页面 / 已复核详情查看页面
  // ============================================================================
  if (detailState && detailRecord) {
    const isReadonly =
      detailState.mode === 'issue_review_readonly' ||
      detailRecord.status === '已申诉已通过' ||
      detailRecord.status === '已申诉已驳回';

    const pendingRulesCount = detailRecord.sessionDetail.ruleResults.filter(
      r => r.appealStatus === '已申诉'
    ).length;

    const statusBadgeText =
      detailRecord.status === '已申诉已通过'
        ? '已通过'
        : detailRecord.status === '已申诉已驳回'
        ? '已驳回'
        : '待复核';

    return (
      <div className="h-full w-full flex flex-col bg-[#f2f4f8] overflow-hidden relative">
        {toastText && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg text-xs flex items-center space-x-2 border border-slate-700">
            <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
            <span>{toastText}</span>
          </div>
        )}

        {/* Top Review Status Banner */}
        <div className="bg-[#f0f7ff] border-b border-[#bae0ff] px-5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <button
              type="button"
              onClick={() => setDetailState(null)}
              className="inline-flex items-center space-x-1 text-[#1677ff] hover:underline font-medium cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>返回问题复核</span>
            </button>
            <span className="text-slate-300">|</span>
            <span>
              复核状态：
              <strong
                className={`ml-1 ${
                  statusBadgeText === '已通过'
                    ? 'text-emerald-700'
                    : statusBadgeText === '已驳回'
                    ? 'text-rose-600'
                    : 'text-amber-700'
                }`}
              >
                {statusBadgeText}
              </strong>
              {!isReadonly && pendingRulesCount > 0 && (
                <span className="ml-1.5 text-[11px] text-amber-700">
                  （尚有 {pendingRulesCount} 项「已申诉」规则待复核）
                </span>
              )}
            </span>
            <span className="text-slate-600">
              申诉人：<strong className="text-slate-800">{detailRecord.appellant}</strong>（
              {detailRecord.appealTime}）
            </span>
            <span className="text-slate-600">
              分发人：<strong className="text-slate-800">{detailRecord.distributor || '-'}</strong>
              {detailRecord.distributedAt ? `（${detailRecord.distributedAt}）` : ''}
            </span>
            <span className="text-slate-600">
              复核质检员：<strong className="text-slate-800">{detailRecord.reviewer || '陈明'}</strong>
              {detailRecord.reviewTime ? `（${detailRecord.reviewTime}）` : ''}
            </span>
          </div>

          <div className="text-[11.5px] text-slate-600 truncate max-w-xl" title={detailRecord.reviewComment || detailRecord.appealReason}>
            {detailRecord.reviewComment
              ? `复核结果说明：${detailRecord.reviewComment}`
              : `申诉理由：${detailRecord.appealReason}`}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <SpecialQualityDetailView
            task={detailRecord.taskSnapshot}
            session={detailRecord.sessionDetail}
            onBackToSessions={() => setDetailState(null)}
            backButtonLabel="返回问题复核"
            compactAudioZone={true}
            detailMode={isReadonly ? 'issue_review_readonly' : 'issue_review'}
            appealHistory={detailRecord.appealHistory}
            reviewHistory={detailRecord.reviewHistory}
            onSubmitRuleReview={payload => {
              onSubmitRuleReview(detailRecord.id, payload);
              setToastText(
                `已提交规则复核（${payload.decision}，复核分 ${payload.reviewScore} 分）`
              );
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex bg-[#f2f4f8] overflow-hidden select-none relative">
      {/* Toast */}
      {toastText && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg text-xs flex items-center space-x-2 border border-slate-700">
          <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
          <span>{toastText}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col bg-white m-2.5 rounded-sm shadow-xs border border-slate-200/80 overflow-hidden min-w-0">
        {/* Top Header + Tabs */}
        <div className="px-5 pt-3 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-3">
              <h1 className="text-[15px] font-bold text-slate-800">问题复核</h1>
              <span className="text-xs text-slate-400">
                质检员收到分发的质检任务后，可在问题复核页面查看并完成人工复核
              </span>
            </div>
          </div>

          {/* Tabs: 待复核 / 已复核 */}
          <div className="flex items-center space-x-6 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('待复核')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === '待复核'
                  ? 'border-[#1677ff] text-[#1677ff] font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>待复核</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
                  activeTab === '待复核'
                    ? 'bg-blue-50 text-[#1677ff]'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {allPendingReviewRecords.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('已复核')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === '已复核'
                  ? 'border-[#1677ff] text-[#1677ff] font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>已复核</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
                  activeTab === '已复核'
                    ? 'bg-blue-50 text-[#1677ff]'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {allDoneReviewRecords.length}
              </span>
            </button>
          </div>
        </div>

        {/* ====================================================================
         * Tab 1: 待复核
         * ==================================================================== */}
        {activeTab === '待复核' && (
          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            {/* Search Card */}
            <div className="bg-[#f9fafc] border border-slate-100 rounded-md px-5 py-4 mb-4 flex-shrink-0">
              {isPendingSearchExpanded ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-y-2.5 gap-x-5">
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
                        className="w-32 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                      />
                      <span className="text-xs text-slate-400">至</span>
                      <input
                        type="date"
                        value={pCallEnd}
                        onChange={e => setPCallEnd(e.target.value)}
                        className="w-32 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
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
                        placeholder="最低"
                        className="w-16 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] tabular-nums"
                      />
                      <span className="text-xs text-slate-400">~</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={pMaxScore}
                        onChange={e => setPMaxScore(e.target.value)}
                        placeholder="最高"
                        className="w-16 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] tabular-nums"
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
                        className="w-32 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                      />
                      <span className="text-xs text-slate-400">至</span>
                      <input
                        type="date"
                        value={pAppealEnd}
                        onChange={e => setPAppealEnd(e.target.value)}
                        className="w-32 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handlePendingSearch}
                      className="h-8 px-5 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors cursor-pointer shadow-2xs"
                    >
                      查询
                    </button>
                    <button
                      type="button"
                      onClick={handlePendingReset}
                      className="h-8 px-5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-medium rounded transition-colors cursor-pointer"
                    >
                      重置
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPendingSearchExpanded(false)}
                      className="flex items-center space-x-0.5 text-xs text-[#1677ff] hover:underline pl-1 cursor-pointer"
                    >
                      <span>收起</span>
                      <ChevronUp size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>已收起查询条件（共 {pendingTotalCount} 条待复核任务）</span>
                  <button
                    type="button"
                    onClick={() => setIsPendingSearchExpanded(true)}
                    className="flex items-center space-x-0.5 text-xs text-[#1677ff] hover:underline cursor-pointer"
                  >
                    <span>展开查询条件</span>
                    <ChevronDown size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* 待复核 Table */}
            <div className="flex-1 overflow-auto border-x border-t border-slate-100 rounded-t-sm custom-scrollbar">
              <table className="w-full border-collapse text-left min-w-[920px]">
                <thead className="sticky top-0 z-10 bg-[#dbe7fb] text-slate-700 text-xs font-semibold">
                  <tr>
                    <th className="py-2.5 px-4 text-center border-r border-white">流水号</th>
                    <th className="py-2.5 px-4 text-center border-r border-white w-[160px]">
                      通话时间
                    </th>
                    <th className="py-2.5 px-4 text-center border-r border-white w-[90px]">
                      评分
                    </th>
                    <th className="py-2.5 px-4 text-center border-r border-white w-[160px]">
                      申诉时间
                    </th>
                    <th className="py-2.5 px-4 text-center border-r border-white w-[110px]">
                      申诉人
                    </th>
                    <th className="py-2.5 px-4 text-center border-r border-white w-[160px]">
                      分发时间
                    </th>
                    <th className="py-2.5 px-4 text-center w-[100px]">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[12.5px] text-slate-700 bg-white">
                  {pagedPending.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400 text-xs">
                        暂无待复核的问题录音任务
                      </td>
                    </tr>
                  ) : (
                    pagedPending.map(rec => (
                      <tr key={rec.id} className="hover:bg-[#f5f8ff] transition-colors">
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-700">
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
                          {rec.distributedAt || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setDetailState({ recordId: rec.id, mode: 'issue_review' })
                            }
                            className="text-[#1677ff] hover:text-blue-700 hover:underline cursor-pointer inline-flex items-center space-x-1 text-xs font-medium"
                          >
                            <ClipboardCheck size={13} />
                            <span>复核</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 待复核 Pagination */}
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
        )}

        {/* ====================================================================
         * Tab 2: 已复核
         * ==================================================================== */}
        {activeTab === '已复核' && (
          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            {/* Search Card */}
            <div className="bg-[#f9fafc] border border-slate-100 rounded-md px-5 py-4 mb-4 flex-shrink-0">
              {isDoneSearchExpanded ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-y-2.5 gap-x-5">
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
                        className="w-32 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                      />
                      <span className="text-xs text-slate-400">至</span>
                      <input
                        type="date"
                        value={dAppealEnd}
                        onChange={e => setDAppealEnd(e.target.value)}
                        className="w-32 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                        复核人
                      </label>
                      <input
                        type="text"
                        value={dReviewer}
                        onChange={e => setDReviewer(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleDoneSearch()}
                        placeholder="请输入复核人"
                        className="w-32 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#1677ff]"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                        复核结果
                      </label>
                      <select
                        value={dDecisionStatus}
                        onChange={e => setDDecisionStatus(e.target.value)}
                        className="w-28 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] cursor-pointer"
                      >
                        <option value="">全部</option>
                        <option value="已通过">已通过</option>
                        <option value="已驳回">已驳回</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                        复核时间
                      </label>
                      <input
                        type="date"
                        value={dReviewStart}
                        onChange={e => setDReviewStart(e.target.value)}
                        className="w-32 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                      />
                      <span className="text-xs text-slate-400">至</span>
                      <input
                        type="date"
                        value={dReviewEnd}
                        onChange={e => setDReviewEnd(e.target.value)}
                        className="w-32 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handleDoneSearch}
                      className="h-8 px-5 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors cursor-pointer shadow-2xs"
                    >
                      查询
                    </button>
                    <button
                      type="button"
                      onClick={handleDoneReset}
                      className="h-8 px-5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-medium rounded transition-colors cursor-pointer"
                    >
                      重置
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDoneSearchExpanded(false)}
                      className="flex items-center space-x-0.5 text-xs text-[#1677ff] hover:underline pl-1 cursor-pointer"
                    >
                      <span>收起</span>
                      <ChevronUp size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>已收起查询条件（共 {doneTotalCount} 条已复核记录）</span>
                  <button
                    type="button"
                    onClick={() => setIsDoneSearchExpanded(true)}
                    className="flex items-center space-x-0.5 text-xs text-[#1677ff] hover:underline cursor-pointer"
                  >
                    <span>展开查询条件</span>
                    <ChevronDown size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* 已复核 Table */}
            <div className="flex-1 overflow-auto border-x border-t border-slate-100 rounded-t-sm custom-scrollbar">
              <table className="w-full border-collapse text-left min-w-[1160px]">
                <thead className="sticky top-0 z-10 bg-[#dbe7fb] text-slate-700 text-xs font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 text-center border-r border-white">流水号</th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[150px]">
                      通话时间
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[80px]">
                      评分
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[95px]">
                      状态
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[150px]">
                      申诉时间
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[95px]">
                      申诉人
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[150px]">
                      分发时间
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[150px]">
                      复核时间
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-white w-[100px]">
                      复核人
                    </th>
                    <th className="py-2.5 px-3 text-center w-[90px]">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[12.5px] text-slate-700 bg-white">
                  {pagedDone.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-16 text-center text-slate-400 text-xs">
                        暂无已复核的问题录音记录
                      </td>
                    </tr>
                  ) : (
                    pagedDone.map(rec => {
                      const displayStatus = rec.status === '已申诉已通过' ? '已通过' : '已驳回';
                      return (
                        <tr key={rec.id} className="hover:bg-[#f5f8ff] transition-colors">
                          <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-700">
                            {rec.serialNo}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-600 tabular-nums">
                            {rec.callTime}
                          </td>
                          <td className="py-3.5 px-3 text-center">
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
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                displayStatus === '已通过'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-600 border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  displayStatus === '已通过' ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                              />
                              {displayStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-600 tabular-nums">
                            {rec.appealTime}
                          </td>
                          <td className="py-3.5 px-3 text-center text-xs font-medium text-slate-700">
                            {rec.appellant}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-600 tabular-nums">
                            {rec.distributedAt || '-'}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-600 tabular-nums">
                            {rec.reviewTime || '-'}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-blue-50 text-[#1677ff] border border-blue-200 rounded text-xs font-medium">
                              <UserCheck size={11} />
                              <span>{rec.reviewer}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setDetailState({
                                  recordId: rec.id,
                                  mode: 'issue_review_readonly',
                                })
                              }
                              className="text-[#1677ff] hover:text-blue-700 hover:underline cursor-pointer inline-flex items-center space-x-1 text-xs font-medium"
                            >
                              <Eye size={13} />
                              <span>查看</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 已复核 Pagination */}
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
    </div>
  );
};

export default QualityIssueReviewWorkbench;
