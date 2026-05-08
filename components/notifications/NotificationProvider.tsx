"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

const NotificationContext =
  createContext<any>(null);

export function NotificationProvider({
  children,
}: any) {
  const [notifications, setNotifications] =
    useState<any[]>([]);

  const addNotification =
    (message: string) => {
      setNotifications(
        (prev) => [
          {
            id:
              Date.now(),
            message,
          },
          ...prev,
        ]
      );
    };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification =
  () =>
    useContext(
      NotificationContext
    );