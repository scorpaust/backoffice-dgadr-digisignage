import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig"; // é o auth da SDK

export async function authenticate(email: string, password: string) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  // A SDK já guarda internamente o ID Token e refresha-o quando expirar
  return userCred.user.getIdToken(); // Opcional, caso ainda precise do token para algo
}
