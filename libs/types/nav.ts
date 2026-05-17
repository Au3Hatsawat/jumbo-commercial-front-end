import { LucideIcon } from "lucide-react";

export interface SubNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string | SubNavItem[];
}