import { WidgetContainer } from "@/components/widget-container";

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WidgetContainer>{children}</WidgetContainer>;
}