// Name any p5.js functions we use in `global` so Glitch can recognize them.
/* global
 *    rect, translate, width, height, fill, rotate, cos, sin, ellipse, noStroke, stroke, strokeWeight
 *    keyIsDown, LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, resetMatrix, line, trailScrollX, trailScrollY
 *    collideLineCircle
 */

class Obstacle {
    constructor(xPosition, yPosition, shapeWidth, shapeHeight, shapeType, shapeColor) {
        this.x = xPosition
        this.y = yPosition
        this.width = shapeWidth
        this.height = shapeHeight
        this.shape = shapeType
        this.color = shapeColor
    }

    show() {
        fill(this.color)
        if (this.shape === 'rect') {
            rect(this.x + scrollX, this.y + scrollY, this.width, this.height)
        }
        else if (this.shape === 'ellipse') {
            ellipse(this.x + scrollX, this.y + scrollY, this.width, this.height)
        }
    }
}