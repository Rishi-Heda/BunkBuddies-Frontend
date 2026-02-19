import Image from "next/image";
import BackgroundGrid from "./components/BackgroundLines";
import Landing from "./components/Landing";

export default function Home() {
  return (
    <>
    <BackgroundGrid>
      <Landing/>
    </BackgroundGrid>
    </>
  );
}
