import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    badge?: string;
}

export function PageHeader({ title, subtitle, badge }: PageHeaderProps) {
    return (
        // REMOVED 'relative' to prevent CSS position conflicts with 'sticky'
        <div className="sticky top-0 z-30 bg-white w-full shadow-sm mb-8">
            <div className="max-w-7xl mx-auto p-2 lg:px-8 flex items-center justify-between w-full">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                        {badge && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                {badge}
                            </span>
                        )}
                    </div>
                    {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
                </div>
                {/* Keep the right side of the flex container strictly empty */}
            </div>
        </div>
    );
}

export default PageHeader;