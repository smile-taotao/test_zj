import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Rewind,
  FastForward,
  Repeat,
  Volume2,
  VolumeX,
  Search,
  ChevronUp,
  ChevronDown,
  Download,
  FileText,
  PhoneCall,
  User,
  Headphones,
  Tag,
  CheckCircle2,
  XCircle,
  ChevronsUpDown,
  Info,
  X,
  History,
  AlertCircle,
  ClipboardList,
} from 'lucide-react';
import {
  SpecialQualityTask,
  SpecialQualitySession,
  SessionTranscriptUtterance,
  SessionQualityRuleResult,
  RuleAppealStatus,
} from './specialQualitySessionData';
import { AppealRecordEntry, ReviewRecordEntry } from './qualityResultData';

interface SpecialQualityDetailViewProps {
  task: SpecialQualityTask;
  session: SpecialQualitySession;
  onBackToSessions: () => void;
  backButtonLabel?: string;
  compactAudioZone?: boolean;
  detailMode?: 'special' | 'grade_query' | 'issue_review' | 'issue_review_readonly';
  appealHistory?: AppealRecordEntry[];
  reviewHistory?: ReviewRecordEntry[];
  onSubmitAppeal?: (payload: {
    items: Array<{ ruleId: string; appealScore: number }>;
    reason: string;
  }) => void;
  onSubmitRuleReview?: (payload: {
    ruleId: string;
    decision: '通过' | '驳回';
    reviewScore: number;
    reason: string;
  }) => void;
}

