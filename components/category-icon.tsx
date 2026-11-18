import {
  AirVent,
  Droplets,
  Zap,
  Sparkles,
  WashingMachine,
  Shirt,
  Wrench,
  Hammer,
  Paintbrush,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  "air-vent": AirVent,
  droplets: Droplets,
  zap: Zap,
  sparkles: Sparkles,
  "washing-machine": WashingMachine,
  shirt: Shirt,
  wrench: Wrench,
  hammer: Hammer,
  paintbrush: Paintbrush,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] || Wrench;
  return <Icon className={className} strokeWidth={1.8} />;
}
