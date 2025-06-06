// src/components/AuthTest.js
"use client";
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../../lib/firebase'; // Import db and auth
import { doc, getDoc, setDoc, collection } from 'firebase/firestore'; // Import Firestore functions
import { useState, useEffect } from 'react';

export default function AuthTest() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null); // State to store user data from Firestore

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          // --- CREATE NEW USER DOCUMENT AND INITIALIZE SUBCOLLECTIONS ---
          try {
            const initialUserData = {
              userName: currentUser.displayName || 'New User',
              email: currentUser.email || '',
              profilePic: currentUser.photoURL || '',
              // passwordHash: 'hashed_on_auth_system', // Handled by Firebase Auth, not stored directly here
              // Add any other default top-level user fields if needed
            };
            await setDoc(userDocRef, initialUserData);
            console.log('New top-level user document created for:', currentUser.uid);

            // Initialize default documents in subcollections
            // badges (user-specific badges)
            await setDoc(doc(collection(userDocRef, 'badges'), 'default'), {
              badgeList: [], // Initially empty list of achieved badge IDs
              fulfilled: false, // General fulfilled status, or can be removed if only badgeList matters
            });
            console.log('Initialized user badges subcollection.');

            // gallery
            await setDoc(doc(collection(userDocRef, 'gallery'), 'default'), {
              artworkGallery: [],
              referenceGallery: [],
            });
            console.log('Initialized user gallery subcollection.');

            // progress
            await setDoc(doc(collection(userDocRef, 'progress'), 'default'), {
              badgeList: [], // List of badge IDs achieved (can duplicate from user's badges subcollection)
              progress: 0,
              toDoList: [],
            });
            console.log('Initialized user progress subcollection.');

            // prompts
            await setDoc(doc(collection(userDocRef, 'prompts'), 'default'), {
              aiModel: 'default_model',
              isActive: true,
              promptThread: [],
              timeCreated: new Date(),
            });
            console.log('Initialized user prompts subcollection.');

            setUserData(initialUserData); // Set data after creation
          } catch (error) {
            console.error('Error creating user document or subcollections:', error);
          }
        } else {
          // User document already exists, fetch its data
          setUserData(userDocSnap.data());
          console.log('User document found:', userDocSnap.data());
        }
      } else {
        setUserData(null); // Clear user data on sign out
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('User signed in:', result.user);
      // The onAuthStateChanged listener will now handle creating/fetching the Firestore document and subcollections
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null); // Clear user data
      console.log('User signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '600px', margin: 'auto', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Authentication Test</h2>
      {user ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#28A745' }}>Welcome, {user.displayName || 'Guest'}!</p>
          <p>Email: {user.email}</p>
          {/* Profile Picture from Firebase Auth */}
          {user.photoURL && (
            <div style={{ margin: '15px 0' }}>
              <p><strong>Auth Profile Pic:</strong></p>
              <img
                src={user.photoURL}
                alt="Auth Profile"
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #007bff' }}
                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/100x100/A0A0A0/FFFFFF?text=Error`; }}
              />
            </div>
          )}
          {userData && (
            <div style={{ borderTop: '1px dashed #eee', paddingTop: '15px', marginTop: '15px', textAlign: 'left' }}>
              <p><strong>Firestore Data:</strong></p>
              <p>Username from Firestore: {userData.userName || 'N/A'}</p>
              {/* Profile Pic from Firestore Data */}
              <p>Profile Pic from Firestore: {userData.profilePic ? (
                <img
                  src={userData.profilePic}
                  alt="Firestore Profile"
                  style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ddd' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/50x50/A0A0A0/FFFFFF?text=Err`; }}
                />
              ) : 'N/A'}</p>
              <p><strong>User ID (UID):</strong> {user.uid || 'N/A'}</p>
              {/* You can display more user data fields here as needed */}
            </div>
          )}
          <button
            onClick={handleSignOut}
            style={{ padding: '10px 20px', backgroundColor: '#DC3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p>Please sign in</p>
          <button
            onClick={signInWithGoogle}
            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
          >
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  );
}