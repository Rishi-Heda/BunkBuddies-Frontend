import React from 'react';
import { Syne } from 'next/font/google';

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: 'Create a profile',
      description:
        'Create a profile by providing necessary details like name, VIT email ID, registration number, and Rank.',
      bgColor: 'bg-[#47D19D]',
    },
    {
      id: 2,
      title: 'Find Roommates',
      description:
        'Search for potential roommates or groups on the website and send a request to join them with a short introduction.',
      bgColor: 'bg-[#BE8EF8]',
    },
    {
      id: 3,
      title: 'Initiate Communication',
      description:
        'If you find a potential match, initiate communication through the app. Start with a simple introduction and try to get to know the other person better by asking questions about their lifestyle, habits, and interests',
      bgColor: 'bg-[#FB5E4C]',
    },
  ];

  return (
    <section className={`${syne.className} w-full py-12 px-4 md:px-6 lg:px-8`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side: Title */}
        <div className="flex justify-center md:justify-start">
          <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight">
            How it works ?
          </h2>
        </div>

        {/* Right Side: Cards */}
        <div className="space-y-6">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`${step.bgColor} p-6 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1`}
            >
              <h3 className="text-[32px] font-bold text-black mb-2 leading-tight">
                {step.title}
              </h3>
              <p className="text-[16px] text-black/80 font-medium leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
