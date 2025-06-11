"use client";

import { useState, useEffect } from 'react';
import { auth, db, storage } from '../../../../../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'; // Import deleteObject
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'; // Import arrayRemove
import { onAuthStateChanged } from 'firebase/auth';

export default function ReferenceGalleryPage() {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // State for current image in carousel

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchGalleryImages(currentUser.uid);
      } else {
        setImages([]);
        setCurrentIndex(0); // Reset index if user logs out
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
      const fetchedImages = data.referenceGallery || [];
      setImages(fetchedImages);
      // Adjust currentIndex if it's out of bounds after fetch (e.g., if images were deleted elsewhere)
      if (currentIndex >= fetchedImages.length && fetchedImages.length > 0) {
        setCurrentIndex(fetchedImages.length - 1);
      } else if (fetchedImages.length === 0) {
        setCurrentIndex(0);
      }
    } else {
      setImages([]);
      setCurrentIndex(0);
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
      await fetchGalleryImages(user.uid);
      // Set current index to the first newly uploaded image if multiple
      if (files.length > 0) {
        setCurrentIndex(images.length); // Assuming new images are appended
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      e.target.value = null; // Reset file input
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (imageUrl) => {
    if (!user || !imageUrl) return;

    // Confirmation dialog
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this reference? This action cannot be undone."
    );

    if (!isConfirmed) {
      return; // User cancelled deletion
    }

    try {
      // 1. Delete from Firebase Storage
      const imageRef = ref(storage, imageUrl); // Create a storage reference from the URL
      await deleteObject(imageRef);

      // 2. Remove URL from Firestore
      const defaultDocRef = doc(db, 'users', user.uid, 'gallery', 'default');
      await updateDoc(defaultDocRef, {
        referenceGallery: arrayRemove(imageUrl),
      });

      // 3. Update local state and adjust carousel index
      const updatedImages = images.filter((url) => url !== imageUrl);
      setImages(updatedImages);

      // Adjust currentIndex after deletion
      if (updatedImages.length > 0) {
        // If the deleted image was the last one, move to the new last one
        if (currentIndex >= updatedImages.length) {
          setCurrentIndex(updatedImages.length - 1);
        }
        // Otherwise, currentIndex remains the same, showing the next image in the array or the previous one
        // if the current was the first and there are others.
      } else {
        setCurrentIndex(0); // No images left
      }

      console.log('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  // Simple Carousel UI navigation
  const prevImage = () => {
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const nextImage = () => {
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  // Calculate indices for the three-image carousel display
  const getDisplayIndices = () => {
    if (images.length === 0) return { prev: null, current: null, next: null };
    if (images.length === 1) return { prev: null, current: 0, next: null };
    if (images.length === 2) {
      if (currentIndex === 0) return { prev: null, current: 0, next: 1 };
      return { prev: 0, current: 1, next: null };
    }

    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    const nextIndex = (currentIndex + 1) % images.length;

    return { prev: prevIndex, current: currentIndex, next: nextIndex };
  };

  const { prev, current, next } = getDisplayIndices();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-8 font-inter">
      <h1 className="text-5xl font-extrabold text-yellow-400 mb-6">Reference Gallery</h1>

      {user ? (
        <>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFilesUpload}
            disabled={uploading}
            className="mb-6 px-5 py-3 rounded-full bg-purple-600 text-white font-medium shadow-lg hover:bg-purple-700 transition duration-200 cursor-pointer"
          />
          {uploading && <p className="text-gray-300 mb-4">Uploading images...</p>}

          {images.length > 0 ? (
            <div className="flex items-center justify-center space-x-4 w-full max-w-4xl"> {/* Container for three images */}
              {/* Previous Image */}
              {prev !== null && (
                <div className="w-[300px] h-[225px] flex-shrink-0 opacity-50"> {/* Smaller, dimmed */}
                  <img
                    src={images[prev]}
                    alt={`Previous reference`}
                    className="object-contain w-full h-full rounded-lg"
                  />
                </div>
              )}

              {/* Current (Main) Image */}
              <div className="relative w-[800px] h-[600px] flex-shrink-0"> {/* Main size */}
                <img
                  src={images[current]}
                  alt={`reference ${currentIndex + 1}`}
                  className="object-contain w-full h-full rounded-lg shadow-xl"
                />
                <button
                  onClick={prevImage}
                  className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-700 text-white px-4 py-2 rounded-full shadow-md hover:bg-gray-600 transition duration-200"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-700 text-white px-4 py-2 rounded-full shadow-md hover:bg-gray-600 transition duration-200"
                >
                  ›
                </button>
                <button
                  onClick={() => handleDeleteImage(images[current])}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-red-700 transition duration-200 text-lg font-medium"
                >
                  Delete Current Image
                </button>
              </div>

              {/* Next Image */}
              {next !== null && (
                <div className="w-[300px] h-[225px] flex-shrink-0 opacity-50"> {/* Smaller, dimmed */}
                  <img
                    src={images[next]}
                    alt={`Next reference`}
                    className="object-contain w-full h-full rounded-lg"
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-300">No images uploaded yet.</p>
          )}
           {images.length > 0 && (
            <p className="text-center mt-4 text-lg text-gray-300">{`${currentIndex + 1} / ${images.length}`}</p>
          )}
        </>
      ) : (
        <p className="text-gray-300">Please sign in to upload and view your reference.</p>
      )}
    </div>
  );
}