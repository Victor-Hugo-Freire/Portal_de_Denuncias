"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { memo } from "react";

interface NotificationProps {
  notification: {
    type: "success" | "error";
    title: string;
    message: string;
  } | null;
}

const Notification = memo(function Notification({
  notification,
}: NotificationProps) {
  if (!notification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-96 animate-alert-anim pointer-events-none">
      <Alert
        variant={notification.type === "success" ? "default" : "destructive"}
        className={
          notification.type === "success"
            ? "bg-emerald-100 border-emerald-300 text-emerald-900"
            : "bg-red-100 border-red-300 text-red-900"
        }
      >
        <div className="flex items-start gap-2">
          {notification.type === "success" ? (
            <CheckCircle className="mt-1 h-6 w-6" />
          ) : (
            <XCircle className="mt-1 h-6 w-6" />
          )}
          <div>
            <AlertTitle>{notification.title}</AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
});

export default Notification;
