import React, { useState } from 'react';
import { ChevronDown, Plus, Trash2, X } from 'lucide-react';

export type ConditionOperator = '=' | '!=' | '包含' | '不包含' | '>' | '<';

export interface MatchConditionRow {
  id: string;
  field: string;
  operator: ConditionOperator;
  values: string[];
}

export interface MatchConditionGroup {
  id: string;
  conditions: MatchConditionRow[];
}

export interface ConditionFieldOption {
  value: string;
  label: string;
  presets: string[];
  defaultOperator: ConditionOperator;
}

export const CONDITION_FIELD_OPTIONS: ConditionFieldOption[] = [
  {
    value: '呼叫类型',
    label: '呼叫类型',
    presets: ['呼出', '呼入'],
    defaultOperator: '=',
  },
  {
    value: '业务线',
    label: '业务线',
    presets: ['电销部', '服务部', '信用卡中心', '财富管理部', '个贷中心', '投诉处理组'],
    defaultOperator: '=',
  },
  {
    value: '技能组名称',
    label: '技能组名称',
    presets: ['VIP专席组', '信用卡综合组', '财富顾问组', '电销外呼一组', '客服综合一组'],
    defaultOperator: '=',
  },
  {
    value: '满意度评价',
    label: '满意度评价',
    presets: ['非常满意', '满意', '一般', '不满意'],
    defaultOperator: '=',
  },
  {
    value: '挂机方',
    label: '挂机方',
    presets: ['坐席挂机', '客户挂机', '系统超时释放'],
    defaultOperator: '=',
  },
  {
    value: '通话时长(秒)',
    label: '通话时长(秒)',
    presets: ['30', '60', '180', '300'],
    defaultOperator: '>',
  },
  {
    value: '坐席工号',
    label: '坐席工号',
    presets: ['6012', '6018', '6027', '6031'],
    defaultOperator: '=',
  },
];

const OPERATOR_OPTIONS: ConditionOperator[] = ['=', '!=', '包含', '不包含', '>', '<'];

// Simulated daily voice dataset for "查询当天满足条件的数据量"
interface SimulatedDailyVoiceRecord {
  id: string;
  callType: string;
  businessLine: string;
  skillGroup: string;
  satisfaction: string;
  hangupParty: string;
  durationSec: number;
  agentId: string;
  countWeight: number; // Represents cluster volume for realistic daily scale
}

const DAILY_VOICE_DATASET: SimulatedDailyVoiceRecord[] = [
  { id: 'V1', callType: '呼出', businessLine: '电销部', skillGroup: '电销外呼一组', satisfaction: '满意', hangupParty: '客户挂机', durationSec: 215, agentId: '6012', countWeight: 386 },
  { id: 'V2', callType: '呼出', businessLine: '电销部', skillGroup: '电销外呼一组', satisfaction: '一般', hangupParty: '坐席挂机', durationSec: 142, agentId: '6027', countWeight: 245 },
  { id: 'V3', callType: '呼出', businessLine: '财富管理部', skillGroup: '财富顾问组', satisfaction: '非常满意', hangupParty: '客户挂机', durationSec: 410, agentId: '6018', countWeight: 168 },
  { id: 'V4', callType: '呼出', businessLine: '信用卡中心', skillGroup: '信用卡综合组', satisfaction: '不满意', hangupParty: '客户挂机', durationSec: 95, agentId: '6031', countWeight: 112 },
  { id: 'V5', callType: '呼入', businessLine: '服务部', skillGroup: '客服综合一组', satisfaction: '非常满意', hangupParty: '客户挂机', durationSec: 185, agentId: '6012', countWeight: 524 },
  { id: 'V6', callType: '呼入', businessLine: '服务部', skillGroup: 'VIP专席组', satisfaction: '满意', hangupParty: '坐席挂机', durationSec: 260, agentId: '6018', countWeight: 318 },
  { id: 'V7', callType: '呼入', businessLine: '信用卡中心', skillGroup: '信用卡综合组', satisfaction: '一般', hangupParty: '客户挂机', durationSec: 174, agentId: '6027', countWeight: 412 },
  { id: 'V8', callType: '呼入', businessLine: '投诉处理组', skillGroup: 'VIP专席组', satisfaction: '不满意', hangupParty: '客户挂机', durationSec: 520, agentId: '6031', countWeight: 94 },
  { id: 'V9', callType: '呼入', businessLine: '个贷中心', skillGroup: '客服综合一组', satisfaction: '满意', hangupParty: '坐席挂机', durationSec: 230, agentId: '6018', countWeight: 189 },
  { id: 'V10', callType: '呼出', businessLine: '服务部', skillGroup: '客服综合一组', satisfaction: '非常满意', hangupParty: '坐席挂机', durationSec: 120, agentId: '6012', countWeight: 156 },
];

