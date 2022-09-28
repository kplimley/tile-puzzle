//@ts-check
'use strict'

/*
  Things to work on next:
  1. Merge javascript into a single file, using a simple if statement if necessary to check for puzzle size (mostly done, but might have bugs)
  2. Add move counter, to record how many moves you make (done)
  3. Add check for initial condition (tiles are all on original squares) (done)
  4. Implement difficult setting that checks the number of correct tiles
*/

const puzzleTable = document.getElementById('puzzle');
// const elScrambleLevel = document.getElementById('scramble-level'); => moved to scramble function
const elMsg = document.getElementById('msg');
const moveCounter = document.querySelector('#moves');
const numCorrectOutput = document.querySelector('#num-correct');
const playButton = document.getElementById('play-btn');
const playAgainButton = document.getElementById('play-again');
// const radioButtons = document.querySelectorAll('input[name="difficulty"]'); => moved to scrambleLevel function
const elTimeElapsed = document.getElementById('time-elapsed');
const showTimeButton = document.querySelector('#time-btn');

// only scramble puzzle when button is pressed
playButton?.addEventListener('click', () => {
  let scrambleLevelString = window.prompt(`What level of scrambling do you want? (enter a number between ${minScrambleLevel} and 9)`, `${minScrambleLevel}`);
  if (!scrambleLevelString) {
    console.log('user canceled');
  } else {
    scrambleLevel = parseInt(scrambleLevelString);
    console.log(`scrambleLevelString converted to integer: ${scrambleLevel}`);
    if (scrambleLevel < minScrambleLevel) {
      scrambleLevel = minScrambleLevel;
    }
    initialize(scrambleLevel);
  }
}, false);

if (showTimeButton) {
  showTimeButton.addEventListener('click', () => {
    let timeWidget = document.getElementById('time-widget');
    if (timeWidget) {
      if (timeWidget.className === 'hidden') {
        timeWidget.className = '';
      } else {
        timeWidget.className = 'hidden';
      }
    }
    }, false); // end event listener
}

// Store the images in an object (as an associative array): redTile: “red.jpg”
const tile = {
  t1: "t1",
  t2: "t2",
  t3: "t3",
  t4: "t4",
  t5: "t5",
  t6: "t6",
  t7: "t7",
  t8: "t8",
  t9: "t9",
  t10: "t10",
  t11: "t11",
  t12: "t12",
  t13: "t13",
  t14: "t14",
  t15: "t15",
  blank: "blank"
}


// The 4x4 game board: the 16 squares in which tiles can move
let square = {
  s1: {
    name: 's1',
    currentTile: tile.t1, // references the object representing the tile currently in this space
    element: document.getElementById('s1'),  // the html element corresponding to this square
    updateImage() { if (this.element) { this.element.className = this.currentTile; } }
  },
  s2: {
    name: 's2',
    currentTile: tile.t2, 
    element: document.getElementById('s2'),
    updateImage() { if (this.element) { this.element.className = this.currentTile; } }
  },
  s3: {
    name: 's3',
    currentTile: tile.t3, 
    element: document.getElementById('s3'),
    updateImage() { if (this.element) { this.element.className = this.currentTile; } }
  },
  s4: {
    name: 's4',
    currentTile: tile.t4, 
    element: document.getElementById('s4'),
    updateImage() { if (this.element) { this.element.className = this.currentTile; } }
  },
  s5: {
    name: 's5',
    currentTile: tile.t5, 
    element: document.getElementById('s5'),
    updateImage() { if (this.element) { this.element.className = this.currentTile; } }
  },
  s6: {
    name: 's6',
    currentTile: tile.t6, 
    element: document.getElementById('s6'),
    updateImage() { if (this.element) { this.element.className = this.currentTile; } }
  },
  s7: {
    name: 's7',
    currentTile: tile.t7, 
    element: document.getElementById('s7'),
    updateImage() { if (this.element) { this.element.className = this.currentTile; } }
  },
  s8: {
    name: 's8',
    currentTile: tile.t8, 
    element: document.getElementById('s8'),
    updateImage() { if (this.element) { this.element.className = this.currentTile; } }
  },
  s9: {
    name: 's9',
    currentTile: tile.blank, 
    element: document.getElementById('s9'),
    updateImage() { if (this.element) { this.element.className = this.currentTile; } }
  }
  // s10: {
  //   name: 's10',
  //   currentTile: tile.t10, 
  //   element: document.getElementById('s10'),
  //   updateImage() {this.element.className = this.currentTile;}
  // },
  // s11: {
  //   name: 's11',
  //   currentTile: tile.t11, 
  //   element: document.getElementById('s11'),
  //   updateImage() {this.element.className = this.currentTile;}
  // },
  // s12: {
  //   name: 's12',
  //   currentTile: tile.t12, 
  //   element: document.getElementById('s12'),
  //   updateImage() {this.element.className = this.currentTile;}
  // },
  // s13: {
  //   name: 's13',
  //   currentTile: tile.t13, 
  //   element: document.getElementById('s13'),
  //   updateImage() {this.element.className = this.currentTile;}
  // },
  // s14: {
  //   name: 's14',
  //   currentTile: tile.t14, 
  //   element: document.getElementById('s14'),
  //   updateImage() {this.element.className = this.currentTile;}
  // },
  // s15: {
  //   name: 's15',
  //   currentTile: tile.t15, 
  //   element: document.getElementById('s15'),
  //   updateImage() {this.element.className = this.currentTile;}
  // },
  // s16: {
  //   name: 's16',
  //   currentTile: tile.blank, 
  //   element: document.getElementById('s16'),
  //   updateImage() {this.element.className = this.currentTile;}
  // }
}

