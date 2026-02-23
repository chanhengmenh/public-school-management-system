"use client";

import React, { useState } from "react";
import {
    Users,
    Search,
    ChevronDown,
    UserX,
    UserCheck,
    Mail,
    Filter
} from "lucide-react";

const initialUsers = [
    { id: "u1", name: "Mr. Tep Rendaro", email: "[email protected]", role: "teacher", class: "10-A", status: "active", avatar: "TR" },
    { id: "u2", name: "Keo Romjong", email: "[email protected]", role: "home-class-teacher", class: "10-A", status: "active", avatar: "KR" },
    { id: "u3", name: "Ms. Sokha Vong", email: "[email protected]", role: "teacher", class: "10-B", status: "active", avatar: "SV" },
    { id: "u4", name: "Preap Sovath", email: "[email protected]", role: "student", class: "10-A", status: "active", avatar: "PS" },
    { id: "u5", name: "Bopha Chan", email: "[email protected]", role: "student", class: "10-A", status: "active", avatar: "BC" },
    { id: "u6", name: "Dara Sok", email: "[email protected]", role: "student", class: "10-A", status: "inactive", avatar: "DS" },
    { id: "u7", name: "Vibol Lim", email: "[email protected]", role: "student", class: "10-B", status: "active", avatar: "VL" },
    { id: "u8", name: "Admin User", email: "[email protected]", role: "admin", class: "-", status: "active", avatar: "AD" },
    { id: "u9", name: "Chan Mony", email: "[email protected]", role: "monitor", class: "10-A", status: "active", avatar: "CM" },
    { id: "u10", name: "Nary Thy", email: "[email protected]", role: "student", class: "10-B", status: "active", avatar: "NT" },
];

const roles = ["admin", "teacher", "home-class-teacher", "student", "monitor"];
const classes = ["-", "10-A", "10-B", "11-A", "11-B", "12-A", "12-B"];

export default function UserManagementPage() {
    const [users, setUsers] = useState(initialUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    const handleRoleChange = (userId: string, newRole: string) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    };

    const handleClassChange = (userId: string, newClass: string) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, class: newClass } : u));
    };

    const toggleStatus = (userId: string) => {
        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
        ));
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === "all" || user.role === filterRole;
        const matchesStatus = filterStatus === "all" || user.status === filterStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            admin: "bg-purple-100 text-purple-700",
            teacher: "bg-blue-100 text-blue-700",
            "home-class-teacher": "bg-indigo-100 text-indigo-700",
            student: "bg-green-100 text-green-700",
            monitor: "bg-orange-100 text-orange-700",
        };
        return colors[role] || "bg-gray-100 text-gray-700";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        User Management
                    </h1>
                    <p className="text-gray-500">{users.length} users total • {users.filter(u => u.status === "active").length} active</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                </div>
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                    <option value="all">All Roles</option>
                    {roles.map(role => (
                        <option key={role} value={role}>{role.replace("-", " ")}</option>
                    ))}
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Role</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Class</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className={`hover:bg-gray-50 ${user.status === "inactive" ? "opacity-60" : ""}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                {user.avatar}
                                            </div>
                                            <span className="font-medium text-gray-900">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-3.5 h-3.5" />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="relative inline-block">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg font-medium text-xs border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 ${getRoleBadge(user.role)}`}
                                            >
                                                {roles.map(role => (
                                                    <option key={role} value={role}>{role.replace("-", " ")}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="relative inline-block">
                                            <select
                                                value={user.class}
                                                onChange={(e) => handleClassChange(user.id, e.target.value)}
                                                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg font-medium text-xs border border-gray-200 cursor-pointer focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                                            >
                                                {classes.map(cls => (
                                                    <option key={cls} value={cls}>{cls}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => toggleStatus(user.id)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${user.status === "active"
                                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                : "bg-green-50 text-green-600 hover:bg-green-100"
                                                }`}
                                        >
                                            {user.status === "active" ? (
                                                <>
                                                    <UserX className="w-3.5 h-3.5" />
                                                    Deactivate
                                                </>
                                            ) : (
                                                <>
                                                    <UserCheck className="w-3.5 h-3.5" />
                                                    Activate
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No users found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
