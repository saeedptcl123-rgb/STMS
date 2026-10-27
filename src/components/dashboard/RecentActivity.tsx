import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

interface Activity {
  id: string
  type: "admission" | "attendance" | "payment" | "exam"
  description: string
  date: Date
  student?: string
}

interface RecentActivityProps {
  activities: Activity[]
}

const typeColors = {
  admission: "bg-blue-100 text-blue-800",
  attendance: "bg-green-100 text-green-800",
  payment: "bg-yellow-100 text-yellow-800",
  exam: "bg-purple-100 text-purple-800",
}

const typeLabels = {
  admission: "Admission",
  attendance: "Attendance",
  payment: "Payment",
  exam: "Exam",
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <div className={`px-2 py-1 rounded text-xs font-medium ${typeColors[activity.type]}`}>
                  {typeLabels[activity.type]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  {activity.student && (
                    <p className="text-sm text-gray-500">{activity.student}</p>
                  )}
                  <p className="text-xs text-gray-400">{formatDate(activity.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
