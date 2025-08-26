import React from "react";

interface RequirementProps {
  title: string;
  children: React.ReactNode;
}

export function Requirement({ title, children }: RequirementProps) {
  return (
    <div className="flex flex-col gap-y-3">
      <span className="font-medium text-primary">{title}</span>
      <div className="text-secondary leading-[160%]">{children}</div>
    </div>
  );
}
