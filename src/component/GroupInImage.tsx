import React from 'react';
import { Layer, Stage, Image } from 'react-konva';
import { createRoot } from 'react-dom/client';

export interface GroupInImageProps {
    group: JSX.Element;
    x?: number;
    y?: number;
    width: number;
    height: number;
}
export default class GroupInImage extends React.Component<GroupInImageProps, {}> {
    private div = document.createElement('div');
    private root = createRoot(this.div);
    private timeStamp = 0;
    render(): React.ReactNode {
        let canvas = this.div.querySelector('canvas');
        const x = this.props.x || 0;
        const y = this.props.y || 0;
        const width = this.props.width;
        const height = this.props.height;
        this.root.render(
            <Stage width={width} height={height}>
                <Layer>
                    {this.props.group}
                </Layer>
            </Stage>
        );
        return (
            <Image image={canvas ? canvas : undefined} x={x} y={y} width={width} height={height} time={this.timeStamp++}></Image>
        );
    }
}
