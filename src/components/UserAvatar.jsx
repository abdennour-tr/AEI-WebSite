import { useState } from "react";
import defaultAvatar from "@/assets/default-avatar.svg";

export default function UserAvatar({
  src,
  name = "",
  alt,
  className = "h-10 w-10 rounded-xl",
}) {
  const [failedSource, setFailedSource] = useState("");
  const validSource = typeof src === "string" && src.trim() ? src.trim() : "";
  const usesFallback = !validSource || failedSource === validSource;

  return (
    <img
      src={usesFallback ? defaultAvatar : validSource}
      alt={alt || (name ? `Photo de profil de ${name}` : "Avatar utilisateur")}
      className={`shrink-0 object-cover ${className}`}
      onError={() => setFailedSource(validSource)}
      data-default-avatar={usesFallback ? "true" : undefined}
    />
  );
}
