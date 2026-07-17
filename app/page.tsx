import Header from "./components/Header";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import RealEstate360 from "./components/RealEstate360";
import Featured from "./components/Featured";
import Services from "./components/Services";
import Properties from "./components/Properties";
import About from "./components/About";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";
import WhatsAppLauncher from "./components/WhatsAppLauncher";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Stats />
        <RealEstate360 />
        <Featured />
        <Services />
        <Properties />
        <About />
        <ContactForm />
      </main>
      <Footer />
      <WhatsAppLauncher />
    </>
  );
}
