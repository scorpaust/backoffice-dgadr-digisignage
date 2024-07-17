import axios from "axios";

const API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

export async function authenticate(email: string, password: string) {
  const response = await axios.post(
    "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" +
      API_KEY,
    {
      email: email,
      password: password,
      returnSecureToken: true,
    }
  );

  const token = response.data.idToken;

  return token;
}
