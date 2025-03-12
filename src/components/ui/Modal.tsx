import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const root = document.getElementById("root");

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div
        className="
        relative
        bg-white
        rounded-md
        shadow-lg
        max-w-md
        w-full
        mx-auto
        my-auto
        p-4
        z-[99999]
        max-h-[90vh]
        flex
        flex-col
      "
      >
        <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">
            {title || "Modal Title"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 bg-transparent"
            aria-label="Close"
          >
            <IoClose size={20} />
          </button>
        </div>
        <div className="text-sm text-gray-700 overflow-y-auto flex-1 pr-1">
          {children}
        </div>
      </div>
    </div>,
    root! // Render modal to the root body element
  );
};

export default Modal;