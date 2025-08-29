"use client";
import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";

export function LampDemo() {
  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-24 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
      >
        Hide Secrets <br /> In Plain Sight
      </motion.h1>
       <motion.p
          initial={{ opacity: 0, y: 120 }}
          whileInView={{ opacity: 1, y: 20 }}
          transition={{
            delay: 0.5,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="mt-4 text-lg text-center text-muted-foreground max-w-xl"
       >
        GhostPixels uses the art of steganography to embed your secret messages within images, making them invisible to the naked eye. Secure your data, protect your privacy, and communicate with confidence, knowing your information is cleverly concealed from unauthorized access.
       </motion.p>
    </LampContainer>
  );
}
