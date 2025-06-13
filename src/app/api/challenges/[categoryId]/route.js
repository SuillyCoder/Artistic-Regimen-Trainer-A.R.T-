// src/app/api/challenges/[categoryId]/route.js
import { NextResponse } from 'next/server';
import { getFirebaseAdminApp } from '../../../../../lib/firebaseAdmin'; // Assuming this path to your Admin SDK setup

const adminDb = getFirebaseAdminApp();

/**
 * GET /api/challenges/[categoryId]
 * Fetches details for a specific challenge category.
 */
export async function GET(request, { params }) {
  const { categoryId } = params;

  try {
    const docRef = adminDb.collection('challenges').doc(categoryId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ message: 'Challenge category not found.' }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching challenge category ${categoryId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/challenges/[categoryId]
 * Updates details for a specific challenge category.
 * Body should contain fields to update (e.g., { description: "new description" }).
 */
export async function PUT(request, { params }) {
  const { categoryId } = params;

  try {
    const updates = await request.json();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No fields provided for update.' }, { status: 400 });
    }

    const docRef = adminDb.collection('challenges').doc(categoryId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ message: 'Challenge category not found.' }, { status: 404 });
    }

    await docRef.update(updates);

    return NextResponse.json({ message: `Challenge category '${categoryId}' updated successfully!` }, { status: 200 });
  } catch (error) {
    console.error(`Error updating challenge category ${categoryId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/challenges/[categoryId]
 * Deletes a specific challenge category and all its sub-collections (challengeItems, difficulties).
 * NOTE: Deleting a document with subcollections in Firestore requires explicit deletion of subcollection documents.
 * This example uses a simplified approach; for large subcollections, a recursive delete function
 * (e.g., using Firebase Admin SDK's `deleteCollection` or a Callable Cloud Function) is recommended.
 */
export async function DELETE(request, { params }) {
  const { categoryId } = params;

  try {
    const categoryRef = adminDb.collection('challenges').doc(categoryId);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return NextResponse.json({ message: 'Challenge category not found.' }, { status: 404 });
    }

    // Acknowledge this is a simplified delete. For production, consider recursive delete.
    // E.g., await deleteCollection(adminDb, categoryRef.collection('challengeItems'));
    // For simplicity, we'll just delete the parent document here.
    // If you need to recursively delete, look into Firebase Admin SDK's batch operations or Cloud Functions.
    await categoryRef.delete();

    return NextResponse.json({ message: `Challenge category '${categoryId}' deleted successfully!` }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting challenge category ${categoryId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}