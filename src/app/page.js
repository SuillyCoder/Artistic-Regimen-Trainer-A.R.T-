// src/app/page.js
import Image from "next/image";
import Link from "next/link"; // Import Link for client-side navigation

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-inter bg-gray-900 text-gray-100">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-center w-full max-w-2xl">
        <Image
          className="dark:invert mb-8"
          src="/next.svg" // Assuming you have this image, or replace with your app logo
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-400 text-center mb-6">
          A.R.T. Prototype
        </h1>
        <p className="text-lg text-center text-gray-300 mb-8">
          Welcome to the A.R.T. Trainer application. Navigate to different sections using the links below.
        </p>

        <div className="flex flex-col gap-4 items-center w-full">
          {/* Navigation Links */}
          <Link href="/navigation/prompts" className="w-full text-center rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-purple-600 text-white gap-2 hover:bg-purple-700 font-medium text-lg h-12 px-5 shadow-lg transform hover:scale-105 transition-transform duration-200">
              Go to Prompts
          </Link>

          <Link href="/navigation/progress" className="w-full text-center rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-indigo-600 text-white gap-2 hover:bg-indigo-700 font-medium text-lg h-12 px-5 shadow-lg transform hover:scale-105 transition-transform duration-200">
              View Progress
          </Link>

          <Link href="/navigation/challenges" className="w-full text-center rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-green-600 text-white gap-2 hover:bg-green-700 font-medium text-lg h-12 px-5 shadow-lg transform hover:scale-105 transition-transform duration-200">
              Explore Challenges
          </Link>

          <Link href="/navigation/gallery" className="w-full text-center rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-yellow-600 text-white gap-2 hover:bg-yellow-700 font-medium text-lg h-12 px-5 shadow-lg transform hover:scale-105 transition-transform duration-200">
              Browse Gallery
          </Link>

          <Link href="/navigation/modules" className="w-full text-center rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-teal-600 text-white gap-2 hover:bg-teal-700 font-medium text-lg h-12 px-5 shadow-lg transform hover:scale-105 transition-transform duration-200">
              Access Modules
          </Link>
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-sm text-gray-400">
        <p>A.R.T. Trainer &copy; 2025</p>
        {/* Removed default Next.js footer links as they are not relevant to your app's navigation */}
      </footer>
    </div>
  );
}