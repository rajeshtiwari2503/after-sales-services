"use client";
import { useEffect, useState } from "react";
import SentimentAnalysis from "@/components/feedback/SentimentAnalysis";
import SmartAlerts from "@/components/notifications/SmartAlerts";
export default function AIPage() {
const [sentiment, setSentiment] = useState(null);
const [alerts, setAlerts] = useState([]);
useEffect(() => {
fetchAI();
}, []);
const fetchAI = async () => {
const sentimentRes = await fetch("/api/feedback/sentiment");
const sentimentData = await sentimentRes.json();
const alertRes = await fetch(
"/api/notifications/smart-alerts"
);
const alertData = await alertRes.json();
setSentiment(sentimentData);
setAlerts(alertData.alerts || []);
};
return (
<div className="space-y-6 p-6">
{/* <SentimentAnalysis data={sentiment} />
<SmartAlerts alerts={alerts} /> */}
</div>
);
}
