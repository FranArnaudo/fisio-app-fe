import { createPortal } from "react-dom";

type ContextMenuProps = {
  anchorEl: HTMLElement;
  contextMenuWidth?: number;
  children?: React.ReactNode;
};
const ContextMenu = ({
  anchorEl,
  children,
  contextMenuWidth = 200,
}: ContextMenuProps) => {
  const { bottom, right, left } = anchorEl.getBoundingClientRect();
  const screenRight = window.innerWidth - window.screenLeft;
  const screenBottom = window.innerHeight - window.screenTop;

  const getPosition = () => {
    if (right + contextMenuWidth > screenRight) {
      return {
        left: `${right - contextMenuWidth}px`,
        top: `${bottom - 30}px`,
      };
    }
    if (bottom + contextMenuWidth > screenBottom) {
      return {
        left: `${left}px`,
        top: `${bottom}px`,
      };
    }
    return {
      left: `${right + (left - right) / 1.5}px`,
      top: `${bottom - 30}px`,
    };
  };
  return createPortal(
    <div
      id="context-menu"
      className="absolute bg-white border border-gray-200 rounded-md shadow-md  z-50"
      style={{ ...getPosition(), width: `${contextMenuWidth}px` }}
    >
      {children}
    </div>,
    document.body
  );
};

export default ContextMenu;
