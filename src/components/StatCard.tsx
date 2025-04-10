
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

const StatCard = ({ title, value, icon, description, className }: StatCardProps) => {
  return (
    <div className={cn("stats-card flex items-center", className)}>
      <div className="bg-white p-3 rounded-full mr-4">
        {icon}
      </div>
      <div>
        <h3 className="text-gray-600 text-sm">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
