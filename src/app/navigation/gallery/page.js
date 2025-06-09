// navigation/gallery/page.js
import Link from "next/link";

export default function GalleryOverviewPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center flex flex-col gap-6 items-center w-full max-w-md mx-auto">
        <h1 className="text-5xl font-extrabold text-yellow-400 mb-4">
          Gallery
        </h1>
        <p className="text-lg text-gray-300">
          Explore different types of galleries.
        </p>
        <Link 
          href="/navigation/gallery/artworkGallery" 
          className="w-full text-center rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-yellow-600 text-white gap-2 hover:bg-yellow-700 font-medium text-lg h-12 px-5 shadow-lg transform hover:scale-105 transition-transform duration-200"
        >
          Artwork Gallery
        </Link>
        <Link 
          href="/navigation/gallery/referenceGallery" 
          className="w-full text-center rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-yellow-600 text-white gap-2 hover:bg-yellow-700 font-medium text-lg h-12 px-5 shadow-lg transform hover:scale-105 transition-transform duration-200"
        >
          Reference Gallery
        </Link>
      </div>
    </div>
  );
}
