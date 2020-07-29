class OpposingPlayer {
    constructor(id, bikeX, bikeY, bikeWidth, bikeHeight, bikeRotation, bikeTrail, bikeHue, bikeWheelWidth, bikeWheelHeight, bikeSteeringAngle) {
        this.id = id
        this.x = bikeX
        this.y = bikeY
        this.width = bikeWidth
        this.height = bikeHeight
        this.rotation = bikeRotation
        this.trail = bikeTrail
        this.hue = bikeHue
        this.wheelWidth = bikeWheelWidth
        this.wheelHeight = bikeWheelHeight
        this.steeringAngle = bikeSteeringAngle
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
    }

    drawTail() {
        fill(this.hue, 100, 100, 50)

        for (let segment of this.trail) {
            stroke(this.hue, 100, 100)
            strokeWeight(5)
            //get the current position of the line and position relative to the center of the screen 
            line(width / 2 + segment.x - trailScrollX, height / 2 + segment.y - trailScrollY, width / 2 + segment.px - trailScrollX, height / 2 + segment.py - trailScrollY)
        }
    }
}