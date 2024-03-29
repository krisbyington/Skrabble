var userOrder;
let firstTurn = false;
let game_id = 0;

const selection = [];
const words = [];
let word = [];

let chatButton = document.getElementById("send-text-game");

chatButton.addEventListener("keydown", (event) => {
  if (event.code === "Enter") { 
      chatButton.click();
  }
});

document
  .getElementById("play-word-button")
  .addEventListener("click", (event) => {
    submitWord().then(result => {
    })
      .catch(err => {
        console.log(err)
      });
  });

document.getElementById("game-board").addEventListener("click", (event) => {
  if (
    Array.from(event.target.classList).includes("game-board-tile") &&
    selection.length === 1
  ) {
    const { x, y } = event.target.dataset;

    if ((firstTurn == true) && (x != 7 || y != 7)) {
      alert("Tile must be placed in center");
      return;
    }
    if (slotTaken(x, y)) {
      alert("A tile has been placed in that slot.");
      return;
    }

    const selectedTile = selection.pop();
    selectedTile.classList.add("played-tile");

    selectedTile.classList.remove("selected-tile");

    let letterP = document.createElement("p");
    let valueP = document.createElement("p");

    letterP.innerText = selectedTile.children[0].innerText;
    valueP.innerText = selectedTile.children[1].innerText;

    event.target.appendChild(letterP);
    event.target.appendChild(valueP);
    event.target.classList.add("played-square");

    document.getElementById("tile-wrapper").removeChild(selectedTile);

    word.push({ ...selectedTile.dataset, x, y });
    words.push({ ...selectedTile.dataset, x, y });
  }
});

document
  .getElementById("tile-wrapper")
  .addEventListener("click", ({ target }) => {
    const element = target.tagName === "P" ? target.parentElement : target;

    if (Array.from(element.classList).includes("selected-tile")) {
      element.classList.remove("selected-tile");
    } else if (Array.from(element.classList).includes("played-tile")) {
      alert("This tile has been used already.");
      return;
    }
    if (Array.from(element.classList).includes("tile")) {
      if (selection.length === 1) {
        alert("Place your tile before selecting a new tile.");
      } else {
        selection.push(element);
      }
    }
  });

const updateBoard = async () =>{
  return await fetch(`${window.location.pathname}/updateBoard`,{
    method:"put"
  })
}

const submitWord = async () => {
  if (word.length === 0) {
    alert("You must enter a word.");
    return;
  }
  return await fetch(`${window.location.pathname}/playWord`, {
    body: JSON.stringify(word),
    method: "post",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
    .then((response) => {
      word = []//??
      return response.json()

    })
    .catch((error) => {
      console.log(error);
      Promise.reject(error)
    });
};

//what is the point of this 
//I think it works because it just pings to /game/userInfo and then grabs session data 
async function getUserInput() {
  return await fetch('/userInfo').then((result) => {
    return result.json()
  }).catch(err => {
    console.log(err)
  })
}

function updatePlayerScore(score, id) {
  let playerList = document.getElementById("player-data");
  for(let player of playerList.children){
    if(player.id == id && player.className == "player-score"){
      player.innerText = score;
    }
  }

}

socket.on("invalid-word", async data => {
  const x = await getUserInput()
  const username = x.username
  window.alert(`invalid word was played! \nPLEASE REFRESH TO TRY AGAIN`)
})

socket.on("valid-word", async data => {
  game_id = data.id
  fillBoardFromDB(data.tileDataForHTML);
  replenishHand(data);
  console.log(data);
  const x = await getUserInput()
  const username = x.username
  const score = data.playerScore[0].score
  updatePlayerScore(score, data.playerId);
  return await fetch(`${window.location.pathname}/nextTurn`, {
    body: JSON.stringify(word),
    method: "post",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      console.log(error);
      Promise.reject(error)
    });
})

socket.on("load-board-data", boardTileData => {
  //console.log("loading board data on socket",boardTileData);
  fillBoardFromDB(boardTileData.boardTileData)
});

const slotTaken = (x, y) => {
  const found = words.find((entry) => entry.x === x && entry.y === y);
  return found !== undefined;
};

// pre-mature code, needs inplementation to change color and indicate turn 
// const isYourTurn = (turnValue) => {
//   if (turnValue) {
//     let bagWrapper = document.querySelector(".bag-icon-wrapper");
//     bagWrapper.ClassList.remove("bag-not-your-turn");
//     bagWrapper.ClassList.add("bag-your-turn");
//   }
// }

// const isNotYourTurn = (turnValue) => {
//   if (!turnValue) {
//     let bagWrapper = document.querySelector(".bag-icon-wrapper");
//     bagWrapper.ClassList.remove("bag-your-turn");
//     bagWrapper.ClassList.add("bag-not-your-turn");
//   }
// }

const replenishHand = (data) => {
  tileWrapper = document.getElementById("tile-wrapper");
  if (data.playerId == tileWrapper.dataset.id) {
    handData = data.playerHand;
    tilesInHand = tileWrapper.children;
    tilesInHandLength = tilesInHand.length;
    let needsTile = [];
    for (i = 0; i < handData.length; i++) {
      let found = false;
      for (j = 0; j < tilesInHandLength; j++) {
        if (handData[i].tileId == tilesInHand[j].dataset.id) {
          found = true;
        }
      }
      if (found == false) {
        needsTile.push(handData[i]);
      }
    }

    for (i = 0; i < needsTile.length; i++) {
      let tileDiv = document.createElement("div");
      tileDiv.dataset.id = needsTile[i].tileId;
      tileDiv.dataset.letter = needsTile[i].letter;
      tileDiv.dataset.value = needsTile[i].value;
      tileDiv.classList.add("tile");
      let letterP = document.createElement("p");
      letterP.innerText = needsTile[i].letter;
      letterP.classList.add("tile-letter");
      tileDiv.appendChild(letterP);
      let valueP = document.createElement("p");
      valueP.innerText = needsTile[i].value;
      valueP.classList.add("tile-value");
      tileDiv.appendChild(valueP);
      tileWrapper.appendChild(tileDiv);
    }
  }
}

const fillBoardFromDB = (boardTileData) => {
  let allSquares = document.getElementById("game-board").children;
  for (i = 0; i < boardTileData.length; i++) {
    for (j = 0; j < allSquares.length; j++) {
      if ((boardTileData[i].x_coordinate == allSquares[j].dataset.x) &&
        (boardTileData[i].y_coordinate == allSquares[j].dataset.y) &&
        (!allSquares[j].classList.contains("played-square"))) {
        allSquares[j].classList.add("played-square");
        let letterP = document.createElement("p");
        letterP.innerText = boardTileData[i].letter;
        let valueP = document.createElement("p");
        valueP.innerText = boardTileData[i].value;
        allSquares[j].appendChild(letterP);
        allSquares[j].appendChild(valueP);
      }
    }
  }
}

window.onload = (event) => {
  const url = (event.target.URL)
  const targetIdx = url.indexOf('/game')
  const id = url.slice(targetIdx + 6);
  //why is this data not being used anymore? 
  updateBoard();
}