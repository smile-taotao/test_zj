import React from 'react';
import { ShieldCheck, Settings } from 'lucide-react';

interface TopNavProps {
  agentStatus?: string;
  onStatusChange?: (status: string) => void;
}

const TopNav: React.FC<TopNavProps> = () => {
  return (
    <div className="h-12 bg-[#006fe6] text-white flex items-center justify-between px-4 shadow-sm flex-shrink-0 z-20 select-none">
      {/* Left: Clean Quality Inspection Platform Header */}
      <div className="flex items-center space-x-2.5 text-xs">
        <div className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center">
          <ShieldCheck size={15} className="text-white stroke-[2.2]" />
        </div>
        <span className="font-semibold text-[13.5px] tracking-wide">
          智能质检系统 · 质检管理工作台
        </span>
      </div>

      {/* Right: User Info & Settings */}
      <div className="flex items-center space-x-3 text-xs">
        <button
          type="button"
          title="系统设置"
          className="p-1.5 rounded hover:bg-white/15 text-white/90 hover:text-white transition-colors cursor-pointer"
        >
          <Settings size={15} />
        </button>

        <div className="flex items-center space-x-2 pl-2 border-l border-white/20">
          <div className="w-7 h-7 rounded-full border-2 border-white/80 overflow-hidden shadow-xs flex items-center justify-center bg-white">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face"
              alt="用户头像"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xs font-medium text-white/95">张晓雅</span>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
