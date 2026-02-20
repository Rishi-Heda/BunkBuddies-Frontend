import Image from "next/image";
import BackgroundGrid from "./components/BackgroundLines";
import Landing from "./components/Landing";
import HowItWorks from "./components/HowItWorks";

export default function Home() {
  return (
    <div className="h-screen overflow-hidden">
      <BackgroundGrid>
        <Landing />
      </BackgroundGrid>
    </div>
  );
}
