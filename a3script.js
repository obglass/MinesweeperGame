$(document).ready(function() {

  let newTable;
  let firstClick = "false";
  let scores = document.getElementById("scores");
  let h2 = document.getElementsByTagName('h2')[0];
  let seconds = 0;
  let minutes= 0;
  let hours = 0;
  let t;
  let list = [];
  let game;

  $("#create").on('click', function() {
    // create board, set rows/cols/mines
    // keep track of all attributes for each cell
    game = "false";
    resetTimer();
    clearTimeout(t);
    $(".tableDiv").empty();
    let mines = [];
    newTable = document.createElement("table");
    newTable.setAttribute("class", "myTable");
    $(".tableDiv").append(newTable);

    // collect input for custom rows, cols, mines
    let rowNum = document.getElementById("rowCount").value;
    if (rowNum < 8 || rowNum > 30) {
      alert("Please choose a number between 8 and 30 for Rows");
      rowNum = 8;
    }
    let colNum = document.getElementById("colCount").value;
    if (colNum < 8 || colNum > 40) {
      alert("Please choose a number between 8 and 40 for Columns");
      colNum = 8;
    }
    let mineMax = rowNum*colNum - 1;
    let mineNum = document.getElementById("mineCount").value;
    if (mineNum < 1 || mineNum > mineMax) {
      alert("Please choose a number between 1 and " + mineMax + " for Mines");
      mineNum = 10;
    }
    bombsLeft = mineNum;
    let text = document.createTextNode("Remaining bombs: " + bombsLeft);
    $("#bombs").empty();
    $("#bombs").append(text);
    for (let k = 0; k < mineNum; k++) {
      bombMaker(mineMax, rowNum, mines, colNum);
    }

    // create table
    for (let r = 0; r < rowNum; r++) {
      let row = newTable.insertRow(r);
      for (let c = 0; c < colNum; c++) {
        let cell = row.insertCell(c);
        let string = r.toString()+","+c.toString();
        newTable.rows[r].cells[c].setAttribute("class", "cellulose");
        newTable.rows[r].cells[c].setAttribute("row", r);
        newTable.rows[r].cells[c].setAttribute("col", c);
        newTable.rows[r].cells[c].setAttribute("marked", "false");
        newTable.rows[r].cells[c].setAttribute("leftClicked", "false");
        if (mines.includes(string)) {
          newTable.rows[r].cells[c].setAttribute("id", "bomb");
          newTable.rows[r].cells[c].setAttribute("nearbyMines", "@");
        } else {
          newTable.rows[r].cells[c].setAttribute("id", "safe");
          let count = 0;
          let adj = [];
          for (let m = -1; m < 2; m++) {
            for (let n = -1; n < 2; n++) {
              let rN = (r+m);
              let cN = (c+n);
              stringTwo = rN.toString() + "," + cN.toString();
              if (mines.includes(stringTwo)) {
                count++;
              }
            }
          }
          newTable.rows[r].cells[c].setAttribute("nearbyMines", count);
          newTable.rows[r].cells[c].setAttribute("adj", adj);
        }
        createCellButton(cell, r, c, newTable, rowNum, colNum);
      }
    }
    $.each(document.getElementsByClassName("cellulose"), function() {
      let adj = [];
      for (let p = -1; p < 2; p++) {
        for (let q = -1; q < 2; q++) {
          let rP = (parseInt($(this).attr("row"))+p);
          let cQ = (parseInt($(this).attr("col"))+q);
          if ((p !=0 || q != 0) && rP >= 0 && cQ >= 0 && rP < rowNum && cQ < colNum) {
            adj.push(newTable.rows[rP].cells[cQ]);
          }
        }
      }
    });
  });

  function bombMaker(max, row, array, col) {
    // randomly place bombs throughout table
    let randMine = randNumGen(max+1);
    let x = Math.floor(((randMine)-1)%row);
    let y = Math.floor(((randMine)-1)/row);
    let value = x.toString()+ ","+y.toString();
    if (array.includes(value) || x >= row || y >= col) {
      bombMaker(max, row, array, col);
    } else {
      array.push(value);
    }
  }

  function randNumGen(max) {
    return Math.floor(Math.random() * (max+2)) + 1;
  }

  function createCellButton(celly, row, col, table, rowTotal, colTotal) {
    // append a button to each cell with id of rows and cols
    let node = document.createElement("BUTTON");
    node.setAttribute("class", "cellButton");
    let rc = row.toString()+ ","+col.toString();
    node.setAttribute("id", rc);
    celly.appendChild(node);
    node.addEventListener ("click", function(e) {
      if (e.shiftKey) {
        shiftLeftClick(node, celly, table, row, col, rowTotal, colTotal);
      } else {
        leftClick(celly, node, row, col, rowTotal, colTotal);
      }
    });
  }

  let buttonMade;
  function leftClick(cell, button, row, col, rowTotal, colTotal) {
    // click on a cell, if unclicked, clear it, if it's a bomb, game over
    // check adjacent cells, if number of marked = nearbyMines, click adjacent
    // replace button with nearbyMines Number or blank if that's 0
    // check if done, see if all bombs are marked and all other cells are clicked
    if (game == "false") {

    if (firstClick == "false") {
      // start timer when first cell is clicked
      firstClick = "true";
      timer();
    }
    // check if the game is over
    checkIfDone(rowTotal, colTotal);
    let stringNew = row.toString() + "," + col.toString();
    $.each(document.getElementsByClassName("cellButton"), function() {
      if ($(this).attr("id") == stringNew) {
        buttonMade = this;
      }
    });
    if (cell.getAttribute("leftClicked") == "false") {
      // if it hasn't been clicked before ...
      if (cell.id == "bomb" && buttonMade.innerHTML != "M") {
        // lose game if click on a bomb
        cell.style.backgroundColor = "red";
        gameOver(rowTotal, colTotal);
        return;
      }
       else if (buttonMade.innerHTML != "M" && cell.id != "bomb") {
        // if cell is not marked ...
        row= parseInt(row);
        col = parseInt(col);
        cell.setAttribute("leftClicked", "true");
        adjNum = cell.getAttribute("nearbyMines");
        cell.innerHTML = adjNum;
        cell.getAttribute("adj");
        if (adjNum == 0) {
          // if no adj cells are bombs
          cell.innerHTML = "";
          for (let m = -1; m < 2; m++) {
            for (let n = -1; n < 2; n++) {
              let rN = row + m;
              let cN = col + n;
              stringMade = rN.toString() + "," + cN.toString();
              if (rN >= 0 && cN >= 0 && rN < rowTotal && cN < colTotal && (rN != row || cN != col)) {
                let newCell = newTable.rows[rN].cells[cN];
                let newButton;
                $.each(document.getElementsByClassName("cellButton"), function() {
                  if ($(this).id == stringMade) {
                    newButton = $(this);
                  }
                });
                // recursively click all cells adjacent to blank ones
                // if those are blank, keep clearing cells until not
                leftClick(newTable.rows[rN].cells[cN], newButton, rN, cN, rowTotal, colTotal);
              }
            }
          }
        } else {
          // if the cells are not blank
        let markCount = 0;
          for (let o = -1; o < 2; o++) {
            for (let s = -1; s < 2; s++) {
              let rO = row + o;
              let cS = col + s;
              stringy = rO.toString() + "," + cS.toString();
              if (rO >= 0 && cS >= 0 && rO < rowTotal && cS < colTotal && (rO != row || cS != col)) {
                if (newTable.rows[rO].cells[cS].getAttribute("marked") == "true") {
                  markCount++;
                  // checking if adjacent cells are marked
                }
                }
            }
          }
          if (markCount == adjNum) {
            // if number of adj marked cells = number of adj bombs, click all adj cells
            // if chose wrong marked cells, could lose game
            for (let u = -1; u < 2; u++) {
              for (let v = -1; v < 2; v++) {
                let rU = row + u;
                let cV = col + v;
                stringyUV = rU.toString() + "," + cV.toString();
                if (rU >= 0 && cV >= 0 && rU < rowTotal && cV < colTotal && (rU != row || cV != col)) {
                  let newButtony;
                  $.each(document.getElementsByClassName("cellButton"), function() {
                    if ($(this).id == stringyUV) {
                      newButtony = $(this);
                    }
                  });
                  leftClick(newTable.rows[rU].cells[cV], newButtony, rU, cV, rowTotal, colTotal)
                }
              }
            }
          }
        }
      }

  }
 }
}

  function shiftLeftClick(button, cell, table, row, col, rowTotal, colTotal) {
    // mark a cell, make it unclickable
    if (firstClick == "false") {
      firstClick="true";
      timer();
    }
    if (button.innerHTML == "") {
      button.innerHTML = "M";
      $(".cellButton").css("color", "white");
      newTable.rows[row].cells[col].setAttribute("marked","true");
      bombsLeft--;
    } else {
      button.innerHTML = "";
      newTable.rows[row].cells[col].setAttribute("marked", "false");
      bombsLeft++;
    }
    let text = document.createTextNode("Remaining bombs: " + bombsLeft);
    $("#bombs").empty();
    $("#bombs").append(text);
    // check if the game is won
    checkIfDone(rowTotal, colTotal);
  }

  function checkIfDone(rowTotal, colTotal) {
    // won when all bombs are marked and all other cells are clicked
    let done = "true";
    $.each(document.getElementsByClassName("cellulose"), function(){
      if ($(this).attr("leftClicked") != "true" && $(this).attr("marked") !="true") {
        done = "false";
      }
    });
    if (done == "true") {
      gameWon(rowTotal, colTotal);
    }
  }

  function add() {
    // set timer times
    seconds++;
    if (seconds >= 60) {
      seconds = 0;
      minutes++;
      if (minutes >= 60) {
        minutes = 0;
        hours++;
      }
    }
    h2.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
    timer();
  }

  function timer() {
    t = setTimeout(add, 1000);
  }

  function resetTimer(){
    // set back to 0
    seconds = 0;
    minutes = 0;
    hours = 0;
    firstClick = "false";
    h2.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
  }

  function gameOver(rowTotal, colTotal) {
    // reset game, make new board
    clearTimeout(t);
    resetTimer();
    firstClick="false";
    game = "true";
    for (let r = 0; r < rowTotal; r++) {
      for (let c = 0; c < colTotal; c++) {
        if (newTable.rows[r].cells[c].id == "bomb") {
          newTable.rows[r].cells[c].style.backgroundColor = "red";
        }
      }
    }
    alert("GAME OVER, START NEW GAME");
    return;
  }

  function gameWon(rowTotal, colTotal) {
    // add time to high scores, reset board, make gameOver (game) true
    game = "true";
    firstClick="false";
    clearTimeout(t);
    list.push(h2.textContent);
    list.sort();

    $("#highScore").empty();

    let par = document.createElement("P");
    let hs = document.createTextNode("High Scores: ");
    par.setAttribute("id","highScore");
    par.append(hs);
    $(".tableDiv").after(par);

    for (let i = 0; i < list.length; i++ ) {
      let li = document.createElement("LI");
      let obj = list[i];
      let txt = document.createTextNode((i+1).toString() + ". " + obj);
      $("#highScore").append(li);
      li.append(txt);
    }
    for (let r = 0; r < rowTotal; r++) {
      for (let c = 0; c < colTotal; c++) {
        if (newTable.rows[r].cells[c].id == "bomb") {
          newTable.rows[r].cells[c].style.backgroundColor = "red";
        }
      }
    }
    alert("CONGRATULATIONS! YOU WON!");
  }

});
