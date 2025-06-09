// navigation/progress/page.js
import Link from "next/link";
export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
        <h1 className="text-5xl font-extrabold text-indigo-400 mb-4">
          Progress
        </h1>
        <p className="text-lg text-gray-300">
          Track your learning journey and achievements here.
        </p>
        <Link 
          href="/navigation/progress/badgeList" 
          className="w-full text-center rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 font-medium text-lg h-12 px-5 shadow-lg transform hover:scale-105 transition-transform duration-200"
        >
          View Badge List
        </Link>
      </div>
    </div>
  );
}
