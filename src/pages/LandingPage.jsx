import Header from "../components/Header";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import ChagasInfo from "../components/ChagasInfo";
import StatsSection from "../components/StatsSection";
import Footer from "../components/Footer";

function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <ChagasInfo />
        <StatsSection />
      </main>
      <Footer />
    </>
  );
}

export default LandingPage;
