import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Eye,
  Shield,
  UserCheck,
  CheckCircle2,
  X,
  Lock,
  Filter,
  ArrowLeft,
} from 'lucide-react';
import {
  QualityResultRecord,
  CONFIGURABLE_DIMENSION_DEFS,
} from './qualityResultData';
import SpecialQualityDetailView from './SpecialQualityDetailView';

interface QualityGradeQueryWorkbenchProps {
  records: QualityResultRecord[];
  onSubmitAppeal?: (
    recordId: string,
    payload: { items: Array<{ ruleId: string; appealScore: number }>; reason: string },
    appellantName: string
  ) => void;
}

interface GradeQueryFilterState {
  serialNo: string;
  status: string;
  reviewer: string;
  appellant: string;
  minScore: string;
  maxScore: string;
  callStartDate: string;
  callEndDate: string;
  reviewStartDate: string;
  reviewEndDate: string;
  appealStartDate: string;
  appealEndDate: string;
  // Audio & recording metrics
  minDuration: string;
  maxDuration: string;
  minSilence: string;
  maxSilence: string;
  minAvgSpeechRate: string;
  maxAvgSpeechRate: string;
  minAvgVolume: string;
  maxAvgVolume: string;
  minAgentSpeechRate: string;
  maxAgentSpeechRate: string;
  minAgentVolume: string;
  maxAgentVolume: string;
  recordingFileName: string;
  // 随录信息 dimensions
  callDirection: string;
  callerNumber: string;
  calleeNumber: string;
  agentId: string;
  skillGroupName: string;
  hangupParty: string;
  satisfactionRating: string;
  minQueueSec: string;
  maxQueueSec: string;
  isFirstInbound: string;
  callStartDimFrom: string;
  callStartDimTo: string;
}

const EMPTY_GRADE_FILTERS: GradeQueryFilterState = {
  serialNo: '',
  status: '',
  reviewer: '',
  appellant: '',
  minScore: '',
  maxScore: '',
  callStartDate: '',
  callEndDate: '',
  reviewStartDate: '',
  reviewEndDate: '',
  appealStartDate: '',
  appealEndDate: '',
  minDuration: '',
  maxDuration: '',
  minSilence: '',
  maxSilence: '',
  minAvgSpeechRate: '',
  maxAvgSpeechRate: '',
  minAvgVolume: '',
  maxAvgVolume: '',
  minAgentSpeechRate: '',
  maxAgentSpeechRate: '',
  minAgentVolume: '',
  maxAgentVolume: '',
  recordingFileName: '',
  callDirection: '',
  callerNumber: '',
  calleeNumber: '',
  agentId: '',
  skillGroupName: '',
  hangupParty: '',
  satisfactionRating: '',
  minQueueSec: '',
  maxQueueSec: '',
  isFirstInbound: '',
  callStartDimFrom: '',
  callStartDimTo: '',
};

const CURRENT_AGENT_NAME = '张晓雅';
const CURRENT_AGENT_ID = '6028';

const LOCKED_DEFAULT_COLUMNS = [
  '流水号',
  '通话时间',
  '评分',
  '状态',
  '复核时间',
  '复核人',
  '申诉时间',
  '申诉人',
  '操作（悬浮固定）',
];

