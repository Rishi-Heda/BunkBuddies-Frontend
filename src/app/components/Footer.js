import { IoMdMail } from "react-icons/io";
import Image from "next/image";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { SiMedium } from "react-icons/si";

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/VinnovateIT",
    icon: <FaGithub className="h-6 w-6" />,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/vinnovateit/",
    icon: <FaInstagram className="h-6 w-6" />,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/vinnovateit/",
    icon: <FaLinkedin className="h-6 w-6" />,
  },
  {
    name: "Medium",
    href: "https://medium.com/@vinnovateit",
    icon: <SiMedium className="h-6 w-6" />,
  },
];

export default function Footer() {
  return (
    <footer className="w-full overflow-hidden">
      <div className="leading-none">
        <svg
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          className="block h-24 w-full sm:h-28 md:h-36 lg:h-40"
          aria-hidden="true"
        >
          <path
            d="M0,12 C320,220 1120,220 1440,12 L1440,220 L0,220 Z"
            fill="#B78AF1"
          />
        </svg>
      </div>

      <div className="-mt-px bg-[#B78AF1] px-4 pb-10 pt-4 sm:px-6 sm:pb-12 md:px-0 md:pb-14">
        <div className="mx-auto flex w-full max-w-none flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-9 pl-0 sm:pl-0 md:pl-[51px] md:gap-10">
            <div className="flex w-full items-start justify-between gap-4 md:flex-col md:justify-start">
              <Image
                src="/logo.svg"
                alt="BunkBuddies logo"
                width={240}
                height={100}
                className="h-auto w-32 sm:w-40 md:w-52"
                draggable={false}
              />

              <Image
                src="/logo.webp"
                alt="VinnovateIT logo"
                width={300}
                height={90}
                className="h-auto w-32 sm:w-40 md:w-[230px]"
                draggable={false}
              />
            </div>

            {/* Social icons aligned to VinnovateIT logo width */}
            <div className="relative">
              <div className="mx-auto flex w-40 sm:w-44 md:w-[200px] justify-evenly items-center text-black px-2 sm:px-3 md:px-4 gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.name}
                    className="transition-transform hover:-translate-y-0.5"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-[320px] text-black md:pb-2 md:text-right md:pr-[51px]">
            <h3 className="text-[24px] font-bold font-sans leading-tight" style={{ fontWeight: 700 }}>
              Contact Us
            </h3>

            <div className="mt-5 space-y-5 text-lg font-medium sm:text-xl">
              <div className="flex items-center gap-3 md:justify-end">
                <IoMdMail className="h-6 w-6 shrink-0" />
                <a
                  href="mailto:vinnovateit@vit.ac.in"
                  className="hover:underline text-[16px] leading-tight sm:text-[18px] md:text-[20px] lg:text-[20px] break-all sm:break-normal"
                >
                  vinnovateit@vit.ac.in
                </a>
              </div>

              <div className="flex items-start gap-3 md:justify-end">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="mt-0.5 h-6 w-6 shrink-0"
                >
                  <path d="M12 2.5A7.5 7.5 0 0 0 4.5 10c0 5.65 6.53 11.05 7.02 11.45a.75.75 0 0 0 .96 0C12.97 21.05 19.5 15.65 19.5 10A7.5 7.5 0 0 0 12 2.5Zm0 9.75A2.25 2.25 0 1 1 12 7.75a2.25 2.25 0 0 1 0 4.5Z" />
                </svg>
                <p className="leading-tight text-[16px] sm:text-[18px] md:text-[20px] lg:text-[20px]">
                  VIT, Vellore Campus
                  <br />
                  Tiruvallam Road,
                  <br />
                  Katpadi, Vellore,
                  <br />
                  Tamil Nadu 632014
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
