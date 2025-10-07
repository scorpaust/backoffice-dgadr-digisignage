import { useEffect, useMemo, useState } from "react";
import { DataSnapshot, off, onValue, ref } from "firebase/database";
import { db } from "@/firebaseConfig";
import { NewsItem } from "@/constants/Types";

interface UseNewsResult {
  data: NewsItem[];
  isLoading: boolean;
  error: string | null;
}

export function useNews(): UseNewsResult {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const newsRef = ref(db, "/news");

    const handleSnapshot = (snapshot: DataSnapshot) => {
      const value = snapshot.val();

      if (!value) {
        setNews([]);
        setIsLoading(false);
        return;
      }

      const parsed: NewsItem[] = Object.entries(value).map(([id, payload]) => ({
        id,
        ...(payload as Omit<NewsItem, "id">),
      }));

      parsed.sort((a, b) => {
        const createdA = a.createdAt ?? "";
        const createdB = b.createdAt ?? "";
        return createdB.localeCompare(createdA);
      });

      setNews(parsed);
      setIsLoading(false);
    };

    const handleError = (err: Error) => {
      setError(err.message);
      setIsLoading(false);
    };

    onValue(newsRef, handleSnapshot, handleError);

    return () => {
      off(newsRef, "value", handleSnapshot);
    };
  }, []);

  return useMemo(
    () => ({
      data: news,
      isLoading,
      error,
    }),
    [news, isLoading, error]
  );
}
