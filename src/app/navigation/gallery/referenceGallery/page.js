"use client";

import { useState, useEffect } from 'react';
import { auth, db, storage } from '../../../../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ReferenceGalleryPage() {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchGalleryImages(currentUser.uid);
      } else {
        setImages([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch gallery images URLs from Firestore
  const fetchGalleryImages = async (uid) => {
    const defaultDocRef = doc(db, 'users', uid, 'gallery', 'default');
    const docSnap = await getDoc(defaultDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setImages(data.referenceGallery || []);
    } else {
      setImages([]);
    }
  };

  // Handle multiple file uploads
  const handleFilesUpload = async (e) => {
    if (!user) return;
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const defaultDocRef = doc(db, 'users', user.uid, 'gallery', 'default');

      for (const file of files) {
        const storageRef = ref(storage, `gallery/${user.uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // Update referenceGallery array in the default doc
        await updateDoc(defaultDocRef, {
          referenceGallery: arrayUnion(downloadURL),
        });
      }

      // Refresh gallery images after upload
      fetchGalleryImages(user.uid);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      e.target.value = null; // Reset file input
    }
  };

  // Simple Carousel UI
  const [currentIndex, setCurrentIndex] = useState(0);
  const prevImage = () => setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-8 font-inter"> {/* Increased padding, added font */}
      <h1 className="text-5xl font-extrabold text-yellow-400 mb-6">Reference Gallery</h1>

      {user ? (
        <>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFilesUpload}
            disabled={uploading}
            className="mb-6 px-5 py-3 rounded-full bg-purple-600 text-white font-medium shadow-lg hover:bg-purple-700 transition duration-200" // Styled input
          />
          {uploading && <p className="text-gray-300 mb-4">Uploading images...</p>}

          {images.length > 0 ? (
            <div className="relative w-[800px] h-[600px]"> {/* Increased image size */}
              <img
                src={images[currentIndex]}
                alt={`reference ${currentIndex + 1}`}
                className="object-contain w-full h-full rounded-lg shadow-xl" // Added shadow
              />
              <button
                onClick={prevImage}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-700 text-white px-4 py-2 rounded-full shadow-md hover:bg-gray-600 transition duration-200" // Styled button
              >
                ‹
              </button>
              <button
                onClick={nextImage}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-700 text-white px-4 py-2 rounded-full shadow-md hover:bg-gray-600 transition duration-200" // Styled button
              >
                ›
              </button>
              <p className="text-center mt-4 text-lg text-gray-300">{`${currentIndex + 1} / ${images.length}`}</p> {/* Styled text */}
            </div>
          ) : (
            <p className="text-gray-300">No images uploaded yet.</p>
          )}
        </>
      ) : (
        <p className="text-gray-300">Please sign in to upload and view your references.</p>
      )}
    </div>
  );
}