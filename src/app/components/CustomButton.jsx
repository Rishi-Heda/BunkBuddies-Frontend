export default function CustomButton({
  children,
  className = "",
  color = "#7C5CBF",
  textColor = "text-black",
  ...props
}) {
  return (
    <button
      {...props}
      className={`
        flex items-center justify-center gap-2
        px-5 py-2.5
        font-semibold text-sm
        border border-black
        border-b-[6px] border-r-[6px]
        rounded-md
        active:translate-x-0.75 active:translate-y-0.75
        active:border-b-[3px] active:border-r-[3px]
        transition-all duration-75
        ${textColor}
        ${className}
      `}
      style={{ backgroundColor: color }}
    >
      {children}
    </button>
  );
}
