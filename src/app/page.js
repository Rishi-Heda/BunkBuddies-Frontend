
import Image from "next/image";
import { Syne } from "next/font/google";
import BackgroundGrid from "./components/BackgroundLines";
import CustomButton from "./components/CustomButton";
import { useRouter } from "next/navigation";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function Home() {
  const router = useRouter();
  const handleSignIn = () => {
    router.push("/signin");
  };
  const steps = [
    {
      id: 1,
      title: "Create a profile",
      description:
        "Create a profile by providing necessary details like name, VIT email ID, registration number, and Rank.",
      bgColor: "bg-[#47D19D]",
    },
    {
      id: 2,
      title: "Find Roommates",
      description:
        "Search for potential roommates or groups on the website and send a request to join them with a short introduction.",
      bgColor: "bg-[#BE8EF8]",
    },
    {
      id: 3,
      title: "Initiate Communication",
      description:
        "If you find a potential match, initiate communication through the app. Start with a simple introduction and try to get to know the other person better by asking questions about their lifestyle, habits, and interests",
      bgColor: "bg-[#FB5E4C]",
    },
  ];
    return <Landing />;
}
