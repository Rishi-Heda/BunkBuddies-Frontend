import Image from "next/image";
import BackgroundGrid from "./components/BackgroundLines";
import Landing from "./components/Landing";
import HowItWorks from "./components/HowItWorks";

export default function Home() {
  return (
    <>
    <BackgroundGrid>
      <Landing/>
      <HowItWorks/>
    </BackgroundGrid>
    </>
  );
}
