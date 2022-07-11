import React from "react";
import { HoveredNode } from "./HoveredNode";


export interface AppButtonPorps {
  backgroundColor: {
    common: string;
    hovered: string;
  }
  textContent: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}
export class AppButton extends React.Component<AppButtonPorps, {}> {
  render(): React.ReactNode {
    let { common, hovered } = this.props.backgroundColor;
    return (
      <HoveredNode
        content={() => this.props.textContent}
        style={hoverMark => ({
          backgroundColor: hoverMark ? hovered : common,
          cursor: 'pointer',
          padding: 10,
          borderRadius: 5,
          margin: 10,
        })}
        originProps={{
          onClick: ev => this.props.onClick && this.props.onClick(ev),
        }}
      />
    );
  }
}
