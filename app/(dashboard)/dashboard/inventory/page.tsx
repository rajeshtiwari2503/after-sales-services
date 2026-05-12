 "use client";
import { useEffect, useState } from "react";
import InventoryTable from "@/components/inventory/InventoryTable";
import InventoryStats from "@/components/inventory/InventoryStats";
export default function InventoryPage() {
const [inventory, setInventory] = useState([]);
useEffect(() => {
fetchInventory();
}, []);
const fetchInventory = async () => {
const res = await fetch("/api/inventory");
const data = await res.json();
setInventory(data.inventory || []);
};
return (
<div className="space-y-6 p-6">
<InventoryStats 
// inventory={inventory}
 />
<InventoryTable 
// inventory={inventory} 
/>
</div>
);
}
