import Header from "./components/Header";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Featured from "./components/Featured";
import Services from "./components/Services";
import Portfolio from "./components/Portfolio";
import About from "./components/About";
import Footer from "./components/Footer";
import WhatsAppLauncher from "./components/WhatsAppLauncher";

// Real React build (replaces the standalone-HTML iframe preview).
// The old bundle stays at /gio-in-the-dr.html for reference.
export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Featured />
        <Services />
        <Portfolio />
        <About />
      </main>
      <Footer />
      <WhatsAppLauncher />
    </>
  );
}