let emptySquare = {}; // initialize to empty object; will depend on puzzleSize
let lastSquare;
let movable = []; // array
let puzzleSize, numCorrect; // integers
let minScrambleLevel = 1;   // integer
let scrambleLevel = 1;      // integer
let moveCount = 0;          // integer
let startTime, endTime; // floating point (times in milliseconds)
let difficulty;         // string

// Sept 2022 comment: I'm not sure I like having the puzzle size in something called puzzleClass. It's misleading, for one thing.
if (puzzleTable) {
  let puzzleClass = puzzleTable.className;
  if (puzzleClass === 'size-three') {
    puzzleSize = 3;
    emptySquare = square.s9;
  } else if (puzzleClass === 'size-four') {
    puzzleSize = 4;
    square.s9.currentTile = tile.t9 // will not be blank
    // alert(`tile on square.s9 is ${square.s9.currentTile}`);
    // Add properties to square object
    square.s10 = {
      name: 's10',
      currentTile: tile.t10, 
      element: document.getElementById('s10'),
      updateImage() { if (this.element) { this.element.className = this.currentTile; } }
    }
    square.s11 = {
      name: 's11',
      currentTile: tile.t11, 
      element: document.getElementById('s11'),
      updateImage() { if (this.element) { this.element.className = this.currentTile; } }
    },
    square.s12 = {
      name: 's12',
      currentTile: tile.t12, 
      element: document.getElementById('s12'),
      updateImage() { if (this.element) { this.element.className = this.currentTile; } }
    },
    square.s13 = {
      name: 's13',
      currentTile: tile.t13, 
      element: document.getElementById('s13'),
      updateImage() { if (this.element) { this.element.className = this.currentTile; } }
    },
    square.s14 = {
      name: 's14',
      currentTile: tile.t14, 
      element: document.getElementById('s14'),
      updateImage() { if (this.element) { this.element.className = this.currentTile; } }
    },
    square.s15 = {
      name: 's15',
      currentTile: tile.t15, 
      element: document.getElementById('s15'),
      updateImage() { if (this.element) { this.element.className = this.currentTile; } }
    },
    square.s16 = {
      name: 's16',
      currentTile: tile.blank,
      element: document.getElementById('s16'),
      updateImage() { if (this.element) { this.element.className = this.currentTile; } }
    }
    emptySquare = square.s16;
  } else {
    console.error('Unable to get the puzzle table class');
  }
}

// The following two lines I moved here from the isComplete() function.
let totalTiles = Object.keys(square);
totalTiles.pop(); // throw away last tile, which should be blank
console.log(`totalTiles: ${totalTiles}`);

