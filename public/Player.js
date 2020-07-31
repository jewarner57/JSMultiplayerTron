// Name any p5.js functions we use in `global` so Glitch can recognize them.
/* global
 *    rect, translate, width, height, fill, rotate, cos, sin, ellipse, noStroke, stroke, strokeWeight
 *    keyIsDown, LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, resetMatrix, line, trailScrollX, trailScrollY
 *    collideLineCircle, collideCircleCircle, collideRectCircle, startTime, obstacles, score, timeSurvived, 
 *    collectibles, gameOver, addNotification, opposingPlayers, random, respawnLocation
 */

class Player {
    constructor(id, playerRotation, playerHue) {
        this.id = id
        this.hue = playerHue
        this.rotation = playerRotation
        this.width = 15
        this.height = 45
        this.wheelWidth = 10
        this.wheelHeight = 25
        this.x = width / 2
        this.y = height / 2
        this.xSpeed = 0
        this.ySpeed = 0
        this.speed = 5
        this.maxSpeed = 15
        this.steeringAngle = 0;
        this.trailX = trailScrollX;
        this.trailY = trailScrollY;
        this.previousTrailX = trailScrollX;
        this.previousTrailY = trailScrollY;
        this.trail = []
        this.trailLength = 300
        this.isAlive = true
        this.isRespawning = false
        this.lives = 3
        this.isInvulnerable = false;
    }

    show() {

        noStroke()
        fill(this.hue, 100, 100)

        translate(width / 2, height / 2)

        rotate(this.rotation - 90)

        rect(-this.width / 2, -this.height / 2, this.width, this.height)

        fill(50)

        rect(-this.wheelWidth / 2, this.wheelHeight / 2, this.wheelWidth, this.wheelHeight)

        translate(0, -this.height / 2)
        rotate(this.steeringAngle)
        rect(-this.wheelWidth / 2, -this.wheelHeight / 2, this.wheelWidth, this.wheelHeight)

        resetMatrix()
    }

    //draw the light trail from the bike.
    drawTail() {

        fill(this.hue, 100, 100, 50)

        for (let segment of this.trail) {
            stroke(this.hue, 100, 100)
            strokeWeight(8)
            //get the current position of the line and position relative to the center of the screen 
            line(width / 2 + segment.x - trailScrollX, height / 2 + segment.y - trailScrollY, width / 2 + segment.px - trailScrollX, height / 2 + segment.py - trailScrollY)
        }
    }

    checkLineCollisions() {

        for (let segment of this.trail) {

            //get the hit circle position using the current rotation
            let hitCircleX = width / 2 - 25 * (cos(this.rotation))
            let hitCircleY = height / 2 - 25 * (sin(this.rotation))
            let hitCircleSize = 15

            let lineSegmentX1 = width / 2 + segment.x - trailScrollX
            let lineSegmentY1 = height / 2 + segment.y - trailScrollY

            let lineSegmentX2 = width / 2 + segment.px - trailScrollX
            let lineSegmentY2 = height / 2 + segment.py - trailScrollY

            let hit = collideLineCircle(lineSegmentX1, lineSegmentY1, lineSegmentX2, lineSegmentY2, hitCircleX, hitCircleY, hitCircleSize)

            //draw the hit circle 
            //fill(0, 100, 100)
            //ellipse(hitCircleX, hitCircleY, hitCircleSize)

            //on a collision
            if (hit) {
                this.speed = 0
                this.isAlive = false;
            }

        }

    }

    checkEnemyCollisions() {
        for (let enemy of opposingPlayers) {
            for (let segment of enemy.trail) {
                //get the hit circle position using the current rotation
                let hitCircleX = width / 2 - 25 * (cos(this.rotation))
                let hitCircleY = height / 2 - 25 * (sin(this.rotation))
                let hitCircleSize = 15

                let lineSegmentX1 = width / 2 + segment.x - trailScrollX
                let lineSegmentY1 = height / 2 + segment.y - trailScrollY

                let lineSegmentX2 = width / 2 + segment.px - trailScrollX
                let lineSegmentY2 = height / 2 + segment.py - trailScrollY

                let hit = collideLineCircle(lineSegmentX1, lineSegmentY1, lineSegmentX2, lineSegmentY2, hitCircleX, hitCircleY, hitCircleSize)

                //draw the hit circle 
                //fill(0, 100, 100)
                //ellipse(hitCircleX, hitCircleY, hitCircleSize)

                //on a collision
                if (hit) {
                    this.speed = 0
                    this.isAlive = false;
                }
            }
        }
    }