function formatTimeMMSS(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(clamped / 60);
  const ss = clamped % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

interface SearchMatchLocation {
  utteranceId: string;
  utteranceIndex: number;
  startOffset: number;
  length: number;
}

const SpecialQualityDetailView: React.FC<SpecialQualityDetailViewProps> = ({
  task,
  session,
  onBackToSessions,
  backButtonLabel = '返回会话列表',
  compactAudioZone = false,
  detailMode = 'special',
  appealHistory = [],
  reviewHistory = [],
  onSubmitAppeal,
  onSubmitRuleReview,
}) => {
  // ============================================================================
  // 1. 录音播放控制状态
  // ============================================================================
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5 | 2>(1);
  const [isLoop, setIsLoop] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(60);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Web Audio gentle tone tick / voice activity indicator (strictly optional, safe fallback)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastPulseUtteranceRef = useRef<string | null>(null);

  const playSoftAudioFeedback = (utteranceId: string, speaker: '客户' | '坐席') => {
    if (isMuted || volume <= 0) return;
    if (lastPulseUtteranceRef.current === utteranceId) return;
    lastPulseUtteranceRef.current = utteranceId;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = speaker === '坐席' ? 420 : 330;
      const gainLevel = Math.min(0.03, (volume / 100) * 0.025);
      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Ignore Web Audio restrictions cleanly
    }
  };

  // Playback timer driven by playbackRate & loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = 100;
    const timer = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + (intervalMs / 1000) * playbackRate;
        if (next >= session.durationSec) {
          if (isLoop) {
            lastPulseUtteranceRef.current = null;
            return 0;
          } else {
            setIsPlaying(false);
            return session.durationSec;
          }
        }
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, playbackRate, isLoop, session.durationSec]);

  // Determine active utterance for currentTime
  const activeUtteranceId = useMemo(() => {
    const matched = session.utterances.find(
      u => currentTime >= u.startSec && currentTime <= u.endSec
    );
    if (matched) return matched.id;
    // If paused/playing between utterances, find nearest preceding utterance once playback started
    if (currentTime > 0) {
      const preceding = [...session.utterances]
        .reverse()
        .find(u => currentTime >= u.startSec);
      return preceding?.id || null;
    }
    return null;
  }, [session.utterances, currentTime]);

  useEffect(() => {
    if (isPlaying && activeUtteranceId) {
      const u = session.utterances.find(item => item.id === activeUtteranceId);
      if (u) {
        playSoftAudioFeedback(u.id, u.speaker);
      }
    }
  }, [isPlaying, activeUtteranceId]);

  const handleTogglePlay = () => {
    if (currentTime >= session.durationSec) {
      setCurrentTime(0);
    }
    setIsPlaying(prev => !prev);
  };

  const handleRewind10 = () => {
    setCurrentTime(prev => Math.max(0, prev - 10));
  };

  const handleForward10 = () => {
    setCurrentTime(prev => Math.min(session.durationSec, prev + 10));
  };

  const handleRestart = () => {
    lastPulseUtteranceRef.current = null;
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleSeekTo = (sec: number) => {
    lastPulseUtteranceRef.current = null;
    setCurrentTime(Math.min(Math.max(0, sec), session.durationSec));
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    handleSeekTo(ratio * session.durationSec);
  };

  // ============================================================================
  // 2. 对话转写区状态（属性显隐 / 跟随滚动 / 关键词搜索<=100字）
  // ============================================================================
  const [showAudioProps, setShowAudioProps] = useState<boolean>(true);
  const [followAudioScroll, setFollowAudioScroll] = useState<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(0);

  const utteranceRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Auto-scroll transcript to current utterance when followAudioScroll is enabled
  useEffect(() => {
    if (!followAudioScroll || !activeUtteranceId) return;
    const el = utteranceRefs.current[activeUtteranceId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeUtteranceId, followAudioScroll]);

  // Search matches across all utterances (case-insensitive, up to 100 chars)
  const searchMatches: SearchMatchLocation[] = useMemo(() => {
    const kw = searchKeyword.trim();
    if (!kw) return [];
    const lowerKw = kw.toLowerCase();
    const results: SearchMatchLocation[] = [];

    session.utterances.forEach((u, uIdx) => {
      const lowerText = u.text.toLowerCase();
      let fromIdx = 0;
      while (fromIdx < lowerText.length) {
        const foundIdx = lowerText.indexOf(lowerKw, fromIdx);
        if (foundIdx === -1) break;
        results.push({
          utteranceId: u.id,
          utteranceIndex: uIdx,
          startOffset: foundIdx,
          length: kw.length,
        });
        fromIdx = foundIdx + kw.length;
      }
    });
    return results;
  }, [searchKeyword, session.utterances]);

  useEffect(() => {
    if (searchMatches.length === 0) {
      setActiveMatchIndex(0);
    } else if (activeMatchIndex >= searchMatches.length) {
      setActiveMatchIndex(0);
    }
  }, [searchMatches.length]);

  const jumpToSearchMatch = (targetIdx: number) => {
    if (searchMatches.length === 0) return;
    const normalized =
      ((targetIdx % searchMatches.length) + searchMatches.length) % searchMatches.length;
    setActiveMatchIndex(normalized);
    const match = searchMatches[normalized];
    const el = utteranceRefs.current[match.utteranceId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // ============================================================================
  // 3. 右下质检结果展示区状态（点击规则高亮展开条件 + 收起/展开）
  // ============================================================================
  const [selectedRuleId, setSelectedRuleId] = useState<string>(
    session.ruleResults[0]?.ruleId || ''
  );
  const [isConditionPanelOpen, setIsConditionPanelOpen] = useState<boolean>(true);
  const [collapsedConditionIds, setCollapsedConditionIds] = useState<Record<string, boolean>>({});

  // Call info modal, appeal/review modals & download toast
  const [callInfoModalOpen, setCallInfoModalOpen] = useState<boolean>(false);
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);

  // Appeal modal state (成绩查询详情)
  const [appealModalOpen, setAppealModalOpen] = useState<boolean>(false);
  const [selectedAppealRuleIds, setSelectedAppealRuleIds] = useState<string[]>([]);
  const [appealScoresMap, setAppealScoresMap] = useState<Record<string, string>>({});
  const [appealReasonInput, setAppealReasonInput] = useState<string>('');
  const [appealFormError, setAppealFormError] = useState<string>('');

  // Review modal state (问题复核详情)
  const [reviewingRule, setReviewingRule] = useState<SessionQualityRuleResult | null>(null);
  const [reviewScoreInput, setReviewScoreInput] = useState<string>('');
  const [reviewReasonInput, setReviewReasonInput] = useState<string>('');
  const [reviewFormError, setReviewFormError] = useState<string>('');

  const [detailToast, setDetailToast] = useState<string | null>(null);

  const showDetailToast = (msg: string) => {
    setDetailToast(msg);
  };
  useEffect(() => {
    if (!detailToast) return;
    const t = setTimeout(() => setDetailToast(null), 2400);
    return () => clearTimeout(t);
  }, [detailToast]);

  const selectedRuleResult: SessionQualityRuleResult | undefined = useMemo(
    () => session.ruleResults.find(r => r.ruleId === selectedRuleId) || session.ruleResults[0],
    [session.ruleResults, selectedRuleId]
  );

  const handleSelectRule = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    setIsConditionPanelOpen(true);
  };

  const toggleSingleCondition = (condId: string) => {
    setCollapsedConditionIds(prev => ({ ...prev, [condId]: !prev[condId] }));
  };

  const handleToggleAllConditions = () => {
    if (!selectedRuleResult) return;
    const allCollapsed = selectedRuleResult.conditions.every(
      c => collapsedConditionIds[c.conditionId]
    );
    const nextMap: Record<string, boolean> = {};
    selectedRuleResult.conditions.forEach(c => {
      nextMap[c.conditionId] = !allCollapsed;
    });
    setCollapsedConditionIds(nextMap);
  };

  const handleDownloadTranscript = () => {
    const lines = session.utterances.map(
      u => `[${u.timeLabel}] ${u.speaker}（${u.speechRate}字/分 | ${u.volumeDb}dB）：${u.text}`
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.serialNo}-对话文本.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showDetailToast('已导出录音转写对话文本');
  };

  const renderHighlightedUtteranceText = (u: SessionTranscriptUtterance) => {
    const kw = searchKeyword.trim();
    if (!kw) return u.text;

    const uMatches = searchMatches
      .map((m, globalIdx) => ({ ...m, globalIdx }))
      .filter(m => m.utteranceId === u.id);

    if (uMatches.length === 0) return u.text;

    const nodes: React.ReactNode[] = [];
    let cursor = 0;

    uMatches.forEach((m, idx) => {
      if (m.startOffset > cursor) {
        nodes.push(u.text.slice(cursor, m.startOffset));
      }
      const isFocusedMatch = m.globalIdx === activeMatchIndex;
      nodes.push(
        <mark
          key={`${u.id}_m_${idx}`}
          className={`px-0.5 rounded-2xs ${
            isFocusedMatch
              ? 'bg-orange-400 text-white font-bold ring-2 ring-orange-300'
              : 'bg-yellow-200 text-slate-900 font-semibold'
          }`}
        >
          {u.text.slice(m.startOffset, m.startOffset + m.length)}
        </mark>
      );
      cursor = m.startOffset + m.length;
    });

    if (cursor < u.text.length) {
      nodes.push(u.text.slice(cursor));
    }
    return nodes;
  };

  const progressPercent =
    session.durationSec > 0 ? Math.min(100, (currentTime / session.durationSec) * 100) : 0;

  // Time axis markers
  const timeMarkers = useMemo(() => {
    const step = session.durationSec <= 45 ? 5 : 10;
    const arr: number[] = [];
    for (let t = 0; t <= session.durationSec; t += step) {
      arr.push(t);
    }
    return arr;
  }, [session.durationSec]);

  return (
    <div className="flex-1 flex flex-col bg-[#f2f4f8] w-full h-full overflow-hidden min-w-0 relative">
      {/* Toast Notification */}
      {detailToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg text-xs flex items-center space-x-2 border border-slate-700">
          <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
          <span>{detailToast}</span>
        </div>
      )}

      {/* Top Header Bar (matching reference screenshot) */}
      <div className="h-12 px-5 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            type="button"
            onClick={onBackToSessions}
            className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-[#1677ff] transition-colors cursor-pointer flex-shrink-0"
          >
            <ArrowLeft size={15} />
            <span>{backButtonLabel}</span>
          </button>
          <span className="text-slate-300">|</span>
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-[14px] font-bold text-slate-800 whitespace-nowrap">
              流水号：
            </span>
            <span className="text-[14px] font-bold font-mono text-slate-800 truncate">
              {session.serialNo}
            </span>
          </div>
          <span className="hidden xl:inline-flex text-[11px] px-2 py-0.5 bg-blue-50 text-[#1677ff] border border-blue-200 rounded">
            任务：{task.name}
          </span>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleDownloadTranscript}
            className="h-7 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <FileText size={12} className="text-[#1677ff]" />
            <span>文本下载</span>
          </button>
          <button
            type="button"
            onClick={() => showDetailToast(`已开始下载音频文件：${session.serialNo}.wav`)}
            className="h-7 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <Download size={12} className="text-[#1677ff]" />
            <span>音频下载</span>
          </button>
          <button
            type="button"
            onClick={() => setCallInfoModalOpen(true)}
            className="h-7 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <PhoneCall size={12} className="text-[#1677ff]" />
            <span>通话详情</span>
          </button>
          {detailMode !== 'special' && (
            <button
              type="button"
              onClick={() => setHistoryModalOpen(true)}
              className="h-7 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <History size={12} className="text-[#1677ff]" />
              <span>申诉记录</span>
              {(appealHistory.length > 0 || reviewHistory.length > 0) && (
                <span className="ml-0.5 px-1.5 py-0 rounded-full bg-blue-50 text-[#1677ff] text-[10px] font-mono">
                  {appealHistory.length + reviewHistory.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main 3-Zone Workspace */}
      <div className="flex-1 flex flex-col p-2.5 gap-2.5 overflow-hidden min-h-0">
        {/* ====================================================================
         * 上区域：录音播放区（录音指标 + 双/单声道波形 + 质检点色块 + 全套播控）
         * ==================================================================== */}
        <div
          className={`bg-white rounded-sm border border-slate-200/80 shadow-xs flex-shrink-0 ${
            compactAudioZone ? 'px-3.5 py-1.5 space-y-1.5' : 'px-4 py-3 space-y-2.5'
          }`}
        >
          {/* 录音数据指标栏 */}
          <div
            className={`flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 text-xs ${
              compactAudioZone ? 'pb-1' : 'pb-2'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="w-1 h-3.5 bg-[#1677ff] rounded-full"></span>
              <span className="font-bold text-slate-800 text-[13px]">录音播放区</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                  session.channels === 2
                    ? 'bg-blue-50 text-[#1677ff] border-blue-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {session.channels === 2 ? '双声道（Ch1 坐席 / Ch2 客户）' : '单声道'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">来电时间：</span>
                <span className="font-mono font-medium text-slate-700">{session.callTime}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">静音时长：</span>
                <span className="font-mono font-semibold text-slate-700">
                  {session.silenceDurationSec} 秒
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">平均语速：</span>
                <span className="font-mono font-semibold text-slate-700">
                  {session.avgSpeechRate} 字/分钟
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">抢话时长：</span>
                <span className="font-mono font-semibold text-amber-600">
                  {session.interruptDurationSec} 秒
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">平均音量：</span>
                <span className="font-mono font-semibold text-slate-700">
                  {session.avgVolumeDb} dB
                </span>
              </div>
            </div>
          </div>

          {/* 波形图区域（暗黑高对比参考样式 + 质检点色块 + 双声道支持） */}
          <div className="space-y-1">
            <div
              onClick={handleWaveformClick}
              className="relative w-full bg-[#090d16] rounded border border-slate-700 overflow-hidden cursor-pointer select-none"
            >
              {/* Quality Hit Region Color Blocks Overlay */}
              {session.hitRegions.map(region => {
                const leftPct = (region.startSec / session.durationSec) * 100;
                const widthPct = Math.max(
                  2.5,
                  ((region.endSec - region.startSec) / session.durationSec) * 100
                );
                const isPlus = region.scoreType === '加分';
                const isSelectedRule = region.ruleId === selectedRuleResult?.ruleId;

                return (
                  <div
                    key={region.id}
                    onClick={e => {
                      e.stopPropagation();
                      handleSeekTo(region.startSec);
                      handleSelectRule(region.ruleId);
                    }}
                    title={`${region.ruleName}（${region.tagLabel}，${formatTimeMMSS(
                      region.startSec
                    )} - ${formatTimeMMSS(region.endSec)}）`}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    className={`absolute top-0 ${
                      compactAudioZone ? 'bottom-4' : 'bottom-5'
                    } z-10 transition-all cursor-pointer group ${
                      isPlus
                        ? 'bg-emerald-500/25 border-x border-emerald-400/80 hover:bg-emerald-500/35'
                        : 'bg-rose-500/25 border-x border-rose-400/80 hover:bg-rose-500/35'
                    } ${isSelectedRule ? 'ring-1 ring-inset ring-amber-300' : ''}`}
                  >
                    <div
                      className={`px-1 py-0.2 text-[10px] font-medium truncate leading-tight ${
                        isPlus ? 'bg-emerald-600/90 text-white' : 'bg-rose-600/90 text-white'
                      }`}
                    >
                      {region.tagLabel}
                    </div>
                  </div>
                );
              })}

              {/* Channel 1 Track (or Mono Track) */}
              <div
                className={`relative flex items-center px-1 border-b border-slate-800/80 ${
                  compactAudioZone ? 'h-8' : 'h-14'
                }`}
              >
                <span className="absolute left-1.5 top-0.5 text-[10px] font-mono text-sky-300/80 z-20 pointer-events-none">
                  {session.channels === 2 ? 'Ch1 坐席声道' : '单声道波形'}
                </span>
                {/* Center zero-line */}
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-rose-500/35 pointer-events-none" />
                <div
                  className={`w-full flex items-center justify-between gap-[1.5px] z-0 ${
                    compactAudioZone ? 'h-6' : 'h-11'
                  }`}
                >
                  {session.waveformPeaksCh1.map((peak, idx) => {
                    const barPct = (idx / session.waveformPeaksCh1.length) * 100;
                    const played = barPct <= progressPercent;
                    return (
                      <div
                        key={`ch1_${idx}`}
                        style={{ height: `${Math.round(peak * 100)}%` }}
                        className={`flex-1 rounded-[1px] transition-colors ${
                          played ? 'bg-[#38bdf8]' : 'bg-[#1d4ed8]/85'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Channel 2 Track (Only rendered for Dual-Channel calls) */}
              {session.channels === 2 && session.waveformPeaksCh2 && (
                <div
                  className={`relative flex items-center px-1 border-b border-slate-800/80 ${
                    compactAudioZone ? 'h-8' : 'h-14'
                  }`}
                >
                  <span className="absolute left-1.5 top-0.5 text-[10px] font-mono text-teal-300/80 z-20 pointer-events-none">
                    Ch2 客户声道
                  </span>
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-rose-500/35 pointer-events-none" />
                  <div
                    className={`w-full flex items-center justify-between gap-[1.5px] z-0 ${
                      compactAudioZone ? 'h-6' : 'h-11'
                    }`}
                  >
                    {session.waveformPeaksCh2.map((peak, idx) => {
                      const barPct = (idx / session.waveformPeaksCh2.length) * 100;
                      const played = barPct <= progressPercent;
                      return (
                        <div
                          key={`ch2_${idx}`}
                          style={{ height: `${Math.round(peak * 100)}%` }}
                          className={`flex-1 rounded-[1px] transition-colors ${
                            played ? 'bg-teal-400' : 'bg-cyan-700/80'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Time Axis Ruler */}
              <div
                className={`bg-[#0f1624] px-2 flex items-center justify-between text-[10px] font-mono text-slate-400 ${
                  compactAudioZone ? 'h-4' : 'h-5'
                }`}
              >
                {timeMarkers.map(sec => (
                  <span key={sec}>{formatTimeMMSS(sec)}</span>
                ))}
              </div>

              {/* Current Playback Cursor Line */}
              <div
                style={{ left: `${progressPercent}%` }}
                className="absolute top-0 bottom-0 w-[2px] bg-amber-400 z-30 pointer-events-none shadow-[0_0_6px_rgba(251,191,36,0.9)]"
              >
                <div className="w-2.5 h-2.5 -ml-[4px] bg-amber-400 rotate-45 -mt-1" />
              </div>
            </div>

            {/* Waveform Legend */}
            {session.hitRegions.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                <span className="font-medium text-slate-600">声波质检命中区域标注：</span>
                {session.hitRegions.map(reg => (
                  <button
                    key={`leg_${reg.id}`}
                    type="button"
                    onClick={() => {
                      handleSeekTo(reg.startSec);
                      handleSelectRule(reg.ruleId);
                    }}
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded border text-[11px] cursor-pointer transition-colors ${
                      reg.scoreType === '加分'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-xs ${
                        reg.scoreType === '加分' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <span>
                      {reg.tagLabel} ({formatTimeMMSS(reg.startSec)}~{formatTimeMMSS(reg.endSec)})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 播控工具栏：播放/暂停、后退10s、前进10s、重头播放、拖动快进、倍速、循环、音量 */}
          <div
            className={`flex flex-wrap items-center gap-3 text-xs ${
              compactAudioZone ? 'pt-0' : 'pt-1'
            }`}
          >
            {/* Transport Buttons */}
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={handleTogglePlay}
                className={`${
                  compactAudioZone ? 'h-7 px-3' : 'h-8 px-3.5'
                } bg-[#1677ff] hover:bg-blue-600 text-white rounded flex items-center space-x-1.5 font-medium cursor-pointer shadow-2xs transition-colors`}
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                <span>{isPlaying ? '暂停' : '播放'}</span>
              </button>

              <button
                type="button"
                onClick={handleRewind10}
                className={`${
                  compactAudioZone ? 'h-7 px-2' : 'h-8 px-2.5'
                } bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded flex items-center space-x-1 cursor-pointer transition-colors`}
                title="后退 10 秒"
              >
                <Rewind size={12} />
                <span>后退10s</span>
              </button>

              <button
                type="button"
                onClick={handleForward10}
                className={`${
                  compactAudioZone ? 'h-7 px-2' : 'h-8 px-2.5'
                } bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded flex items-center space-x-1 cursor-pointer transition-colors`}
                title="前进 10 秒"
              >
                <FastForward size={12} />
                <span>前进10s</span>
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className={`${
                  compactAudioZone ? 'h-7 px-2' : 'h-8 px-2.5'
                } bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded flex items-center space-x-1 cursor-pointer transition-colors`}
                title="重新开始播放"
              >
                <RotateCcw size={12} />
                <span>重新开始</span>
              </button>
            </div>

            {/* Drag Progress Slider + Time */}
            <div className="flex-1 min-w-[200px] flex items-center space-x-2.5 px-2">
              <input
                type="range"
                min={0}
                max={session.durationSec}
                step={0.1}
                value={currentTime}
                onChange={e => handleSeekTo(Number(e.target.value))}
                className="flex-1 h-1.5 accent-[#1677ff] cursor-pointer"
                aria-label="播放进度条"
              />
              <span className="font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                <strong className="text-[#1677ff]">{formatTimeMMSS(currentTime)}</strong> /{' '}
                {formatTimeMMSS(session.durationSec)}
              </span>
            </div>

            {/* Speed Controls (1x / 1.5x / 2x) & Loop Toggle */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">倍速：</span>
              {([1, 1.5, 2] as const).map(rate => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setPlaybackRate(rate)}
                  className={`h-7 px-2 rounded border text-xs font-mono cursor-pointer transition-colors ${
                    playbackRate === rate
                      ? 'bg-blue-50 text-[#1677ff] border-[#1677ff] font-semibold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {rate}x
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsLoop(prev => !prev)}
                className={`h-7 px-2.5 rounded border text-xs flex items-center space-x-1 cursor-pointer transition-colors ml-1 ${
                  isLoop
                    ? 'bg-blue-50 text-[#1677ff] border-[#1677ff] font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Repeat size={12} />
                <span>循环</span>
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
              <button
                type="button"
                onClick={() => setIsMuted(prev => !prev)}
                className="text-slate-500 hover:text-[#1677ff] cursor-pointer"
                title={isMuted ? '取消静音' : '静音'}
              >
                {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={e => {
                  const val = Number(e.target.value);
                  setVolume(val);
                  if (val > 0 && isMuted) setIsMuted(false);
                }}
                className="w-20 h-1.5 accent-[#1677ff] cursor-pointer"
                aria-label="音量调节"
              />
              <span className="w-8 text-right font-mono text-[11px] text-slate-500 tabular-nums">
                {isMuted ? 0 : volume}%
              </span>
            </div>
          </div>
        </div>

        {/* ====================================================================
         * 下方左右分栏：下左（录音转写对话区） + 下右（质检结果展示区）
         * ==================================================================== */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-hidden min-h-0">
          {/* ==================== 下左：录音转写对话区 (7 cols) ==================== */}
          <div className="lg:col-span-7 bg-white rounded-sm border border-slate-200/80 shadow-xs flex flex-col overflow-hidden min-h-0">
            {/* Transcript Toolbar (matching screenshot top-left bar) */}
            <div className="px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 flex-shrink-0 bg-white">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <span className="w-1 h-3.5 bg-[#1677ff] rounded-full"></span>
                  <span className="text-[13px] font-bold text-slate-800">对话文本</span>
                </div>

                {/* 开关：显示/隐藏录音属性（语速、音量） */}
                <label className="inline-flex items-center space-x-1.5 text-xs text-slate-600 cursor-pointer">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showAudioProps}
                    onClick={() => setShowAudioProps(prev => !prev)}
                    className={`w-8 h-4.5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                      showAudioProps ? 'bg-[#1677ff] justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
                  </button>
                  <span>显示录音属性</span>
                </label>

                {/* 开关：文本是否跟随录音播放滚动 */}
                <label className="inline-flex items-center space-x-1.5 text-xs text-slate-600 cursor-pointer">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={followAudioScroll}
                    onClick={() => setFollowAudioScroll(prev => !prev)}
                    className={`w-8 h-4.5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                      followAudioScroll ? 'bg-[#1677ff] justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
                  </button>
                  <span>跟随播放滚动</span>
                </label>
              </div>

              {/* 关键词搜索栏（支持100字以内任意字符 + 上一个/下一个跳转 + 高亮） */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500 tabular-nums whitespace-nowrap">
                  共<strong className="text-[#1677ff] mx-0.5">{searchMatches.length}</strong>个，第
                  <strong className="text-[#1677ff] mx-0.5">
                    {searchMatches.length > 0 ? activeMatchIndex + 1 : 0}
                  </strong>
                  个
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    disabled={searchMatches.length === 0}
                    onClick={() => jumpToSearchMatch(activeMatchIndex - 1)}
                    className="h-7 px-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs disabled:opacity-40 cursor-pointer disabled:pointer-events-none"
                  >
                    上一个
                  </button>
                  <button
                    type="button"
                    disabled={searchMatches.length === 0}
                    onClick={() => jumpToSearchMatch(activeMatchIndex + 1)}
                    className="h-7 px-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs disabled:opacity-40 cursor-pointer disabled:pointer-events-none"
                  >
                    下一个
                  </button>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    maxLength={100}
                    value={searchKeyword}
                    onChange={e => {
                      setSearchKeyword(e.target.value.slice(0, 100));
                      setActiveMatchIndex(0);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && searchMatches.length > 0) {
                        jumpToSearchMatch(activeMatchIndex + 1);
                      }
                    }}
                    placeholder="输入关键词(100字内)"
                    className="w-44 h-7 pl-2.5 pr-11 bg-white border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#1677ff]"
                  />
                  {searchKeyword && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchKeyword('');
                        setActiveMatchIndex(0);
                      }}
                      className="absolute right-6 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="清空搜索"
                    >
                      <X size={12} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => jumpToSearchMatch(activeMatchIndex)}
                    className="absolute right-2 text-slate-400 hover:text-[#1677ff] cursor-pointer"
                    title="定位关键词"
                  >
                    <Search size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Transcript Bubbles Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#f7f8fa] custom-scrollbar">
              {session.utterances.map(u => {
                const isAgent = u.speaker === '坐席';
                const isCurrentUtterance = u.id === activeUtteranceId;
                const shouldBold = isCurrentUtterance && followAudioScroll;
                const hasQualityTags = u.qualityTags.length > 0;

                return (
                  <div
                    key={u.id}
                    ref={el => {
                      utteranceRefs.current[u.id] = el;
                    }}
                    onClick={() => handleSeekTo(u.startSec)}
                    className={`flex items-start gap-2.5 cursor-pointer group ${
                      isAgent ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {/* Customer Left Avatar */}
                    {!isAgent && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 flex-shrink-0 mt-0.5">
                        <User size={16} />
                      </div>
                    )}

                    {/* Bubble + Attributes + Quality Hit Tags */}
                    <div
                      className={`max-w-[78%] flex flex-col ${
                        isAgent ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`px-3.5 py-2.5 rounded-lg text-[12.5px] leading-relaxed shadow-2xs transition-all border ${
                          isAgent
                            ? isCurrentUtterance
                              ? 'bg-[#1677ff] text-white border-blue-600 ring-2 ring-blue-300'
                              : 'bg-[#e8f2ff] text-slate-800 border-blue-200/80 group-hover:border-blue-300'
                            : isCurrentUtterance
                            ? 'bg-white text-slate-900 border-[#1677ff] ring-2 ring-blue-200'
                            : 'bg-white text-slate-800 border-slate-200/80 group-hover:border-slate-300'
                        } ${shouldBold ? 'font-bold' : 'font-normal'}`}
                      >
                        {renderHighlightedUtteranceText(u)}
                      </div>

                      {/* Timestamp & Recording Attributes Row */}
                      <div
                        className={`mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400 ${
                          isAgent ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span className="font-mono tabular-nums">{u.timeLabel}</span>
                        {showAudioProps && (
                          <>
                            <span>·</span>
                            <span className="tabular-nums">语速 {u.speechRate} 字/分钟</span>
                            <span>·</span>
                            <span className="tabular-nums">音量 {u.volumeDb} dB</span>
                          </>
                        )}
                      </div>

                      {/* 质检项命中的质检点标签显示在对应句子下方 */}
                      {hasQualityTags && (
                        <div
                          className={`mt-1.5 flex flex-wrap gap-1.5 ${
                            isAgent ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {u.qualityTags.map((tag, tIdx) => {
                            const isPlus = tag.scoreType === '加分';
                            return (
                              <button
                                key={`${u.id}_tag_${tIdx}`}
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleSeekTo(u.startSec);
                                  handleSelectRule(tag.ruleId);
                                }}
                                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium border cursor-pointer transition-colors ${
                                  isPlus
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                }`}
                              >
                                <Tag size={11} />
                                <span>
                                  质检点：{tag.tagLabel}（
                                  {tag.scoreDelta > 0 ? `+${tag.scoreDelta}` : tag.scoreDelta}分）
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Agent Right Avatar */}
                    {isAgent && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-[#1677ff] flex-shrink-0 mt-0.5">
                        <Headphones size={16} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ==================== 下右：质检结果展示区 (5 cols) ==================== */}
          <div className="lg:col-span-5 bg-white rounded-sm border border-slate-200/80 shadow-xs flex flex-col overflow-hidden min-h-0">
            {/* Result Header */}
            <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-white">
              <div className="flex items-center space-x-1.5">
                <span className="w-1 h-3.5 bg-[#1677ff] rounded-full"></span>
                <span className="text-[13px] font-bold text-slate-800">质检结果（专项质检）</span>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">({session.scoringStrategy}策略)</span>
                <span className="text-slate-600 font-medium">总得分：</span>
                <span
                  className={`text-[15px] font-bold font-mono tabular-nums ${
                    session.score >= 80
                      ? 'text-emerald-600'
                      : session.score >= 60
                      ? 'text-[#1677ff]'
                      : 'text-rose-600'
                  }`}
                >
                  {session.score}
                </span>
                {detailMode === 'grade_query' && (
                  <button
                    type="button"
                    onClick={() => {
                      const preSelected = session.ruleResults
                        .filter(
                          r =>
                            (r.appealStatus || '未申诉') === '未申诉' ||
                            r.appealStatus === '已驳回'
                        )
                        .filter(r => r.isHit)
                        .map(r => r.ruleId);
                      const fallbackRuleIds =
                        preSelected.length > 0
                          ? [preSelected[0]]
                          : session.ruleResults[0]
                          ? [session.ruleResults[0].ruleId]
                          : [];
                      const initialScores: Record<string, string> = {};
                      session.ruleResults.forEach(r => {
                        initialScores[r.ruleId] = String(
                          r.scoreDelta < 0 ? 0 : r.scoreDelta === 0 ? 5 : r.scoreDelta
                        );
                      });
                      setSelectedAppealRuleIds(fallbackRuleIds);
                      setAppealScoresMap(initialScores);
                      setAppealReasonInput('');
                      setAppealFormError('');
                      setAppealModalOpen(true);
                    }}
                    className="ml-1.5 h-7 px-3 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded cursor-pointer transition-colors shadow-2xs"
                  >
                    申诉
                  </button>
                )}
              </div>
            </div>

            {/* Rules Result Table */}
            <div className="max-h-[44%] overflow-auto border-b border-slate-200 flex-shrink-0 custom-scrollbar">
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 bg-[#dbe7fb] text-slate-700 text-xs font-semibold">
                  <tr>
                    <th className="py-2 px-3 text-left border-r border-white">规则名称</th>
                    <th className="py-2 px-2.5 text-center border-r border-white w-[78px]">
                      是否命中
                    </th>
                    {detailMode !== 'special' && (
                      <th className="py-2 px-2.5 text-center border-r border-white w-[78px]">
                        状态
                      </th>
                    )}
                    <th
                      className={`py-2 px-2.5 text-center w-[68px] ${
                        detailMode === 'issue_review' ? 'border-r border-white' : ''
                      }`}
                    >
                      评分
                    </th>
                    {detailMode === 'issue_review' && (
                      <th className="py-2 px-2.5 text-center w-[68px]">操作</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs bg-white">
                  {session.ruleResults.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          detailMode === 'special'
                            ? 3
                            : detailMode === 'issue_review'
                            ? 5
                            : 4
                        }
                        className="py-6 text-center text-slate-400"
                      >
                        暂无质检规则结果
                      </td>
                    </tr>
                  ) : (
                    session.ruleResults.map(res => {
                      const isSelected = selectedRuleResult?.ruleId === res.ruleId;
                      const ruleStatus: RuleAppealStatus = res.appealStatus || '未申诉';
                      return (
                        <tr
                          key={res.ruleId}
                          onClick={() => handleSelectRule(res.ruleId)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/75' : 'hover:bg-[#f5f8ff]'
                          }`}
                        >
                          <td className="py-2.5 px-3">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleSelectRule(res.ruleId);
                              }}
                              className={`text-left font-medium hover:underline cursor-pointer flex items-center space-x-1 ${
                                isSelected ? 'text-[#1677ff] font-semibold' : 'text-[#1677ff]'
                              }`}
                            >
                              <span>{res.ruleName}</span>
                            </button>
                          </td>
                          <td className="py-2.5 px-2.5 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                                res.isHit
                                  ? 'bg-blue-50 text-[#1677ff] border-blue-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              {res.isHit ? '已命中' : '未命中'}
                            </span>
                          </td>
                          {detailMode !== 'special' && (
                            <td className="py-2.5 px-2.5 text-center">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap ${
                                  ruleStatus === '已申诉'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : ruleStatus === '已复核'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : ruleStatus === '已驳回'
                                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                                    : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}
                              >
                                {ruleStatus}
                              </span>
                            </td>
                          )}
                          <td
                            className={`py-2.5 px-2.5 text-center font-mono font-semibold tabular-nums ${
                              res.scoreDelta > 0
                                ? 'text-emerald-600'
                                : res.scoreDelta < 0
                                ? 'text-rose-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {res.scoreDisplay}
                          </td>
                          {detailMode === 'issue_review' && (
                            <td className="py-2.5 px-2.5 text-center">
                              {ruleStatus === '已申诉' ? (
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setReviewingRule(res);
                                    setReviewScoreInput(
                                      String(res.appealScore !== undefined ? res.appealScore : res.scoreDelta)
                                    );
                                    setReviewReasonInput('');
                                    setReviewFormError('');
                                  }}
                                  className="text-[#1677ff] hover:text-blue-700 hover:underline font-medium cursor-pointer"
                                >
                                  复核
                                </button>
                              ) : (
                                <span className="text-slate-300">--</span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Selected Rule Conditions Breakdown (referencing image_a606e25b.png) */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-[#f9fafc]">
              {selectedRuleResult ? (
                <>
                  {/* Rule Conditions Section Header with Collapse/Expand All */}
                  <div className="px-4 py-2 bg-white border-b border-slate-200/80 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="px-2 py-0.5 bg-[#1677ff] text-white text-[11px] font-medium rounded-2xs flex-shrink-0">
                        质检点
                      </span>
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {selectedRuleResult.ruleName}
                      </span>
                      <span className="text-[11px] text-slate-400 flex-shrink-0">
                        （{selectedRuleResult.conditions.length} 条配置条件）
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={handleToggleAllConditions}
                        className="h-6 px-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded text-[11px] flex items-center space-x-1 cursor-pointer"
                      >
                        <ChevronsUpDown size={11} />
                        <span>展开/收起条件</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConditionPanelOpen(prev => !prev)}
                        className="text-xs text-[#1677ff] hover:underline flex items-center space-x-0.5 cursor-pointer"
                      >
                        {isConditionPanelOpen ? (
                          <>
                            <ChevronUp size={13} />
                            <span>收起</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown size={13} />
                            <span>展开</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Conditions Cards List */}
                  {isConditionPanelOpen && (
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
                      {selectedRuleResult.conditions.map((cond, cIdx) => {
                        const isCollapsed = Boolean(collapsedConditionIds[cond.conditionId]);
                        return (
                          <div
                            key={cond.conditionId}
                            className="bg-white border border-slate-200 rounded overflow-hidden shadow-2xs"
                          >
                            {/* Condition Bar Header (matching ▼ 条件A 通用/关键词  < 1 / 1 >) */}
                            <button
                              type="button"
                              onClick={() => toggleSingleCondition(cond.conditionId)}
                              className="w-full px-3 py-2 bg-[#f3f5f8] hover:bg-[#ebeff5] border-b border-slate-200/80 flex items-center justify-between text-xs cursor-pointer transition-colors"
                            >
                              <div className="flex items-center space-x-2">
                                {isCollapsed ? (
                                  <ChevronDown size={13} className="text-slate-500" />
                                ) : (
                                  <ChevronUp size={13} className="text-slate-500" />
                                )}
                                <span className="font-semibold text-slate-700">
                                  {cond.conditionLabel}
                                </span>
                                <span className="text-slate-600">{cond.ruleType}</span>
                              </div>

                              <div className="flex items-center space-x-2">
                                <span
                                  className={`inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[11px] font-medium border ${
                                    cond.isHit
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}
                                >
                                  {cond.isHit ? (
                                    <CheckCircle2 size={10} />
                                  ) : (
                                    <XCircle size={10} />
                                  )}
                                  <span>{cond.isHit ? '条件命中' : '未命中'}</span>
                                </span>
                                <span className="text-[11px] font-mono text-slate-400">
                                  &lt; {cIdx + 1} / {selectedRuleResult.conditions.length} &gt;
                                </span>
                              </div>
                            </button>

                            {/* Condition Body */}
                            {!isCollapsed && (
                              <div className="p-3 space-y-2.5 text-xs">
                                <div className="text-slate-600">
                                  规则配置要求：
                                  <span className="text-[#1677ff] font-medium ml-1">
                                    {cond.ruleType}
                                  </span>
                                </div>

                                {/* Expression / Semantic Prompt Gray Box */}
                                <div className="px-3 py-2 bg-[#f0f2f5] border border-slate-200/80 rounded font-mono text-[11.5px] text-slate-700 break-all">
                                  {cond.expressionOrDesc}
                                </div>

                                {cond.wordDistance && (
                                  <div className="text-slate-700 font-medium">
                                    词距离：<span className="font-mono">{cond.wordDistance}</span>
                                  </div>
                                )}

                                {/* Attributes Grid (2 cols matching image_a606e25b.png) */}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11.5px] text-slate-600 pt-1">
                                  <div>
                                    <span className="text-slate-400">适用角色：</span>
                                    <span className="text-slate-700">{cond.applicableRole}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">前置条件：</span>
                                    <span className="text-slate-700">{cond.precondition}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">检测范围：</span>
                                    <span className="text-slate-700">{cond.detectionScope}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">至少命中次数：</span>
                                    <span className="text-slate-700 font-mono">
                                      {cond.minHitCount} 次（实测 {cond.actualHitCount} 次）
                                    </span>
                                  </div>
                                </div>

                                {/* Matched Snippet Tags (matching red-boxed bottom chip in image_a606e25b.png) */}
                                <div className="pt-1.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                                  <span className="text-[11px] text-slate-400">命中片段：</span>
                                  {cond.isHit && cond.matchedSnippets.length > 0 ? (
                                    cond.matchedSnippets.map((snip, sIdx) => (
                                      <button
                                        key={sIdx}
                                        type="button"
                                        onClick={() => {
                                          const firstUId = cond.matchedUtteranceIds[0];
                                          const foundU = session.utterances.find(
                                            item => item.id === firstUId
                                          );
                                          if (foundU) {
                                            handleSeekTo(foundU.startSec);
                                            const el = utteranceRefs.current[foundU.id];
                                            if (el) {
                                              el.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'center',
                                              });
                                            }
                                          }
                                        }}
                                        className="px-2 py-1 bg-[#e5e7eb] hover:bg-slate-300 text-slate-700 rounded text-[11.5px] font-medium cursor-pointer transition-colors"
                                        title="点击定位到对应对话句"
                                      >
                                        <span>命中词：</span>
                                        <span className="text-rose-600 font-semibold">{snip}</span>
                                      </button>
                                    ))
                                  ) : (
                                    <span className="text-[11px] text-slate-400">
                                      本次通话未触及该条件
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                  点击上方高亮规则名称，查看对应的配置条件与命中详情
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 通话详情弹窗 */}
      {callInfoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="h-11 px-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info size={15} className="text-[#1677ff]" />
                <h3 className="text-sm font-bold text-slate-800">通话基础属性详情</h3>
              </div>
              <button
                type="button"
                onClick={() => setCallInfoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-slate-400">会话流水号</div>
                <div className="font-mono font-medium text-slate-800 mt-0.5 break-all">
                  {session.serialNo}
                </div>
              </div>
              <div>
                <div className="text-slate-400">所属专项任务</div>
                <div className="font-medium text-slate-800 mt-0.5">{task.name}</div>
              </div>
              <div>
                <div className="text-slate-400">来电时间</div>
                <div className="font-mono text-slate-800 mt-0.5">{session.callTime}</div>
              </div>
              <div>
                <div className="text-slate-400">通话时长 / 声道</div>
                <div className="text-slate-800 mt-0.5">
                  {session.durationSec} 秒 · {session.channels === 2 ? '双声道' : '单声道'}
                </div>
              </div>
              <div>
                <div className="text-slate-400">静音时长</div>
                <div className="text-slate-800 mt-0.5">{session.silenceDurationSec} 秒</div>
              </div>
              <div>
                <div className="text-slate-400">抢话时长</div>
                <div className="text-slate-800 mt-0.5">{session.interruptDurationSec} 秒</div>
              </div>
              <div>
                <div className="text-slate-400">平均语速</div>
                <div className="text-slate-800 mt-0.5">{session.avgSpeechRate} 字/分钟</div>
              </div>
              <div>
                <div className="text-slate-400">平均音量</div>
                <div className="text-slate-800 mt-0.5">{session.avgVolumeDb} dB</div>
              </div>
            </div>
            <div className="h-12 px-5 bg-[#f9fafc] border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setCallInfoModalOpen(false)}
                className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs rounded cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
       * 申诉记录弹窗（坐席申诉记录 + 质检员复核记录）
       * ==================================================================== */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl w-[740px] max-w-[94vw] max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="h-12 px-5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <History size={16} className="text-[#1677ff]" />
                <h3 className="text-sm font-bold text-slate-800">申诉与复核记录</h3>
                <span className="text-xs font-mono text-slate-400">{session.serialNo}</span>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs custom-scrollbar">
              {/* Section 1: 坐席申诉记录 */}
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2 font-bold text-slate-800 text-[13px]">
                  <span className="w-1 h-3.5 bg-[#1677ff] rounded-full"></span>
                  <span>坐席申诉记录（{appealHistory.length}）</span>
                </div>

                {appealHistory.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 bg-[#f9fafc] border border-slate-200/80 rounded">
                    暂无坐席申诉记录
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {appealHistory.map((item, idx) => (
                      <div
                        key={item.id}
                        className="border border-slate-200 rounded bg-[#f9fafc] p-3.5 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-blue-50 text-[#1677ff] border border-blue-200 rounded font-medium">
                              申诉记录 #{appealHistory.length - idx}
                            </span>
                            <span className="text-slate-700 font-semibold">
                              申诉人：{item.appellant}
                            </span>
                          </div>
                          <span className="font-mono text-slate-500">
                            申诉时间：{item.appealTime}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-slate-500 font-medium">申诉质检规则项：</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {item.items.map(r => (
                              <div
                                key={`${item.id}_${r.ruleId}`}
                                className="bg-white border border-slate-200 rounded px-2.5 py-1.5 flex items-center justify-between"
                              >
                                <span className="text-slate-700 font-medium truncate mr-2">
                                  {r.ruleName}
                                </span>
                                <span className="font-mono text-[11px] whitespace-nowrap">
                                  原分 {r.originalScoreDisplay} →{' '}
                                  <strong className="text-[#1677ff]">
                                    申诉分 {r.appealScore}
                                  </strong>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-slate-700 bg-white border border-slate-200/80 rounded px-3 py-2">
                          <span className="text-slate-400">申诉原因：</span>
                          <span>{item.reason}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: 质检员复核记录 */}
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2 font-bold text-slate-800 text-[13px]">
                  <span className="w-1 h-3.5 bg-emerald-500 rounded-full"></span>
                  <span>质检员复核记录（{reviewHistory.length}）</span>
                </div>

                {reviewHistory.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 bg-[#f9fafc] border border-slate-200/80 rounded">
                    暂无质检员复核记录
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {reviewHistory.map((rv, idx) => (
                      <div
                        key={rv.id}
                        className="border border-slate-200 rounded bg-white p-3.5 space-y-2 shadow-2xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded font-medium border ${
                                rv.decision === '通过'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-600 border-rose-200'
                              }`}
                            >
                              复核{rv.decision} #{reviewHistory.length - idx}
                            </span>
                            <span className="font-semibold text-slate-800">{rv.ruleName}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-slate-500">
                            <span>
                              复核人：<strong className="text-slate-700">{rv.reviewer}</strong>
                            </span>
                            <span className="font-mono">{rv.reviewTime}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                          <span>
                            原规则评分：
                            <strong className="font-mono text-slate-800 ml-1">
                              {rv.originalScoreDelta}
                            </strong>
                          </span>
                          <span>
                            坐席申诉得分：
                            <strong className="font-mono text-[#1677ff] ml-1">
                              {rv.appealScore}
                            </strong>
                          </span>
                          <span>
                            质检员复核分：
                            <strong
                              className={`font-mono ml-1 ${
                                rv.decision === '通过' ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {rv.reviewScore}
                            </strong>
                          </span>
                        </div>

                        <div className="text-slate-700 bg-[#f9fafc] border border-slate-200/70 rounded px-3 py-2">
                          <span className="text-slate-400">复核理由：</span>
                          <span>{rv.reason}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="h-12 px-5 bg-[#f9fafc] border-t border-slate-200 flex items-center justify-end flex-shrink-0">
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs rounded cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
       * 发起质检申诉弹窗（成绩查询详情 -> 申诉按钮）
       * ==================================================================== */}
      {appealModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl w-[680px] max-w-[94vw] max-h-[86vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="h-12 px-5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <ClipboardList size={16} className="text-[#1677ff]" />
                <h3 className="text-sm font-bold text-slate-800">发起质检成绩申诉</h3>
                <span className="text-xs font-mono text-slate-400">{session.serialNo}</span>
              </div>
              <button
                type="button"
                onClick={() => setAppealModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs custom-scrollbar">
              {/* Step 1: 选择申诉项及填写申诉得分 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">
                    1. 选择申诉项（勾选需要申诉的规则并填写申诉得分）
                  </span>
                  <span className="text-[11px] text-slate-400">
                    已选 <strong className="text-[#1677ff]">{selectedAppealRuleIds.length}</strong> 项
                  </span>
                </div>

                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full border-collapse text-left">
                    <thead className="bg-[#dbe7fb] text-slate-700 text-xs font-semibold">
                      <tr>
                        <th className="w-10 py-2 text-center border-r border-white">选择</th>
                        <th className="py-2 px-3 text-left border-r border-white">规则名称</th>
                        <th className="py-2 px-2.5 text-center border-r border-white w-[76px]">
                          当前状态
                        </th>
                        <th className="py-2 px-2.5 text-center border-r border-white w-[72px]">
                          原评分
                        </th>
                        <th className="py-2 px-2.5 text-center w-[115px]">申诉得分</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {session.ruleResults.map(rule => {
                        const checked = selectedAppealRuleIds.includes(rule.ruleId);
                        const curStatus = rule.appealStatus || '未申诉';
                        const isLocked = curStatus === '已申诉' || curStatus === '已复核';
                        return (
                          <tr
                            key={`ap_row_${rule.ruleId}`}
                            onClick={() => {
                              if (isLocked) return;
                              setAppealFormError('');
                              setSelectedAppealRuleIds(prev =>
                                prev.includes(rule.ruleId)
                                  ? prev.filter(id => id !== rule.ruleId)
                                  : [...prev, rule.ruleId]
                              );
                            }}
                            className={`transition-colors ${
                              isLocked
                                ? 'bg-slate-50/70 text-slate-400 cursor-not-allowed'
                                : checked
                                ? 'bg-blue-50/60 cursor-pointer'
                                : 'hover:bg-[#f5f8ff] cursor-pointer'
                            }`}
                          >
                            <td className="py-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={isLocked}
                                onChange={() => {}}
                                className="accent-[#1677ff] cursor-pointer disabled:cursor-not-allowed"
                              />
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-800">
                              {rule.ruleName}
                            </td>
                            <td className="py-2.5 px-2.5 text-center">{curStatus}</td>
                            <td className="py-2.5 px-2.5 text-center font-mono font-semibold">
                              {rule.scoreDisplay}
                            </td>
                            <td
                              className="py-2 px-2.5 text-center"
                              onClick={e => e.stopPropagation()}
                            >
                              {checked ? (
                                <input
                                  type="number"
                                  value={appealScoresMap[rule.ruleId] ?? '0'}
                                  onChange={e => {
                                    setAppealFormError('');
                                    setAppealScoresMap(prev => ({
                                      ...prev,
                                      [rule.ruleId]: e.target.value,
                                    }));
                                  }}
                                  placeholder="申诉分"
                                  className="w-24 h-7 px-2 text-center bg-white border border-[#1677ff] rounded text-xs font-mono focus:outline-none"
                                />
                              ) : (
                                <span className="text-slate-300">--</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Step 2: 说明申诉原因 */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  2. 申诉原因说明 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={appealReasonInput}
                  onChange={e => {
                    setAppealReasonInput(e.target.value);
                    setAppealFormError('');
                  }}
                  placeholder="请详细说明申诉依据（如：对应时间点坐席已完整口播、语音识别误差等）..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                />
              </div>

              {appealFormError && (
                <div className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 border border-rose-200 rounded text-rose-600">
                  <AlertCircle size={13} />
                  <span>{appealFormError}</span>
                </div>
              )}
            </div>

            <div className="h-12 px-5 bg-[#f9fafc] border-t border-slate-200 flex items-center justify-end space-x-2.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setAppealModalOpen(false)}
                className="h-8 px-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 text-xs rounded cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedAppealRuleIds.length === 0) {
                    setAppealFormError('请至少选择一条需要申诉的质检规则。');
                    return;
                  }
                  const parsedItems: Array<{ ruleId: string; appealScore: number }> = [];
                  for (const rId of selectedAppealRuleIds) {
                    const raw = (appealScoresMap[rId] ?? '').trim();
                    if (raw === '' || isNaN(Number(raw))) {
                      setAppealFormError('请为所有选中的申诉规则填写有效的申诉得分。');
                      return;
                    }
                    parsedItems.push({ ruleId: rId, appealScore: Number(raw) });
                  }
                  if (!appealReasonInput.trim()) {
                    setAppealFormError('请填写申诉原因说明。');
                    return;
                  }
                  if (onSubmitAppeal) {
                    onSubmitAppeal({
                      items: parsedItems,
                      reason: appealReasonInput.trim(),
                    });
                  }
                  setAppealModalOpen(false);
                  showDetailToast(`已提交 ${parsedItems.length} 项规则的申诉申请，等待分发复核`);
                }}
                className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded cursor-pointer"
              >
                提交申诉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
       * 质检规则复核弹窗（问题复核 -> 待复核 -> 规则操作列“复核”）
       * ==================================================================== */}
      {reviewingRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl w-[540px] max-w-[94vw] flex flex-col overflow-hidden border border-slate-200">
            <div className="h-12 px-5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-[#1677ff]" />
                <h3 className="text-sm font-bold text-slate-800">质检规则申诉复核</h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewingRule(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-[#f9fafc] border border-slate-200/80 rounded p-3.5 space-y-2.5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3 sm:col-span-1">
                    <div className="text-slate-400">规则名称</div>
                    <div className="font-semibold text-slate-800 mt-0.5">
                      {reviewingRule.ruleName}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">评分（原机检分）</div>
                    <div className="font-mono font-bold text-slate-800 mt-0.5">
                      {reviewingRule.scoreDisplay}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">申诉得分</div>
                    <div className="font-mono font-bold text-[#1677ff] mt-0.5">
                      {reviewingRule.appealScore !== undefined
                        ? reviewingRule.appealScore
                        : '--'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/70">
                  <div className="text-slate-400 mb-1">申诉理由</div>
                  <div className="text-slate-700 bg-white border border-slate-200/80 rounded px-2.5 py-2 leading-relaxed">
                    {reviewingRule.appealReason || '坐席申请对该规则评分进行人工复核。'}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  复核分 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={reviewScoreInput}
                  onChange={e => {
                    setReviewScoreInput(e.target.value);
                    setReviewFormError('');
                  }}
                  placeholder="请输入复核后的规则分值"
                  className="w-full h-8 px-3 bg-white border border-slate-200 rounded text-xs font-mono text-slate-800 focus:outline-none focus:border-[#1677ff]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  复核理由 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reviewReasonInput}
                  onChange={e => {
                    setReviewReasonInput(e.target.value);
                    setReviewFormError('');
                  }}
                  placeholder="请填写核听录音后的复核结论与依据..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#1677ff]"
                />
              </div>

              {reviewFormError && (
                <div className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 border border-rose-200 rounded text-rose-600">
                  <AlertCircle size={13} />
                  <span>{reviewFormError}</span>
                </div>
              )}
            </div>

            <div className="h-12 px-5 bg-[#f9fafc] border-t border-slate-200 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setReviewingRule(null)}
                className="h-8 px-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 text-xs rounded cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (reviewScoreInput.trim() === '' || isNaN(Number(reviewScoreInput))) {
                    setReviewFormError('请填写有效的复核分。');
                    return;
                  }
                  if (!reviewReasonInput.trim()) {
                    setReviewFormError('请填写复核理由。');
                    return;
                  }
                  if (onSubmitRuleReview) {
                    onSubmitRuleReview({
                      ruleId: reviewingRule.ruleId,
                      decision: '驳回',
                      reviewScore: Number(reviewScoreInput),
                      reason: reviewReasonInput.trim(),
                    });
                  }
                  setReviewingRule(null);
                  showDetailToast('已驳回该规则申诉并生成复核记录');
                }}
                className="h-8 px-4 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded cursor-pointer"
              >
                驳回
              </button>
              <button
                type="button"
                onClick={() => {
                  if (reviewScoreInput.trim() === '' || isNaN(Number(reviewScoreInput))) {
                    setReviewFormError('请填写有效的复核分。');
                    return;
                  }
                  if (!reviewReasonInput.trim()) {
                    setReviewFormError('请填写复核理由。');
                    return;
                  }
                  if (onSubmitRuleReview) {
                    onSubmitRuleReview({
                      ruleId: reviewingRule.ruleId,
                      decision: '通过',
                      reviewScore: Number(reviewScoreInput),
                      reason: reviewReasonInput.trim(),
                    });
                  }
                  setReviewingRule(null);
                  showDetailToast('已通过该规则申诉并生成复核记录');
                }}
                className="h-8 px-4 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium rounded cursor-pointer"
              >
                通过
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialQualityDetailView;
