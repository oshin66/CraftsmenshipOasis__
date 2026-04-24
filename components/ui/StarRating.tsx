import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  max?: number
  size?: number
  showNumber?: boolean
}

export default function StarRating({ rating, max = 5, size = 12, showNumber = true }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            size={size}
            fill={i < Math.round(rating) ? 'var(--forest)' : 'none'}
            stroke="var(--forest)"
            strokeWidth={1.5}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-[11px] text-[var(--grey)] ml-1 font-[Jost]">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
