"use client";

import React from "react";
import { homeClassData } from "@/data/home-class-data";
import {
    User,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    MapPin,
    Award
} from "lucide-react";

export default function HomeClassTeacherProfilePage() {
    const { profile } = homeClassData;

    if (!profile) {
        return <div>Profile data not available</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header / Cover */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <div className="px-6 pb-6">
                    <div className="relative flex justify-between items-end -mt-12 mb-4">
                        <div className="flex gap-4 items-end">
                            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md">
                                <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                                    {profile.avatar}
                                </div>
                            </div>
                            <div className="mb-1">
                                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                                <p className="text-gray-500">{profile.role}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Contact Information</h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <span>{profile.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <span>{profile.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <span>Room A101 (Faculty Office)</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Academic Information</h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Briefcase className="w-5 h-5 text-gray-400" />
                                    <span>{profile.department}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Award className="w-5 h-5 text-gray-400" />
                                    <span>ID: {profile.id}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <span>Joined {profile.joinDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Bio</h2>
                        <p className="text-gray-600 leading-relaxed">
                            {profile.bio}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
