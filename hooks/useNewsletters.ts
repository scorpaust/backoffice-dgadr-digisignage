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
import { Newsletter, NewsletterIssue } from "../constants/Types";

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
            name: key,
            displayName: data[key].displayName || key,
            color: data[key].color || "#3F51B5",
            issues: data[key].issues || {},
          }));
        }

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
    displayName: string,
    color: string = "#3F51B5"
  ): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      await set(ref(db, `/newsletters/${name}`), {
        id: name,
        displayName,
        color,
        issues: {},
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
    displayName: string,
    color: string
  ): Promise<boolean> => {
    try {
      await update(ref(db, `/newsletters/${id}`), {
        displayName,
        color,
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

  const addIssue = async (
    newsletterId: string,
    issue: Omit<NewsletterIssue, "id" | "createdAt" | "updatedAt">
  ): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      const issueId = `${newsletterId}-${issue.publishedAt.replace(/-/g, "-")}`;

      await set(ref(db, `/newsletters/${newsletterId}/issues/${issueId}`), {
        ...issue,
        id: issueId,
        createdAt: now,
        updatedAt: now,
      });
      return true;
    } catch (err) {
      console.error("Erro ao adicionar issue:", err);
      return false;
    }
  };

  const updateIssue = async (
    newsletterId: string,
    issueId: string,
    issue: Partial<NewsletterIssue>
  ): Promise<boolean> => {
    try {
      await update(ref(db, `/newsletters/${newsletterId}/issues/${issueId}`), {
        ...issue,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (err) {
      console.error("Erro ao atualizar issue:", err);
      return false;
    }
  };

  const deleteIssue = async (
    newsletterId: string,
    issueId: string
  ): Promise<boolean> => {
    try {
      await remove(ref(db, `/newsletters/${newsletterId}/issues/${issueId}`));
      return true;
    } catch (err) {
      console.error("Erro ao apagar issue:", err);
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
    addIssue,
    updateIssue,
    deleteIssue,
  };
};
