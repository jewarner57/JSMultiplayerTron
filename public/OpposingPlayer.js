// Name any p5.js functions we use in `global` so Glitch can recognize them.
/* global
 *    rect, translate, width, height, fill, rotate, cos, sin, ellipse, noStroke, stroke, strokeWeight
 *    keyIsDown, LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, resetMatrix, line, trailScrollX, trailScrollY
 *    collideLineCircle, collideCircleCircle, collideRectCircle, startTime, obstacles, score, timeSurvived, 
 *    collectibles, gameOver, addNotification, opposingPlayers, random, spawnLocations
 */

class OpposingPlayer {
    constructor(id, bikeX, bikeY, bikeWidth, bikeHeight, bikeRotation, bikeHue, bikeWheelWidth, bikeWheelHeight, bikeSteeringAngle, isInvulnerable, enemyTrailScrollX, enemyTrailScrollY, trailLength) {
        this.id = id
        this.x = bikeX
        this.y = bikeY
        this.prevX = bikeX + 1
        this.prevY = bikeY + 1
        this.width = bikeWidth
        this.height = bikeHeight
        this.rotation = bikeRotation
        this.trail = []
        this.hue = bikeHue
        this.wheelWidth = bikeWheelWidth
        this.wheelHeight = bikeWheelHeight
        this.steeringAngle = bikeSteeringAngle
        this.isInvulnerable = isInvulnerable
        this.trailX = enemyTrailScrollX;
        this.trailY = enemyTrailScrollY;
        this.previousTrailX = enemyTrailScrollX;
        this.previousTrailY = enemyTrailScrollY;
        this.trailLength = trailLength
    }

    show() {
        noStroke()
        fill(this.hue, 100, 100)

        translate(this.x + scrollX, this.y + scrollY)

        rotate(this.rotation - 90)

        rect(-this.width / 2, -this.height / 2, this.width, this.height)

        fill(50)

        rect(-this.wheelWidth / 2, this.wheelHeight / 2, this.wheelWidth, this.wheelHeight)

        translate(0, -this.height / 2)
        rotate(this.steeringAngle)
        rect(-this.wheelWidth / 2, -this.wheelHeight / 2, this.wheelWidth, this.wheelHeight)

        resetMatrix()

        if (!this.isInvulnerable) {
            if (this.trail.length > this.trailLength) {
                this.trail.shift()
            }
            if (this.trailX != this.previousTrailX || this.trailY != this.previousTrailY) {
                this.trail.push({ x: this.trailX, y: this.trailY, px: this.previousTrailX, py: this.previousTrailY })

                this.previousTrailX = this.trailX
                this.previousTrailY = this.trailY

            }
        }
        else {
            this.trail = []
            this.previousTrailX = this.trailX
            this.previousTrailY = this.trailY
        }

    }

    drawTail() {
        fill(this.hue, 100, 100, 50)

        if (!this.isInvulnerable) {
            for (let segment of this.trail) {
                stroke(this.hue, 100, 100)
                strokeWeight(5)

                line(width / 2 + segment.x - trailScrollX, height / 2 + segment.y - trailScrollY, width / 2 + segment.px - trailScrollX, height / 2 + segment.py - trailScrollY)
            }
        }
    }
}