// src/app/api/challenges/[category]/items/[challengeId]/difficulty/[difficultyLevel]/route.js
import { NextResponse } from 'next/server';
import { firestore } from '../../../../../../../../../lib/firebaseAdmin';

export async function GET(request, { params }) {
  const { category, challengeId, difficultyLevel } = params;

  if (!category || !challengeId || !difficultyLevel) {
    return new Response(JSON.stringify({ message: 'Missing parameters.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Construct the path to the specific difficulty subcollection
    // e.g., challenges/anatomy/challengeItems/someChallengeId/easyItems/easyDocId
    const difficultyCollectionRef = firestore
      .collection('challenges')
      .doc(category)
      .collection('challengeItems')
      .doc(challengeId)
      .collection(difficultyLevel); // This assumes your subcollection names are 'easyItems', 'mediumItems', 'hardItems'

    // Fetch the document within this difficulty subcollection.
    // Assuming there's only one document per difficulty (e.g., 'data' or 'default')
    // OR if you store multiple, you might need to query them.
    // For now, let's assume one document per difficulty that holds the gallery array.
    const snapshot = await difficultyCollectionRef.get();

    let galleryData = { gallery: [], timeLimit: 0 }; // Default empty arrays/values

    if (!snapshot.empty) {
      // Assuming you store your gallery in a single document within the difficulty subcollection
      // For example, if you have a document named 'galleryData' or 'main'
      const doc = snapshot.docs[0]; // Just take the first document found
      galleryData.gallery = doc.data().challengeGallery || [];
      galleryData.timeLimit = doc.data().timeLimit || 0;
    } else {
        // If no document found in the difficulty subcollection, return 404
        return new Response(JSON.stringify({ message: `No gallery data found for difficulty ${difficultyLevel}.` }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(galleryData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error fetching gallery for ${category}/${challengeId}/${difficultyLevel}:`, error);
    return new Response(JSON_stringify({ message: 'Internal Server Error', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}