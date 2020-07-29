// Name any p5.js functions we use in `global` so Glitch can recognize them.
/* global
 *    rect, translate, width, height, fill, rotate, cos, sin, ellipse, noStroke, stroke, strokeWeight
 *    keyIsDown, LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, resetMatrix, line, trailScrollX, trailScrollY
 *    collideLineCircle, collideCircleCircle, collideRectCircle, startTime, obstacles, random, text, textSize
 *    mapWidthMin, mapWidthMax, mapHeightMin, mapHeightMax
 */

class Collectible {
    constructor(xPos, yPos, size, colorHue, text, collectibleAction) {
        this.x = xPos
        this.y = yPos
        this.maxSize = size
        this.currentSize = this.maxSize
        this.sizeChangeVel = 2
        this.hue = colorHue
        this.action = collectibleAction
        this.text = text
        this.respawn()
    }

    show() {

        fill(this.hue, 100, 50)
        ellipse(this.x + scrollX, this.y + scrollY, this.currentSize, this.maxSize)

        fill(this.hue, 100, 100)
        ellipse(this.x + scrollX, this.y + scrollY, this.currentSize - 5, this.maxSize - 5)

        this.collectibleSpin()

    }

    checkObstacleCollision() {
        for (let obstacle of obstacles) {

            let hit = false;

            if (obstacle.shape === "rect") {
                hit = collideRectCircle(obstacle.x + scrollX, obstacle.y + scrollY, obstacle.width, obstacle.height, this.x + scrollX, this.y + scrollY, this.maxSize)
            }
            else if (obstacle.shape === "ellipse") {
                hit = collideCircleCircle(obstacle.x + scrollX, obstacle.y + scrollY, obstacle.width, this.x + scrollX, this.y + scrollY, this.maxSize)
            }

            //on a collision
            if (hit) {
                this.respawn()
            }
        }
    }

    collectibleSpin() {

        if (this.currentSize > this.maxSize || this.currentSize < 4) {
            this.sizeChangeVel *= -1
        }

        this.currentSize += this.sizeChangeVel

    }

    respawn() {
        this.x = random(-mapWidthMax, mapWidthMin)
        this.y = random(mapHeightMax, -mapHeightMin)
        this.checkObstacleCollision()
    }
}