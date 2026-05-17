"use client";

import { useState, useEffect, useCallback } from "react";

interface InventoryItem {
  _id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unitPrice: number;
  location?: string;
  isActive: boolean;
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async (search?: string, lowStock?: boolean) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (lowStock) params.set("lowStock", "true");
      const res = await fetch(`/api/inventory?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch inventory");
      const data = await res.json();
      setItems(data.data?.items ?? data.data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (item: Partial<InventoryItem>) => {
    try {
      const res = await fetch("/api/inventory", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error("Failed to add item");
      await fetchInventory();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchInventory]);

  const updateStock = useCallback(async (id: string, quantity: number) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Failed to update stock");
      setItems(prev => prev.map(i => i._id === id ? { ...i, quantity } : i));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const lowStockItems = items.filter(i => i.quantity <= i.minQuantity);
  const totalValue = items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  return {
    items, loading, error, lowStockItems, totalValue,
    fetchInventory, addItem, updateStock,
  };
}