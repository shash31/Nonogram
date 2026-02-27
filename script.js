window.addEventListener('DOMContentLoaded', () => {
    const game = document.getElementById('game')
    const table = document.getElementById('nonogram')
    const diff = document.getElementById('difficulty-select')
    const tableBody = document.createElement('tbody')
    let displayGrid = null
    
    const timerDisplay = document.getElementById('timer')
    let timeinsec = 0;

    const resetbtn = document.getElementById('reset-game-button')
    const checkbtn = document.getElementById('check-game-button')
    const newgamebtn = document.getElementById('new-game-button')
    resetbtn.addEventListener('click', reset)
    checkbtn.addEventListener('click', validate)
    newgamebtn.addEventListener('click', newgame)

    const status = document.createElement('p')
    status.id = 'status'

    let grid = null;
    let colnos = null;
    let rownos = null;
    let size = 5;
    
    // For detecting dragging;
    let leftclicked = false;
    let rightclicked = false;
    tableBody.addEventListener('contextmenu', (e) => e.preventDefault())
    tableBody.addEventListener('pointerdown', pressed)
    tableBody.addEventListener('pointerup', unpressed)
    let gameOver = false;

    const confetti = new JSConfetti();

    generateGrid();

    let timerInterval = setInterval(timer, 1000)

    function timer() {
        timeinsec++;
        timerDisplay.innerText = formatTime(timeinsec)
    }

    function formatTime(sec) {
        const h = String(Math.floor(sec / 3600)).padStart(2, '0');
        const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    function generateGrid() {
        grid = Array.from({ length: size }, () => [])
        
        colnos = []
        rownos = []

        displayGrid = Array.from({ length: size }, () => [])

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                grid[i].push(false)
            }
        }

        // Populating grid
        const min = Math.floor((size**2)*(3/10)) // 30% of grid covered
        const max = Math.ceil((size**2)*(3/4)) // 75% of grid covered
        console.log('min', min)
        console.log('max', max)
        const n = Math.floor(Math.random() * ((max - min + 1))) + min;
        console.log(n)
        for (let i = 0; i < n; i++) {
            let x = Math.floor(Math.random() * ((size - 1) + 1))
            let y = Math.floor(Math.random() * ((size - 1) + 1))
            while (grid[x][y]) {
                x = Math.floor(Math.random() * ((size - 1) + 1))
                y = Math.floor(Math.random() * ((size - 1) + 1))            
            }
            grid[x][y] = true;
        }
        console.log(grid)

        // Generating colnos and rownos
        for (let i = 0; i < size; i++) {
            let rcount = []
            let rind = -1
            let rtrues = false

            let ccount = []
            let cind = -1
            let ctrues = false

            for (let j = 0; j < size; j++) {
                if (!rtrues) {
                    if (grid[i][j]) {
                        rtrues = true;
                        rind++;
                        rcount.push(1)
                    }
                } else {
                    if (grid[i][j]) {
                        rcount[rind]++;
                    } else {
                        rtrues = false;
                    }
                }

                if (!ctrues) {
                    if (grid[j][i]) {
                        ctrues = true;
                        cind++;
                        ccount.push(1)
                    }
                } else {
                    if (grid[j][i]) {
                        ccount[cind]++;
                    } else {
                        ctrues = false;
                    }
                }
            }

            if (rcount.length > 0) { rownos.push(rcount) } else { rownos.push([0]) }
            if (ccount.length > 0) { colnos.push(ccount) } else { colnos.push([0]) }
        }
        console.log(rownos)
        console.log(colnos)

        // Adding colnos
        const colheaders = document.createElement('thead')
        colheaders.appendChild(document.createElement('th'))
        for (const col of colnos) {
            const th = document.createElement('th')
            for (const nos of col) {
                th.innerText += String(nos)+'\n'
            }
            th.rowSpan = col.length
            colheaders.appendChild(th)
        }

        // Creating display
        for (let i = 0; i < size; i++) {
            const row = document.createElement('tr')
            
            const rowno = document.createElement('th');
            for (const nos of rownos[i]) {
                rowno.innerText += String(nos) + ' '
            }
            rowno.classList.add('rowno')
            row.appendChild(rowno)

            if (((i + 1) % 5) == 0) row.classList.add('rowfives')
            
            for (let j = 0; j < size; j++) {
                const cell = document.createElement('td')
                cell.dataset.x = i
                cell.dataset.y = j
                cell.addEventListener('pointerover', drag)
                if (((j + 1) % 5) == 0) cell.classList.add('colfives')
                displayGrid[i].push(cell)
                row.appendChild(cell)
            }
            
            tableBody.appendChild(row)
        }
        
        table.appendChild(colheaders)
        table.appendChild(tableBody)
        
    }

    function pressed(e) {
        if (!gameOver) {
            if (!e.target.classList.contains('rowno')) {
                if (e.button == 0) {
                    leftclicked = true;
                    click(e.target)
                } else if (e.button == 2) {
                    rightclicked = true;
                    rightclick(e.target)
                }
            }
        }
    }

    function unpressed() {
        leftclicked = false;
        rightclicked = false;
    }
    
    function click(cell) {
        if (cell.classList.contains('clicked')) {
            cell.classList.remove('clicked')
            cell.classList.add('crossed')
            cell.innerHTML = '&times;';
        } else {
            if (cell.classList.contains('crossed')) {
                cell.classList.remove('crossed');
                cell.innerText = '';
            } else {
                cell.classList.add('clicked')
                // check win
                validate()
            }
        }
    }

    function drag(e) {
        const cell = e.currentTarget
        if (leftclicked) {
            click(cell)
        } else if (rightclicked) {
            rightclick(cell)
        }
    }

    function rightclick(cell) {
        if (cell.classList.contains('crossed')) {
            cell.classList.remove('crossed')
            cell.innerText = '';
        } else {
            if (cell.classList.contains('clicked')) {
                cell.classList.remove('clicked')
            } else {
                cell.classList.add('crossed')
                cell.innerHTML = '&times;';
            }
        }
    }

    // function 

    function reset() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                displayGrid[i][j].classList.remove('clicked')
                displayGrid[i][j].classList.remove('crossed')
                displayGrid[i][j].innerText = ''
            }
        }

        gameOver = false;
        status.remove();
    }

    function setDiff() {
        if (diff.value == 'easy') {
            size = 5;
        } else if (diff.value == 'medium') {
            size = 10;
        } else if (diff.value == 'hard') {
            size = 15;
        }
    }

    function newgame() {
        grid = null;
        displayGrid = null;
        table.replaceChildren();
        tableBody.replaceChildren();
        gameOver = false;
        status.remove()
        setDiff();
        generateGrid();
        clearInterval(timerInterval)
        timeinsec = 0;
        timerDisplay.innerText = '00:00:00'
        timerInterval = setInterval(timer, 1000);
    }

    function incorrectbanner() {
        status.className = 'incorrect'
        status.innerText = 'Something is wrong with the solution'
        if (!status.isConnected) game.appendChild(status)
    }

    function validate(e=null) {
        // Check if solution is correct so far
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (displayGrid[i][j].classList.contains('clicked')) {
                    if (!grid[i][j]) {
                        if (e) incorrectbanner()
                        return false;
                    }
                } else {
                    if (grid[i][j]) {
                        if (!e) return false;
                        if (e && displayGrid[i][j].classList.contains('crossed')) incorrectbanner();
                    }
                }
            }
        }
        
        if (e) {
            status.className = 'correct'
            status.innerText = 'Solution is correct so far!'
        } else {
            clearInterval(timerInterval)
            status.className = 'win'
            status.innerText = `Congrats!! You solved it in ${timerDisplay.innerText}`
            confetti.addConfetti();
            gameOver = true;
        }
        
        if (!status.isConnected) game.appendChild(status)
    }
})

