// navigation/modules/page.js
import Link from "next/link";

export default function ModulesOverviewPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center flex flex-col gap-6 items-center w-full max-w-md mx-auto">
        <h1 className="text-5xl font-extrabold text-teal-400 mb-4">
          Modules
        </h1>
        <p className="text-lg text-gray-300">
          Select a specific module to begin your learning journey.
        </p>
        <Link 
          href="/navigation/modules/anatomy" 
          className="w-full text-center rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-teal-600 text-white gap-2 hover:bg-teal-700 font-medium text-lg h-12 px-5 shadow-lg transform hover:scale-105 transition-transform duration-200"
        >
          Anatomy Module
        </Link>
        <Link 
          href="/navigation/modules/gesture" 
          className="w-full text-center rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-teal-600 text-white gap-2 hover:bg-teal-700 font-medium text-lg h-12 px-5 shadow-lg transform hover:scale-105 transition-transform duration-200"
        >
          Gesture Module
        </Link>
        <Link 
          href="/navigation/modules/perspective" 
          className="w-full text-center rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-teal-600 text-white gap-2 hover:bg-teal-700 font-medium text-lg h-12 px-5 shadow-lg transform hover:scale-105 transition-transform duration-200"
        >
          Perspective Module
        </Link>
      </div>
    </div>
  );
}
