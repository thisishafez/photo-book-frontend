import { useEffect, useState } from "react";
import { api } from "../services/api";

export function useSuggestedActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        const response = await api.recommendations.getSuggestions();
        const scores = response?.suggestions || [];

        if (scores.length) {
          // Resolve each activity_id into a full activity; drop any
          // that fail (e.g. since deleted) instead of failing the
          // whole feed.
          const resolved = await Promise.all(
            scores.map(async (score) => {
              try {
                const activity = await api.activities.getActivity(
                  score.activity_id
                );
                return { activity, score: score.total };
              } catch {
                return null;
              }
            })
          );

          if (!cancelled) {
            setActivities(resolved.filter(Boolean));
          }
        } else {
          // No suggestions yet — fall back to the plain approved feed.
          const fallback = await api.activities.list();
          if (!cancelled) {
            setActivities(
              (fallback || []).map((activity) => ({ activity, score: null }))
            );
          }
        }
      } catch (error) {
        console.error("[useSuggestedActivities] Failed loading", error);
        if (!cancelled) setActivities([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { activities, loading };
}