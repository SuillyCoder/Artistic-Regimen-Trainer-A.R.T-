// src/app/api/users/[userId]/gallery/route.js

import { collection, getDocs, doc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../../../lib/firebase'; // Adjust path
import { NextResponse } from 'next/server';

const DEFAULT_DOC_ID = 'default';

export async function GET(request, { params }) {
  try {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }
    const userGalleryDocRef = doc(db, 'users', userId, 'gallery', DEFAULT_DOC_ID);
    const docSnap = await getDoc(userGalleryDocRef); // Changed from getDocs to getDoc
    if (docSnap.exists()) {
      const data = docSnap.data();
      return NextResponse.json([{ id: DEFAULT_DOC_ID, ...data }], { status: 200 });
    } else {
      return NextResponse.json({ error: 'Default gallery document not found for this user.' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Error getting user galleries for user ${params.userId}:`, error);
    return NextResponse.json({ error: 'Failed to retrieve user galleries.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required for update.' }, { status: 400 });
    }
    const updatedData = await request.json();
    const userGalleryDocRef = doc(db, 'users', userId, 'gallery', DEFAULT_DOC_ID);
    const updatePayload = {};

    if (updatedData.artworkToAdd && Array.isArray(updatedData.artworkToAdd)) {
        updatePayload.artworkGallery = arrayUnion(...updatedData.artworkToAdd);
    } else if (updatedData.artworkGallery && !updatedData.artworkToAdd) {
        updatePayload.artworkGallery = updatedData.artworkGallery; // Full array replacement
    }
    if (updatedData.referenceToAdd && Array.isArray(updatedData.referenceToAdd)) {
        updatePayload.referenceGallery = arrayUnion(...updatedData.referenceToAdd);
    } else if (updatedData.referenceGallery && !updatedData.referenceToAdd) {
        updatePayload.referenceGallery = updatedData.referenceGallery; // Full array replacement
    }
    
    // Add any other scalar fields that might be updated on the gallery document itself
    Object.assign(updatePayload, updatedData); // This will add any other fields in updatedData to the payload

    await updateDoc(userGalleryDocRef, updatePayload);
    return NextResponse.json({ message: 'Default user gallery document updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error updating user gallery data for user ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to update user gallery data.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required for deletion.' }, { status: 400 });
    }
    const userGalleryDocRef = doc(db, 'users', userId, 'gallery', DEFAULT_DOC_ID);
    await updateDoc(userGalleryDocRef, {
      artworkGallery: [],    // Clear artwork gallery
      referenceGallery: [],  // Clear reference gallery
      lastCleared: new Date()
    });
    return NextResponse.json({ message: `User gallery document cleared successfully.` }, { status: 200 });
  } catch (error) {
    console.error(`Error clearing user gallery document for user ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to clear user gallery document.' }, { status: 500 });
  }
}