export const TOTAL_DAILY_VOICE_COUNT = DAILY_VOICE_DATASET.reduce((sum, r) => sum + r.countWeight, 0);

function getRecordFieldValue(record: SimulatedDailyVoiceRecord, field: string): string {
  switch (field) {
    case '呼叫类型':
      return record.callType;
    case '业务线':
      return record.businessLine;
    case '技能组名称':
      return record.skillGroup;
    case '满意度评价':
      return record.satisfaction;
    case '挂机方':
      return record.hangupParty;
    case '通话时长(秒)':
      return String(record.durationSec);
    case '坐席工号':
      return record.agentId;
    default:
      return '';
  }
}

function matchSingleCondition(record: SimulatedDailyVoiceRecord, cond: MatchConditionRow): boolean {
  if (cond.values.length === 0) return true;
  const actual = getRecordFieldValue(record, cond.field);
  const actualNum = Number(actual);

  switch (cond.operator) {
    case '=':
      return cond.values.some(v => actual === v);
    case '!=':
      return cond.values.every(v => actual !== v);
    case '包含':
      return cond.values.some(v => actual.includes(v));
    case '不包含':
      return cond.values.every(v => !actual.includes(v));
    case '>':
      return !isNaN(actualNum) && cond.values.some(v => !isNaN(Number(v)) && actualNum > Number(v));
    case '<':
      return !isNaN(actualNum) && cond.values.some(v => !isNaN(Number(v)) && actualNum < Number(v));
    default:
      return true;
  }
}

export function evaluateDailyVoiceDataCount(groups: MatchConditionGroup[]): {
  matchedCount: number;
  totalCount: number;
  breakdown: { label: string; count: number }[];
} {
  if (groups.length === 0) {
    return {
      matchedCount: TOTAL_DAILY_VOICE_COUNT,
      totalCount: TOTAL_DAILY_VOICE_COUNT,
      breakdown: [
        { label: '呼出数据', count: DAILY_VOICE_DATASET.filter(r => r.callType === '呼出').reduce((s, r) => s + r.countWeight, 0) },
        { label: '呼入数据', count: DAILY_VOICE_DATASET.filter(r => r.callType === '呼入').reduce((s, r) => s + r.countWeight, 0) },
      ],
    };
  }

  const matchedRecords = DAILY_VOICE_DATASET.filter(record =>
    groups.some(group =>
      group.conditions.length === 0 || group.conditions.every(cond => matchSingleCondition(record, cond))
    )
  );

  const matchedCount = matchedRecords.reduce((sum, r) => sum + r.countWeight, 0);
  const outboundCount = matchedRecords.filter(r => r.callType === '呼出').reduce((s, r) => s + r.countWeight, 0);
  const inboundCount = matchedRecords.filter(r => r.callType === '呼入').reduce((s, r) => s + r.countWeight, 0);

  const breakdown: { label: string; count: number }[] = [];
  if (outboundCount > 0) breakdown.push({ label: '呼出语音', count: outboundCount });
  if (inboundCount > 0) breakdown.push({ label: '呼入语音', count: inboundCount });

  return {
    matchedCount,
    totalCount: TOTAL_DAILY_VOICE_COUNT,
    breakdown,
  };
}

