
type TooltipProps = {
    children: JSX.Element
    tooltipText: string
}

const Tooltip = ({ children, tooltipText }:TooltipProps) => {
  return (
    <div className="relative inline-block group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[9999]">
        <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
          {tooltipText}
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
