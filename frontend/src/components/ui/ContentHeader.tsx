import { useState, useEffect } from "react";
import { Crown } from "lucide-react";

interface ContentHeaderProps {
  title: string;
  description: string;
  storageKey?: string;
  isSuperAdmin?: boolean;
  userId?: number | string | null;
}

export default function ContentHeader({
  title,
  description,
  storageKey = "contentHeaderClosed",
  isSuperAdmin = false,
  userId,
}: ContentHeaderProps) {
  const [visible, setVisible] = useState(true);

  // Inside ContentHeader.tsx
useEffect(() => {
  const keyWithUser = `${storageKey}_${userId || "guest"}`;
  const isClosed = localStorage.getItem(keyWithUser);
  if (isClosed === "true") {
    setVisible(false);
  } else {
    setVisible(true); // Đổi user thì hiện lại (This comment is correct)
  }
}, [storageKey, userId]); // This means the effect RE-RUNS when userId changes

  const handleClose = () => {
    setVisible(false);
    const keyWithUser = `${storageKey}_${userId || "guest"}`;
    localStorage.setItem(keyWithUser, "true");
  };

  if (!visible) return null;

  return (
    <div className="relative bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6 transition-opacity duration-300">
      {/* Nút close */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
      >
        ✕
      </button>

      <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
        {title}
        {isSuperAdmin && (
          <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Crown className="h-4 w-4 mr-1" />
            Super Admin Access
          </span>
        )}
      </h3>

      <p className="text-gray-700 leading-relaxed">{description}</p>
    </div>
  );
}