    checkCollectibleCollisions() {
        for (let collectible of collectibles) {

            //get the hit circle position using the current rotation
            let hitCircleX = width / 2 - 25 * (cos(this.rotation))
            let hitCircleY = height / 2 - 25 * (sin(this.rotation))
            let hitCircleSize = 15

            let hit = false;

            hit = collideCircleCircle(collectible.x + scrollX, collectible.y + scrollY, collectible.maxSize, hitCircleX, hitCircleY, hitCircleSize)

            //draw the hit circle 
            //fill(0, 100, 100)
            //ellipse(hitCircleX, hitCircleY, hitCircleSize)

            //on a collision
            if (hit) {
                collectible.action()
                collectible.respawn()
            }
        }
    }

    checkObstacleCollisions() {
        for (let obstacle of obstacles) {

            //get the hit circle position using the current rotation
            let hitCircleX = width / 2 - 25 * (cos(this.rotation))
            let hitCircleY = height / 2 - 25 * (sin(this.rotation))
            let hitCircleSize = 15

            let hit = false;

            if (obstacle.shape === "rect") {
                hit = collideRectCircle(obstacle.x + scrollX, obstacle.y + scrollY, obstacle.width, obstacle.height, hitCircleX, hitCircleY, hitCircleSize)
            }
            else if (obstacle.shape === "ellipse") {
                hit = collideCircleCircle(obstacle.x + scrollX, obstacle.y + scrollY, obstacle.width, hitCircleX, hitCircleY, hitCircleSize)
            }

            //draw the hit circle 
            //fill(0, 100, 100)
            //ellipse(hitCircleX, hitCircleY, hitCircleSize)

            //on a collision
            if (hit) {
                this.speed /= 3
                if (this.speed < 3) {
                    this.speed = 3
                }

                let random = Math.random()

                if (random > 0.50) {
                    this.rotation += 150
                }
                else {
                    this.rotation -= 210
                }
            }
        }
    }

    move() {
        this.getAngularSpeed();

        scrollX += this.xSpeed;
        scrollY += this.ySpeed;

        //for the light trail to work it needs seperate scroll counters that
        //move in the opposite directions
        trailScrollX -= this.xSpeed;
        trailScrollY -= this.ySpeed;

        //set bike position
        this.x = -scrollX + width / 2
        this.y = -scrollY + height / 2

        //set trail positions
        this.previousTrailX = this.trailX
        this.previousTrailY = this.trailY

        this.trailX = trailScrollX
        this.trailY = trailScrollY

        if (this.isInvulnerable === false) {
            if (this.trail.length > this.trailLength) {
                this.trail.shift()
            }

            this.trail.push({ x: this.trailX, y: this.trailY, px: this.previousTrailX, py: this.previousTrailY })
        }
    }

    //get the x and y speed based on the angle of the bike
    getAngularSpeed() {
        this.xSpeed = this.speed * cos(this.rotation);
        this.ySpeed = this.speed * sin(this.rotation);
    }

    getKeyInput() {

        if (keyIsDown(UP_ARROW) && this.speed < this.maxSpeed) {
            this.speed += 0.1;
        }
        if (keyIsDown(DOWN_ARROW) && this.speed > 5) {
            this.speed -= 0.1;
        }

        if (keyIsDown(LEFT_ARROW)) {
            this.rotation -= 4 * (this.speed / this.maxSpeed)

            if (this.steeringAngle > -25) {
                this.steeringAngle -= 2
            }
        }
        else if (keyIsDown(RIGHT_ARROW)) {
            this.rotation += 3 * (this.speed / this.maxSpeed)

            if (this.steeringAngle < 25) {
                this.steeringAngle += 2
            }
        }
        else {
            if (this.steeringAngle < 0) {
                this.steeringAngle += 2
            }
            else if (this.steeringAngle > 0) {
                this.steeringAngle -= 2
            }
        }
    }

    respawn() {

        this.lives -= 1
        if (this.lives > -1) {

            this.isInvulnerable = true

            let spawnPosition = respawnLocation

            scrollX = spawnPosition.x;
            scrollY = spawnPosition.y;

            this.x = width / 2
            this.y = width / 2

            trailScrollX = spawnPosition.x;
            trailScrollY = spawnPosition.y;

            this.rotation = random(360)

            this.trailX = trailScrollX;
            this.trailY = trailScrollY;
            this.previousTrailX = trailScrollX;
            this.previousTrailY = trailScrollY;

            this.trail = []

            this.speed = 5

            score += timeSurvived

            startTime = Date.now()

            this.isAlive = true;
            this.isRespawning = false;
        }
        else {
            gameOver = true
        }
    }
}