function checkMovable() {
  // console.log(`checkMovable() has been called \n puzzleSize is ${puzzleSize} \n emptySquare is ${emptySquare.name}`);
  if (puzzleSize === 3) {
    switch (emptySquare) {  // This switch statement works for 3x3 grid
      case square.s1: {movable = [square.s2, square.s4]; break;}
      case square.s2: {movable = [square.s1, square.s3, square.s5]; break;}
      case square.s3: {movable = [square.s2, square.s6]; break;}
      case square.s4: {movable = [square.s1, square.s5, square.s7]; break;}
      case square.s5: {movable = [square.s2, square.s4, square.s6, square.s8]; break;}
      case square.s6: {movable = [square.s3, square.s5, square.s9]; break;}
      case square.s7: {movable = [square.s4, square.s8]; break;}
      case square.s8: {movable = [square.s5, square.s7, square.s9]; break;}
      case square.s9: {movable = [square.s6, square.s8]; break;}
    }
  } else if (puzzleSize === 4) {
    switch (emptySquare) {  
      // Top row
      case square.s1: {movable = [square.s2, square.s5]; break;}
      case square.s2: {movable = [square.s1, square.s3, square.s6]; break;}
      case square.s3: {movable = [square.s2, square.s4, square.s7]; break;}
      case square.s4: {movable = [square.s3, square.s8]; break;}
      // Second row
      case square.s5: {movable = [square.s1, square.s6, square.s9]; break;}
      case square.s6: {movable = [square.s2, square.s5, square.s7, square.s10]; break;}
      case square.s7: {movable = [square.s3, square.s6, square.s8, square.s11]; break;}
      case square.s8: {movable = [square.s4, square.s7, square.s12]; break;}
      // Third row
      case square.s9: {movable = [square.s5, square.s10, square.s13]; break;}
      case square.s10: {movable = [square.s6, square.s9, square.s11, square.s14]; break;}
      case square.s11: {movable = [square.s7, square.s10, square.s12, square.s15]; break;}
      case square.s12: {movable = [square.s8, square.s11, square.s16]; break;}
      // Bottom row
      case square.s13: {movable = [square.s9, square.s14]; break;}
      case square.s14: {movable = [square.s10, square.s13, square.s15]; break;}
      case square.s15: {movable = [square.s11, square.s14, square.s16]; break;}
      case square.s16: {movable = [square.s12, square.s15]; break;}
    }
  } else {
    console.error(`Puzzle size should be 3 or 4; instead got ${puzzleSize}`);
  }
} // end checkMovable() function

function isComplete() { // checks if puzzle is complete, and calls separate function to count correct tiles
  console.log('isComplete function called');
  // numCorrect = 0; => moved to inside countCorrectTiles() function
  let success = false;

  numCorrect = countCorrectTiles(); // call separate function, assign integer answer to numCorrect
  console.log(`numCorrect: ${numCorrect}`);

  if ( numCorrect === totalTiles.length ) {
    success = true;
  } else if (numCorrect > totalTiles.length ) {
    throw 'Error: numCorrect exeeds the number of tiles!';
  }
  console.log(`success = ${success}`);
  return success; // return either false or true;
} // end of isComplete() function

function countCorrectTiles() {
  // console.log('countCorrectTiles() function called');
  numCorrect = 0;
  for (let i = 1; i <= totalTiles.length; i++) {
    // console.log(`The number we want is ${i}!`);

    // get the current tile of this square (the actual object, not name or number)
    let thisSquare = 's' + i;
    let thisTile = square[thisSquare].currentTile;

    // What is the number of the correct tile for this square?
    let correctTile = 't' + i;
    // console.log(`The correct tile would be ${correctTile}`);
    if ( thisTile === correctTile ) {
      // console.log('This tile is in the correct place!');
      numCorrect++;
      continue;
    } // end check
  } // end loop
  return numCorrect;
}

function puzzleEvent(e) {
  // console.log('puzzleEvent(e) has been called');
  let target = e.target;
  console.log(`click target is ${target.className}`);
  checkMovable();
  
  // Check all movable tiles (elements in movable array)
  for (let i = 0; i < movable.length; i++) {
    if (target.className == movable[i].currentTile) {
      
      // Save the tile of the clicked square to a temporary variable
      let tileToMove = tile[target.className];   // tileToMove is a property of tile object

      emptySquare.currentTile = tileToMove; 
      
      // Update image of the previously empty square ("move" the tile to the empty square)
      emptySquare.updateImage();
      
      // The clicked square will be the empty one next
      emptySquare = movable[i];        
      // alert(`${emptySquare.name} will be the next empty square!`); 

      // This clicked square's property (e.g., square.s8) has already been set to emptySquare, so update emptySquare's tile
      emptySquare.currentTile = tile.blank;
      emptySquare.updateImage();

      // Update move counter
      moveCount++;
      if (moveCounter) {
        let moveStr = moveCount.toString();
        moveCounter.textContent = moveStr;
        // moveCounter.firstChild.nodeValue = moveCount;
      }
      endTime = (Date.now() - startTime) / 1000;
      if (elTimeElapsed) {
        elTimeElapsed.innerText = endTime.toString();
      }
      if ( isComplete() && moveCount > 0 && puzzleTable) {
        puzzleTable.removeEventListener('click', puzzleEvent);
        if (puzzleSize === 3) {
          lastSquare = square.s9.element;
          if (lastSquare === null) {
            throw new Error('lastSquare in 3x3 puzzles is null');
          }
          lastSquare.className = 't9';
        } else if (puzzleSize === 4) {
          lastSquare = square.s16.element;
          lastSquare.className = 't16';
        }
        lastSquare.animate({
          opacity: [ 0.2, 1 ] // [ from, to ]
        }, 2000);
        if (playButton) {
          playButton.textContent = 'Play again!';
        }
        console.log('Game End (Win)');
        showWinningText(moveCount);
      }
      if (numCorrectOutput) {
        numCorrectOutput.textContent = numCorrect;
      }
    } 
  }

} // End puzzleEvent function

