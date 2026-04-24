'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock, Layers } from 'lucide-react'
import StarRating from '@/components/ui/StarRating'
import Badge from '@/components/ui/Badge'
import { Gig } from '@/types'

interface GigCardProps {
  gig: Gig
}

const stackSpring = { type: 'spring', stiffness: 300, damping: 20 } as const

export default function GigCard({ gig }: GigCardProps) {
  return (
    <Link href={`/gig/${gig.id}`} className="group block perspective-1000">
      <motion.div 
        className="relative h-[420px] w-full flex items-end justify-center pb-8"
        initial="rest"
        whileHover="hover"
      >
        {/* Floating Label */}
        <motion.div
          variants={{
            rest: { opacity: 0, y: 10 },
            hover: { opacity: 1, y: -45 }
          }}
          transition={stackSpring}
          className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-30"
        >
          <div className="bg-[var(--forest)] text-[var(--paper)] px-3 py-1 text-[9px] uppercase tracking-[2px] font-bold shadow-xl border-[0.5px] border-white/20">
            {gig.category}: {gig.techStack.split(',')[0]}
          </div>
        </motion.div>

        {/* Card 03 (Bottom/Right) */}
        <motion.div
          variants={{
            rest: { x: 0, rotate: 0, scale: 0.9, zIndex: 10 },
            hover: { x: 60, rotate: 5, scale: 0.95, zIndex: 10 }
          }}
          transition={stackSpring}
          className="absolute inset-x-0 bottom-8 h-[320px] bg-[var(--paper-dark)] border-[0.5px] border-[var(--line)] opacity-40 rounded-sm"
        />

        {/* Card 02 (Middle/Left) */}
        <motion.div
          variants={{
            rest: { x: 0, rotate: 0, scale: 0.95, zIndex: 15 },
            hover: { x: -60, rotate: -5, scale: 0.98, zIndex: 15 }
          }}
          transition={stackSpring}
          className="absolute inset-x-0 bottom-8 h-[320px] bg-[var(--paper-dark)] border-[0.5px] border-[var(--line)] opacity-60 rounded-sm"
        />

        {/* Card 01 (Front/Main) */}
        <motion.div
          variants={{
            rest: { scale: 1, zIndex: 20 },
            hover: { scale: 1.02, zIndex: 20 }
          }}
          transition={stackSpring}
          className="relative w-full border-[0.5px] border-[var(--line)] bg-[var(--paper)] shadow-lg transition-colors group-hover:border-[var(--forest-light)] z-20"
        >
          {/* Thumbnail */}
          <div className="relative aspect-[16/10] overflow-hidden bg-[var(--paper-dark)]">
            {gig.thumbnail ? (
              <Image
                src={gig.thumbnail}
                alt={gig.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.1">
                  <path d="M24 4L44 15v18L24 44 4 33V15z" stroke="var(--forest)" strokeWidth="1"/>
                </svg>
              </div>
            )}
            <div className="absolute top-3 left-3 flex gap-2">
              <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[8px] uppercase tracking-[1.5px] font-bold text-[var(--forest)] border-[0.5px] border-[var(--line)]">
                {gig.category}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 bg-[var(--paper)]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-[var(--forest)] text-white flex items-center justify-center text-[9px] font-bold">
                {gig.seller.name.charAt(0)}
              </div>
              <span className="text-[10px] text-[var(--grey)] font-medium uppercase tracking-[1px]">{gig.seller.name}</span>
            </div>

            <h3 className="font-display text-[15px] font-light text-[var(--charcoal)] leading-snug mb-3 line-clamp-2 h-[42px]">
              {gig.title}
            </h3>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--line)]">
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-[1px] text-[var(--grey-light)] mb-0.5">Starting at</span>
                <span className="font-display text-[18px] font-medium text-[var(--forest)]">₹{gig.basicPrice.toLocaleString()}</span>
              </div>
              <div className="flex flex-col items-end">
                <StarRating rating={gig.rating} size={9} />
                <span className="text-[9px] text-[var(--grey-light)] mt-1">{gig.deliveryDays}d delivery</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Link>
  )
}

