import React, { useState } from 'react';
import {
  ShieldCheck,
  SlidersHorizontal,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  isCollapsed: controlledCollapsed,
  onToggleCollapse 
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [qualityGroupExpanded, setQualityGroupExpanded] = useState(true);
  const [strategyGroupExpanded, setStrategyGroupExpanded] = useState(true);
  const [resultGroupExpanded, setResultGroupExpanded] = useState(true);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(prev => !prev);
    }
  };

  return (
    <div 
      className={`
        bg-[#0f172a] h-full flex flex-col flex-shrink-0 text-slate-300 shadow-xl border-r border-slate-800 select-none transition-all duration-200 z-30
        ${isCollapsed ? 'w-14' : 'w-64'}
      `}
    >
      {/* Top Logo / Toggle Area */}
      <div className={`h-12 flex items-center border-b border-slate-800/80 bg-[#0f172a] sticky top-0 z-10 ${isCollapsed ? 'justify-center px-1' : 'justify-between px-3'}`}>
        {!isCollapsed ? (
          <div className="flex items-center min-w-0">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-2 shadow-md shadow-blue-500/20 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              AI
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-100 tracking-wide text-xs block leading-tight truncate">智能客服系统</span>
              <span className="text-[10px] text-slate-500 block leading-tight mt-0.5 truncate">多渠道智能协同平台</span>
            </div>
          </div>
        ) : (
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md shadow-blue-500/20 flex items-center justify-center text-white font-bold text-xs">
            AI
          </div>
        )}

        <button
          onClick={handleToggle}
          title={isCollapsed ? "展开菜单" : "收起菜单"}
          className={`
            p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer
            ${isCollapsed ? 'mt-0' : 'ml-1'}
          `}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Menu Header (only when expanded) */}
      {!isCollapsed && (
        <div className="px-3.5 pt-3 pb-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>工作台菜单</span>
          <span className="text-[10px] text-slate-500 font-normal">支持折叠</span>
        </div>
      )}

      {/* Menu Items */}
      <div className={`flex-1 ${isCollapsed ? 'px-1.5' : 'px-2.5'} py-2 space-y-1.5 overflow-y-auto custom-scrollbar`}>
        {/* 质检管理 Group (质检规则配置 / 评分项管理 / 随录参数) */}
        {isCollapsed ? (
          <button
            onClick={() => onChangeView('QUALITY_RULE_CONFIG')}
            title="质检管理 - 质检规则配置 / 评分项管理 / 随录参数"
            className={`
              w-full h-10 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer relative group
              ${
                currentView === 'QUALITY_RULE_CONFIG' ||
                currentView === 'QUALITY_SCORE_ITEM_MANAGEMENT' ||
                currentView === 'QUALITY_RECORDING_PARAM_MANAGEMENT'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }
            `}
          >
            <ShieldCheck size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-400 ring-2 ring-slate-900"></span>
            <div className="hidden group-hover:block absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded shadow-lg whitespace-nowrap z-50 border border-slate-700 pointer-events-none">
              质检管理
            </div>
          </button>
        ) : (
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setQualityGroupExpanded(prev => !prev)}
              className="w-full p-2 flex items-center justify-between text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mr-2.5 flex-shrink-0 transition-colors ${
                    currentView === 'QUALITY_RULE_CONFIG' ||
                    currentView === 'QUALITY_SCORE_ITEM_MANAGEMENT' ||
                    currentView === 'QUALITY_RECORDING_PARAM_MANAGEMENT'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <ShieldCheck size={16} />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[12.5px] font-semibold text-slate-100 truncate">
                    质检管理
                  </div>
                  <div className="text-[10.5px] text-slate-400 truncate">
                    质检规则、评分项与随录参数
                  </div>
                </div>
              </div>
              <div className="text-slate-400 ml-1">
                {qualityGroupExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>

            {qualityGroupExpanded && (
              <div className="px-2 pb-2 pt-0.5 space-y-1">
                <button
                  type="button"
                  onClick={() => onChangeView('QUALITY_RULE_CONFIG')}
                  className={`w-full text-left pl-9 pr-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'QUALITY_RULE_CONFIG'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>质检规则配置</span>
                  <span
                    className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono ${
                      currentView === 'QUALITY_RULE_CONFIG'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    规则库
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeView('QUALITY_SCORE_ITEM_MANAGEMENT')}
                  className={`w-full text-left pl-9 pr-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'QUALITY_SCORE_ITEM_MANAGEMENT'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>评分项管理</span>
                  <span
                    className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono ${
                      currentView === 'QUALITY_SCORE_ITEM_MANAGEMENT'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    评分库
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeView('QUALITY_RECORDING_PARAM_MANAGEMENT')}
                  className={`w-full text-left pl-9 pr-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'QUALITY_RECORDING_PARAM_MANAGEMENT'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>随录参数</span>
                  <span
                    className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono ${
                      currentView === 'QUALITY_RECORDING_PARAM_MANAGEMENT'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    参数库
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 质检策略 Group (常规质检 / 专项质检) */}
        {isCollapsed ? (
          <button
            onClick={() => onChangeView('ROUTINE_QUALITY_INSPECTION')}
            title="质检策略 - 常规质检 / 专项质检"
            className={`
              w-full h-10 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer relative group
              ${
                currentView === 'ROUTINE_QUALITY_INSPECTION' ||
                currentView === 'SPECIAL_QUALITY_INSPECTION'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }
            `}
          >
            <SlidersHorizontal size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-400 ring-2 ring-slate-900"></span>
            <div className="hidden group-hover:block absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded shadow-lg whitespace-nowrap z-50 border border-slate-700 pointer-events-none">
              质检策略
            </div>
          </button>
        ) : (
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setStrategyGroupExpanded(prev => !prev)}
              className="w-full p-2 flex items-center justify-between text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mr-2.5 flex-shrink-0 transition-colors ${
                    currentView === 'ROUTINE_QUALITY_INSPECTION' ||
                    currentView === 'SPECIAL_QUALITY_INSPECTION'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <SlidersHorizontal size={16} />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[12.5px] font-semibold text-slate-100 truncate">
                    质检策略
                  </div>
                  <div className="text-[10.5px] text-slate-400 truncate">
                    常规定时质检与一次性专项任务
                  </div>
                </div>
              </div>
              <div className="text-slate-400 ml-1">
                {strategyGroupExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>

            {strategyGroupExpanded && (
              <div className="px-2 pb-2 pt-0.5 space-y-1">
                <button
                  type="button"
                  onClick={() => onChangeView('ROUTINE_QUALITY_INSPECTION')}
                  className={`w-full text-left pl-9 pr-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'ROUTINE_QUALITY_INSPECTION'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>常规质检</span>
                  <span
                    className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono ${
                      currentView === 'ROUTINE_QUALITY_INSPECTION'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    定时任务
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeView('SPECIAL_QUALITY_INSPECTION')}
                  className={`w-full text-left pl-9 pr-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'SPECIAL_QUALITY_INSPECTION'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>专项质检</span>
                  <span
                    className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono ${
                      currentView === 'SPECIAL_QUALITY_INSPECTION'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    一次性
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 质检结果 Group (成绩查询 / 问题分发 / 问题复核) */}
        {isCollapsed ? (
          <button
            onClick={() => onChangeView('QUALITY_GRADE_QUERY')}
            title="质检结果 - 成绩查询 / 问题分发 / 问题复核"
            className={`
              w-full h-10 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer relative group
              ${
                currentView === 'QUALITY_GRADE_QUERY' ||
                currentView === 'QUALITY_ISSUE_DISTRIBUTION' ||
                currentView === 'QUALITY_ISSUE_REVIEW'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }
            `}
          >
            <ClipboardCheck size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-400 ring-2 ring-slate-900"></span>
            <div className="hidden group-hover:block absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded shadow-lg whitespace-nowrap z-50 border border-slate-700 pointer-events-none">
              质检结果
            </div>
          </button>
        ) : (
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setResultGroupExpanded(prev => !prev)}
              className="w-full p-2 flex items-center justify-between text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mr-2.5 flex-shrink-0 transition-colors ${
                    currentView === 'QUALITY_GRADE_QUERY' ||
                    currentView === 'QUALITY_ISSUE_DISTRIBUTION' ||
                    currentView === 'QUALITY_ISSUE_REVIEW'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <ClipboardCheck size={16} />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[12.5px] font-semibold text-slate-100 truncate">
                    质检结果
                  </div>
                  <div className="text-[10.5px] text-slate-400 truncate">
                    成绩查询、分发与复核
                  </div>
                </div>
              </div>
              <div className="text-slate-400 ml-1">
                {resultGroupExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>

            {resultGroupExpanded && (
              <div className="px-2 pb-2 pt-0.5 space-y-1">
                <button
                  type="button"
                  onClick={() => onChangeView('QUALITY_GRADE_QUERY')}
                  className={`w-full text-left pl-9 pr-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'QUALITY_GRADE_QUERY'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>成绩查询</span>
                  <span
                    className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono ${
                      currentView === 'QUALITY_GRADE_QUERY'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    成绩库
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeView('QUALITY_ISSUE_DISTRIBUTION')}
                  className={`w-full text-left pl-9 pr-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'QUALITY_ISSUE_DISTRIBUTION'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>问题分发</span>
                  <span
                    className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono ${
                      currentView === 'QUALITY_ISSUE_DISTRIBUTION'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    申诉处理
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeView('QUALITY_ISSUE_REVIEW')}
                  className={`w-full text-left pl-9 pr-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'QUALITY_ISSUE_REVIEW'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>问题复核</span>
                  <span
                    className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono ${
                      currentView === 'QUALITY_ISSUE_REVIEW'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    质检复核
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Version & Info */}
      <div className={`p-2.5 text-[11px] text-slate-400 border-t border-slate-800 text-center bg-[#0b1120] ${isCollapsed ? 'px-1' : ''}`}>
        {!isCollapsed ? (
          <div className="flex items-center justify-center space-x-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10.5px]">语音服务引擎 · 就绪</span>
          </div>
        ) : (
          <div className="flex justify-center" title="语音服务引擎 · 就绪">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
