// Name any p5.js functions we use in `global` so Glitch can recognize them.
/* global
 *    HSB, background, color, colorMode, createCanvas, ellipse, height, map, angleMode, DEGREES,
 *    mouseX, mouseY, noStroke, random, rect, round, sqrt, text, width, line, Player, fill, stroke,
 *    Obstacle, Collectible, textSize, strokeWeight, socket, io, OpposingPlayer, frameCount, frameRate
 */

//Trello link
//https://trello.com/b/kgHSA4on/cssi-final-project

let backgroundColor, scrollX, scrollY, trailScrollX, trailScrollY, player, timeSurvived, score, waitingNotifications;
let mapWidthMin, mapWidthMax, mapHeightMin, mapHeightMax, wallThickness, startTime, currentTime, respawnLocation
let gameOver = false
let obstacles = []
let collectibles = []
let notifications = []
let opposingPlayers = []

/*let spawnLocations = [
  //bottom right
  {x: 300, y: 500, rotation: 0}, 
  //bottom left
  {x: 2800, y: 500, rotation: 180},
  //top right
  {x: 300, y: 2800, rotation: 0},
  //top left
  {x: 2800, y: 2800, rotation: 180},
]*/

function setup() {
    // Canvas & color settings
    createCanvas(1080, 720)
    colorMode(HSB, 360, 100, 100)
    backgroundColor = 0
    frameRate(60)
    angleMode(DEGREES)

    //socket connection and methods
    socket = io.connect('https://multiplayer-tron-clone.glitch.me/')

    socket.on('recieveID', setPlayerID)
    socket.on('sendBikeData', updateEnemyBike)
    socket.on('playerDisconnected', removeDisconnectedPlayers)

    startTime = Date.now()
    timeSurvived = 0;

    //score is timesurvived over all lives plus any exra points earned during their 3 lives
    score = 0;
    waitingNotifications = 0

    //add custom obstacles here. 
    //obstacle properties: Obstacle(x, y, width, height, shape, color)
    // shape should be either: "ellipse" or "rect"
    obstacles.push(new Obstacle(-770, -70, 100, 100, "rect", color(200, 100, 100)))
    obstacles.push(new Obstacle(-150, -150, 200, 200, "ellipse", color(150, 100, 100)))
    obstacles.push(new Obstacle(-110, -110, 40, 40, "ellipse", color(165, 0, 191)))
    obstacles.push(new Obstacle(-2230, -330, 50, 50, "rect", color(17, 24, 212)))
    obstacles.push(new Obstacle(-1123, -2213, 41, 73, "rect", color(212, 247, 156)))



    //Map Boundaries

    wallThickness = 400

    mapWidthMin = -3000;
    mapWidthMax = 1000;
    mapHeightMin = 500;
    mapHeightMax = -3000;


    //bottom
    obstacles.push(new Obstacle(mapWidthMin - wallThickness, mapHeightMin, Math.abs(mapWidthMin) + mapWidthMax + wallThickness * 2, wallThickness, "rect", color(188, 70, 100)))
    //right
    obstacles.push(new Obstacle(mapWidthMax, mapHeightMax, wallThickness, Math.abs(mapHeightMax) + mapHeightMin, "rect", color(188, 70, 100)))
    //top
    obstacles.push(new Obstacle(mapWidthMin - wallThickness, mapHeightMax - wallThickness, Math.abs(mapWidthMin) + mapWidthMax + wallThickness * 2, wallThickness, "rect", color(188, 70, 100)))
    //right
    obstacles.push(new Obstacle(mapWidthMin - wallThickness, mapHeightMax, wallThickness, Math.abs(mapHeightMax) + mapHeightMin, "rect", color(188, 70, 100)))


    //spawnLocation is static for now.
    respawnLocation = { x: mapWidthMax, y: -mapHeightMax / 2 }

    trailScrollX = respawnLocation.x
    trailScrollY = respawnLocation.y

    scrollX = respawnLocation.x
    scrollY = respawnLocation.y

    player = new Player("", random(360), random(360))

    //add custom collectibles here
    //collectible properties: Collectible(x, y, size, hue, action)
    //action should be a function
    collectibles.push(new Collectible(0, 0, 50, 50, "+25", (function () {
        score += 25
        addNotification("Score +25")
    })))

    collectibles.push(new Collectible(0, 0, 100, 10, "+10", (function () {
        score += 10
        addNotification("Score +10")
    })))
}

function setPlayerID(data) {
    player.id = data
}

function removeDisconnectedPlayers(data) {
    let disconnectedPlayerID = data


    for (let i = 0; i < opposingPlayers.length; i++) {

        if (opposingPlayers[i].id === disconnectedPlayerID) {
            opposingPlayers.splice(i - 1, 1)
        }
    }

}

function updateEnemyBike(data) {

    for (let i = 0; i < opposingPlayers.length; i++) {
        if (data.id === opposingPlayers[i].id) {
            opposingPlayers[i].x = data.x
            opposingPlayers[i].y = data.y
            opposingPlayers[i].rotation = data.rotation
            opposingPlayers[i].trailX = data.trailX
            opposingPlayers[i].trailY = data.trailY
            opposingPlayers[i].isInvulnerable = data.isInvulnerable

            return;
        }
    }

    let playerData = new OpposingPlayer(
        data.id,
        data.x,
        data.y,
        data.width,
        data.height,
        data.rotation,
        data.hue,
        data.wheelWidth,
        data.wheelHeight,
        data.steeringAngle,
        data.isInvulnerable,
        data.trailX,
        data.trailY,
        data.trailLength
    )

    console.log("New Player Joined")
    opposingPlayers.push(playerData)
}

