import React, { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowBigUp } from "lucide-react";
import Button from "./Button";

const OnScreenKeyboard = ({
  value,
  onChange,
  onEnter,
  onClose,
  className = "",
}) => {
  const [isShift, setIsShift] = useState(false);
  const [pressedKey, setPressedKey] = useState(null);

  // Define letters for shift logic
  const letters = "abcdefghijklmnopqrstuvwxyz";

  const rows = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["shift", "z", "x", "c", "v", "b", "n", "m", "backspace"],
    ["space"]
  ];

  const handleKey = (key) => {
    if (key === "backspace") {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === "space") {
      onChange(value + " ");
      return;
    }
    if (key === "enter") {
      onEnter && onEnter();
      return;
    }
    if (key === "shift") {
      setIsShift((prev) => !prev);
      return;
    }

    // Letters uppercase when shift ON, numbers unchanged
    const isLetter = letters.includes(key);
    const char = isLetter && isShift ? key.toUpperCase() : key;
    onChange(value + char);
  };

  // Touch event handlers for Crestron panel fallback
  const handleTouchStart = (key) => setPressedKey(key);
  const handleTouchEnd = () => setPressedKey(null);

  const renderKey = (key) => {
    const isPressed = pressedKey === key;
    const base =
      "keyboard-key flex-1 rounded-xl shadow-sm bg-white hover:bg-gray-100 " +
      "border border-gray-200 flex items-center justify-center select-none " +
      "text-xl px-3 py-3 " +
      "touchPanel:text-3xl touchPanel:px-6 touchPanel:py-6 touchPanel:min-h-[72px] transition-all" +
      (isPressed ? " bg-primary-100 scale-95" : "");

    // Common touch props for all keys
    const touchProps = {
      onTouchStart: () => handleTouchStart(key),
      onTouchEnd: handleTouchEnd,
      onMouseDown: () => handleTouchStart(key),
      onMouseUp: handleTouchEnd,
      onMouseLeave: handleTouchEnd,
    };

    if (key === "space") {
      return (
        <Button
          key={key}
          type="button"
          onClick={() => handleKey(key)}
          className={`${base} keyboard-key flex-[4]`}
          variant="ghost"
          {...touchProps}
        >
          Space
        </Button>
      );
    }

    if (key === "backspace") {
      return (
        <Button
          key={key}
          type="button"
          onClick={() => handleKey(key)}
          className={`${base} keyboard-key-backspace flex-[1.2] bg-red-50 hover:bg-red-100 border-none ${isPressed ? "!bg-red-200 scale-95" : ""}`}
          variant="secondary"
          {...touchProps}
        >
          <ArrowLeft size={24} className="touchPanel:w-8 touchPanel:h-8" />
        </Button>
      );
    }

    if (key === "shift") {
      return (
        <Button
          key={key}
          type="button"
          onClick={() => handleKey(key)}
          // ✅ ADDED: keyboard-key-shift-inactive when shift is off — targeted by global.css
          className={`${base} keyboard-key-shift flex-[1.2] ${
            isShift
              ? "bg-blue-800 hover:bg-blue-900 border-blue-500 shadow-md font-bold"
              : "keyboard-key-shift-inactive bg-blue-50 hover:bg-blue-100 border-blue-200"
          } ${isPressed ? "scale-95" : ""}`}
          variant={isShift ? "default" : "ghost"}
          {...touchProps}
        >
          <ArrowBigUp
            size={20}
            className={`touchPanel:w-7 touchPanel:h-7 drop-shadow-sm ${
              isShift
                ? "text-blue-800 fill-current"
                : "text-blue-800"
            }`}
          />
        </Button>
      );
    }

    return (
      <Button
        key={key}
        type="button"
        onClick={() => handleKey(key)}
        className={base}
        variant="ghost"
        {...touchProps}
      >
        {letters.includes(key) && isShift ? key.toUpperCase() : key}
      </Button>
    );
  };

  // Helper to check if row needs centering (Row 3 has 9 buttons)
  const isCenteredRow = (rowIndex) => rowIndex === 2;

  return (
    // ✅ ADDED: keyboard-container class — targeted by global.css dark mode
    <div
      className={
        "keyboard-container w-full bg-gray-50 rounded-2xl p-3 touchPanel:p-4 flex flex-col gap-3 " +
        "max-h-[55vh] touchPanel:max-h-[65vh] overflow-y-auto " +
        className
      }
    >
      {rows.map((row, idx) => (
        <div
          key={idx}
          className={`flex gap-2 justify-center ${
            isCenteredRow(idx) ? "w-[90%] mx-auto" : ""
          }`}
        >
          {row.map(renderKey)}
        </div>
      ))}

      {/* SIMPLIFIED BOTTOM BUTTONS */}
      {/* ✅ ADDED: keyboard-bottom-divider class — targeted by global.css dark mode */}
      <div className="keyboard-bottom-divider flex justify-between gap-3 pt-3 border-t border-gray-200">
        <Button
          variant="outline"
          size="lg"
          onClick={onClose}
          className="flex-1 touchPanel:px-8 touchPanel:py-6 touchPanel:text-2xl"
        >
          Close
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onEnter}
          className="flex-1 touchPanel:px-8 touchPanel:py-6 touchPanel:text-2xl"
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default OnScreenKeyboard;
