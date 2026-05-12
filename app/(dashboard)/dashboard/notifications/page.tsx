"use client";
import { useEffect, useState } from "react";
import NotificationDrawer from "@/components/notifications/NotificationDrawer";
export default function NotificationsPage() {
const [notifications, setNotifications] = useState([]);
useEffect(() => {
fetchNotifications();
}, []);
const fetchNotifications = async () => {
const res = await fetch("/api/notifications");
const data = await res.json();
setNotifications(data.notifications || []);
};
return (
<div className="p-6">
{/* <NotificationDrawer notifications={notifications} /> */}
</div>
);
}