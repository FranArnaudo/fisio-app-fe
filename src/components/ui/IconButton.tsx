interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  noBackground?: boolean;
}

const IconButton = ({ children, noBackground, ...props }: IconButtonProps) => {
  return (
    <button
      className={`grid place-items-center p-2 sm:p-3 ${
        noBackground
          ? "bg-transparent hover:bg-gray-200 dark:hover:bg-slate-700"
          : "bg-primary hover:bg-gray-800 dark:hover:bg-slate-300"
      } `}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;
