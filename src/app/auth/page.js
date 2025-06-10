"use client";

import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../../lib/firebase';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        const uid = currentUser.uid;
        if (!uid) {
          console.warn('User object does not have a uid yet.');
          return;
        }

        try {
          const userDocRef = doc(db, 'users', uid);
          const userDocSnap = await getDoc(userDocRef);

          if (!userDocSnap.exists()) {
            const initialUserData = {
              userName: currentUser.displayName || 'New User',
              email: currentUser.email || '',
              profilePic: currentUser.photoURL || '',
            };
            await setDoc(userDocRef, initialUserData);
            console.log('Created new user document');

            await setDoc(doc(collection(userDocRef, 'badges'), 'default'), { badgeList: [], fulfilled: false });
            await setDoc(doc(collection(userDocRef, 'gallery'), 'default'), { artworkGallery: [], referenceGallery: [] });
            await setDoc(doc(collection(userDocRef, 'progress'), 'default'), { badgeList: [], progress: 0, toDoList: [] });
            await setDoc(doc(collection(userDocRef, 'prompts'), 'default'), { aiModel: 'default_model', isActive: true, promptThread: [], timeCreated: new Date() });
            console.log('Initialized user subcollections');

            setUserData(initialUserData);
          } else {
            setUserData(userDocSnap.data());
            console.log('User document exists:', userDocSnap.data());
          }

          if (!hasRedirected.current) {
            hasRedirected.current = true;

            // Optionally fetch ID token and store it or send it to your API here
            // const idToken = await currentUser.getIdToken();

            router.push('/');
            console.log('Redirected to /');
          }
        } catch (error) {
          console.error('Error fetching or creating user document:', error);
        }
      } else {
        setUserData(null);
        hasRedirected.current = false;
        console.log('User signed out or not authenticated');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Signed in:', result.user.uid);
      // onAuthStateChanged listener will handle redirect and user doc logic
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      hasRedirected.current = false;
      router.push('/auth');
      console.log('Signed out and redirected to /auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <p className="text-xl">Loading authentication state...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-lg w-full">
        <h2 className="text-3xl font-extrabold text-blue-400 mb-6">Authentication</h2>
        {user ? (
          <div className="flex flex-col items-center">
            <p className="text-xl font-bold text-green-400 mb-4">Welcome, {user.displayName || 'Guest'}!</p>
            <p className="text-gray-300 mb-2">Email: {user.email}</p>
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 my-4"
                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/96x96/A0A0A0/FFFFFF?text=Error`; }}
              />
            )}
            {userData && (
              <div className="mt-6 pt-4 border-t border-gray-700 text-left w-full">
                <p className="text-lg font-semibold text-gray-200">Firestore Data:</p>
                <p className="text-gray-300">Username: {userData.userName || 'N/A'}</p>
                <p className="text-gray-300">User ID: {user.uid || 'N/A'}</p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="mt-8 px-6 py-3 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-700 transition duration-200"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-lg text-gray-300 mb-6">Please sign in to access the application.</p>
            <button
              onClick={signInWithGoogle}
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition duration-200"
            >
              Sign in with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
