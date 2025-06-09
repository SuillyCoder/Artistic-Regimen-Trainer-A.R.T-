// navigation/challenges/page.js
import Link from "next/link";

export default function ChallengesOverviewPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center flex flex-col gap-6 items-center w-full max-w-md mx-auto">
        <h1 className="text-5xl font-extrabold text-green-400 mb-4">
          Challenges
        </h1>
        <p className="text-lg text-gray-300">
          Choose a challenge category to test your skills.
        </p>
        <Link 
          href="/navigation/challenges/anatomyChallenges" 
          className="w-full text-center rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-green-600 text-white gap-2 hover:bg-green-700 font-medium text-lg h-12 px-5 shadow-lg transform hover:scale-105 transition-transform duration-200"
        >
          Anatomy Challenges
        </Link>
        <Link 
          href="/navigation/challenges/gestureChallenges" 
          className="w-full text-center rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-green-600 text-white gap-2 hover:bg-green-700 font-medium text-lg h-12 px-5 shadow-lg transform hover:scale-105 transition-transform duration-200"
        >
          Gesture Challenges
        </Link>
        <Link 
          href="/navigation/challenges/perspectiveChallenges" 
          className="w-full text-center rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-green-600 text-white gap-2 hover:bg-green-700 font-medium text-lg h-12 px-5 shadow-lg transform hover:scale-105 transition-transform duration-200"
        >
          Perspective Challenges
        </Link>
      </div>
    </div>
  );
}
