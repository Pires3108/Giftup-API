import React from "react";

export default function Button({ children, onClick, style, className, type, ...props }) {
  return (
    <button
      onClick={onClick}
      type={type}
      className={className}
      style={{
        padding: "10px 20px",
        borderRadius: "9999px",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold",
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
