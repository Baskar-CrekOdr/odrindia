"use client";

import { useEffect, useState } from "react";
import OdrLabsClient from "./OdrLabsClient";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { withAuth } from "@/lib/auth";



function OdrLabsClientComponent() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const response = await apiFetch("/odrlabs/ideas");
        if (!response.ok) {
          if (response.status === 401) {
            setError("You need to be logged in to view ideas.");
            return;
          }
          throw new Error("Failed to fetch ideas");
        }
        const data = await response.json();
        setIdeas(data.ideas || []);
      } catch (err) {
        console.error("Error fetching ideas:", err);
        setError("Failed to load ideas. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchIdeas();
  }, []);

  return loading ? (
    <div className="flex justify-center items-center h-96">
      <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
    </div>
  ) : error ? (
    <Alert variant="destructive" className="max-w-3xl mx-auto my-8">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  ) : (
    <OdrLabsClient initialIdeas={ideas} />
  );
}

export default withAuth(OdrLabsClientComponent);