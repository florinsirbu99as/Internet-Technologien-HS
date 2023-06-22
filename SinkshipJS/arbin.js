window.addEventListener("load", () => {
  SinkShip.init();
  SinkShip.ShipHandler();
  SinkShip.BuildInventory();
});

const SinkShip = {
  playerField: [],
  PcField: [],
  selectedShipOrientation: "",
  selectedShipSize: "",
  selectedShipType: "",
  playButtonPressed: false,
  init() {
    document.body.appendChild(this.MakeHeader());
    document.body.appendChild(this.MakeMain());
    document.body.appendChild(this.MakeFooter());
  },
  MakeHeader() {
    const header = document.createElement("header");

    const limiter = document.createElement("div");
    limiter.classList.add("limiter");
    header.appendChild(limiter);

    const headline = document.createElement("h1");
    headline.textContent = "Sink Ship";
    limiter.appendChild(headline);

    const subheading = document.createElement("h4");
    subheading.textContent = "By Arbin Klinaku 767351";
    limiter.appendChild(subheading);

    return header;
  },
  MakeMain() {
    const main = document.createElement("main");

    const limiter = document.createElement("div");
    limiter.classList.add("limiter");
    main.appendChild(limiter);

    const DDiv = this.MakeDiv("controls");

    const controls = this.MakeControls();
    DDiv.appendChild(controls);

    limiter.appendChild(DDiv);

    const message = this.MakeDiv("message");
    message.id = "message";
    limiter.appendChild(message);

    const fields = this.MakeDiv("fields");
    limiter.appendChild(fields);

    const playerField = this.MakeField();
    playerField.id = "playerField";
    fields.appendChild(playerField.field);

    const pcField = this.BuildMenu();
    pcField.id = "PcField";
    fields.appendChild(pcField);

    this.playerField = playerField.Field;
    this.pcField = pcField.Field;

    this.messageElement = message;

    return main;
  },

  MakeFooter() {
    const footer = document.createElement("footer");

    const limiter = document.createElement("div");
    limiter.classList.add("limiter");
    footer.appendChild(limiter);

    return footer;
  },
  MakeDiv(className) {
    const divElement = document.createElement("div");
    divElement.classList.add(className);
    return divElement;
  },

  MakeField() {
    const field = this.MakeDiv("field");
    const Field = [];

    for (let y = 0; y < 10; y++) {
      const row = [];
      for (let x = 0; x < 10; x++) {
        const cell = this.MakeDiv("cell");
        row.push(cell);
        field.appendChild(cell);
      }
      Field.push(row);
    }

    return { field, Field };
  },

  MakeControls() {
    let playButtonPressed = false;
    const controls = this.MakeDiv("controls");

    const button1 = document.createElement("button");
    button1.textContent = "Build";
    button1.id = "button1";
    button1.addEventListener("click", () => {
      this.BuildButton();
    });
    controls.appendChild(button1);

    const button3 = document.createElement("button");
    button3.textContent = "AutoPlace";
    button3.id = "button3";
    button3.addEventListener("click", () => {
      this.AutoPlace();
    });
    controls.appendChild(button3);

    const button2 = document.createElement("button");
    button2.textContent = "Play";
    button2.id = "button2";
    button2.disabled = true;
    button2.addEventListener("click", () => {
      this.playButtonPressed = true;
      this.PlayButton(this.MakeField.bind(this));
    });
    controls.appendChild(button2);

    return controls;
  },

  BuildMenu() {
    const pcField = this.MakeDiv("field");

    const table = document.createElement("table");
    const th = this.MakeTableHead();
    table.appendChild(th);

    const td = this.MakeTableBody();
    table.appendChild(td);

    pcField.appendChild(table);

    return pcField;
  },
  MakeTableHead() {
    const thead = document.createElement("thead");
    const tableRow = document.createElement("tr");

    const numberCell = document.createElement("th");
    numberCell.textContent = "Number";
    tableRow.appendChild(numberCell);

    const emptyCell1 = document.createElement("th");
    tableRow.appendChild(emptyCell1);

    const emptyCell2 = document.createElement("th");
    tableRow.appendChild(emptyCell2);

    const typeCell = document.createElement("th");
    typeCell.textContent = "Type";
    tableRow.appendChild(typeCell);

    const sizeCell = document.createElement("th");
    sizeCell.textContent = "Size";
    tableRow.appendChild(sizeCell);

    thead.appendChild(tableRow);

    return thead;
  },

  MakeTableBody() {
    const tbody = document.createElement("tbody");

    const rowData = [
      {
        number: "1",
        class1: "battleship",
        class2: "h",
        class3: "w",
        type: "Battleship",
        size: "5",
      },
      {
        number: "2",
        class1: "cruiser",
        class2: "h",
        class3: "w",
        type: "Cruiser",
        size: "4",
      },
      {
        number: "3",
        class1: "destroyer",
        class2: "h",
        class3: "w",
        type: "Destroyer",
        size: "3",
      },
      {
        number: "4",
        class1: "submarine",
        class2: "h",
        class3: "w",
        type: "Submarine",
        size: "2",
      },
    ];

    rowData.forEach((data) => {
      const row = document.createElement("tr");

      const numberCell = document.createElement("td");
      numberCell.textContent = data.number;
      row.appendChild(numberCell);

      const emptyCell1 = document.createElement("td");
      emptyCell1.classList.add(data.class1, data.class2);
      emptyCell1.addEventListener("click", () => {
        this.renameFirstCell(data.class2, data.size, data.type);
      });
      row.appendChild(emptyCell1);

      const emptyCell2 = document.createElement("td");
      emptyCell2.classList.add(data.class1, data.class3);
      emptyCell2.addEventListener("click", () => {
        this.renameFirstCell(data.class3, data.size, data.type);
      });

      row.appendChild(emptyCell2);

      const typeCell = document.createElement("td");
      const typeDiv = document.createElement("div");
      typeDiv.textContent = data.type;
      typeCell.appendChild(typeDiv);
      row.appendChild(typeCell);

      const sizeCell = document.createElement("td");
      sizeCell.textContent = data.size;
      row.appendChild(sizeCell);

      tbody.appendChild(row);
    });

    return tbody;
  },

  renameFirstCell(className, shipSize, shipType) {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
      cell.classList.remove("usable", "disable");
      cell.removeEventListener("click", this.cellClickHandler);
    });

    const availableShips = this.inventory.find(
      (ship) => ship.type === shipType
    );
    if (availableShips && availableShips.available > 0) {
      availableShips.available--;

      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          const isPlaceable = this.ShipPosition(className, shipSize, x, y);
          const cell = this.playerField[x][y];

          if (
            isPlaceable &&
            !this.isShipAdjacentOrColliding(className, shipSize, x, y)
          ) {
            cell.classList.remove(
              "left",
              "right",
              "top",
              "bottom",
              "horizontal",
              "vertical"
            );
            cell.classList.add("usable", className);
            cell.addEventListener("click", this.cellClickHandler);
          } else {
            cell.classList.add("disable");
          }
        }
      }

      this.selectedShipOrientation = className;
      this.selectedShipSize = shipSize;
      this.selectedShipType = shipType;
    } else {
      const tableRows = document.querySelectorAll("tbody tr");
      tableRows.forEach((row) => {
        const typeDiv = row.querySelector("td div");
        if (typeDiv.textContent === shipType) {
          const cells = row.querySelectorAll(".w, .h");
          cells.forEach((cell) => {});
        }
      });
    }

    if (availableShips && availableShips.available === 1) {
      const tableRows = document.querySelectorAll("tbody tr");
      tableRows.forEach((row) => {
        const typeDiv = row.querySelector("td div");
        if (typeDiv.textContent === shipType) {
          const cells = row.querySelectorAll(".w, .h");
          cells.forEach((cell) => {
            if (cell.classList.contains("w")) {
              cell.classList.add("off");
            } else if (cell.classList.contains("h")) {
              cell.classList.add("off");
            }
          });
          // Enable play button if there are no ships left

          const battleshipCount = this.inventory.find(
            (ship) => ship.type === "Battleship"
          ).available;
          const cruiserCount = this.inventory.find(
            (ship) => ship.type === "Cruiser"
          ).available;
          const destroyerCount = this.inventory.find(
            (ship) => ship.type === "Destroyer"
          ).available;
          const submarineCount = this.inventory.find(
            (ship) => ship.type === "Submarine"
          ).available;

          if (
            battleshipCount === 1 &&
            cruiserCount === 1 &&
            destroyerCount === 1 &&
            submarineCount === 1
          ) {
            const playButton = document.getElementById("button2");
            playButton.disabled = false;
          }
        }
      });
    }
  },

  isShipAdjacentOrColliding(className, shipSize, x, y) {
    const endX = x + (className === "h" ? shipSize - 1 : 0);
    const endY = y + (className === "w" ? shipSize - 1 : 0);

    for (let i = x - 1; i <= endX + 1; i++) {
      for (let j = y - 1; j <= endY + 1; j++) {
        if (i >= 0 && i < 10 && j >= 0 && j < 10) {
          const cell = this.playerField[i][j];
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

  ShipHandler() {
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const cell = this.playerField[y][x];
        cell.addEventListener("click", () => {
          if (cell.classList.contains("usable")) {
            console.log(`Ship start: X: ${x}, Y: ${y}`);
            console.log(
              `Orientation: ${this.selectedShipOrientation}, Size: ${this.selectedShipSize}, Type: ${this.selectedShipType}`
            );

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
              const removedShipType = this.selectedShipType;
              const shipCells = [];
              if (this.selectedShipOrientation === "w") {
                for (let i = 0; i < this.selectedShipSize; i++) {
                  const shipCell = this.playerField[y][x + i];
                  shipCells.push(shipCell);
                }
              } else if (this.selectedShipOrientation === "h") {
                for (let i = 0; i < this.selectedShipSize; i++) {
                  const shipCell = this.playerField[y + i][x];
                  shipCells.push(shipCell);
                }
              }

              shipCells.forEach((shipCell) => {
                shipCell.addEventListener("click", () => {
                  if (!this.isShipPlaced(shipCells)) {
                    return;
                  }
                  const clickedIndex = shipCells.indexOf(shipCell);

                  shipCells.forEach((cell) => {
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
                  if (removedShip) {
                    removedShip.available++;

                    if (removedShip.available === 2) {
                      const tableRows = document.querySelectorAll("tbody tr");
                      tableRows.forEach((row) => {
                        const typeDiv = row.querySelector("td div");
                        if (typeDiv.textContent === removedShipType) {
                          const cells = row.querySelectorAll(".w, .h");
                          cells.forEach((cell) => {
                            cell.classList.remove("off");
                          });
                        }
                      });
                    }
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
      cell.classList.remove("usable", "disable");
      cell.classList.remove("w", "h");
      cell.removeEventListener("click", this.cellClickHandler);
    });
  },

  BuildInventory() {
    this.inventory = [
      { type: "Battleship", size: "5", available: 2, placed: false },
      { type: "Cruiser", size: "4", available: 3, placed: false },
      { type: "Destroyer", size: "3", available: 4, placed: false },
      { type: "Submarine", size: "2", available: 5, placed: false },
    ];
  },

  BuildButton() {
    location.reload();
  },

  async PlayButton(makeFieldFunc) {
    const pcField = document.getElementById("PcField");
    pcField.parentNode.removeChild(pcField);

    const newPcField = this.MakeField();
    newPcField.field.id = "PcField";

    const fields = document.querySelector(".fields");
    fields.appendChild(newPcField.field);

    this.ChangeField();

    const auto = document.getElementById("button3");
    auto.disabled = true;
    const field = document.getElementsByClassName("field")[0];
    field.id = "playerField";

    this.SendStart();
  },

  ChangeField() {
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
      } else if (cell.parentElement.id != "PcField") {
        cell.classList.add("water");
        cell.removeEventListener("click", this.cellClickHandler);
      } else {
        cell.classList.remove("shootable");
        cell.classList.add("off");
        cell.removeEventListener("click", this.cellClickHandler);
      }
    });
  },

  resetFieldCells() {
    this.playerField.forEach((row) => {
      row.forEach((cell) => {
        cell.classList.remove(
          "left",
          "right",
          "top",
          "bottom",
          "horizontal",
          "vertical",
          "usable",
          "disable",
          "top2",
          "bottom2",
          "left2",
          "right2",
          "water"
        );

        const pcField = document.getElementById("PcField");
        pcField.parentNode.removeChild(pcField);

        const fields = document.querySelector(".fields");
        const newPcField = this.BuildMenu();
        newPcField.id = "PcField";
        fields.appendChild(newPcField);

        cell.removeEventListener("click", this.cellClickHandler);
      });
    });
  },

  resetInventory() {
    this.inventory.forEach((ship) => {
      switch (ship.type) {
        case "Battleship":
          ship.available = 2;
          break;
        case "Cruiser":
          ship.available = 3;
          break;
        case "Destroyer":
          ship.available = 4;
          break;
        case "Submarine":
          ship.available = 5;
          break;

        default:
          break;
      }

      if (
        ship.available === 2 ||
        ship.available === 3 ||
        ship.available === 4 ||
        ship.available === 5
      ) {
        const tableRows = document.querySelectorAll("tbody tr");
        tableRows.forEach((row) => {
          const typeDiv = row.querySelector("td div");
          if (typeDiv.textContent === ship.type) {
            const cells = row.querySelectorAll(".w, .h");
            cells.forEach((cell) => {
              cell.classList.remove("off");
            });
          }
        });
      }
    });
  },

  AutoPlace() {
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

    this.resetFieldCells();
    this.resetInventory();

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

    updateInventoryClasses.call(this);

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

    function updateInventoryClasses() {
      const inventoryShips = [
        battleshipType,
        cruiserType,
        destroyerType,
        submarineType,
      ];

      inventoryShips.forEach((shipType) => {
        const ship = this.inventory.find((ship) => ship.type === shipType);
        if (ship && ship.available === 1) {
          const tableRows = document.querySelectorAll("tbody tr");
          tableRows.forEach((row) => {
            const typeDiv = row.querySelector("td div");
            if (typeDiv.textContent === shipType) {
              const cells = row.querySelectorAll(".w, .h");
              cells.forEach((cell) => {
                cell.classList.add("off");
              });
            }
          });
        }
      });
    }
    const but = document.getElementById("button2");
    but.disabled = false;
  },

  async FetchAndDecode(query) {
    return fetch(
      "https://www2.hs-esslingen.de/~melcher/internet-technologien/sinkship/?" +
        query
    ).then((response) => response.json());
  },

  async SendStart() {
    const request = "request=start&userid=arklit00";

    const response = await this.FetchAndDecode(request);

    console.log(response);

    this.token = response.token;
    this.messageElement.textContent = response.statusText;

    this.MakeShot();
  },
  FieldsChange() {
    const pcFieldCells = document.querySelectorAll("#PcField .cell");

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const index = y * 10 + x;
        const cell = pcFieldCells[index];

        cell.classList.replace("off", "shootable");
      }
    }
  },

  MakeShot() {
    const pcFieldCells = document.querySelectorAll("#PcField .cell");

    pcFieldCells.forEach((cell) => {
      const clickHandler = cell._clickHandler;
      if (clickHandler) {
        cell.removeEventListener("click", clickHandler);
        delete cell._clickHandler;
      }
    });

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const index = y * 10 + x;
        const cell = pcFieldCells[index];

        const clickHandler = () => {
          this.ChangeField();
          this.SendShot(y, x, cell);
          cell.removeEventListener("click", cell._clickHandler);
        };

        cell.addEventListener("click", clickHandler);
        cell._clickHandler = clickHandler;
        cell.classList.replace("off", "shootable");
      }
    }
  },

  async SendShot(y, x, cell) {
    const request = `request=shoot&token=${this.token}&x=${x}&y=${y}`;
    const response = await this.FetchAndDecode(request);

    console.log(response);

    this.messageElement.textContent = response.statusText;

    this.FieldsChange();

    if (response.state === 1) {
      if (response.statusText === "You have sunk a ship - shoot again") {
        cell.classList.replace("shootable", "hitLast");
      } else {
        cell.classList.replace("shootable", "hit");
      }
    } else if (response.state === 2) {
      cell.classList.replace("shootable", "water");
      const coordinates = await this.GetShotCoordinates();
      const result = this.FindHit(coordinates);
      this.SendResult(result);
    } else if (response.state === 4) {
      cell.classList.replace("shootable", "hitLast");
      this.PlayerWon();
    }
  },

  async GetShotCoordinates() {
    const request = `request=getshotcoordinates&token=${this.token}`;
    let response = await this.FetchAndDecode(request);

    // no already used coordinates
    const usedCoordinates = [];

    while (usedCoordinates.includes(`${response.y},${response.x}`)) {
      response = await this.FetchAndDecode(request);
    }

    usedCoordinates.push(`${response.y},${response.x}`);

    console.log(response);

    return { y: response.y, x: response.x };
  },

  async SendResult(result) {
    const request = `request=sendingresult&token=${this.token}&result=${result}`;
    const response = await this.FetchAndDecode(request);

    console.log(response);

    if (result === 0) {
      this.MakeShot();
    } else if (result === 1) {
      const coordinates = await this.GetShotCoordinates();
      const newResult = this.FindHit(coordinates);
      this.SendResult(newResult);
    } else if (result === 2) {
      this.ServerWon();
    }

    this.messageElement.textContent = response.statusText;
  },

  ServerWon() {
    const overlay = this.MakeDiv("overlay");

    const heading = document.createElement("h1");

    const h2 = document.createElement("h2");

    const button = document.createElement("button");

    heading.textContent = "The Server Won...";
    h2.textContent = "Play again?";
    button.textContent = "Play again";

    button.addEventListener("click", () => {
      this.Replay();
    });

    overlay.appendChild(heading);
    overlay.appendChild(h2);
    overlay.appendChild(button);

    document.body.appendChild(overlay);

    return overlay;
  },

  PlayerWon() {
    const overlay = this.MakeDiv("overlay");

    const heading = document.createElement("h1");

    const h2 = document.createElement("h2");

    const button = document.createElement("button");

    heading.textContent = "You Won!";
    h2.textContent = "Play again?";
    button.textContent = "Play again";

    button.addEventListener("click", () => {
      this.Replay();
    });

    overlay.appendChild(heading);
    overlay.appendChild(h2);
    overlay.appendChild(button);

    document.body.appendChild(overlay);

    return overlay;
  },

  Replay() {
    location.reload();
  },

  SunkShip(yShot, xShot) {
    const playerFieldCells = document.querySelectorAll("#playerField .cell");

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

  FindHit(coordinates) {
    const playerFieldCells = document.querySelectorAll("#playerField .cell");
    const { y: yShot, x: xShot } = coordinates;
    const cell = playerFieldCells[yShot * 10 + xShot];
    const shipSunk = this.SunkShip(yShot, xShot);

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
};
