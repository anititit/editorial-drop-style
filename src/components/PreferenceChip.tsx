import { cn } from "@/lib/utils";

interface PreferenceChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function PreferenceChip({ label, selected, onClick }: PreferenceChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "preference-chip",
        selected && "active"
      )}
    >
      {label}
    </button>
  );
}
