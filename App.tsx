import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import QualityRuleConfigWorkbench from './components/QualityRuleConfigWorkbench';
import QualityScoreItemWorkbench from './components/QualityScoreItemWorkbench';
import QualityRecordingParamWorkbench from './components/QualityRecordingParamWorkbench';
import RoutineQualityWorkbench from './components/RoutineQualityWorkbench';
import SpecialQualityWorkbench from './components/SpecialQualityWorkbench';
import QualityGradeQueryWorkbench from './components/QualityGradeQueryWorkbench';
import QualityIssueDistributionWorkbench from './components/QualityIssueDistributionWorkbench';
import QualityIssueReviewWorkbench from './components/QualityIssueReviewWorkbench';
import {
  INITIAL_QUALITY_RESULT_RECORDS,
  QualityResultRecord,
  AppealRecordEntry,
  ReviewRecordEntry,
} from './components/qualityResultData';
import { ViewState } from './types';
import { ShieldCheck, SlidersHorizontal, ClipboardCheck } from 'lucide-react';

function App() {
  // Default to the Quality Management section
  const [currentView, setCurrentView] = useState<ViewState>('QUALITY_RULE_CONFIG');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [qualityResultRecords, setQualityResultRecords] = useState<QualityResultRecord[]>(
    INITIAL_QUALITY_RESULT_RECORDS
  );

  const formatNow = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  };

  const handleDistributeQualityRecords = (recordIds: string[], inspectorName: string) => {
    const formattedTime = formatNow();

    setQualityResultRecords((prev) =>
      prev.map((rec) =>
        recordIds.includes(rec.id)
          ? {
              ...rec,
              distributionStatus: '已分发',
              distributedAt: formattedTime,
              distributor: '张颖',
              reviewer: inspectorName,
            }
          : rec
      )
    );
  };

  const handleSubmitAppeal = (
    recordId: string,
    payload: { items: Array<{ ruleId: string; appealScore: number }>; reason: string },
    appellantName: string
  ) => {
    const formattedTime = formatNow();
    const itemMap = new Map<string, number>(
      payload.items.map(it => [it.ruleId, it.appealScore])
    );

    setQualityResultRecords(prev =>
      prev.map(rec => {
        if (rec.id !== recordId) return rec;

        const appealItems: AppealRecordEntry['items'] = [];
        const updatedRules = rec.sessionDetail.ruleResults.map(rule => {
          if (!itemMap.has(rule.ruleId)) return rule;
          const appealScore = itemMap.get(rule.ruleId)!;
          appealItems.push({
            ruleId: rule.ruleId,
            ruleName: rule.ruleName,
            originalScoreDisplay: rule.scoreDisplay,
            originalScoreDelta: rule.scoreDelta,
            appealScore,
          });
          return {
            ...rule,
            appealStatus: '已申诉' as const,
            appealScore,
            appealReason: payload.reason,
          };
        });

        const newAppealEntry: AppealRecordEntry = {
          id: `AP_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          appealTime: formattedTime,
          appellant: appellantName,
          items: appealItems,
          reason: payload.reason,
        };

        const shouldResetDist = rec.status !== '已申诉未复核';

        return {
          ...rec,
          status: '已申诉未复核',
          appealTime: formattedTime,
          appellant: appellantName,
          appealReason: payload.reason,
          distributionStatus: shouldResetDist ? '待分发' : rec.distributionStatus,
          distributedAt: shouldResetDist ? '' : rec.distributedAt,
          distributor: shouldResetDist ? '' : rec.distributor,
          reviewer: shouldResetDist ? '' : rec.reviewer,
          reviewTime: shouldResetDist ? '' : rec.reviewTime,
          reviewComment: shouldResetDist ? '' : rec.reviewComment,
          appealHistory: [newAppealEntry, ...rec.appealHistory],
          sessionDetail: {
            ...rec.sessionDetail,
            ruleResults: updatedRules,
          },
        };
      })
    );
  };

  const handleSubmitRuleReview = (
    recordId: string,
    payload: {
      ruleId: string;
      decision: '通过' | '驳回';
      reviewScore: number;
      reason: string;
    }
  ) => {
    const formattedTime = formatNow();

    setQualityResultRecords(prev =>
      prev.map(rec => {
        if (rec.id !== recordId) return rec;
        const reviewerName = rec.reviewer || '陈明';
        const targetRule = rec.sessionDetail.ruleResults.find(
          r => r.ruleId === payload.ruleId
        );
        if (!targetRule) return rec;

        const prevDelta = targetRule.scoreDelta;
        const nextScoreDelta =
          payload.decision === '通过' ? payload.reviewScore : prevDelta;
        const nextScoreDisplay =
          nextScoreDelta > 0
            ? `+${nextScoreDelta}`
            : nextScoreDelta < 0
            ? `${nextScoreDelta}`
            : '0';

        const updatedRules = rec.sessionDetail.ruleResults.map(rule => {
          if (rule.ruleId !== payload.ruleId) return rule;
          return {
            ...rule,
            appealStatus:
              payload.decision === '通过' ? ('已复核' as const) : ('已驳回' as const),
            reviewScore: payload.reviewScore,
            reviewReason: payload.reason,
            scoreDelta: nextScoreDelta,
            scoreDisplay: nextScoreDisplay,
          };
        });

        const scoreDiff =
          payload.decision === '通过' ? payload.reviewScore - prevDelta : 0;
        const nextSessionScore = Math.min(
          100,
          Math.max(0, rec.sessionDetail.score + scoreDiff)
        );

        const newReviewEntry: ReviewRecordEntry = {
          id: `RV_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          reviewTime: formattedTime,
          reviewer: reviewerName,
          ruleId: targetRule.ruleId,
          ruleName: targetRule.ruleName,
          originalScoreDelta: prevDelta,
          appealScore: targetRule.appealScore ?? 0,
          reviewScore: payload.reviewScore,
          decision: payload.decision,
          reason: payload.reason,
        };

        const hasRemainingAppealedRules = updatedRules.some(
          r => r.appealStatus === '已申诉'
        );
        const hasAnyApproved = updatedRules.some(r => r.appealStatus === '已复核');

        const nextRecordStatus = hasRemainingAppealedRules
          ? '已申诉未复核'
          : hasAnyApproved || payload.decision === '通过'
          ? '已申诉已通过'
          : '已申诉已驳回';

        return {
          ...rec,
          machineScore: nextSessionScore,
          status: nextRecordStatus,
          reviewTime: hasRemainingAppealedRules ? rec.reviewTime : formattedTime,
          reviewer: reviewerName,
          reviewComment: payload.reason,
          reviewHistory: [newReviewEntry, ...rec.reviewHistory],
          sessionDetail: {
            ...rec.sessionDetail,
            score: nextSessionScore,
            ruleResults: updatedRules,
          },
        };
      })
    );
  };

  const pageMeta: Record<ViewState, { title: string; category: string; icon: any }> = {
    QUALITY_RULE_CONFIG: {
      title: '质检规则配置',
      category: '质检管理',
      icon: ShieldCheck,
    },
    QUALITY_SCORE_ITEM_MANAGEMENT: {
      title: '评分项管理',
      category: '质检管理',
      icon: ShieldCheck,
    },
    QUALITY_RECORDING_PARAM_MANAGEMENT: {
      title: '随录参数',
      category: '质检管理',
      icon: ShieldCheck,
    },
    ROUTINE_QUALITY_INSPECTION: {
      title: '常规质检',
      category: '质检策略',
      icon: SlidersHorizontal,
    },
    SPECIAL_QUALITY_INSPECTION: {
      title: '专项质检',
      category: '质检策略',
      icon: SlidersHorizontal,
    },
    QUALITY_GRADE_QUERY: {
      title: '成绩查询',
      category: '质检结果',
      icon: ClipboardCheck,
    },
    QUALITY_ISSUE_DISTRIBUTION: {
      title: '问题分发',
      category: '质检结果',
      icon: ClipboardCheck,
    },
    QUALITY_ISSUE_REVIEW: {
      title: '问题复核',
      category: '质检结果',
      icon: ClipboardCheck,
    },
  };

  const currentMeta = pageMeta[currentView] || pageMeta.QUALITY_RULE_CONFIG;

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans text-slate-900 overflow-hidden">
      {/* Left Sidebar with collapse / expand support */}
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Blue Bar */}
        <TopNav />

        {/* Breadcrumb / Top Bar Area */}
        <div className="bg-white border-b border-slate-200 px-4 py-2 text-[12.5px] text-slate-600 flex items-center justify-between flex-shrink-0 select-none">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">{currentMeta.category}</span>
            <span className="text-slate-400">/</span>
            <span className="text-blue-600 font-semibold flex items-center space-x-1.5">
              <span>{currentMeta.title}</span>
            </span>
          </div>

          {/* Quick Tabs: Core Pages */}
          <div className="flex items-center space-x-1.5 text-[11.5px]">
            <span className="text-slate-400 mr-1 text-[11px]">快捷切换:</span>

            <button
              onClick={() => setCurrentView('QUALITY_RULE_CONFIG')}
              className={`flex items-center px-2 py-0.5 rounded transition-colors cursor-pointer border text-xs ${
                currentView === 'QUALITY_RULE_CONFIG'
                  ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentView === 'QUALITY_RULE_CONFIG' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              <span>质检规则配置</span>
            </button>

            <button
              onClick={() => setCurrentView('QUALITY_SCORE_ITEM_MANAGEMENT')}
              className={`flex items-center px-2 py-0.5 rounded transition-colors cursor-pointer border text-xs ${
                currentView === 'QUALITY_SCORE_ITEM_MANAGEMENT'
                  ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentView === 'QUALITY_SCORE_ITEM_MANAGEMENT' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              <span>评分项管理</span>
            </button>

            <button
              onClick={() => setCurrentView('QUALITY_RECORDING_PARAM_MANAGEMENT')}
              className={`flex items-center px-2 py-0.5 rounded transition-colors cursor-pointer border text-xs ${
                currentView === 'QUALITY_RECORDING_PARAM_MANAGEMENT'
                  ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentView === 'QUALITY_RECORDING_PARAM_MANAGEMENT' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              <span>随录参数</span>
            </button>

            <button
              onClick={() => setCurrentView('ROUTINE_QUALITY_INSPECTION')}
              className={`flex items-center px-2 py-0.5 rounded transition-colors cursor-pointer border text-xs ${
                currentView === 'ROUTINE_QUALITY_INSPECTION'
                  ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentView === 'ROUTINE_QUALITY_INSPECTION' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              <span>常规质检</span>
            </button>

            <button
              onClick={() => setCurrentView('SPECIAL_QUALITY_INSPECTION')}
              className={`flex items-center px-2 py-0.5 rounded transition-colors cursor-pointer border text-xs ${
                currentView === 'SPECIAL_QUALITY_INSPECTION'
                  ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentView === 'SPECIAL_QUALITY_INSPECTION' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              <span>专项质检</span>
            </button>

            <button
              onClick={() => setCurrentView('QUALITY_GRADE_QUERY')}
              className={`flex items-center px-2 py-0.5 rounded transition-colors cursor-pointer border text-xs ${
                currentView === 'QUALITY_GRADE_QUERY'
                  ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentView === 'QUALITY_GRADE_QUERY' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              <span>成绩查询</span>
            </button>

            <button
              onClick={() => setCurrentView('QUALITY_ISSUE_DISTRIBUTION')}
              className={`flex items-center px-2 py-0.5 rounded transition-colors cursor-pointer border text-xs ${
                currentView === 'QUALITY_ISSUE_DISTRIBUTION'
                  ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentView === 'QUALITY_ISSUE_DISTRIBUTION' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              <span>问题分发</span>
            </button>

            <button
              onClick={() => setCurrentView('QUALITY_ISSUE_REVIEW')}
              className={`flex items-center px-2 py-0.5 rounded transition-colors cursor-pointer border text-xs ${
                currentView === 'QUALITY_ISSUE_REVIEW'
                  ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentView === 'QUALITY_ISSUE_REVIEW' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              <span>问题复核</span>
            </button>
          </div>
        </div>

        {/* Dynamic Content - Keep alive to preserve all session states */}
        <div className="flex-1 overflow-hidden relative">
          {/* Quality Inspection Rule Configuration Workbench */}
          <div className={`h-full w-full ${currentView === 'QUALITY_RULE_CONFIG' ? 'flex flex-col' : 'hidden'}`}>
            <QualityRuleConfigWorkbench />
          </div>

          {/* Quality Score Item Management Workbench */}
          <div className={`h-full w-full ${currentView === 'QUALITY_SCORE_ITEM_MANAGEMENT' ? 'flex flex-col' : 'hidden'}`}>
            <QualityScoreItemWorkbench />
          </div>

          {/* Quality Recording Parameter Management Workbench */}
          <div className={`h-full w-full ${currentView === 'QUALITY_RECORDING_PARAM_MANAGEMENT' ? 'flex flex-col' : 'hidden'}`}>
            <QualityRecordingParamWorkbench />
          </div>

          {/* Routine Quality Inspection Workbench */}
          <div className={`h-full w-full ${currentView === 'ROUTINE_QUALITY_INSPECTION' ? 'flex flex-col' : 'hidden'}`}>
            <RoutineQualityWorkbench />
          </div>

          {/* Special Quality Inspection Workbench */}
          <div className={`h-full w-full ${currentView === 'SPECIAL_QUALITY_INSPECTION' ? 'flex flex-col' : 'hidden'}`}>
            <SpecialQualityWorkbench />
          </div>

          {/* Quality Grade Query Workbench */}
          <div className={`h-full w-full ${currentView === 'QUALITY_GRADE_QUERY' ? 'flex flex-col' : 'hidden'}`}>
            <QualityGradeQueryWorkbench
              records={qualityResultRecords}
              onSubmitAppeal={handleSubmitAppeal}
            />
          </div>

          {/* Quality Issue Distribution Workbench */}
          <div className={`h-full w-full ${currentView === 'QUALITY_ISSUE_DISTRIBUTION' ? 'flex flex-col' : 'hidden'}`}>
            <QualityIssueDistributionWorkbench
              records={qualityResultRecords}
              onDistribute={handleDistributeQualityRecords}
            />
          </div>

          {/* Quality Issue Review Workbench */}
          <div className={`h-full w-full ${currentView === 'QUALITY_ISSUE_REVIEW' ? 'flex flex-col' : 'hidden'}`}>
            <QualityIssueReviewWorkbench
              records={qualityResultRecords}
              onSubmitRuleReview={handleSubmitRuleReview}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

