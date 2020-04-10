// @ts-nocheck
/**
 * http://www.lib4dev.in/info/murphywuwu/react-dnd-examples/192708475
 * https://github.com/react-dnd/react-dnd
 * **/
import React from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import CustomDragLayer from './CustomDragLayer'
import Item from './Item'
import '../style/index.less'
export default function DragProvider(props) {
    return (
        <DndProvider backend={Backend}>
            {props.children}
            <CustomDragLayer />
        </DndProvider>
    )
}

DragProvider.Item = Item

