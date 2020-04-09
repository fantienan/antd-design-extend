// @ts-nocheck
export function snapToGrid(x, y) {
    const snappedX = Math.round(x / 32) * 32
    const snappedY = Math.round(y / 32) * 32
    return [snappedX, snappedY]
}
const safety = 1
export function getItemStyles(props) {
    const { initialOffset, currentOffset, width, height } = props
    if (!initialOffset || !currentOffset) {
        return {
            display: 'none',
        }
    }
    let { x, y } = currentOffset
    // 对齐网格，吸附网格
    if (props.snapToGrid) {
        x -= initialOffset.x
        y -= initialOffset.y
            ;[x, y] = snapToGrid(x, y)
        x += initialOffset.x
        y += initialOffset.y
    }
    const transform = `translate(${x - initialOffset.x}px, ${y - initialOffset.y}px)`
    const opacity = x - initialOffset.x > safety || y - initialOffset.y > safety ? 0.6 : 0
    return {
        top: initialOffset.y,
        left: initialOffset.x,
        width: width + 'px',
        height: height + 'px',
        opacity,
        transform,
        WebkitTransform: transform,
    }
}