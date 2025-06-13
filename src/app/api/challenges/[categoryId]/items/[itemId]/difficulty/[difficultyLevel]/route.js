// src/app/api/challenges/[categoryId]/items/[itemId]/difficulty/[difficultyLevel]/route.js
import { NextResponse } from 'next/server';
import { getFirebaseAdminApp } from '../../../../../../../../../lib/firebaseAdmin'; // Assuming this path to your Admin SDK setup

const adminDb = getFirebaseAdminApp();

/**
 * GET /api/challenges/[categoryId]/items/[itemId]/difficulty/[difficultyLevel]
 * Fetches the gallery for a specific difficulty level of a challenge item.
 */
export async function GET(request, { params }) {
  const { categoryId, itemId, difficultyLevel } = params;

  try {
    const docRef = adminDb
      .collection('challenges')
      .doc(categoryId)
      .collection('challengeItems')
      .doc(itemId)
      .collection('difficulty')
      .doc(difficultyLevel);

    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ message: `Difficulty level '${difficultyLevel}' not found for this challenge item.` }, { status: 404 });
    }

    return NextResponse.json({ level: doc.id, ...doc.data() }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching gallery for difficulty level ${difficultyLevel} of item ${itemId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/challenges/[categoryId]/items/[itemId]/difficulty/[difficultyLevel]
 * Updates the gallery for a specific difficulty level.
 * Body should contain { gallery: ["new_url1", "new_url2"] }
 */
export async function PUT(request, { params }) {
  const { categoryId, itemId, difficultyLevel } = params;

  try {
    const { gallery } = await request.json();

    if (!Array.isArray(gallery)) {
      return NextResponse.json({ message: 'Missing or invalid "gallery" field (must be an array of URLs).' }, { status: 400 });
    }

    const docRef = adminDb
      .collection('challenges')
      .doc(categoryId)
      .collection('challengeItems')
      .doc(itemId)
      .collection('difficulty')
      .doc(difficultyLevel);

    const doc = await docRef.get();
    if (!doc.exists) {
        return NextResponse.json({ message: `Difficulty level '${difficultyLevel}' not found. Cannot update.` }, { status: 404 });
    }

    await docRef.update({ gallery });

    return NextResponse.json({ message: `Gallery for difficulty level '${difficultyLevel}' updated successfully!` }, { status: 200 });
  } catch (error) {
    console.error(`Error updating gallery for difficulty level ${difficultyLevel} of item ${itemId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/challenges/[categoryId]/items/[itemId]/difficulty/[difficultyLevel]
 * Deletes a specific difficulty level document (effectively removing its gallery).
 */
export async function DELETE(request, { params }) {
  const { categoryId, itemId, difficultyLevel } = params;

  try {
    const docRef = adminDb
      .collection('challenges')
      .doc(categoryId)
      .collection('challengeItems')
      .doc(itemId)
      .collection('difficulty')
      .doc(difficultyLevel);

    const doc = await docRef.get();
    if (!doc.exists) {
        return NextResponse.json({ message: `Difficulty level '${difficultyLevel}' not found. Nothing to delete.` }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ message: `Difficulty level '${difficultyLevel}' deleted successfully!` }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting difficulty level ${difficultyLevel} of item ${itemId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}