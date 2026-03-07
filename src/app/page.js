import BackgroundGrid from "./components/BackgroundLines";
import Landing from "./components/Landing";
import HowItWorks from "./components/HowItWorks";
import Contributors from "./components/contributors";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <BackgroundGrid>
        <Landing />
        <HowItWorks />
        <Contributors />
        <Footer />
      </BackgroundGrid>
    </>
  );
}
