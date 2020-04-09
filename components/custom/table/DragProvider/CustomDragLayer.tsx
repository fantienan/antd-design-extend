// @ts-nocheck
import React from 'react'
import { useDragLayer } from 'react-dnd'
import { snapToGrid, getItemStyles } from './utils'

const PreviewItem = ({ title, node }) => {
    const { width, height } = node.current.parentElement.getBoundingClientRect();
    return <div style={{ width, height }}>{title}</div>
}
export default function CustomDragLayer(props) {
    const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer(monitor => ({
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
    }));
    function renderItem() {
        switch (itemType) {
            case item.accept:
                return item.title;
            default:
                return null;
        }
    }
    if (!isDragging || !((item || {}).node || {}).current) {
        return null;
    }
    const { width, height } = item.node.current.parentElement.getBoundingClientRect();
    return (
        <div className="custom-drag-layer"
            style={getItemStyles({ initialOffset, currentOffset, width, height })}
        >
            {renderItem()}
        </div>
    )
};