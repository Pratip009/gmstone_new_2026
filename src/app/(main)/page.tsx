import GemsPromise from "@/components/ui/GemsPromise";
import HeroCarousel from "@/components/ui/Herocarousel";
import ShopByCategory from "@/components/ui/Shopbycategory";
import TrustBadges from "@/components/ui/TrustBadges";

export default function HomePage() {
  return (
    <main className="w-full">
      <section className="h-screen overflow-hidden">
        <HeroCarousel />
      </section>
      <TrustBadges />
      <ShopByCategory />
      <GemsPromise />
    </main>
  );
}