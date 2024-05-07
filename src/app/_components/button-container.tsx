import React from "react";

const ButtonContainer = (props: { children: React.ReactNode }) => {
  return <div className="grid grid-cols-2 gap-2">{props.children}</div>;
};

export default ButtonContainer;
