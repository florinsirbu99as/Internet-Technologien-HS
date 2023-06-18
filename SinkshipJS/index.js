window.addEventListener("load", () => {
  SinkShip.init();
  SinkShip.shipHandler();
  SinkShip.buildInventory();
});

const limiter = document.createElement("div");
limiter.classList.add("limiter");

let SinkShip = {
  playerField: [],
  ComputerField: [],
  inventory: [],
  selectedShipType: "",
  selectedShipOrientation: "",
  selectedShipSize: "",

  init() {
    document.body.appendChild(this.makeHeader());
    document.body.appendChild(this.makeMain());
    document.body.appendChild(this.makeFooter());
    this.shipHandler();
    this.buildInventory();
  },
  makeHeader() {
    const header = document.createElement("header");
    header.innerHTML = `
        <h1>Sink Ship</h1>
        <h4>by Florin Alexandru Siru</h4>
      `;
    header.appendChild(limiter);
    return header;
  },
  makeMain() {
    const main = document.createElement("main");
    const controls = this.makeControls();
    const fields = this.makeDiv("fields");
    const playerField = this.makeField();
    const computerField = this.buildMenu();

    playerField.id = "playerfield";
    computerField.id = "computerfield";

    fields.appendChild(playerField.field);
    fields.appendChild(computerField);
    //fields.appendChild(computerField.field);
    main.appendChild(controls);
    main.appendChild(fields);

    this.playerField = playerField.Field;
    this.ComputerField = computerField.Field;

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
    controls.appendChild(this.makeButton("Build"));
    controls.appendChild(this.makeButton("Play"));
    return controls;
  },
  makeButton(label) {
    const button = document.createElement("button");
    button.innerHTML = label;
    return button;
  },
  buildMenu() {
    const computerField = this.makeDiv("field");
    computerField.classList.add("field");
    const table = document.createElement("table");

    computerField.appendChild(table);
    table.appendChild(this.makeTableHeader("Number"));
    table.appendChild(this.makeTableHeader("Type"));
    table.appendChild(this.makeTableHeader("Size"));
    table.appendChild(this.makeTableBody());

    return computerField;
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
    } else if (data[0] === "cruiser") {
      size = 7;
    } else if (data[0] === "destroyer") {
      size = 8;
    } else if (data[0] === "submarine") {
      size = 9;
    }
    this.showAvaliablePosition(x, y, size, playerField, data);
  },

  showAvaliablePosition(x, y, size, playerField, data) {
    if (
      !playerField[y][x].classList.contains("horizontal") &&
      !playerField[y][x].classList.contains("vertical") &&
      !playerField[y][x].classList.contains("left") &&
      !playerField[y][x].classList.contains("right") &&
      !playerField[y][x].classList.contains("top") &&
      !playerField[y][x].classList.contains("bottom")
    ) {
      if (data[1] === "h") {
        if (x < size) {
          playerField[y][x].style.backgroundColor = "green";
          playerField[y][x].className = "cell usable";
        } else {
          playerField[y][x].style.backgroundColor = "grey";
          playerField[y][x].className = "cell disabled";
        }
      } else if (data[1] === "v") {
        if (y < size) {
          playerField[y][x].style.backgroundColor = "green";
          playerField[y][x].className = "cell usable";
        } else {
          playerField[y][x].style.backgroundColor = "grey";
          playerField[y][x].className = "cell disabled";
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
            this.isShipAdjacentOrColliding(
              this.selectedShipOrientation,
              this.selectedShipSize,
              this.selectedShipType
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

  resetCells() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
      cell.classList.remove("usable", "disable");
      cell.classList.remove("w", "h");
      cell.removeEventListener("click", this.cellClickHandler);
    });
  },

  buildInventory() {
    this.inventory = [
      { type: "battleship", size: "5", available: 1, isPlaced: false },
      { type: "cruiser", size: "4", available: 2, isPlaced: false },
      { type: "destroyer", size: "3", available: 3, isPlaced: false },
      { type: "submarine", size: "2", available: 4, isPlaced: false },
    ];
  },

  getNextFreeShip(data) {
    this.saveShipData(data);
    for (let i = 0; i < this.inventory.length; i++) {
      if (data[0] === this.inventory[i].type) {
        if (this.inventory[i].available <= 0) {
          this.hideShip(data);
          return 0;
        } else {
          console.log(data[0]);
          this.inventory[i].available -= 1;
          console.log(this.inventory[i].available);
        }
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
  },

  isShipAdjacentOrColliding(className, shipSize) {
    for(let y = 0; y )
    console.log("plaziert");
    return false;
  },
};
