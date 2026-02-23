export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard Overview</h2>
                <div className="flex items-center gap-2">
                    {/* Actions or date picker can go here */}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Placeholder cards */}
                {[
                    { title: "Total Students", value: "1,234", change: "+12%" },
                    { title: "Total Teachers", value: "56", change: "+2%" },
                    { title: "Active Classes", value: "32", change: "0%" },
                    { title: "Pending Requests", value: "12", change: "-5%" },
                ].map((item) => (
                    <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between space-y-0.5">
                            <h3 className="tracking-tight text-sm font-medium text-gray-500">{item.title}</h3>
                        </div>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900">{item.value}</span>
                            <span className={`text-xs font-medium ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {item.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 min-h-[400px]">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500">Chart / Activity Feed Placeholder</p>
                </div>
            </div>
        </div>
    );
}
