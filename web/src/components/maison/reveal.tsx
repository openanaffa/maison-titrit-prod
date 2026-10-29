"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

/**
 * Reveal — scroll-triggered entrance animation.
 *
 * framer-motion is lazy-loaded via next/dynamic so it is NOT part of the
 * initial shared chunk. This keeps the home page's critical render path
 * free of framer-motion's ~1.6s main-thread execution cost. framer-motion
 * is only parsed/executed when a <Reveal> component actually mounts
 * (typically below-the-fold content).
 */
const Reveal = dynamic(
  async () => {
    const { motion, useReducedMotion } = await import("framer-motion");

    function RevealComponent({
      children,
      delay = 0,
      y = 18,
      className,
      once = true,
    }: {
      children?: React.ReactNode;
      delay?: number;
      y?: number;
      className?: string;
      once?: boolean;
    }) {
      const reduce = useReducedMotion();
      if (reduce) {
        return <div className={className}>{children}</div>;
      }
      return (
        <motion.div
          className={className}
          initial={{ opacity: 0, y }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once, margin: "-80px" }}
          transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      );
    }

    return { default: RevealComponent };
  },
  { ssr: false, loading: () => <></> }
);

export default Reveal;
