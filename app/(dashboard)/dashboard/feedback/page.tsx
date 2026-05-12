"use client";
import { useEffect, useState } from "react";
import FeedbackDashboard from "@/components/feedback/FeedbackDashboard";
import FeedbackTable from "@/components/feedback/FeedbackTable";
export default function FeedbackPage() {
    const [feedbacks, setFeedbacks] = useState([]);
    useEffect(() => {
        fetchFeedbacks();
    }, []);
    const fetchFeedbacks = async () => {
        const res = await fetch("/api/feedback");
        const data = await res.json();
        setFeedbacks(data.feedbacks || []);
    };
    return (
        <div className="space-y-6 p-6">
            <FeedbackDashboard />
            <FeedbackTable
            //  feedbacks={feedbacks} 
             />
        </div>
    );
}
