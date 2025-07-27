"use client"
import "../globals.css"
import ResponsiveHowToCard from "@/components/ResponsiveHowToCard"
import { LetsCollaborate } from "@/components/letscolaborate"
import { HeroSection } from "@/components/hero-section"
import { InnovationSection } from "@/components/innovation-section"
import { FAQ } from "@/components/Faq"
import VisionariesGallery from "@/components/visionaries"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 overflow-x-hidden">
        {/* Hero Section */}
        <HeroSection />

        {/* How It Works Section - Responsive */}
        <ResponsiveHowToCard />

        {/* Lets Collaborate Section */}
        <LetsCollaborate />
        {/* Visionaries Gallery Section */}
        <VisionariesGallery/>

        {/* Innovation Section */}
        <InnovationSection />

        {/* FAQ Section */}
        <FAQ />
      </main>
    </div>
  )
}