// random number function from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

function scramble(scrambleLevel) {
  console.log(`scramble function called with scrambleLevel of ${scrambleLevel}`);
  const elScrambleLevel = document.getElementById('scramble-level');
  if (elScrambleLevel) {
    elScrambleLevel.textContent = scrambleLevel;
  }
  let maxCorrectTiles;
  if (difficulty === 'easy') {
    maxCorrectTiles = 12; // higher ceiling on easy
  } else {
    maxCorrectTiles = 9; // lower ceiling on hard
  }
  console.log(`maxCorrectTiles: ${maxCorrectTiles}`);
  do {
    for (let j = 1; j <= (scrambleLevel * 10); j++) {
      checkMovable();
      let r = getRandomIntInclusive(0,movable.length-1);
      console.log(`Move ${j}: tile to randomly move is ${movable[r].name}`);
      let tileToMove = movable[r].currentTile;   // tileToMove is a property of tile object
      emptySquare.currentTile = tileToMove; 
      emptySquare.updateImage();
      emptySquare = movable[r];
      emptySquare.currentTile = tile.blank;
      emptySquare.updateImage();
    }
  } while (countCorrectTiles() > maxCorrectTiles); // repeat if too many tiles are in the correct place
  if (numCorrectOutput) {
    numCorrectOutput.textContent = numCorrect;
  }
  console.log(`End of scramble function`);
} // end scramble function

function showWinningText(moveCount) {
  if (elMsg) {
    if (moveCount < 9) {
      elMsg.innerHTML = 'That wasn\'t very challenging, was it!<br><br>How about playing again?';
      minScrambleLevel += 2;
    } else if (moveCount < 13) {
      elMsg.innerHTML = 'Pretty good!<br><br>Let&#39;s up the difficulty slightly.';
      minScrambleLevel += 1;
    } else {
      elMsg.innerHTML = `You did it! <br> It only took you ${moveCount} moves!`;
    }
  }
  
}

function initialize(scrambleLevel) {
  console.log(`initialize function called with scrambleLevel of ${scrambleLevel}`);
  if (puzzleSize === 3) {
    lastSquare = square.s9.element;
  } else if (puzzleSize === 4) {
    lastSquare = square.s16.element;
  }
  console.log(`puzzleSize: ${puzzleSize}`);
  lastSquare.className = 'blank';
  if (elMsg) {
    elMsg.innerHTML = '';
  }
  moveCount = 0;
  endTime = 0;
  if (moveCounter) { moveCounter.textContent = moveCount.toString(); }
  if (elTimeElapsed) { elTimeElapsed.innerText = ''; }

  if (puzzleTable === null) {
    throw new Error('puzzleTable element is null');
  } else {
    puzzleTable.addEventListener('click', puzzleEvent, false);
    const radioButtons = document.querySelectorAll('input[name="difficulty"]');
    for (const radioButton of radioButtons) {
        // @ts-ignore
        if (radioButton.checked) {
            // @ts-ignore
            difficulty = radioButton.value;
            break;
        }
    }
    scramble(scrambleLevel); // this variable is passed as an argument to the initialize function, and then passed unchanged to the scramble function. Is this really necessary?

    // I should remove the play again button altogether, and delete the following 4 lines.
    if (playAgainButton) {
      playAgainButton.className = 'hidden';
      playAgainButton.removeEventListener('click', initialize);  
    }
    startTime = Date.now();
  }
}

// scrambleLevel = 10;
// initialize(scrambleLevel); // Change: only call this function when a button is clicked.

// Square 8's tile:
// square.s8.currentTile    => this is initially tile.t8

/*
A square with a tile is clicked, for example square 8.
1. Square 8's current tile needs to move to the empty square.
  (a) save the current tile to a variable (represented by tileToMove)
  (b) assign this variable to the empty square's tile (line 118)
2. Square 8 is the new empty square.
  (a) Update the emptySquare variable. (line 121)
  (b) Set square 8's current tile to blank. (line 125)
3. Update the classes
  (a) Call the updateImage() method on square 8 and the previous emptySquare.

Look further into this: https://gomakethings.com/why-you-shouldnt-attach-event-listeners-in-a-for-loop-with-vanilla-javascript/

Other reading:
https://www.geeksforgeeks.org/how-to-pause-and-play-a-loop-in-javascript-using-event-listeners/

https://www.nickang.com/blog

https://learningwebdesign.com/articles/index.html

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw

https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener

https://www.javascripttutorial.net/javascript-dom/javascript-radio-button/

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now

https://www.degraeve.com/reference/specialcharacters.php
*/