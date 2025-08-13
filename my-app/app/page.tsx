import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { FeaturedProducts } from "@/components/featured-products"
import { AboutSection } from "@/components/about-section"
import { Testimonials } from "@/components/testimonials"
import { Newsletter } from "@/components/newsletter"
import { Footer } from "@/components/footer"
<<<<<<< HEAD

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />
      <Hero />
      <FeaturedProducts />
      <AboutSection />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
=======
import { SessionProvider } from "next-auth/react"

export default function HomePage() {
  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Header />
        <Hero />
        <FeaturedProducts />
        <AboutSection />
        <Testimonials />
        <Newsletter />
        <Footer />
      </div>
>>>>>>> 9b85b48 (feat: create profile page)
  )
}
