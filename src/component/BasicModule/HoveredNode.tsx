import React, { EventHandler, SyntheticEvent } from 'react';

function mergeListener<T extends SyntheticEvent<any>>(newFunc: EventHandler<T>, originFunc: EventHandler<T> | undefined): EventHandler<T> {
  return ev => {
    originFunc && originFunc(ev);
    newFunc(ev);
  };
}
export interface HoveredNodeProps {
  style?: (hoverMark: boolean) => React.CSSProperties;
  content: (hoverMark: boolean) => React.ReactNode;
  originProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
}
export interface HoveredNodeState {
  hoverMark: boolean;
}
export class HoveredNode extends React.Component<HoveredNodeProps, HoveredNodeState>{
  state: Readonly<HoveredNodeState> = { hoverMark: false };
  render(): React.ReactNode {
    let style = this.props.style && this.props.style(this.state.hoverMark);
    let props = { ...this.props.originProps, style };
    props.onMouseEnter = mergeListener(() =>
      this.setState({ hoverMark: true }), props.onMouseEnter);
    props.onMouseLeave = mergeListener(() =>
      this.setState({ hoverMark: false }), props.onMouseLeave);
    return (
      <div {...props}>
        {this.props.content && this.props.content(this.state.hoverMark)}
      </div>
    );
  }
}
