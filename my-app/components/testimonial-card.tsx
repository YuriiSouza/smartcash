import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface TestimonialCardProps {
  name: string
  role: string
  testimonial: string
  initial: string
  color: string
}

export function TestimonialCard({ name, role, testimonial, initial, color }: TestimonialCardProps) {
  return (
    <Card className={`border-2 hover:border-${color}-200 transition-colors`}>
      <CardContent className="pt-6">
        <div className="flex mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-gray-600 mb-4">{testimonial}</p>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-${color}-100 rounded-full flex items-center justify-center`}>
            <span className={`text-${color}-600 font-semibold`}>{initial}</span>
          </div>
          <div>
            <div className="font-semibold">{name}</div>
            <div className="text-sm text-gray-500">{role}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
