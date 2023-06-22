window.addEventListener("load", () => {
  SinkShip.init();
  SinkShip.shipHandler();
  SinkShip.buildInventory();
  //SinkShip.playerWon();
});

const limiter = document.createElement("div");
limiter.classList.add("limiter");

let SinkShip = {
  playerField: [],
  serverField: [],
  inventory: [],
  selectedShipType: "",
  selectedShipOrientation: "",
  selectedShipSize: "",
  playButtonPressed: false,

  init() {
    document.body.appendChild(this.makeHeader());
    document.body.appendChild(this.makeMain());
    document.body.appendChild(this.makeFooter());
  },
  makeHeader() {
    const header = document.createElement("header");
    header.innerHTML = `
      <h1>Sink Ship</h1>
      <h4>by Florin Alexandru Sirbu</h4>
    `;
    header.appendChild(limiter);
    return header;
  },

  makeMain() {
    const main = document.createElement("main");
    const controls = this.makeControls();
    const fields = this.makeDiv("fields");
    const playerField = this.makeField();
    const serverField = this.buildMenu();
    const message = this.makeDiv("message");

    playerField.field.id = "playerfield";
    serverField.id = "serverfield";
    message.id = "message";

    fields.appendChild(playerField.field);
    fields.appendChild(serverField);
    main.appendChild(controls);
    main.appendChild(message);
    main.appendChild(fields);
    main.appendChild(limiter);

    this.playerField = playerField.Field;
    this.serverField = serverField.Field;
    this.messageElement = message;

    return main;
  },

  makeFooter() {
    const footer = document.createElement("footer");
    footer.appendChild(limiter);
    return footer;
  },

  makeDiv(className) {
    const div = document.createElement("div");
    div.classList.add(className);
    return div;
  },
  makeField() {
    const field = this.makeDiv("field");
    const Field = [];

    for (let y = 0; y < 10; y++) {
      const row = [];
      for (let x = 0; x < 10; x++) {
        const cell = this.makeDiv("cell");
        row.push(cell);
        field.appendChild(cell);
      }
      Field.push(row);
    }

    console.log(Field);
    return { field, Field };
  },

  makeControls() {
    const controls = this.makeDiv("controls");

    const buildButton = this.makeButton("Build", "btn-build");
    buildButton.addEventListener("click", () => {
      this.buildButton();
    });
    controls.appendChild(buildButton);

    const playButton = this.makeButton("Play", "btn-play");
    playButton.addEventListener("click", () => {
      this.playButtonPressed = true;
      this.playButton();
    });
    playButton.disabled = true;
    controls.appendChild(playButton);

    const autoplaceButton = this.makeButton("Autoplace", "btn-autplace");
    autoplaceButton.addEventListener("click", () => {
      this.autoplaceButton();
    });
    controls.appendChild(autoplaceButton);

    return controls;
  },

  makeButton(label, id) {
    const button = document.createElement("button");
    button.innerHTML = label;
    button.id = id;
    return button;
  },

  playButton() {
    const serverField = document.getElementById("serverfield");
    serverField.parentNode.removeChild(serverField);

    const newServerField = this.makeField();
    newServerField.field.id = "serverfield";

    const fields = document.querySelector(".fields");
    fields.appendChild(newServerField.field);

    this.makeShot();
    this.changeField();
    this.sendStart();

    const serverFieldCells = document.querySelectorAll("#serverfield .cell");

    serverFieldCells.forEach((cell) => {
      cell.classList.add("shootable");
    });
  },

  async sendStart() {
    const request = "request=start&userid=flsiit00";

    const response = await this.fetchAndDecode(request);

    console.log(response);

    this.token = response.token;
    this.messageElement.textContent = response.statusText;

    this.makeShot();
  },

  makeShot() {
    const serverFieldCells = document.querySelectorAll("#serverfield .cell");
    serverFieldCells.forEach((cell) => {
      const clickHandler = cell._clickHandler;
      if (clickHandler) {
        cell.removeEventListener("click", clickHandler);
        delete cell._clickHandler;
      }
    });

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const index = y * 10 + x;
        const cell = serverFieldCells[index];

        const clickHandler = () => {
          this.changeField();
          this.sendShot(y, x, cell);
          console.log(x, y, cell);
          cell.removeEventListener("click", cell._clickHandler);
        };

        cell.addEventListener("click", clickHandler);
        cell._clickHandler = clickHandler;
        cell.classList.replace("off", "shootable");
      }
    }
  },

  async sendShot(y, x, cell) {
    const request = `request=shoot&token=${this.token}&x=${x}&y=${y}`;
    const response = await this.fetchAndDecode(request);

    console.log(response);

    this.messageElement.textContent = response.statusText;

    this.fieldsChange();

    if (response.state === 1) {
      if (response.statusText === "You have sunk a ship - shoot again") {
        cell.classList.replace("shootable", "hitLast");
      } else {
        cell.classList.replace("shootable", "hit");
      }
    } else if (response.state === 2) {
      cell.classList.replace("shootable", "water");
      const coordinates = await this.getShotCoordinates();
      const result = this.findHit(coordinates);
      this.sendResult(result);
    } else if (response.state === 4) {
      cell.classList.replace("shootable", "hitLast");
      this.playerWon();
    }
  },

  async sendResult(result) {
    const request = `request=sendingresult&token=${this.token}&result=${result}`;
    const response = await this.fetchAndDecode(request);

    console.log(response);

    if (result === 0) {
      this.makeShot();
    } else if (result === 1) {
      const coordinates = await this.getShotCoordinates();
      const newResult = this.findHit(coordinates);
      this.sendResult(newResult);
    } else if (result === 2) {
      this.serverWon();
      console.log("serverwon");
    }

    this.messageElement.textContent = response.statusText;
  },

  findHit(coordinates) {
    const playerFieldCells = document.querySelectorAll("#playerfield .cell");
    const { y: yShot, x: xShot } = coordinates;
    const cell = playerFieldCells[yShot * 10 + xShot];
    const shipSunk = this.sunkShip(yShot, xShot);

    const hasRemainingShipCells = Array.from(playerFieldCells).some((cell) => {
      return (
        cell.classList.contains("top2") ||
        cell.classList.contains("vertical") ||
        cell.classList.contains("bottom2") ||
        cell.classList.contains("left2") ||
        cell.classList.contains("horizontal") ||
        cell.classList.contains("right2")
      );
    });

    if (shipSunk === 0) {
      return 0;
    } else if (shipSunk === 1) {
      return 1;
    } else if (!hasRemainingShipCells) {
      return 2;
    }

    return 0;
  },

  sunkShip(yShot, xShot) {
    const playerFieldCells = document.querySelectorAll("#playerfield .cell");
    console.log(yShot, xShot);

    if (playerFieldCells.length === 0) {
      console.error("Player field cells not found or empty.");
      return;
    }

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const cellIndex = y * 10 + x;
        const cell = playerFieldCells[cellIndex];

        if (y === yShot && x === xShot) {
          if (
            cell.classList.contains("top2") ||
            cell.classList.contains("vertical") ||
            cell.classList.contains("bottom2") ||
            cell.classList.contains("left2") ||
            cell.classList.contains("horizontal") ||
            cell.classList.contains("right2")
          ) {
            cell.classList.remove("top2");
            cell.classList.remove("vertical");
            cell.classList.remove("bottom2");
            cell.classList.remove("left2");
            cell.classList.remove("horizontal");
            cell.classList.remove("right2");
            cell.classList.remove("water");
            cell.classList.add("hit");
            return 1;
          } else if (cell.classList.contains("water")) {
            cell.classList.remove("water");
            cell.classList.add("hitWater");
            return 0;
          }
        }
      }
    }
  },

  async getShotCoordinates() {
    const request = `request=getshotcoordinates&token=${this.token}`;
    let response = await this.fetchAndDecode(request);

    // no already used coordinates
    const usedCoordinates = [];

    while (usedCoordinates.includes(`${response.y},${response.x}`)) {
      response = await this.fetchAndDecode(request);
    }

    usedCoordinates.push(`${response.y},${response.x}`);

    console.log(response);

    return { y: response.y, x: response.x };
  },

  fieldsChange() {
    const pcFieldCells = document.querySelectorAll("#serverfield .cell");

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const index = y * 10 + x;
        const cell = pcFieldCells[index];

        cell.classList.replace("off", "shootable");
      }
    }
  },

  changeField() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
      if (
        (cell.parentElement.id != "PcField" &&
          cell.classList.contains("top")) ||
        cell.classList.contains("vertical") ||
        cell.classList.contains("bottom") ||
        cell.classList.contains("horizontal") ||
        cell.classList.contains("right") ||
        cell.classList.contains("left") ||
        cell.classList.contains("top2") ||
        cell.classList.contains("bottom2") ||
        cell.classList.contains("right2") ||
        cell.classList.contains("left2")
      ) {
        cell.classList.replace("bottom", "bottom2");
        cell.classList.replace("top", "top2");
        cell.classList.replace("left", "left2");
        cell.classList.replace("right", "right2");
        cell.removeEventListener("click", this.cellClickHandler);
      } else if (cell.parentElement.id != "serverfield") {
        cell.classList.add("water");
        cell.removeEventListener("click", this.cellClickHandler);
      } else {
        cell.classList.remove("shootable");
        cell.classList.add("off");
        cell.removeEventListener("click", this.cellClickHandler);
      }
    });
  },

  async fetchAndDecode(query) {
    const url =
      "https://www2.hs-esslingen.de/~melcher/internet-technologien/sinkship/?";
    return fetch(url + query).then((response) => response.json());
  },

  autoplaceButton() {
    const battleshipType = "Battleship";
    const cruiserType = "Cruiser";
    const destroyerType = "Destroyer";
    const submarineType = "Submarine";
    const cruiserCount = 2;
    const destroyerCount = 3;
    const submarineCount = 4;
    const shipSize = {
      Battleship: 5,
      Cruiser: 4,
      Destroyer: 3,
      Submarine: 2,
    };

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        this.playerField[x][y].classList = "cell";
        this.playerField[x][y].style.backgroundColor = "";
      }
    }

    const selectableElements = document.querySelectorAll(
      "[class*='selectable']"
    );

    selectableElements.forEach((element) => {
      element.style.backgroundColor = "";
    });
    this.buildInventory();

    placeShip.call(this, battleshipType, shipSize.Battleship);

    for (let i = 0; i < cruiserCount; i++) {
      placeShip.call(this, cruiserType, shipSize.Cruiser);
    }
    for (let i = 0; i < destroyerCount; i++) {
      placeShip.call(this, destroyerType, shipSize.Destroyer);
    }
    for (let i = 0; i < submarineCount; i++) {
      placeShip.call(this, submarineType, shipSize.Submarine);
    }

    function placeShip(shipType, size) {
      const classNames = ["w", "h"];
      const className =
        classNames[Math.floor(Math.random() * classNames.length)];
      let startX = Math.floor(Math.random() * 10);
      let startY = Math.floor(Math.random() * 10);

      while (
        !this.ShipPosition(className, size, startX, startY) ||
        this.isShipAdjacentOrColliding(className, size, startX, startY)
      ) {
        startX = Math.floor(Math.random() * 10);
        startY = Math.floor(Math.random() * 10);
      }

      if (className === "w") {
        for (let i = 0; i < size; i++) {
          const cell = this.playerField[startX][startY + i];
          cell.classList.remove(
            "left",
            "right",
            "top",
            "bottom",
            "horizontal",
            "vertical"
          );
          cell.classList.add(
            i === 0 ? "left" : i === size - 1 ? "right" : "horizontal"
          );
          cell.addEventListener("click", this.cellClickHandler);
        }
      } else if (className === "h") {
        for (let i = 0; i < size; i++) {
          const cell = this.playerField[startX + i][startY];
          cell.classList.remove(
            "left",
            "right",
            "top",
            "bottom",
            "horizontal",
            "vertical"
          );
          cell.classList.add(
            i === 0 ? "top" : i === size - 1 ? "bottom" : "vertical"
          );
          cell.addEventListener("click", this.cellClickHandler);
        }
      }
      const ship = this.inventory.find((ship) => ship.type === shipType);
      if (ship) {
        ship.available--;
      }
    }
    this.setInventoryNull();
    console.log(this.inventory);
  },

  setInventoryNull() {
    for (let i = 0; i < this.inventory.length; i++) {
      this.inventory[i].available = 0;
      this.checkIfShipsEmpty(this.inventory[i].type);
    }
  },

  isShipAdjacentOrColliding(className, shipSize, x, y) {
    const endX = x + (className === "h" ? shipSize - 1 : 0);
    const endY = y + (className === "w" ? shipSize - 1 : 0);
    console.log("endx:", endX, "endy:", endY);
    for (let i = x - 1; i <= endX + 1; i++) {
      for (let j = y - 1; j <= endY + 1; j++) {
        if (i >= 0 && i < 10 && j >= 0 && j < 10) {
          console.log(i, j);
          const cell = this.playerField[i][j]; //why i get here this error: Uncaught TypeError: Cannot read properties of undefined (reading '3')
          if (
            cell.classList.contains("horizontal") ||
            cell.classList.contains("vertical") ||
            cell.classList.contains("left") ||
            cell.classList.contains("right") ||
            cell.classList.contains("top") ||
            cell.classList.contains("bottom")
          ) {
            if (
              !(i === x && j === y) &&
              !(
                (i === x - 1 && j === y - 1) ||
                (i === x - 1 && j === endY + 1) ||
                (i === endX + 1 && j === y - 1) ||
                (i === endX + 1 && j === endY + 1)
              )
            ) {
              return true;
            }
          }
        }
      }
    }

    return false;
  },

  ShipPosition(className, shipSize, x, y) {
    const endX = x + (className === "h" ? shipSize - 1 : 0);
    const endY = y + (className === "w" ? shipSize - 1 : 0);

    if (endX < 10 && endY < 10) {
      return true;
    } else {
      return false;
    }
  },

  buildMenu() {
    const serverField = this.makeDiv("field");
    serverField.classList.add("field");
    const table = document.createElement("table");

    serverField.appendChild(table);
    table.appendChild(this.makeTableHeader("Number"));
    table.appendChild(this.makeTableHeader(""));
    table.appendChild(this.makeTableHeader(""));
    table.appendChild(this.makeTableHeader("Type"));
    table.appendChild(this.makeTableHeader("Size"));
    table.appendChild(this.makeTableBody());

    return serverField;
  },

  makeTableHeader(title) {
    const th = document.createElement("th");
    th.textContent = title;
    return th;
  },

  makeTableBody() {
    const tbody = document.createElement("tbody");
    tbody.appendChild(
      this.makeRow(
        ["1"],
        ["battleship", "h", "selectable"],
        ["battleship", "v", "selectable"],
        ["Battleship"],
        ["5"]
      )
    );
    tbody.appendChild(
      this.makeRow(
        ["2"],
        ["cruiser", "h", "selectable"],
        ["cruiser", "v", "selectable"],
        ["Cruiser"],
        ["4"]
      )
    );
    tbody.appendChild(
      this.makeRow(
        ["3"],
        ["destroyer", "h", "selectable"],
        ["destroyer", "v", "selectable"],
        ["Destroyer"],
        ["3"]
      )
    );
    tbody.appendChild(
      this.makeRow(
        ["4"],
        ["submarine", "h", "selectable"],
        ["submarine", "v", "selectable"],
        ["Submarine"],
        ["2"]
      )
    );

    return tbody;
  },

  makeRow(number, class1, class2, type, size) {
    const tr = document.createElement("tr");
    tr.appendChild(this.makeTableData(number));
    tr.appendChild(this.makeTableData(class1));
    tr.appendChild(this.makeTableData(class2));
    tr.appendChild(this.makeTableData(type));
    tr.appendChild(this.makeTableData(size));
    return tr;
  },

  makeTableData(data) {
    const td = document.createElement("td");

    console.log(data.length);
    console.log(data);
    if (data.length == 3) {
      td.className = Array.isArray(data) ? data.join(" ") : data;
      td.addEventListener("click", () => {
        console.log("Clicked:", data);
        this.showUsablePositions(data, this.playerField);
        this.getNextFreeShip(data);
      });
    } else {
      td.innerHTML = data;
    }
    return td;
  },

  enablePlayButton() {
    const selectableElements = document.querySelectorAll(
      "[class*='selectable']"
    );
    let enableButton = true;

    selectableElements.forEach((element) => {
      if (element.style.backgroundColor !== "grey") {
        enableButton = false;
      }
    });

    const playButton = document.getElementById("btn-play");
    playButton.disabled = !enableButton;
  },

  showUsablePositions(data, playerField) {
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        this.checkShip(x, y, data, playerField);
      }
    }
  },

  checkShip(x, y, data, playerField) {
    let size;
    if (data[0] === "battleship") {
      size = 6;
      sizeship = 5;
    } else if (data[0] === "cruiser") {
      size = 7;
      sizeship = 4;
    } else if (data[0] === "destroyer") {
      size = 8;
      sizeship = 3;
    } else if (data[0] === "submarine") {
      size = 9;
      sizeship = 2;
    }
    this.showAvaliablePosition(x, y, size, sizeship, playerField, data);
  },

  showAvaliablePosition(x, y, size, sizeship, playerField, data) {
    if (
      !playerField[y][x].classList.contains("horizontal") &&
      !playerField[y][x].classList.contains("vertical") &&
      !playerField[y][x].classList.contains("left") &&
      !playerField[y][x].classList.contains("right") &&
      !playerField[y][x].classList.contains("top") &&
      !playerField[y][x].classList.contains("bottom") &&
      !playerField[y][x].classList.contains("colliding")
    ) {
      if (data[1] === "h") {
        if (x < size) {
          playerField[y][x].classList.add("usable");
        } else {
          playerField[y][x].classList.add("disabled");
        }
      } else if (data[1] === "v") {
        if (y < size) {
          playerField[y][x].classList.add("usable");
        } else {
          playerField[y][x].classList.add("disabled");
        }
      }
    }
    if (
      playerField[y][x].classList.contains("horizontal") ||
      playerField[y][x].classList.contains("vertical") ||
      playerField[y][x].classList.contains("left") ||
      playerField[y][x].classList.contains("right") ||
      playerField[y][x].classList.contains("top") ||
      playerField[y][x].classList.contains("bottom") ||
      playerField[y][x].classList.contains("colliding")
    ) {
      playerField[y][x].style.pointerEvents = "none";
    }
    this.disableFieldBesideShip(playerField, sizeship, data);
  },

  disableFieldBesideShip(playerField, sizeship, data) {
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        if (playerField[y][x]) {
          const cellClassList = playerField[y][x].classList;

          if (
            cellClassList.contains("left") ||
            cellClassList.contains("right") ||
            cellClassList.contains("top") ||
            cellClassList.contains("bottom") ||
            cellClassList.contains("horizontal") ||
            cellClassList.contains("vertical")
          ) {
            if (x > 0 && playerField[y][x - 1]) {
              playerField[y][x - 1].classList.remove("usable");
              playerField[y][x - 1].classList.add("disabled");
            }
            if (x < 9 && playerField[y][x + 1]) {
              playerField[y][x + 1].classList.remove("usable");
              playerField[y][x + 1].classList.add("disabled");
            }
            if (y > 0 && playerField[y - 1][x]) {
              playerField[y - 1][x].classList.remove("usable");
              playerField[y - 1][x].classList.add("disabled");
            }
            if (y < 9 && playerField[y + 1][x]) {
              playerField[y + 1][x].classList.remove("usable");
              playerField[y + 1][x].classList.add("disabled");
            }
          }

          if (data[1] === "h") {
            if (
              playerField[y][x] &&
              playerField[y][x].classList.contains("left")
            ) {
              for (let i = 0; i <= sizeship; i++) {
                if (
                  x - i >= 0 &&
                  playerField[y][x - i] &&
                  playerField[y][x - i].classList.contains("usable")
                ) {
                  playerField[y][x - i].classList.remove("usable");
                  playerField[y][x - i].classList.add("disabled");
                }
                if (
                  y > 0 &&
                  y - 1 >= 0 &&
                  playerField[y - 1][x - i] &&
                  playerField[y - 1][x - i].classList.contains("usable")
                ) {
                  playerField[y - 1][x - i].classList.remove("usable");
                  playerField[y - 1][x - i].classList.add("disabled");
                }
                if (
                  y < 9 &&
                  y + 1 <= 9 &&
                  playerField[y + 1][x - i] &&
                  playerField[y + 1][x - i].classList.contains("usable")
                ) {
                  playerField[y + 1][x - i].classList.remove("usable");
                  playerField[y + 1][x - i].classList.add("disabled");
                }
              }
            }
            if (
              playerField[y][x] &&
              playerField[y][x].classList.contains("vertical")
            ) {
              for (let i = 0; i <= sizeship; i++) {
                if (
                  x - i >= 0 &&
                  playerField[y][x - i] &&
                  playerField[y][x - i].classList.contains("usable")
                ) {
                  playerField[y][x - i].classList.remove("usable");
                  playerField[y][x - i].classList.add("disabled");
                }
              }
            }
            if (
              playerField[y][x] &&
              playerField[y][x].classList.contains("top")
            ) {
              for (let i = 0; i <= sizeship; i++) {
                if (
                  x - i >= 0 &&
                  playerField[y][x - i] &&
                  playerField[y][x - i].classList.contains("usable")
                ) {
                  playerField[y][x - i].classList.remove("usable");
                  playerField[y][x - i].classList.add("disabled");
                }
              }
            }
            if (
              playerField[y][x] &&
              playerField[y][x].classList.contains("bottom")
            ) {
              for (let i = 0; i <= sizeship; i++) {
                if (
                  x - i >= 0 &&
                  playerField[y][x - i] &&
                  playerField[y][x - i].classList.contains("usable")
                ) {
                  playerField[y][x - i].classList.remove("usable");
                  playerField[y][x - i].classList.add("disabled");
                }
              }
            }
          }

          if (data[1] === "v") {
            if (
              playerField[y][x] &&
              playerField[y][x].classList.contains("left")
            ) {
              for (let i = 0; i <= sizeship; i++) {
                if (
                  y - i >= 0 &&
                  playerField[y - i][x] &&
                  playerField[y - i][x].classList.contains("usable")
                ) {
                  playerField[y - i][x].classList.remove("usable");
                  playerField[y - i][x].classList.add("disabled");
                }
              }
            }
            if (
              playerField[y][x] &&
              playerField[y][x].classList.contains("right")
            ) {
              for (let i = 0; i <= sizeship; i++) {
                if (
                  y - i >= 0 &&
                  playerField[y - i][x] &&
                  playerField[y - i][x].classList.contains("usable")
                ) {
                  playerField[y - i][x].classList.remove("usable");
                  playerField[y - i][x].classList.add("disabled");
                }
              }
            }
            if (
              playerField[y][x] &&
              playerField[y][x].classList.contains("horizontal")
            ) {
              for (let i = 0; i <= sizeship; i++) {
                if (
                  y - i >= 0 &&
                  playerField[y - i][x] &&
                  playerField[y - i][x].classList.contains("usable")
                ) {
                  playerField[y - i][x].classList.remove("usable");
                  playerField[y - i][x].classList.add("disabled");
                }
              }
            }
          }
        }
      }
    }
  },
  shipHandler() {
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const cell = this.playerField[y][x];
        cell.addEventListener("click", () => {
          if (cell.classList.contains("usable")) {
            console.log(`Ship start: X: ${x}, Y: ${y}`);
            this.drawShip(x, y);
            console.log(
              `Orientation: ${this.selectedShipOrientation}, Size: ${this.selectedShipSize}, Type: ${this.selectedShipType}`
            );
            //this.removeShip();
            cell.classList.remove("usable");
            if (this.selectedShipOrientation === "w") {
              for (let i = 0; i < this.selectedShipSize; i++) {
                const currentCell = this.playerField[y][x + i];
                currentCell.classList.add(
                  i === 0
                    ? "left"
                    : i === this.selectedShipSize - 1
                    ? "right"
                    : "horizontal"
                );
              }
            } else if (this.selectedShipOrientation === "h") {
              for (let i = 0; i < this.selectedShipSize; i++) {
                const currentCell = this.playerField[y + i][x];
                currentCell.classList.add(
                  i === 0
                    ? "top"
                    : i === this.selectedShipSize - 1
                    ? "bottom"
                    : "vertical"
                );
              }
            }

            if (!this.playButtonPressed) {
              console.log("Inside if block");
              const removedShipType = this.selectedShipType;
              const shipCells = [];
              this.checkIfShipsEmpty(removedShipType);
              if (this.selectedShipOrientation === "vertical") {
                for (let i = 0; i < this.selectedShipSize; i++) {
                  const shipCell = this.playerField[y + i][x];
                  shipCells.push(shipCell);
                }
              } else if (this.selectedShipOrientation === "horizontal") {
                for (let i = 0; i < this.selectedShipSize; i++) {
                  const shipCell = this.playerField[y][x + i];
                  shipCells.push(shipCell);
                }
              }

              console.log("shipCells:", shipCells);

              shipCells.forEach((shipCell) => {
                shipCell.addEventListener("click", () => {
                  console.log("Ship cell clicked");
                  if (!this.isShipPlaced(shipCells)) {
                    console.log("Ship is already placed, exiting callback");
                    return;
                  }
                  const clickedIndex = shipCells.indexOf(shipCell);

                  console.log("clickedIndex:", clickedIndex);
                  console.log("shipCell:", shipCell);

                  shipCells.forEach((cell) => {
                    console.log("Inside shipCells forEach");
                    cell.classList.remove(
                      "left",
                      "right",
                      "top",
                      "bottom",
                      "horizontal",
                      "vertical"
                    );
                  });

                  shipCell.removeEventListener("click", () => {});

                  const removedShip = this.inventory.find(
                    (ship) => ship.type === removedShipType
                  );

                  console.log("removedShip:", removedShip);
                  if (removedShip) {
                    removedShip.available++;
                    this.checkIfShipsEmpty(removedShip.type);
                    console.log(removedShip.available);
                  }
                });
              });
            }
            this.resetCells();
          }
        });
      }
    }
  },

  isShipPlaced(shipCells) {
    return shipCells.every(
      (cell) =>
        cell.classList.contains("left") ||
        cell.classList.contains("right") ||
        cell.classList.contains("top") ||
        cell.classList.contains("bottom") ||
        cell.classList.contains("horizontal") ||
        cell.classList.contains("vertical")
    );
  },

  resetCells() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
      cell.classList.remove("usable", "disabled");
      cell.classList.remove("w", "h");
      cell.removeEventListener("click", this.cellClickHandler);
    });
  },

  buildInventory() {
    this.inventory = [
      {
        type: "battleship",
        size: "5",
        available: 1,
        isPlaced: false,
        haveShips: true,
        x: [],
        y: [],
      },
      {
        type: "cruiser",
        size: "4",
        available: 2,
        isPlaced: false,
        haveShips: true,
        x: [],
        y: [],
      },
      {
        type: "destroyer",
        size: "3",
        available: 3,
        isPlaced: false,
        haveShips: true,
        x: [],
        y: [],
      },
      {
        type: "submarine",
        size: "2",
        available: 4,
        isPlaced: false,
        haveShips: true,
        x: [],
        y: [],
      },
    ];
  },

  getNextFreeShip(data) {
    this.saveShipData(data);
    for (let i = 0; i < this.inventory.length; i++) {
      if (data[0] === this.inventory[i].type) {
        if (this.inventory[i].available > 1) {
          this.inventory[i].available -= 1;
        } else {
          this.hideShip();
        }
      }
    }
  },

  hideShip() {
    const shipElementh = document.querySelector(
      `.${this.selectedShipType}.h.selectable`
    );
    const shipElementv = document.querySelector(
      `.${this.selectedShipType}.v.selectable`
    );

    for (let i = 0; i < this.inventory.length; i++) {
      if (this.inventory[i].type === this.selectedShipType) {
        this.inventory[i].available--;
        this.checkIfShipsEmpty(this.selectedShipType);
      }
    }

    this.enablePlayButton();
  },

  checkIfShipsEmpty(shipType) {
    const shipElements = document.querySelectorAll(`.${shipType}.selectable`);

    let hasAvailableShips = false;
    for (let i = 0; i < this.inventory.length; i++) {
      if (
        this.inventory[i].type === shipType &&
        this.inventory[i].available > 0
      ) {
        hasAvailableShips = true;
        break;
      }
    }

    if (hasAvailableShips) {
      shipElements.forEach((shipElement) => {
        shipElement.style.backgroundColor = "white";
        shipElement.style.pointerEvents = "auto";
      });
    } else {
      shipElements.forEach((shipElement) => {
        shipElement.style.backgroundColor = "grey";
        shipElement.style.pointerEvents = "none";
      });
    }

    let enablePlayButton;
    for (let i = 0; i < this.inventory.length; i++) {
      if (this.inventory[i].available === 0) {
        this.enablePlayButton();
      }
    }
  },

  saveShipData(data) {
    this.selectedShipType = data[0];
    for (let i = 0; i < this.inventory.length; i++) {
      if (data[0] === this.inventory[i].type) {
        this.selectedShipSize = this.inventory[i].size;
        data[1] === "h"
          ? (this.selectedShipOrientation = "horizontal")
          : (this.selectedShipOrientation = "vertical");
      }
    }
  },

  drawShip(x, y) {
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        if (
          this.playerField[y][x].classList.contains("horizontal") ||
          this.playerField[y][x].classList.contains("vertical") ||
          this.playerField[y][x].classList.contains("left") ||
          this.playerField[y][x].classList.contains("right") ||
          this.playerField[y][x].classList.contains("top") ||
          this.playerField[y][x].classList.contains("bottom") ||
          this.playerField[y][x].classList.contains("colliding")
        ) {
          this.playerField[y][x].style.pointerEvents = "auto";
        }
      }
    }

    if (this.selectedShipOrientation === "horizontal") {
      const firstCell = this.playerField[y][x];
      firstCell.classList.add("cell", "left");

      for (let i = 1; i < this.selectedShipSize; i++) {
        const cell = this.playerField[y][x + i];
        cell.classList.add("cell", "horizontal");

        if (i === this.selectedShipSize - 1) {
          cell.classList.add("right");
        }
      }
    } else if (this.selectedShipOrientation === "vertical") {
      const firstCell = this.playerField[y][x];
      firstCell.classList.add("cell", "top");

      for (let i = 1; i < this.selectedShipSize; i++) {
        const cell = this.playerField[y + i][x];
        cell.classList.add("cell", "vertical");

        if (i === this.selectedShipSize - 1) {
          cell.classList.remove("vertical");
          cell.classList.add("bottom");
        }
      }
    }
    for (let i = 0; i < this.inventory.length; i++) {
      if (this.selectedShipType === this.inventory[i].type) {
        this.inventory[i].isPlaced = true;
        this.inventory[i].x.push(x);
        this.inventory[i].y.push(y);
      }
    }
  },

  buildButton() {
    location.reload();
  },

  createPopUp(textContent) {
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    const heading = document.createElement("h1");
    heading.textContent = textContent;

    const h2 = document.createElement("h2");
    h2.textContent = "Play again?";

    const button = document.createElement("button");
    button.textContent = "Play again";
    button.addEventListener("click", () => {
      this.buildButton();
    });

    overlay.appendChild(heading);
    overlay.appendChild(h2);
    overlay.appendChild(button);

    document.body.appendChild(overlay);

    return overlay;
  },

  serverWon() {
    const overlay = this.createPopUp("The server wins...");
    return overlay;
  },

  playerWon() {
    const overlay = this.createPopUp("You win!");
    return overlay;
  },
};
