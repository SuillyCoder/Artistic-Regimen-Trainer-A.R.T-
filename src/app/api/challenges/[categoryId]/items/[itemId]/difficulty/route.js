// src/app/api/challenges/[categoryId]/items/[itemId]/difficulty/route.js
import { NextResponse } from 'next/server';
import { getFirebaseAdminApp } from '../../../../../../../../lib/firebaseAdmin'; // Assuming this path to your Admin SDK setup

const adminDb = getFirebaseAdminApp();

/**
 * GET /api/challenges/[categoryId]/items/[itemId]/difficulty
 * Fetches all difficulty levels (easy, medium, hard) and their galleries for a specific challenge item.
 */
export async function GET(request, { params }) {
  const { categoryId, itemId } = params;

  try {
    const difficultyRef = adminDb
      .collection('challenges')
      .doc(categoryId)
      .collection('challengeItems')
      .doc(itemId)
      .collection('difficulty');

    const snapshot = await difficultyRef.get();

    if (snapshot.empty) {
      return NextResponse.json({ message: 'No difficulty levels found for this challenge item.' }, { status: 404 });
    }

    const difficulties = snapshot.docs.map(doc => ({
      level: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(difficulties, { status: 200 });
  } catch (error) {
    console.error(`Error fetching difficulty levels for item ${itemId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/challenges/[categoryId]/items/[itemId]/difficulty
 * Adds/Sets a new difficulty level (e.g., 'easy') with its gallery for a challenge item.
 * Body should contain { difficultyLevel: "easy" | "medium" | "hard", gallery: ["url1", "url2"] }
 */
export async function POST(request, { params }) {
  const { categoryId, itemId } = params;

  try {
    const { difficultyLevel, gallery } = await request.json();

    if (!difficultyLevel || !Array.isArray(gallery)) {
      return NextResponse.json({ message: 'Missing required fields (difficultyLevel, gallery as array).' }, { status: 400 });
    }

    if (!['easy', 'medium', 'hard'].includes(difficultyLevel)) {
        return NextResponse.json({ message: 'Invalid difficultyLevel. Must be "easy", "medium", or "hard".' }, { status: 400 });
    }

    const difficultyDocRef = adminDb
      .collection('challenges')
      .doc(categoryId)
      .collection('challengeItems')
      .doc(itemId)
      .collection('difficulty')
      .doc(difficultyLevel); // Use difficultyLevel as DocumentID

    await difficultyDocRef.set({ gallery }); // .set() will create or overwrite

    return NextResponse.json({ message: `Difficulty level '${difficultyLevel}' added/updated successfully!` }, { status: 201 });
  } catch (error) {
    console.error(`Error adding/updating difficulty level ${difficultyLevel} for item ${itemId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}