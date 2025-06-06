// src/app/api/users/[userId]/progress/route.js

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
    const userProgressDocRef = doc(db, 'users', userId, 'progress', DEFAULT_DOC_ID);
    const docSnap = await getDoc(userProgressDocRef); // Changed from getDocs to getDoc
    if (docSnap.exists()) {
      const data = docSnap.data();
      return NextResponse.json([{ id: DEFAULT_DOC_ID, ...data }], { status: 200 });
    } else {
      return NextResponse.json({ error: 'Default progress document not found for this user.' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Error getting user progress for user ${params.userId}:`, error);
    return NextResponse.json({ error: 'Failed to retrieve user progress.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required for update.' }, { status: 400 });
    }
    const updatedData = await request.json();
    const userProgressDocRef = doc(db, 'users', userId, 'progress', DEFAULT_DOC_ID);
    const updatePayload = {};

    if (updatedData.badgeListToAdd && Array.isArray(updatedData.badgeListToAdd)) {
        updatePayload.badgeList = arrayUnion(...updatedData.badgeListToAdd);
    } else if (updatedData.badgeList && !updatedData.badgeListToAdd) {
        updatePayload.badgeList = updatedData.badgeList; // Full array replacement
    }
    if (updatedData.toDoListToAdd && Array.isArray(updatedData.toDoListToAdd)) {
        updatePayload.toDoList = arrayUnion(...updatedData.toDoListToAdd);
    } else if (updatedData.toDoList && !updatedData.toDoListToAdd) {
        updatePayload.toDoList = updatedData.toDoList; // Full array replacement
    }
    
    // Add any other scalar fields that might be updated on the progress document itself
    Object.assign(updatePayload, updatedData); // This will add any other fields in updatedData to the payload

    await updateDoc(userProgressDocRef, updatePayload);
    return NextResponse.json({ message: 'Default user progress document updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error updating user progress data for user ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to update user progress data.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required for deletion.' }, { status: 400 });
    }
    const userProgressDocRef = doc(db, 'users', userId, 'progress', DEFAULT_DOC_ID);
    await updateDoc(userProgressDocRef, {
      badgeList: [],    // Clear badge list
      progress: 0,      // Reset progress to 0
      toDoList: [],     // Clear todo list
      lastCleared: new Date()
    });
    return NextResponse.json({ message: `User progress document cleared successfully.` }, { status: 200 });
  } catch (error) {
    console.error(`Error clearing user progress document for user ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to clear user progress document.' }, { status: 500 });
  }
}