import BackgroundGrid from "./components/BackgroundLines";
import Landing from "./components/Landing";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";
import Contributors from "./components/contributors";

export default function Home() {
  return (
    <>
      <BackgroundGrid>
        <Landing />
        <HowItWorks />
        <Contributors/>
        <Footer />
      </BackgroundGrid>
    </>
  );
}
