import { FileText, FileSpreadsheet, Presentation } from "lucide-react";

export default function SubjectMaterialsPage() {
    const weeks = [
        {
            title: "Week 9 — Latest",
            items: [
                { id: 1, title: "Chapter 9: Advanced Concepts", type: "Lecture Notes · PDF", size: "2.4 MB", icon: FileText, color: "text-red-500", bg: "bg-red-50" },
                { id: 2, title: "Week 9 Slides", type: "Presentation · PPTX", size: "5.1 MB", icon: Presentation, color: "text-orange-500", bg: "bg-orange-50" },
            ]
        },
        {
            title: "Week 8",
            items: [
                { id: 3, title: "Chapter 8: Intermediate Concepts", type: "Lecture Notes · PDF", size: "1.8 MB", icon: FileText, color: "text-red-500", bg: "bg-red-50" },
                { id: 4, title: "Lab Data Sheet", type: "Spreadsheet · XLSX", size: "140 KB", icon: FileSpreadsheet, color: "text-emerald-500", bg: "bg-emerald-50" },
            ]
        }
    ];

    return (
        <div className="space-y-8">
            {weeks.map((week, idx) => (
                <div key={idx}>
                    <h2 className="text-lg font-bold text-slate-800 mb-4">{week.title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {week.items.map(item => {
                            const Icon = item.icon;
                            return (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center space-x-4 hover:shadow-sm transition-shadow">
                                    <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{item.type} • {item.size}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}