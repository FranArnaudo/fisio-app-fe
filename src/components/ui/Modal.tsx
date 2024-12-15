import React from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      {/* Modal Card */}
      <div
        className="
        relative
        bg-white
        rounded-md
        shadow-lg
        max-w-md
        w-full
        mx-4
        p-4
        z-[99999]
      "
      >
        <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            {title || "Modal Title"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700
            bg-transparent"
          >
            <IoClose size={20} />
          </button>
        </div>
        <div className="text-sm text-gray-700">{children}</div>
      </div>
    </div>,
    document.body // Render modal to the root body element
  );
};

export default Modal;