var JSConfetti=function(){"use strict";function t(t,i){if(!(t instanceof i))throw new TypeError("Cannot call a class as a function")}function i(t,i){for(var e=0;e<i.length;e++){var o=i[e];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}function e(t,e,o){return e&&i(t.prototype,e),o&&i(t,o),t}function o(t){return+t.replace(/px/,"")}function n(t,i){var e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,o=Math.random()*(i-t)+t;return Math.floor(o*Math.pow(10,e))/Math.pow(10,e)}function s(t){return t[n(0,t.length)]}var a=["#fcf403","#62fc03","#f4fc03","#03e7fc","#03fca5","#a503fc","#fc03ad","#fc03c2"];function r(t){return Math.log(t)/Math.log(1920)}var h=function(){function i(e){t(this,i);var o=e.initialPosition,a=e.direction,h=e.confettiRadius,c=e.confettiColors,d=e.emojis,l=e.emojiSize,u=e.canvasWidth,f=n(.9,1.7,3)*r(u);this.confettiSpeed={x:f,y:f},this.finalConfettiSpeedX=n(.2,.6,3),this.rotationSpeed=d.length?.01:n(.03,.07,3)*r(u),this.dragForceCoefficient=n(5e-4,9e-4,6),this.radius={x:h,y:h},this.initialRadius=h,this.rotationAngle="left"===a?n(0,.2,3):n(-.2,0,3),this.emojiSize=l,this.emojiRotationAngle=n(0,2*Math.PI),this.radiusYUpdateDirection="down";var p="left"===a?n(82,15)*Math.PI/180:n(-15,-82)*Math.PI/180;this.absCos=Math.abs(Math.cos(p)),this.absSin=Math.abs(Math.sin(p));var m=n(-150,0),v={x:o.x+("left"===a?-m:m)*this.absCos,y:o.y-m*this.absSin};this.currentPosition=Object.assign({},v),this.initialPosition=Object.assign({},v),this.color=d.length?null:s(c),this.emoji=d.length?s(d):null,this.createdAt=(new Date).getTime(),this.direction=a}return e(i,[{key:"draw",value:function(t){var i=this.currentPosition,e=this.radius,o=this.color,n=this.emoji,s=this.rotationAngle,a=this.emojiRotationAngle,r=this.emojiSize,h=window.devicePixelRatio;o?(t.fillStyle=o,t.beginPath(),t.ellipse(i.x*h,i.y*h,e.x*h,e.y*h,s,0,2*Math.PI),t.fill()):n&&(t.font="".concat(r,"px serif"),t.save(),t.translate(h*i.x,h*i.y),t.rotate(a),t.textAlign="center",t.fillText(n,0,0),t.restore())}},{key:"updatePosition",value:function(t,i){var e=this.confettiSpeed,o=this.dragForceCoefficient,n=this.finalConfettiSpeedX,s=this.radiusYUpdateDirection,a=this.rotationSpeed,r=this.createdAt,h=this.direction,c=i-r;e.x>n&&(this.confettiSpeed.x-=o*t),this.currentPosition.x+=e.x*("left"===h?-this.absCos:this.absCos)*t,this.currentPosition.y=this.initialPosition.y-e.y*this.absSin*c+.00125*Math.pow(c,2)/2,this.rotationSpeed-=this.emoji?1e-4:1e-5*t,this.rotationSpeed<0&&(this.rotationSpeed=0),this.emoji?this.emojiRotationAngle+=this.rotationSpeed*t%(2*Math.PI):"down"===s?(this.radius.y-=t*a,this.radius.y<=0&&(this.radius.y=0,this.radiusYUpdateDirection="up")):(this.radius.y+=t*a,this.radius.y>=this.initialRadius&&(this.radius.y=this.initialRadius,this.radiusYUpdateDirection="down"))}},{key:"getIsVisibleOnCanvas",value:function(t){return this.currentPosition.y<t+100}}]),i}();function c(){var t=document.createElement("canvas");return t.style.position="fixed",t.style.width="100%",t.style.height="100%",t.style.top="0",t.style.left="0",t.style.zIndex="1000",t.style.pointerEvents="none",document.body.appendChild(t),t}function d(t){var i=t.confettiRadius,e=void 0===i?6:i,o=t.confettiNumber,n=void 0===o?t.confettiesNumber||(t.emojis?40:250):o,s=t.confettiColors,r=void 0===s?a:s,h=t.emojis,c=void 0===h?t.emojies||[]:h,d=t.emojiSize,l=void 0===d?80:d;return t.emojies&&console.error("emojies argument is deprecated, please use emojis instead"),t.confettiesNumber&&console.error("confettiesNumber argument is deprecated, please use confettiNumber instead"),{confettiRadius:e,confettiNumber:n,confettiColors:r,emojis:c,emojiSize:l}}return function(){function i(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};t(this,i),this.canvas=e.canvas||c(),this.canvasContext=this.canvas.getContext("2d"),this.shapes=[],this.lastUpdated=(new Date).getTime(),this.iterationIndex=0,this.loop=this.loop.bind(this),requestAnimationFrame(this.loop)}return e(i,[{key:"loop",value:function(){var t,i,e,n,s,a=this;t=this.canvas,i=window.devicePixelRatio,e=getComputedStyle(t),n=o(e.getPropertyValue("width")),s=o(e.getPropertyValue("height")),t.setAttribute("width",(n*i).toString()),t.setAttribute("height",(s*i).toString());var r=(new Date).getTime(),h=r-this.lastUpdated,c=this.canvas.offsetHeight;this.shapes.forEach((function(t){t.updatePosition(h,r),t.draw(a.canvasContext)})),this.iterationIndex%100==0&&(this.shapes=this.shapes.filter((function(t){return t.getIsVisibleOnCanvas(c)}))),this.lastUpdated=r,this.iterationIndex++,requestAnimationFrame(this.loop)}},{key:"addConfetti",value:function(){for(var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},i=d(t),e=i.confettiRadius,o=i.confettiNumber,n=i.confettiColors,s=i.emojis,a=i.emojiSize,r=window.devicePixelRatio,c=this.canvas.width/r,l=this.canvas.height/r,u=5*l/7,f={x:0,y:u},p={x:c,y:u},m=0;m<o/2;m++)this.shapes.push(new h({initialPosition:f,direction:"right",confettiRadius:e,confettiColors:n,confettiNumber:o,emojis:s,emojiSize:a,canvasWidth:c})),this.shapes.push(new h({initialPosition:p,direction:"left",confettiRadius:e,confettiColors:n,confettiNumber:o,emojis:s,emojiSize:a,canvasWidth:c}))}}]),i}()}();