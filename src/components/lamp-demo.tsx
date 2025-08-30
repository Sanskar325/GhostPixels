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
        GhostPixels leverages the ancient art of steganography, reborn for the digital age, to seamlessly embed your secret messages, files, or sensitive data within the very pixels of an image. This process makes your information completely invisible to the naked eye, appearing as nothing more than an ordinary picture. Secure your personal data, protect your privacy with state-of-the-art encryption, and communicate with absolute confidence, knowing your information is cleverly and securely concealed from any unauthorized access. Whether for confidential business communications or personal secrets, GhostPixels is your digital vault in plain sight.
       </motion.p>
    </LampContainer>
  );
}
