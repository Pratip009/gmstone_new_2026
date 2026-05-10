import GemsPromise from "@/components/ui/GemsPromise";
import HeroCarousel from "@/components/ui/Herocarousel";
import ShopByCategory from "@/components/ui/Shopbycategory";
import TrustBadges from "@/components/ui/TrustBadges";
import Testimonials from "@/components/ui/Testimonials";
import SpecialsMarquee from "@/components/ui/Specialsmarquee";
import FeaturedInNews from "@/components/ui/FeaturedInNews";
import VideoTextReveal from "@/components/ui/VideoRevealHero";

export default function HomePage() {
  return (
    <main className="w-full">
      <section className="overflow-hidden">
        <HeroCarousel />
      </section>
      <TrustBadges />
      <ShopByCategory />
      <VideoTextReveal/>
      <SpecialsMarquee/>
      <GemsPromise />
      <Testimonials/>
      <FeaturedInNews/>
    </main>
  );
}