function draw() {

    background(backgroundColor);

    drawFloor()

    //debugging text: scrollX, scrollY
    //fill(100, 0, 100)
    //noStroke()
    //text(`ScrollX ${Math.floor(scrollX)}`, width - 100, 100)
    //text(`ScrollY ${Math.floor(scrollY)}`, width - 100, 150)

    drawInfoText()

    drawCollectibles()

    drawObstacles()

    if (!gameOver) {
        drawPlayers()
    }
    else {
        socket.disconnect()
    }

    if (player.id != "") {
        socket.emit('getBikeData', player)
    }

    drawEnemyPlayers()

    drawCollectibleNotifications()

    drawMinimap()
}

function drawMinimap() {
    let minimapSize = 200
    let mapPosition = {
        x: 20,
        y: height - 220
    }

    stroke(181, 70, 50)
    strokeWeight(5)
    fill(0, 0, 0)
    rect(mapPosition.x, mapPosition.y, 200, 200)


    for (let collectible of collectibles) {
        let collectibleMiniX = map(-collectible.x, -mapWidthMin, -mapWidthMax, mapPosition.x, mapPosition.x + minimapSize + 5)
        let collectibleMiniY = map(-collectible.y, -mapHeightMax, -mapHeightMin, mapPosition.y, mapPosition.y + minimapSize + 5)
        strokeWeight(10)
        stroke(collectible.hue, 100, 100)
        line(collectibleMiniX, collectibleMiniY, collectibleMiniX, collectibleMiniY)
    }

    for (let enemy of opposingPlayers) {
        let enemyMiniX = map(-enemy.x, -mapWidthMin, -mapWidthMax, mapPosition.x, mapPosition.x + minimapSize + 5)
        let enemyMiniY = map(-enemy.y, -mapHeightMax, -mapHeightMin, mapPosition.y, mapPosition.y + minimapSize + 5)
        strokeWeight(10)
        stroke(enemy.hue, 100, 100)
        fill(enemy.hue, 100, 100)
        line(enemyMiniX, enemyMiniY, enemyMiniX, enemyMiniY)
    }


    let playerMiniX = map(-player.x, -mapWidthMin, -mapWidthMax, mapPosition.x, mapPosition.x + minimapSize + 5)
    let playerMiniY = map(-player.y, -mapHeightMax, -mapHeightMin, mapPosition.y, mapPosition.y + minimapSize + 5)
    strokeWeight(10)
    stroke(player.hue, 100, 100)
    fill(player.hue, 100, 100)
    line(playerMiniX, playerMiniY, playerMiniX, playerMiniY)

}

function drawCollectibleNotifications() {
    if (notifications.length > 0) {
        textSize(30)

        fill(0, 0, 100)

        text(notifications[0], width / 2 - notifications[0].length * (textSize() / 3), 200)
        textSize(12)
    }
}

function addNotification(text) {
    notifications.push(text)

    setTimeout(function () {

        notifications.shift()

    }, 1500);
}

function drawInfoText() {
    fill(0, 0, 100)
    noStroke()
    textSize(12)

    //get time alive text
    if (player.isAlive) {
        currentTime = Date.now()
    }
    timeSurvived = Math.floor((currentTime - startTime) / 1000)
    text(`Current Lifetime: ${timeSurvived}`, 20, 20)

    //get the score text
    //displays the the current timeSurvived + score
    //when current time is reset it is added to score
    let displayScore = timeSurvived + score

    text(`Score: ${displayScore}`, 20, 35)

    //get the current lives text
    let lives = player.lives > 0 ? player.lives : 0

    text(`Lives: ${lives}`, 20, 50)
}

function drawFloor() {
    stroke(188, 70, 100)
    strokeWeight(5)

    let floorLineX = scrollX % width
    let floorLineY = scrollY % height

    line(0, floorLineY, width, floorLineY)
    line(floorLineX, 0, floorLineX, height)

}

function drawCollectibles() {
    for (let collectible of collectibles) {
        collectible.show()
    }
}

function drawObstacles() {
    for (let obstacle of obstacles) {
        obstacle.show()
    }
}

function drawPlayers() {

    player.drawTail()

    if (player.isInvulnerable && frameCount % 2 === 0) {
        player.show()
    }
    else if (!player.isInvulnerable) {
        player.show()
    }

    if (player.isAlive) {

        if (!player.isInvulnerable) {
            player.checkLineCollisions()
            player.checkCollectibleCollisions()
            player.checkEnemyCollisions()
        }
        player.checkObstacleCollisions()
        player.move()
        player.getKeyInput()

    }
    else {
        if (player.isRespawning === false) {

            player.isRespawning = true
            if (player.lives > 0) {
                addNotification("Respawning...")
            }

            setTimeout(function () {
                player.respawn()

                setTimeout(function () {
                    player.isInvulnerable = false
                }, 2000);

            }, 100);
        }
    }
}

function drawEnemyPlayers() {
    for (let enemy of opposingPlayers) {
        fill(enemy.hue, 100, 100)
        enemy.drawTail()
        enemy.show()
    }
}