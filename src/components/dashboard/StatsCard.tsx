import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: string
  color?: string
}

export function StatsCard({ title, value, description, icon, color = "primary" }: StatsCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          {icon && (
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}`}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
