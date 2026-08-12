import Header from "./components/Header";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import RealEstate360 from "./components/RealEstate360";
import AreaMap from "./components/AreaMap";
import Services from "./components/Services";
import Properties from "./components/Properties";
import PropertySearchProvider from "./components/PropertySearchProvider";
import About from "./components/About";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";
import WhatsAppLauncher from "./components/WhatsAppLauncher";
import { getAreas } from "./lib/areas";
import { getProperties } from "./lib/properties.server";

export default async function Home() {
  /*
    Both Sanity queries start before either is awaited. Fetching the listings and
    then letting <AreaMap> fetch the areas ran them back to back — two round trips
    where one wall-clock is enough, since neither depends on the other.

    The listings are awaited here because the client provider needs the array
    itself; the areas travel on as a promise for AreaMap to await further down.
  */
  const areasPromise = getAreas();
  const properties = await getProperties();

  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1">
        <Hero />
        {/* The only page with the search on it, so the provider sits here rather than in
            the layout. Everything inside it stays a server component — they're passed
            through as children. */}
        <PropertySearchProvider properties={properties}>
          <Properties />
        </PropertySearchProvider>
        <RealEstate360 />
        <AreaMap areas={areasPromise} />
        <Services />
        <Stats />
        <About />
        <ContactForm />
      </main>
      <Footer />
      <WhatsAppLauncher />
    </>
  );
}