const QualityGradeQueryWorkbench: React.FC<QualityGradeQueryWorkbenchProps> = ({
  records,
  onSubmitAppeal,
}) => {
  // Role permission perspective: 质检组长 (view all) vs 坐席 (view own only)
  const [roleMode, setRoleMode] = useState<'质检组长' | '坐席'>('质检组长');

  // Detail modal / view state
  const [viewingRecordId, setViewingRecordId] = useState<string | null>(null);

  // Query panels
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(true);
  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] = useState<boolean>(false);
  const [draftFilters, setDraftFilters] = useState<GradeQueryFilterState>(EMPTY_GRADE_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<GradeQueryFilterState>(EMPTY_GRADE_FILTERS);

  // Configurable dimension columns
  const [enabledDimKeys, setEnabledDimKeys] = useState<string[]>([
    'durationSec',
    'callDirection',
    'skillGroupName',
  ]);
  const [dimModalOpen, setDimModalOpen] = useState<boolean>(false);
  const [draftDimKeys, setDraftDimKeys] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [jumpPageInput, setJumpPageInput] = useState<string>('1');

  // Toast
  const [toastText, setToastText] = useState<string | null>(null);
  useEffect(() => {
    if (!toastText) return;
    const t = setTimeout(() => setToastText(null), 2600);
    return () => clearTimeout(t);
  }, [toastText]);

  const updateDraft = <K extends keyof GradeQueryFilterState>(
    key: K,
    val: GradeQueryFilterState[K]
  ) => {
    setDraftFilters(prev => ({ ...prev, [key]: val }));
  };

  const handleSearch = () => {
    setAppliedFilters({ ...draftFilters });
    setCurrentPage(1);
    setJumpPageInput('1');
  };

  const handleResetFilters = () => {
    setDraftFilters(EMPTY_GRADE_FILTERS);
    setAppliedFilters(EMPTY_GRADE_FILTERS);
    setCurrentPage(1);
    setJumpPageInput('1');
  };

  const handleRoleChange = (nextRole: '质检组长' | '坐席') => {
    setRoleMode(nextRole);
    setCurrentPage(1);
    setJumpPageInput('1');
    setToastText(
      nextRole === '坐席'
        ? `已切换为「坐席（${CURRENT_AGENT_NAME} · ${CURRENT_AGENT_ID}）」视角，仅展示本人质检成绩`
        : '已切换为「质检组长」视角，可查看全部坐席的质检成绩'
    );
  };

  // Helper numeric range matcher
  const inRange = (val: number, minStr: string, maxStr: string): boolean => {
    if (minStr !== '') {
      const min = Number(minStr);
      if (!isNaN(min) && val < min) return false;
    }
    if (maxStr !== '') {
      const max = Number(maxStr);
      if (!isNaN(max) && val > max) return false;
    }
    return true;
  };

  // Filtered records (Role permission + Combined filters)
  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      // Role-based access check
      if (
        roleMode === '坐席' &&
        rec.dimensions.agentId !== CURRENT_AGENT_ID &&
        rec.appellant !== CURRENT_AGENT_NAME
      ) {
        return false;
      }

      const f = appliedFilters;

      if (f.serialNo && !rec.serialNo.toLowerCase().includes(f.serialNo.trim().toLowerCase())) {
        return false;
      }
      if (f.status && rec.status !== f.status) {
        return false;
      }
      if (f.reviewer && !rec.reviewer.toLowerCase().includes(f.reviewer.trim().toLowerCase())) {
        return false;
      }
      if (f.appellant && !rec.appellant.toLowerCase().includes(f.appellant.trim().toLowerCase())) {
        return false;
      }
      if (!inRange(rec.machineScore, f.minScore, f.maxScore)) {
        return false;
      }

      // 通话时间范围
      const callDate = rec.callTime.slice(0, 10);
      if (f.callStartDate && callDate < f.callStartDate) return false;
      if (f.callEndDate && callDate > f.callEndDate) return false;

      // 复核时间范围
      const reviewDate = rec.reviewTime ? rec.reviewTime.slice(0, 10) : '';
      if (f.reviewStartDate && (!reviewDate || reviewDate < f.reviewStartDate)) return false;
      if (f.reviewEndDate && (!reviewDate || reviewDate > f.reviewEndDate)) return false;

      // 申诉时间范围
      const appealDate = rec.appealTime ? rec.appealTime.slice(0, 10) : '';
      if (f.appealStartDate && (!appealDate || appealDate < f.appealStartDate)) return false;
      if (f.appealEndDate && (!appealDate || appealDate > f.appealEndDate)) return false;

      // Audio metrics
      if (!inRange(rec.durationSec, f.minDuration, f.maxDuration)) return false;
      if (!inRange(rec.silenceDurationSec, f.minSilence, f.maxSilence)) return false;
      if (!inRange(rec.avgSpeechRate, f.minAvgSpeechRate, f.maxAvgSpeechRate)) return false;
      if (!inRange(rec.avgVolumeDb, f.minAvgVolume, f.maxAvgVolume)) return false;
      if (!inRange(rec.agentAvgSpeechRate, f.minAgentSpeechRate, f.maxAgentSpeechRate)) return false;
      if (!inRange(rec.agentAvgVolumeDb, f.minAgentVolume, f.maxAgentVolume)) return false;
      if (
        f.recordingFileName &&
        !rec.recordingFileName.toLowerCase().includes(f.recordingFileName.trim().toLowerCase())
      ) {
        return false;
      }

      // 随录信息 dimensions
      const d = rec.dimensions;
      if (f.callDirection && d.callDirection !== f.callDirection) return false;
      if (f.callerNumber && !d.callerNumber.includes(f.callerNumber.trim())) return false;
      if (f.calleeNumber && !d.calleeNumber.includes(f.calleeNumber.trim())) return false;
      if (f.agentId && !d.agentId.includes(f.agentId.trim())) return false;
      if (f.skillGroupName && d.skillGroupName !== f.skillGroupName) return false;
      if (f.hangupParty && d.hangupParty !== f.hangupParty) return false;
      if (f.satisfactionRating && d.satisfactionRating !== f.satisfactionRating) return false;
      if (!inRange(d.queueDurationSec, f.minQueueSec, f.maxQueueSec)) return false;
      if (f.isFirstInbound === '是' && !d.isFirstInbound) return false;
      if (f.isFirstInbound === '否' && d.isFirstInbound) return false;

      const startDimDate = d.callStartTime ? d.callStartTime.slice(0, 10) : '';
      if (f.callStartDimFrom && (!startDimDate || startDimDate < f.callStartDimFrom)) return false;
      if (f.callStartDimTo && (!startDimDate || startDimDate > f.callStartDimTo)) return false;

      return true;
    });
  }, [records, roleMode, appliedFilters]);

  const totalCount = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedRecords = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, safeCurrentPage, pageSize]);

  const activeDimDefs = useMemo(
    () => CONFIGURABLE_DIMENSION_DEFS.filter(def => enabledDimKeys.includes(def.key)),
    [enabledDimKeys]
  );

  const handleOpenDimModal = () => {
    setDraftDimKeys([...enabledDimKeys]);
    setDimModalOpen(true);
  };

  const handleToggleDraftDim = (key: string) => {
    setDraftDimKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleConfirmDimModal = () => {
    setEnabledDimKeys(draftDimKeys);
    setDimModalOpen(false);
    setToastText(`已更新列表展示维度（已启用 ${draftDimKeys.length} 项扩展维度）`);
  };

  const viewingRecord = useMemo(
    () => records.find(r => r.id === viewingRecordId) || null,
    [records, viewingRecordId]
  );

  // If inspecting a specific grade record, show full 3-area detail view with appeal/review summary banner
  if (viewingRecord) {
    return (
      <div className="h-full w-full flex flex-col bg-[#f2f4f8] overflow-hidden">
        {/* Appeal & Review Summary Header Strip */}
        <div className="bg-[#f0f7ff] border-b border-[#bae0ff] px-5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <button
              type="button"
              onClick={() => setViewingRecordId(null)}
              className="inline-flex items-center space-x-1 text-[#1677ff] hover:underline font-medium cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>返回成绩查询</span>
            </button>
            <span className="text-slate-300">|</span>
            <span>
              当前状态：
              <strong
                className={`ml-1 ${
                  viewingRecord.status === '已申诉已通过'
                    ? 'text-emerald-700'
                    : viewingRecord.status === '已申诉已驳回'
                    ? 'text-rose-600'
                    : viewingRecord.status === '未申诉'
                    ? 'text-slate-600'
                    : 'text-amber-700'
                }`}
              >
                {viewingRecord.status}
              </strong>
            </span>
            <span className="text-slate-600">
              申诉人：<strong className="text-slate-800">{viewingRecord.appellant || '未发起申诉'}</strong>
              {viewingRecord.appealTime ? `（${viewingRecord.appealTime}）` : ''}
            </span>
            <span className="text-slate-600">
              复核人：
              <strong className="text-slate-800">{viewingRecord.reviewer || '待指派/待复核'}</strong>
              {viewingRecord.reviewTime ? `（${viewingRecord.reviewTime}）` : ''}
            </span>
          </div>

          <div className="text-[11.5px] text-slate-600 truncate max-w-xl" title={viewingRecord.appealReason}>
            申诉理由：{viewingRecord.appealReason || '暂未提交申诉（可在右侧点击「申诉」发起）'}
            {viewingRecord.reviewComment ? ` ｜ 复核意见：${viewingRecord.reviewComment}` : ''}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <SpecialQualityDetailView
            task={viewingRecord.taskSnapshot}
            session={viewingRecord.sessionDetail}
            onBackToSessions={() => setViewingRecordId(null)}
            backButtonLabel="返回成绩查询"
            compactAudioZone={true}
            detailMode="grade_query"
            appealHistory={viewingRecord.appealHistory}
            reviewHistory={viewingRecord.reviewHistory}
            onSubmitAppeal={payload => {
              if (onSubmitAppeal) {
                const appellantName =
                  roleMode === '坐席'
                    ? CURRENT_AGENT_NAME
                    : viewingRecord.appellant || `坐席${viewingRecord.dimensions.agentId}`;
                onSubmitAppeal(viewingRecord.id, payload, appellantName);
              }
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
        {/* Top Title Header + Role Permission Switcher */}
        <div className="h-12 px-5 flex items-center justify-between border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <h1 className="text-[15px] font-bold text-slate-800">成绩查询</h1>
            <span className="text-xs text-slate-400 hidden sm:inline">
              坐席可查看本人质检成绩，质检组长可查看全部人员的质检成绩与申诉复核结果
            </span>
          </div>

          {/* Role Permission Selector */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500">当前角色权限：</span>
            <div className="inline-flex rounded border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => handleRoleChange('质检组长')}
                className={`px-2.5 py-1 rounded text-xs flex items-center space-x-1 cursor-pointer transition-colors ${
                  roleMode === '质检组长'
                    ? 'bg-[#1677ff] text-white font-medium shadow-2xs'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Shield size={12} />
                <span>质检组长（全部数据）</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('坐席')}
                className={`px-2.5 py-1 rounded text-xs flex items-center space-x-1 cursor-pointer transition-colors ${
                  roleMode === '坐席'
                    ? 'bg-[#1677ff] text-white font-medium shadow-2xs'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <UserCheck size={12} />
                <span>坐席 · {CURRENT_AGENT_NAME}（仅本人）</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 flex flex-col p-5 overflow-hidden">
          {/* Combined Query Filter Area */}
          <div className="bg-[#f9fafc] border border-slate-100 rounded-md px-5 py-3.5 mb-3.5 flex-shrink-0">
            {isSearchExpanded ? (
              <div className="space-y-3">
                {/* Primary Filters Row */}
                <div className="flex flex-wrap items-center gap-y-2.5 gap-x-5">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      流水号
                    </label>
                    <input
                      type="text"
                      value={draftFilters.serialNo}
                      onChange={e => updateDraft('serialNo', e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      placeholder="请输入流水号"
                      className="w-44 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#1677ff]"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      状态
                    </label>
                    <select
                      value={draftFilters.status}
                      onChange={e => updateDraft('status', e.target.value)}
                      className="w-36 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] cursor-pointer"
                    >
                      <option value="">全部状态</option>
                      <option value="未申诉">未申诉</option>
                      <option value="已申诉未复核">已申诉未复核</option>
                      <option value="已申诉已通过">已申诉已通过</option>
                      <option value="已申诉已驳回">已申诉已驳回</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      机器评分
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={draftFilters.minScore}
                      onChange={e => updateDraft('minScore', e.target.value)}
                      placeholder="最低"
                      className="w-16 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] tabular-nums"
                    />
                    <span className="text-xs text-slate-400">~</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={draftFilters.maxScore}
                      onChange={e => updateDraft('maxScore', e.target.value)}
                      placeholder="最高"
                      className="w-16 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff] tabular-nums"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      复核人
                    </label>
                    <input
                      type="text"
                      value={draftFilters.reviewer}
                      onChange={e => updateDraft('reviewer', e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      placeholder="复核人"
                      className="w-28 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#1677ff]"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      申诉人
                    </label>
                    <input
                      type="text"
                      value={draftFilters.appellant}
                      onChange={e => updateDraft('appellant', e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      placeholder="申诉人"
                      className="w-28 h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#1677ff]"
                    />
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      通话时间
                    </label>
                    <input
                      type="date"
                      value={draftFilters.callStartDate}
                      onChange={e => updateDraft('callStartDate', e.target.value)}
                      className="w-32 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                    />
                    <span className="text-xs text-slate-400">至</span>
                    <input
                      type="date"
                      value={draftFilters.callEndDate}
                      onChange={e => updateDraft('callEndDate', e.target.value)}
                      className="w-32 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                    />
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      复核时间
                    </label>
                    <input
                      type="date"
                      value={draftFilters.reviewStartDate}
                      onChange={e => updateDraft('reviewStartDate', e.target.value)}
                      className="w-32 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                    />
                    <span className="text-xs text-slate-400">至</span>
                    <input
                      type="date"
                      value={draftFilters.reviewEndDate}
                      onChange={e => updateDraft('reviewEndDate', e.target.value)}
                      className="w-32 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                    />
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      申诉时间
                    </label>
                    <input
                      type="date"
                      value={draftFilters.appealStartDate}
                      onChange={e => updateDraft('appealStartDate', e.target.value)}
                      className="w-32 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                    />
                    <span className="text-xs text-slate-400">至</span>
                    <input
                      type="date"
                      value={draftFilters.appealEndDate}
                      onChange={e => updateDraft('appealEndDate', e.target.value)}
                      className="w-32 h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => setIsAdvancedSearchExpanded(prev => !prev)}
                      className="h-8 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded text-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <Filter size={12} className="text-[#1677ff]" />
                      <span>
                        {isAdvancedSearchExpanded ? '收起语音/随录条件' : '语音及随录维度组合搜索'}
                      </span>
                    </button>
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

                {/* Expandable Audio Metrics & 随录信息 Dimension Filters */}
                {isAdvancedSearchExpanded && (
                  <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                    <div className="text-[11px] font-semibold text-slate-500">
                      语音指标与录音文件条件：
                    </div>
                    <div className="flex flex-wrap items-center gap-y-2.5 gap-x-4 text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-600">通话时长(秒)</span>
                        <input
                          type="number"
                          value={draftFilters.minDuration}
                          onChange={e => updateDraft('minDuration', e.target.value)}
                          placeholder="最小"
                          className="w-16 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                        <span className="text-slate-400">~</span>
                        <input
                          type="number"
                          value={draftFilters.maxDuration}
                          onChange={e => updateDraft('maxDuration', e.target.value)}
                          placeholder="最大"
                          className="w-16 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-600">静音时长(秒)</span>
                        <input
                          type="number"
                          value={draftFilters.minSilence}
                          onChange={e => updateDraft('minSilence', e.target.value)}
                          placeholder="最小"
                          className="w-16 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                        <span className="text-slate-400">~</span>
                        <input
                          type="number"
                          value={draftFilters.maxSilence}
                          onChange={e => updateDraft('maxSilence', e.target.value)}
                          placeholder="最大"
                          className="w-16 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-600">平均语速(字/分)</span>
                        <input
                          type="number"
                          value={draftFilters.minAvgSpeechRate}
                          onChange={e => updateDraft('minAvgSpeechRate', e.target.value)}
                          placeholder="最小"
                          className="w-16 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                        <span className="text-slate-400">~</span>
                        <input
                          type="number"
                          value={draftFilters.maxAvgSpeechRate}
                          onChange={e => updateDraft('maxAvgSpeechRate', e.target.value)}
                          placeholder="最大"
                          className="w-16 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-600">平均音量(dB)</span>
                        <input
                          type="number"
                          value={draftFilters.minAvgVolume}
                          onChange={e => updateDraft('minAvgVolume', e.target.value)}
                          placeholder="最小"
                          className="w-16 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                        <span className="text-slate-400">~</span>
                        <input
                          type="number"
                          value={draftFilters.maxAvgVolume}
                          onChange={e => updateDraft('maxAvgVolume', e.target.value)}
                          placeholder="最大"
                          className="w-16 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-600">坐席平均语速</span>
                        <input
                          type="number"
                          value={draftFilters.minAgentSpeechRate}
                          onChange={e => updateDraft('minAgentSpeechRate', e.target.value)}
                          placeholder="最小"
                          className="w-16 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                        <span className="text-slate-400">~</span>
                        <input
                          type="number"
                          value={draftFilters.maxAgentSpeechRate}
                          onChange={e => updateDraft('maxAgentSpeechRate', e.target.value)}
                          placeholder="最大"
                          className="w-16 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-600">坐席平均音量</span>
                        <input
                          type="number"
                          value={draftFilters.minAgentVolume}
                          onChange={e => updateDraft('minAgentVolume', e.target.value)}
                          placeholder="最小"
                          className="w-16 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                        <span className="text-slate-400">~</span>
                        <input
                          type="number"
                          value={draftFilters.maxAgentVolume}
                          onChange={e => updateDraft('maxAgentVolume', e.target.value)}
                          placeholder="最大"
                          className="w-16 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-600">录音文件名</span>
                        <input
                          type="text"
                          value={draftFilters.recordingFileName}
                          onChange={e => updateDraft('recordingFileName', e.target.value)}
                          placeholder="如 REC_20261119..."
                          className="w-44 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                      </div>
                    </div>

                    <div className="text-[11px] font-semibold text-slate-500 pt-1">
                      随录信息各维度字段组合搜索：
                    </div>
                    <div className="flex flex-wrap items-center gap-y-2.5 gap-x-4 text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-600">呼叫方向</span>
                        <select
                          value={draftFilters.callDirection}
                          onChange={e => updateDraft('callDirection', e.target.value)}
                          className="w-24 h-7 px-2 bg-white border border-slate-200 rounded text-xs cursor-pointer"
                        >
                          <option value="">全部</option>
                          <option value="呼入">呼入</option>
                          <option value="呼出">呼出</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-600">主叫号码</span>
                        <input
                          type="text"
                          value={draftFilters.callerNumber}
                          onChange={e => updateDraft('callerNumber', e.target.value)}
                          placeholder="主叫号码"
                          className="w-28 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-600">被叫号码</span>
                        <input
                          type="text"
                          value={draftFilters.calleeNumber}
                          onChange={e => updateDraft('calleeNumber', e.target.value)}
                          placeholder="被叫号码"
                          className="w-28 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-600">坐席工号</span>
                        <input
                          type="text"
                          value={draftFilters.agentId}
                          onChange={e => updateDraft('agentId', e.target.value)}
                          placeholder="如 6028"
                          className="w-24 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-600">技能组名称</span>
                        <select
                          value={draftFilters.skillGroupName}
                          onChange={e => updateDraft('skillGroupName', e.target.value)}
                          className="w-32 h-7 px-2 bg-white border border-slate-200 rounded text-xs cursor-pointer"
                        >
                          <option value="">全部</option>
                          <option value="VIP专席组">VIP专席组</option>
                          <option value="信用卡综合组">信用卡综合组</option>
                          <option value="财富顾问组">财富顾问组</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-600">挂机方</span>
                        <select
                          value={draftFilters.hangupParty}
                          onChange={e => updateDraft('hangupParty', e.target.value)}
                          className="w-32 h-7 px-2 bg-white border border-slate-200 rounded text-xs cursor-pointer"
                        >
                          <option value="">全部</option>
                          <option value="坐席挂机">坐席挂机</option>
                          <option value="客户挂机">客户挂机</option>
                          <option value="系统超时释放">系统超时释放</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-600">满意度评价</span>
                        <select
                          value={draftFilters.satisfactionRating}
                          onChange={e => updateDraft('satisfactionRating', e.target.value)}
                          className="w-28 h-7 px-2 bg-white border border-slate-200 rounded text-xs cursor-pointer"
                        >
                          <option value="">全部</option>
                          <option value="非常满意">非常满意</option>
                          <option value="满意">满意</option>
                          <option value="一般">一般</option>
                          <option value="不满意">不满意</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-600">排队时长(秒)</span>
                        <input
                          type="number"
                          value={draftFilters.minQueueSec}
                          onChange={e => updateDraft('minQueueSec', e.target.value)}
                          placeholder="最小"
                          className="w-16 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                        <span className="text-slate-400">~</span>
                        <input
                          type="number"
                          value={draftFilters.maxQueueSec}
                          onChange={e => updateDraft('maxQueueSec', e.target.value)}
                          placeholder="最大"
                          className="w-16 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-600">是否首次进线</span>
                        <select
                          value={draftFilters.isFirstInbound}
                          onChange={e => updateDraft('isFirstInbound', e.target.value)}
                          className="w-24 h-7 px-2 bg-white border border-slate-200 rounded text-xs cursor-pointer"
                        >
                          <option value="">全部</option>
                          <option value="是">是</option>
                          <option value="否">否</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-600">进线接入时间</span>
                        <input
                          type="date"
                          value={draftFilters.callStartDimFrom}
                          onChange={e => updateDraft('callStartDimFrom', e.target.value)}
                          className="w-32 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                        <span className="text-slate-400">至</span>
                        <input
                          type="date"
                          value={draftFilters.callStartDimTo}
                          onChange={e => updateDraft('callStartDimTo', e.target.value)}
                          className="w-32 h-7 px-2 bg-white border border-slate-200 rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  已折叠查询条件栏（支持复核时间、复核人、状态、申诉人、机器评分、通话时间、语音及随录维度组合查询）
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

          {/* Action Toolbar Row: 维度设置 + 角色数据提示 */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleOpenDimModal}
                className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors cursor-pointer shadow-2xs flex items-center space-x-1.5"
              >
                <Sliders size={13} />
                <span>维度设置</span>
              </button>
              <span className="text-xs text-slate-500">
                当前已添加 <strong className="text-[#1677ff]">{activeDimDefs.length}</strong> 个扩展展示维度（可横向滚动查看，操作列固定在最右侧）
              </span>
            </div>

            {roleMode === '坐席' && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs">
                坐席权限视图：当前仅展示坐席「{CURRENT_AGENT_NAME} ({CURRENT_AGENT_ID})」本人的质检成绩
              </span>
            )}
          </div>

          {/* Table Container with Horizontal Scroll + Sticky Right Action Column */}
          <div className="flex-1 overflow-auto border border-slate-100 rounded-t-sm custom-scrollbar relative">
            <table className="w-full min-w-max border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#dbe7fb] text-slate-700 text-xs font-semibold select-none">
                <tr>
                  <th className="py-2.5 px-3 text-center border-r border-white w-[210px]">
                    流水号
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-white w-[155px]">
                    通话时间
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-white w-[85px]">
                    评分
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-white w-[125px]">
                    状态
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-white w-[155px]">
                    复核时间
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-white w-[95px]">
                    复核人
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-white w-[155px]">
                    申诉时间
                  </th>
                  <th className="py-2.5 px-3 text-center border-r border-white w-[95px]">
                    申诉人
                  </th>

                  {/* Dynamically Added Dimension Columns */}
                  {activeDimDefs.map(dim => (
                    <th
                      key={dim.key}
                      className={`py-2.5 px-3 text-center border-r border-white ${dim.widthClass}`}
                    >
                      {dim.label}
                    </th>
                  ))}

                  {/* Sticky Fixed Right Action Column */}
                  <th className="sticky right-0 z-20 bg-[#dbe7fb] py-2.5 px-4 text-center w-[95px] shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.14)] border-l border-white">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[12.5px] text-slate-700 bg-white">
                {pagedRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9 + activeDimDefs.length}
                      className="py-16 text-center text-slate-400 text-xs"
                    >
                      暂无符合条件的质检成绩数据，请调整查询条件或重置筛选
                    </td>
                  </tr>
                ) : (
                  pagedRecords.map(rec => (
                    <tr key={rec.id} className="group hover:bg-[#f5f8ff] transition-colors">
                      <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-700">
                        <button
                          type="button"
                          onClick={() => setViewingRecordId(rec.id)}
                          className="text-[#1677ff] hover:underline cursor-pointer"
                        >
                          {rec.serialNo}
                        </button>
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
                          {rec.machineScore}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            rec.status === '已申诉已通过'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : rec.status === '已申诉已驳回'
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : rec.status === '未申诉'
                              ? 'bg-slate-50 text-slate-500 border-slate-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              rec.status === '已申诉已通过'
                                ? 'bg-emerald-500'
                                : rec.status === '已申诉已驳回'
                                ? 'bg-rose-500'
                                : rec.status === '未申诉'
                                ? 'bg-slate-400'
                                : 'bg-amber-500'
                            }`}
                          />
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-600 tabular-nums">
                        {rec.reviewTime || <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-3.5 px-3 text-center text-xs text-slate-700">
                        {rec.reviewer || (
                          <span className="text-slate-300">
                            {rec.status === '未申诉' ? '-' : '待分配'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-600 tabular-nums">
                        {rec.appealTime || <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-3.5 px-3 text-center text-xs font-medium text-slate-700">
                        {rec.appellant || <span className="text-slate-300">-</span>}
                      </td>

                      {/* Configurable Dimension Cells */}
                      {activeDimDefs.map(dim => (
                        <td
                          key={`${rec.id}_${dim.key}`}
                          className="py-3.5 px-3 text-center text-xs text-slate-600 font-mono tabular-nums"
                        >
                          {dim.getValue(rec)}
                        </td>
                      ))}

                      {/* Sticky Fixed Right Action Column */}
                      <td className="sticky right-0 z-10 bg-white group-hover:bg-[#f5f8ff] py-3.5 px-4 text-center shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.12)] border-l border-slate-100">
                        <button
                          type="button"
                          onClick={() => setViewingRecordId(rec.id)}
                          className="text-[#1677ff] hover:text-blue-700 hover:underline cursor-pointer inline-flex items-center space-x-1 text-xs font-medium"
                        >
                          <Eye size={13} />
                          <span>查看</span>
                        </button>
                      </td>
                    </tr>
                  ))
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

      {/* ========================================================================
       * 维度设置弹窗（添加或删除语音指标 / 录音文件名 / 随录信息字段）
       * ======================================================================== */}
      {dimModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl w-[720px] max-w-[94vw] max-h-[86vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="h-12 px-5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Sliders size={15} className="text-[#1677ff]" />
                <h3 className="text-sm font-bold text-slate-800">列表展示维度设置</h3>
              </div>
              <button
                type="button"
                onClick={() => setDimModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs custom-scrollbar">
              {/* Locked Default Columns */}
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5 font-semibold text-slate-700">
                  <Lock size={13} className="text-slate-400" />
                  <span>默认展示字段（系统锁定，不可移除）</span>
                </div>
                <div className="flex flex-wrap gap-2 bg-[#f9fafc] border border-slate-200/80 rounded p-3">
                  {LOCKED_DEFAULT_COLUMNS.map(col => (
                    <span
                      key={col}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded text-xs"
                    >
                      <Lock size={10} />
                      <span>{col}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Group 1: Audio & Recording File Metrics */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">
                    语音与录音维度字段（可添加 / 删除）
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDraftDimKeys(CONFIGURABLE_DIMENSION_DEFS.map(d => d.key))
                      }
                      className="text-[#1677ff] hover:underline cursor-pointer"
                    >
                      全选所有扩展维度
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setDraftDimKeys([])}
                      className="text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                    >
                      清空扩展维度
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 bg-white border border-slate-200/80 rounded p-3">
                  {/* 通话时间 is locked default per spec */}
                  <label className="flex items-center space-x-2 px-2.5 py-1.5 rounded bg-slate-50 text-slate-400 cursor-not-allowed">
                    <input type="checkbox" checked disabled className="accent-[#1677ff]" />
                    <span>通话时间（默认锁定）</span>
                  </label>

                  {CONFIGURABLE_DIMENSION_DEFS.filter(d => d.group === '语音指标').map(dim => {
                    const checked = draftDimKeys.includes(dim.key);
                    return (
                      <label
                        key={dim.key}
                        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded border cursor-pointer transition-colors ${
                          checked
                            ? 'bg-blue-50/70 border-[#1677ff] text-[#1677ff] font-medium'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleDraftDim(dim.key)}
                          className="accent-[#1677ff] cursor-pointer"
                        />
                        <span>{dim.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Group 2: 随录信息 Dimension Fields */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-700">
                  随录信息各维度字段（可添加 / 删除）
                </div>
                <div className="grid grid-cols-3 gap-2.5 bg-white border border-slate-200/80 rounded p-3">
                  {CONFIGURABLE_DIMENSION_DEFS.filter(d => d.group === '随录信息').map(dim => {
                    const checked = draftDimKeys.includes(dim.key);
                    return (
                      <label
                        key={dim.key}
                        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded border cursor-pointer transition-colors ${
                          checked
                            ? 'bg-blue-50/70 border-[#1677ff] text-[#1677ff] font-medium'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleDraftDim(dim.key)}
                          className="accent-[#1677ff] cursor-pointer"
                        />
                        <span>{dim.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="h-12 px-5 border-t border-slate-200 bg-[#f9fafc] flex items-center justify-between flex-shrink-0 text-xs">
              <span className="text-slate-500">
                已选择 <strong className="text-[#1677ff]">{draftDimKeys.length}</strong> 个扩展展示字段
              </span>
              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => setDimModalOpen(false)}
                  className="h-8 px-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 rounded cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDimModal}
                  className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white font-medium rounded cursor-pointer"
                >
                  保存维度设置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityGradeQueryWorkbench;
