"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/motion";
type Props = { children: ReactNode; className?: string };
export function AnimatedSection({ children, className = "" }: Props) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(root.current!.querySelectorAll("[data-reveal]"), {
        y: 32, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 88%", once: true },
      });
    });
    return () => media.revert();
  }, []);
  return <div ref={root} className={className}>{children}</div>;
}
export function AnimatedItem({ children, className = "" }: Props) {
  return <div data-reveal className={className}>{children}</div>;
}
