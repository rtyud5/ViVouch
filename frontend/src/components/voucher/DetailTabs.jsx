import React, { useState } from "react";
import { Info, ShieldAlert, MapPin, Phone } from "lucide-react";

/**
 * DetailTabs component
 *
 * Hiển thị các thông tin chi tiết của voucher dưới dạng tabs.
 *
 * Props:
 * @param {string} description - Mô tả voucher
 * @param {Array<string>} conditions - Danh sách điều kiện áp dụng
 * @param {Array<object>} branches - Danh sách chi nhánh áp dụng
 */
export function DetailTabs({ description = "", conditions = [], branches = [] }) {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    { id: "description", label: "Mô tả", icon: Info },
    { id: "conditions", label: "Điều kiện áp dụng", icon: ShieldAlert },
    { id: "branches", label: "Chi nhánh áp dụng", icon: MapPin },
  ];

  return (
    <div className="w-full bg-base-100 rounded-2xl shadow-sm border border-base-200 overflow-hidden">
      {/* Tab Header */}
      <div className="flex border-b border-base-200 bg-base-50/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-2 sm:px-6 text-sm font-semibold border-b-2 flex items-center justify-center gap-2 transition-all duration-200
                ${
                  isActive
                    ? "border-primary text-primary bg-base-100"
                    : "border-transparent text-base-content/60 hover:text-base-content hover:bg-base-100/50"
                }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6 sm:p-8 min-h-[200px]">
        {/* Tab 1: Description */}
        {activeTab === "description" && (
          <div className="prose max-w-none text-base-content/80 leading-relaxed text-sm sm:text-base animate-fadeIn">
            <p className="whitespace-pre-line">{description || "Không có mô tả chi tiết."}</p>
          </div>
        )}

        {/* Tab 2: Conditions */}
        {activeTab === "conditions" && (
          <div className="animate-fadeIn">
            {conditions.length > 0 ? (
              <ul className="space-y-3">
                {conditions.map((cond, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-base-content/80">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-warning/10 text-warning text-xs font-bold mt-0.5 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-tight">{cond}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base-content/50 italic text-sm">Không có điều kiện áp dụng cụ thể.</p>
            )}
          </div>
        )}

        {/* Tab 3: Branches */}
        {activeTab === "branches" && (
          <div className="animate-fadeIn">
            {branches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branches.map((branch, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-base-200/50 border border-base-200 flex flex-col gap-2 hover:border-primary/20 transition-all"
                  >
                    <h4 className="font-bold text-sm sm:text-base text-base-content flex items-center gap-2">
                      <span className="badge badge-primary badge-sm shrink-0">CN {idx + 1}</span>
                      <span className="truncate">{branch.name}</span>
                    </h4>
                    
                    <div className="flex items-start gap-2.5 text-xs sm:text-sm text-base-content/70 mt-1">
                      <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                      <span>{branch.address}</span>
                    </div>

                    {branch.phone && (
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm text-base-content/70 mt-auto pt-2 border-t border-base-200/40">
                        <Phone size={14} className="text-success shrink-0" />
                        <a href={`tel:${branch.phone}`} className="hover:underline font-semibold text-primary">
                          {branch.phone}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/50 italic text-sm">Không có danh sách chi nhánh áp dụng.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
