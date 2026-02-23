"use client";

import { useState } from "react";
import { teacherData } from "@/data/teacher-data";
import {
    User,
    Mail,
    BookOpen,
    Clock,
    MapPin,
    Phone,
    Award,
    Calendar,
    Briefcase,
    Camera,
    Save,
    X,
    Edit2
} from "lucide-react";
import Link from "next/link";

export default function TeacherProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: teacherData.profile.name,
        department: teacherData.profile.department,
        email: teacherData.profile.email,
        experience: teacherData.profile.experience,
        location: "Faculty Room A101", // Default as it wasn't in data
        phone: "+1 (555) 123-4567",     // Default
        bio: `Dedicated mathematics educator with over a decade of experience in inspiring students to love and understand complex mathematical concepts. 
Specializes in Algebra and Calculus with a focus on interactive and problem-solving teaching methods.

Believes in creating a supportive classroom environment where every student feels encouraged to ask questions and explore new ideas.
Actively involved in curriculum development and math club activities.`
    });

    const { stats } = teacherData;

    const handleSave = () => {
        // In a real app, this would make an API call
        console.log("Saving profile:", formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Reset form data to potentially original values (here just closing edit mode for now, 
        // ideally we'd have ‘originalData’ to revert to)
        setIsEditing(false);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header / Cover */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400 relative group">
                    {isEditing && (
                        <button className="absolute right-4 top-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors">
                            <Camera size={20} />
                        </button>
                    )}
                </div>
                <div className="px-6 pb-6 relative">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-4 gap-6">
                        <div className="h-24 w-24 rounded-full bg-white p-1 shadow-md relative group">
                            <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold overflow-hidden">
                                {formData.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera size={24} className="text-white" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 w-full md:w-auto">
                            {isEditing ? (
                                <div className="space-y-3 mt-4 md:mt-0">
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none w-full md:w-1/2 bg-transparent"
                                        placeholder="Full Name"
                                    />
                                    <input
                                        type="text"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="block text-gray-500 border-b border-gray-300 focus:border-blue-500 focus:outline-none w-full md:w-1/3 bg-transparent"
                                        placeholder="Department"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{formData.name}</h1>
                                    <p className="text-gray-500">{formData.department} Department</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-4 md:mt-0">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        <X size={18} />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
                                    >
                                        <Save size={18} />
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        <Edit2 size={18} />
                                        Edit Profile
                                    </button>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm">
                                        View Public Profile
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-gray-600">
                            <Mail className="h-5 w-5 text-gray-400" />
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent w-full"
                                />
                            ) : (
                                <span>{formData.email}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <Briefcase className="h-5 w-5 text-gray-400" />
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    className="border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent w-full"
                                />
                            ) : (
                                <span>{formData.experience}</span> // removed 'Experience' suffix to match input type loosely for now
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent w-full"
                                />
                            ) : (
                                <span>{formData.location}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Stats & Bio */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">Total Students</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">Classes</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">Subjects</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalSubjects}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">Pending Grading</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.pendingGrading}</p>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                        {isEditing ? (
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={6}
                                className="w-full w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                            />
                        ) : (
                            <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                                {formData.bio}
                            </div>
                        )}
                    </div>

                    {/* Teaching Schedule Preview */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
                            <Link href="/teacher/schedule" className="text-sm text-blue-600 hover:underline">
                                View Full Schedule
                            </Link>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <div className="p-2 bg-white rounded-md text-blue-600 font-bold text-center min-w-[60px]">
                                    08:00
                                    <span className="block text-xs font-normal text-gray-500">AM</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Mathematics 10</p>
                                    <p className="text-sm text-gray-600">Class 10-A • Room A101</p>
                                </div>
                                <span className="ml-auto px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full font-medium">In Progress</span>
                            </div>
                            <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-100 rounded-lg opacity-60">
                                <div className="p-2 bg-white rounded-md text-gray-600 font-bold text-center min-w-[60px]">
                                    10:00
                                    <span className="block text-xs font-normal text-gray-500">AM</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Mathematics 10</p>
                                    <p className="text-sm text-gray-600">Class 10-B • Room A102</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Information & Settings */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div className="w-full">
                                    <p className="text-sm font-medium text-gray-900">Email Address</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="text-sm text-gray-600 border-b border-gray-300 focus:border-blue-500 focus:outline-none w-full"
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-600">{formData.email}</p>
                                    )}
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div className="w-full">
                                    <p className="text-sm font-medium text-gray-900">Phone</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="text-sm text-gray-600 border-b border-gray-300 focus:border-blue-500 focus:outline-none w-full"
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-600">{formData.phone}</p>
                                    )}
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Office Hours</p>
                                    <p className="text-sm text-gray-600">Mon-Fri: 2:00 PM - 4:00 PM</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Certifications */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h2>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Award className="h-8 w-8 text-yellow-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Master of Mathematics</p>
                                    <p className="text-xs text-gray-500">University of Education</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Award className="h-8 w-8 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Certified Educator</p>
                                    <p className="text-xs text-gray-500">National Board</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
