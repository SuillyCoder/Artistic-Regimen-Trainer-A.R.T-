// src/app/api/users/route.js

import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase'; // Adjust path
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return NextResponse.json({ id: userDocSnap.id, ...userDocSnap.data() }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Error getting user data:`, error);
    return NextResponse.json({ error: 'Failed to retrieve user data.' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required for update.' }, { status: 400 });
    }
    const updatedData = await request.json();
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, updatedData);
    return NextResponse.json({ message: 'User data updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error updating user data for ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to update user data.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required for deletion.' }, { status: 400 });
    }
    await deleteDoc(doc(db, 'users', userId));
    return NextResponse.json({ message: 'User data deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting user data for ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to delete user data.' }, { status: 500 });
  }
}