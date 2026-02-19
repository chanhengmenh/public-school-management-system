import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center p-4">
      <div className="mb-8 flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 text-blue-600">
        <GraduationCap className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
        TechStack
      </h1>
      <p className="max-w-xl text-lg text-gray-600 mb-8">
        A comprehensive platform for managing academic, administrative, and student activities.
      </p>
      <div className="flex gap-4">
        <Link
          href="/admin"
          className="rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/login"
          className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
