// @ts-nocheck
import * as React from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'

export default function Item(props) {
    const { children, cancelCls, moveCard, ...otherProps } = props;
    let direction;
    const ref = React.useRef();
    const lineRef = React.useRef();
    const clearActive = () => {
        window.__lineRefs && window.__lineRefs.forEach(({ ref, cls }) => {
            ref.current.classList.remove(cls)
        })
        window.__lineRefs = []
    }
    // useDrop：用于将当前组件用作放置目标。
    const [, drop] = useDrop({
        // 定义拖拽类型
        accept: props.accept,
        hover(item, monitor) {
            clearActive()
            // 拖拽目标的index
            const dragIndex = item.index
            // 放置目标的index
            const hoverIndex = props.index
            // 如果拖拽目标和放置目标相同的话，停止执行
            if (dragIndex === hoverIndex) {
                return
            }
            //如果不做以下处理，则卡片移动到另一个卡片上就会进行交换，下方处理使得卡片能够在跨过中心线后进行交换.
            //获取卡片的边框矩形
            const hoverBoundingRect = ref.current.parentElement.getBoundingClientRect()
            // 左右居中
            const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2

            //获取拖拽目标偏移量
            const clientOffset = monitor.getClientOffset()
            // Get pixels to the left
            const hoverClientX = clientOffset.x - hoverBoundingRect.left
            direction = dragIndex < hoverIndex ? 'to-right' : 'to-left';
            //只有当鼠标移动了一半的物品宽度度时才进行移动
            //向右拖动时，仅当光标低于50%时移动
            if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
                return
            }
            //向左拖动时，仅当光标超过50%时移动
            if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
                return
            }
            window.__lineRefs.push({
                ref: lineRef,
                cls: direction
            })
            lineRef.current.classList.add(direction)
        },
        drop: (item, monitor) => {
            if (!(window.__lineRefs || []).length) {
                return
            }
            clearActive()
            moveCard(item, props)
        },
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        })
    })
    // useDrag：用于将当前组件用作拖动源。
    const [{ isDragging, opacity }, drag, preview] = useDrag({
        item: { type: props.accept, isChild: props.isChild, ...otherProps, node: ref },
        collect: monitor => ({
            isDragging: monitor.isDragging(), // 是否正在拖拽
            opacity: monitor.isDragging() ? 0.4 : 1,
        }),
        end: (item, monitor) => {
            clearActive()
        },
        // options: {
        //     dropEffect: props.showCopyIcon ? 'copy' : 'move',
        // },
        // canDrag: (monitor) => { },
        // isDragging: (monitor) => { },
        // begin: (monitor) => {},
        
    })
    drag(drop(ref))
    React.useEffect(() => {
        preview(getEmptyImage(), {
            captureDraggingState: true,
        });
    }, []);

    return <>
        {React.Children.map(
            children,
            (child, index) => React.cloneElement(
                child, {
                ref,
                className: (child.props.className || '') + ` drop-target-item ${cancelCls}`
            })
        )}
        <div ref={lineRef} className="vertical-grain" />
    </>
}
