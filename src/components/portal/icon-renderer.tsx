import React from "react";
import * as Icons from "lucide-react";

interface IconRendererProps {
  name: string;
  className?: string;
}

export function IconRenderer({ name, className = "h-5 w-5" }: IconRendererProps) {
  const LucideIcon = (Icons as Record<string, any>)[name] || Icons.ExternalLink;
  return <LucideIcon className={className} />;
}
