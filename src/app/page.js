import BackgroundGrid from "./components/BackgroundLines";
import Landing from "./components/Landing";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <BackgroundGrid>
        <Landing />
        <HowItWorks />
        <Footer />
      </BackgroundGrid>
    </>
  );
}
