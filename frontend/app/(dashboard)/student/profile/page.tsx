"use client";

import { useState } from "react";
import { studentProfile } from "@/data/student-profile";
import { User, Mail, Phone, Calendar, Save, Github, Linkedin, Twitter, Award, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const initialFormData = {
        firstName: studentProfile.personal.firstName,
        lastName: studentProfile.personal.lastName,
        phone: studentProfile.personal.phone,
        bio: studentProfile.personal.bio,
        linkedin: studentProfile.socialLinks.linkedin,
        github: studentProfile.socialLinks.github,
        twitter: studentProfile.socialLinks.twitter,
    };

    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        console.log("Saved data:", formData);
        setIsEditing(false);
        alert("Profile saved successfully!");
    };

    const handleCancel = () => {
        setFormData(initialFormData);
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Profile</h1>
                <div className="flex gap-2">
                    {isEditing && (
                        <button
                            onClick={handleCancel}
                            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                            isEditing
                                ? "bg-green-600 text-white hover:bg-green-500"
                                : "bg-blue-600 text-white hover:bg-blue-500"
                        )}
                    >
                        {isEditing ? <><Save className="h-4 w-4" /> Save Changes</> : <><Edit2 className="h-4 w-4" /> Edit Profile</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Profile Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center">
                    <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mb-4">
                        {formData.firstName[0]}{formData.lastName[0]}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{formData.firstName} {formData.lastName}</h2>
                    <p className="text-gray-500">{studentProfile.personal.grade} • Section {studentProfile.personal.section}</p>
                    <p className="text-sm text-gray-400 mt-1">ID: {studentProfile.personal.id}</p>

                    <div className="mt-6 space-y-3 text-left">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {studentProfile.personal.email}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {formData.phone}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(studentProfile.personal.dateOfBirth).toLocaleDateString()}
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-900 mb-3 text-left">Achievements</h3>
                        <div className="flex flex-wrap gap-2">
                            {studentProfile.achievements.map((achievement, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                                    <Award className="h-3 w-3" />
                                    {achievement}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Editable Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Linkedin className="h-5 w-5 text-blue-700" />
                                <input
                                    type="text"
                                    name="linkedin"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="LinkedIn URL"
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Github className="h-5 w-5 text-gray-900" />
                                <input
                                    type="text"
                                    name="github"
                                    value={formData.github}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="GitHub URL"
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Twitter className="h-5 w-5 text-sky-500" />
                                <input
                                    type="text"
                                    name="twitter"
                                    value={formData.twitter}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="Twitter URL"
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Academic History */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Academic History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Year</th>
                                        <th className="px-6 py-3 font-medium">Grade</th>
                                        <th className="px-6 py-3 font-medium">GPA</th>
                                        <th className="px-6 py-3 font-medium">Rank</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {studentProfile.academicHistory.map((record, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{record.year}</td>
                                            <td className="px-6 py-4 text-gray-600">{record.grade}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "font-medium",
                                                    record.gpa >= 3.7 ? "text-green-600" : record.gpa >= 3.0 ? "text-blue-600" : "text-gray-600"
                                                )}>
                                                    {record.gpa.toFixed(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {record.rank} / {record.totalStudents}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
