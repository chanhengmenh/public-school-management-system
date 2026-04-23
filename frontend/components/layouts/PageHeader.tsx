import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    badge?: React.ReactNode;
    actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, badge, actions }: PageHeaderProps) {
    return (
        <div className="sticky top-0 z-30 bg-white w-full shadow-sm mb-8">
            <div className="max-w-7xl mx-auto p-2 lg:px-8 flex items-center justify-between w-full">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                        {badge}
                    </div>
                    {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
        </div>
    );
}

export default PageHeader;
