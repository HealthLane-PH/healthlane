// packages/auth/authHelpers.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebaseConfig";

export async function registerDoctor(email: string, password: string) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function loginDoctor(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutDoctor() {
  return await signOut(auth);
}