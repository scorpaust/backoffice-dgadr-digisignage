import { useState, useEffect } from "react";
import {
  ref,
  onValue,
  off,
  push,
  set,
  remove,
  update,
} from "firebase/database";
import { db } from "../firebaseConfig";
import { Newsletter } from "../constants/Types";

const AVAILABLE_NEWSLETTERS = [
  { name: "raiz_digital", displayName: "Raiz Digital" },
  { name: "em_rede", displayName: "Em Rede" },
];

export const useNewsletters = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const newslettersRef = ref(db, "/newsletters");

    const listener = onValue(newslettersRef, (snapshot) => {
      try {
        const data = snapshot.val();
        let newslettersList: Newsletter[] = [];

        if (data) {
          newslettersList = Object.keys(data).map((key) => ({
            ...data[key],
            id: key,
          }));
        }

        // Adicionar newsletters padrão se não existirem
        AVAILABLE_NEWSLETTERS.forEach((defaultNewsletter) => {
          if (!newslettersList.find((n) => n.name === defaultNewsletter.name)) {
            newslettersList.push({
              id: defaultNewsletter.name,
              name: defaultNewsletter.name,
              displayName: defaultNewsletter.displayName,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        });

        setNewsletters(newslettersList);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar newsletters:", err);
        setError("Erro ao carregar newsletters");
      } finally {
        setLoading(false);
      }
    });

    return () => {
      off(newslettersRef, "value", listener);
    };
  }, []);

  const addNewsletter = async (
    name: string,
    displayName: string
  ): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      const newslettersRef = ref(db, "/newsletters");
      const newRef = push(newslettersRef);
      await set(newRef, {
        name,
        displayName,
        createdAt: now,
        updatedAt: now,
      });
      return true;
    } catch (err) {
      console.error("Erro ao adicionar newsletter:", err);
      return false;
    }
  };

  const updateNewsletter = async (
    id: string,
    displayName: string
  ): Promise<boolean> => {
    try {
      await update(ref(db, `/newsletters/${id}`), {
        displayName,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (err) {
      console.error("Erro ao atualizar newsletter:", err);
      return false;
    }
  };

  const deleteNewsletter = async (id: string): Promise<boolean> => {
    try {
      await remove(ref(db, `/newsletters/${id}`));
      return true;
    } catch (err) {
      console.error("Erro ao apagar newsletter:", err);
      return false;
    }
  };

  return {
    newsletters,
    loading,
    error,
    addNewsletter,
    updateNewsletter,
    deleteNewsletter,
  };
};
