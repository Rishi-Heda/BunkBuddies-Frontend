export default function BackgroundGrid({ children }) {
  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        backgroundColor: "#FEE3D2",
        backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.07) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.07) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
      {children}
    </div>
  );
}