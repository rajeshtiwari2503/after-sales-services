"use client";

import { useEffect, useState } from "react";

import FeedbackCard from "@/components/feedback/FeedbackCard";

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] =
    useState([]);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks =
    async () => {
      try {
        const res = await fetch(
          "/api/feedback"
        );

        const data =
          await res.json();

        setFeedbacks(data);
      } catch (error) {
        console.log(error);
      }
    };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black">
          Customer Feedback
        </h1>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {feedbacks.map(
          (feedback: any) => (
            <FeedbackCard
              key={feedback._id}
              feedback={feedback}
            />
          )
        )}
      </div>
    </div>
  );
}