export function createDefaultConditionGroups(): MatchConditionGroup[] {
  return [
    {
      id: `grp_${Date.now()}_1`,
      conditions: [
        {
          id: `row_${Date.now()}_1`,
          field: '呼叫类型',
          operator: '=',
          values: ['呼出'],
        },
        {
          id: `row_${Date.now()}_2`,
          field: '业务线',
          operator: '=',
          values: ['电销部'],
        },
      ],
    },
    {
      id: `grp_${Date.now()}_2`,
      conditions: [
        {
          id: `row_${Date.now()}_3`,
          field: '呼叫类型',
          operator: '=',
          values: ['呼入'],
        },
        {
          id: `row_${Date.now()}_4`,
          field: '业务线',
          operator: '=',
          values: ['服务部'],
        },
      ],
    },
  ];
}

interface DataMatchConditionBuilderProps {
  groups: MatchConditionGroup[];
  onChange: (groups: MatchConditionGroup[]) => void;
  readOnly?: boolean;
}

export const DataMatchConditionBuilder: React.FC<DataMatchConditionBuilderProps> = ({
  groups,
  onChange,
  readOnly = false,
}) => {
  // Track draft text and open preset dropdown per condition row
  const [draftInputs, setDraftInputs] = useState<Record<string, string>>({});
  const [openDropdownRowId, setOpenDropdownRowId] = useState<string | null>(null);

  const handleFieldChange = (groupId: string, rowId: string, newField: string) => {
    const meta = CONDITION_FIELD_OPTIONS.find(f => f.value === newField);
    onChange(
      groups.map(g =>
        g.id === groupId
          ? {
              ...g,
              conditions: g.conditions.map(c =>
                c.id === rowId
                  ? {
                      ...c,
                      field: newField,
                      operator: meta?.defaultOperator || '=',
                      values: [],
                    }
                  : c
              ),
            }
          : g
      )
    );
  };

  const handleOperatorChange = (groupId: string, rowId: string, newOp: ConditionOperator) => {
    onChange(
      groups.map(g =>
        g.id === groupId
          ? {
              ...g,
              conditions: g.conditions.map(c =>
                c.id === rowId ? { ...c, operator: newOp } : c
              ),
            }
          : g
      )
    );
  };

  const handleAddTagValue = (groupId: string, rowId: string, val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    onChange(
      groups.map(g =>
        g.id === groupId
          ? {
              ...g,
              conditions: g.conditions.map(c =>
                c.id === rowId && !c.values.includes(trimmed)
                  ? { ...c, values: [...c.values, trimmed] }
                  : c
              ),
            }
          : g
      )
    );
    setDraftInputs(prev => ({ ...prev, [rowId]: '' }));
  };

  const handleRemoveTagValue = (groupId: string, rowId: string, valToRemove: string) => {
    onChange(
      groups.map(g =>
        g.id === groupId
          ? {
              ...g,
              conditions: g.conditions.map(c =>
                c.id === rowId
                  ? { ...c, values: c.values.filter(v => v !== valToRemove) }
                  : c
              ),
            }
          : g
      )
    );
  };

  const handleAddAndCondition = (groupId: string) => {
    const newRow: MatchConditionRow = {
      id: `row_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      field: '业务线',
      operator: '=',
      values: [],
    };
    onChange(
      groups.map(g =>
        g.id === groupId ? { ...g, conditions: [...g.conditions, newRow] } : g
      )
    );
  };

  const handleRemoveAndCondition = (groupId: string, rowId: string) => {
    onChange(
      groups
        .map(g =>
          g.id === groupId
            ? { ...g, conditions: g.conditions.filter(c => c.id !== rowId) }
            : g
        )
        .filter(g => g.conditions.length > 0)
    );
  };

  const handleAddOrGroup = () => {
    const newGroup: MatchConditionGroup = {
      id: `grp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      conditions: [
        {
          id: `row_${Date.now()}_1`,
          field: '呼叫类型',
          operator: '=',
          values: ['呼入'],
        },
      ],
    };
    onChange([...groups, newGroup]);
  };

  const handleRemoveOrGroup = (groupId: string) => {
    if (groups.length <= 1) return;
    onChange(groups.filter(g => g.id !== groupId));
  };

  return (
    <div className="space-y-3">
      <div className="text-xs font-medium text-slate-700">质检匹配条件</div>

      <div className="space-y-0">
        {groups.map((group, groupIdx) => (
          <React.Fragment key={group.id}>
            {/* OR Group Box matching screenshot style */}
            <div className="bg-[#f7f8fa] border border-slate-100 rounded-sm px-4 py-3.5 relative group/card">
              {!readOnly && groups.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOrGroup(group.id)}
                  title="删除该条件组"
                  className="absolute top-2.5 right-3 text-slate-400 hover:text-red-500 transition-colors cursor-pointer opacity-0 group-hover/card:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              )}

              <div className="space-y-2.5">
                {group.conditions.map((row) => {
                  const fieldMeta = CONDITION_FIELD_OPTIONS.find(f => f.value === row.field);
                  const presets = fieldMeta?.presets || [];
                  const isDropdownOpen = openDropdownRowId === row.id;
                  const draftVal = draftInputs[row.id] || '';
                  const isMultiLineStyle = row.field !== '呼叫类型' || row.values.length > 2;

                  return (
                    <div key={row.id} className="flex items-start gap-2.5">
                      {/* Field Select */}
                      <div className="relative w-32 flex-shrink-0">
                        <select
                          disabled={readOnly}
                          value={row.field}
                          onChange={e => handleFieldChange(group.id, row.id, e.target.value)}
                          className="w-full h-8 pl-2.5 pr-7 bg-white border border-slate-200 rounded text-xs text-slate-700 appearance-none focus:outline-none focus:border-[#1677ff] disabled:bg-slate-50 cursor-pointer"
                        >
                          {CONDITION_FIELD_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={13}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                      </div>

                      {/* Operator Select */}
                      <div className="relative w-20 flex-shrink-0">
                        <select
                          disabled={readOnly}
                          value={row.operator}
                          onChange={e =>
                            handleOperatorChange(
                              group.id,
                              row.id,
                              e.target.value as ConditionOperator
                            )
                          }
                          className="w-full h-8 pl-2.5 pr-6 bg-white border border-slate-200 rounded text-xs text-slate-700 appearance-none focus:outline-none focus:border-[#1677ff] disabled:bg-slate-50 cursor-pointer"
                        >
                          {OPERATOR_OPTIONS.map(op => (
                            <option key={op} value={op}>
                              {op}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={13}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                      </div>

                      {/* Tag / Value Input matching screenshot */}
                      <div className="relative flex-1 max-w-[440px]">
                        <div
                          onClick={() => {
                            if (!readOnly && presets.length > 0 && row.field === '呼叫类型') {
                              setOpenDropdownRowId(isDropdownOpen ? null : row.id);
                            }
                          }}
                          className={`w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 flex flex-wrap items-center gap-1.5 transition-colors focus-within:border-[#1677ff] ${
                            isMultiLineStyle ? 'min-h-[58px] items-start content-start' : 'min-h-[32px]'
                          } ${readOnly ? 'bg-slate-50' : ''}`}
                        >
                          {row.values.map(val => (
                            <span
                              key={val}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f0f2f5] text-slate-700 text-xs rounded-full border border-slate-200/70"
                            >
                              <span>{val}</span>
                              {!readOnly && (
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleRemoveTagValue(group.id, row.id, val);
                                  }}
                                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                  <X size={11} />
                                </button>
                              )}
                            </span>
                          ))}

                          {!readOnly && (
                            <input
                              type="text"
                              value={draftVal}
                              onChange={e =>
                                setDraftInputs(prev => ({ ...prev, [row.id]: e.target.value }))
                              }
                              onFocus={() => {
                                if (presets.length > 0) {
                                  setOpenDropdownRowId(row.id);
                                }
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && draftVal.trim()) {
                                  e.preventDefault();
                                  handleAddTagValue(group.id, row.id, draftVal);
                                } else if (
                                  e.key === 'Backspace' &&
                                  !draftVal &&
                                  row.values.length > 0
                                ) {
                                  handleRemoveTagValue(
                                    group.id,
                                    row.id,
                                    row.values[row.values.length - 1]
                                  );
                                }
                              }}
                              placeholder={
                                row.field === '呼叫类型'
                                  ? row.values.length === 0
                                    ? '请选择或输入'
                                    : ''
                                  : '输入完成后请按回车'
                              }
                              className={`flex-1 min-w-[140px] text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent ${
                                isMultiLineStyle ? 'w-full mt-1' : ''
                              }`}
                            />
                          )}

                          {!readOnly && presets.length > 0 && row.field === '呼叫类型' && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setOpenDropdownRowId(isDropdownOpen ? null : row.id);
                              }}
                              className="ml-auto text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <ChevronDown size={13} />
                            </button>
                          )}
                        </div>

                        {/* Presets Dropdown Menu */}
                        {!readOnly && isDropdownOpen && presets.length > 0 && (
                          <div
                            onMouseLeave={() => setOpenDropdownRowId(null)}
                            className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded shadow-md z-20 py-1 max-h-40 overflow-y-auto"
                          >
                            <div className="px-2.5 py-1 text-[10.5px] text-slate-400 border-b border-slate-100 flex items-center justify-between">
                              <span>快捷选项（可点击多选或直接输入后按回车）</span>
                              <button
                                type="button"
                                onClick={() => setOpenDropdownRowId(null)}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                <X size={11} />
                              </button>
                            </div>
                            {presets.map(preset => {
                              const selected = row.values.includes(preset);
                              return (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => {
                                    if (selected) {
                                      handleRemoveTagValue(group.id, row.id, preset);
                                    } else {
                                      handleAddTagValue(group.id, row.id, preset);
                                    }
                                  }}
                                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-blue-50 cursor-pointer ${
                                    selected ? 'text-[#1677ff] font-medium bg-blue-50/40' : 'text-slate-700'
                                  }`}
                                >
                                  <span>{preset}</span>
                                  {selected && <span className="text-[11px]">✓</span>}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Remove row button */}
                      {!readOnly && (group.conditions.length > 1 || groups.length > 1) && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAndCondition(group.id, row.id)}
                          title="删除该行条件"
                          className="h-8 px-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer flex items-center"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add AND condition link */}
              {!readOnly && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => handleAddAndCondition(group.id)}
                    className="inline-flex items-center space-x-1 text-xs font-medium text-[#1677ff] hover:text-blue-700 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>新增(AND)条件</span>
                  </button>
                </div>
              )}
            </div>

            {/* Dashed divider with centered 'or' badge matching screenshot */}
            <div className="relative flex items-center py-3">
              <div className="w-full border-t border-dashed border-slate-200"></div>
              <div className="absolute left-8 px-3 py-0.5 bg-[#e5e7eb] text-slate-600 text-[11px] font-medium rounded-full border border-slate-300/60">
                or
              </div>
            </div>
          </React.Fragment>
        ))}

        {/* Bottom Add OR condition link */}
        {!readOnly && (
          <div className="pt-0.5">
            <button
              type="button"
              onClick={handleAddOrGroup}
              className="inline-flex items-center space-x-1 text-xs font-medium text-[#1677ff] hover:text-blue-700 cursor-pointer"
            >
              <Plus size={13} />
              <span>新增(OR)条件</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
