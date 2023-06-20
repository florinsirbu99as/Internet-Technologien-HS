window.addEventListener("load", () => {
    SinkShip.init();
    SinkShip.ShipHandler();
    SinkShip.BuildInventory();
  });

  const SinkShip = {
    playerField: [],
    pcField: [],
    selectedShipOrientation: "",
    selectedShipSize: "",
    selectedShipType: "",
    playButtonPressed: false,
    init() {
      const body = document.querySelector("body");
      body.appendChild(this.MakeHeader());
      body.appendChild(this.MakeMain());
      body.appendChild(this.MakeFooter());
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

      const controls = this.MakeControls();
      limiter.appendChild(controls);

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
      const pcField =.    this.MakeField();
      const ships = [
        { type: "carrier", size: 5 },
        { type: "battleship", size: 4 },
        { type: "cruiser", size: 3 },
        { type: "submarine", size: 3 },
        { type: "destroyer", size: 2 },
      ];

      const menu = this.MakeDiv("menu");

      ships.forEach((ship) => {
        const menuItem = document.createElement("div");
        menuItem.classList.add("menu-item");
        menuItem.textContent = `${ship.type} (${ship.size})`;
        menuItem.addEventListener("click", () => {
          this.SelectShip(ship);
        });
        menu.appendChild(menuItem);
      });

      return { menu, Field: [] };
    },

    SelectShip(ship) {
      this.selectedShipType = ship.type;
      this.selectedShipSize = ship.size;

      const menuItems = document.querySelectorAll(".menu-item");
      menuItems.forEach((menuItem) => {
        menuItem.classList.remove("selected");
      });

      const selectedMenuItem = document.querySelector(
        `.menu-item:contains(${ship.type})`
      );
      selectedMenuItem.classList.add("selected");
    },

    BuildInventory() {
      const inventory = document.querySelector(".inventory");
      inventory.textContent = "";

      const ships = [
        { type: "carrier", size: 5 },
        { type: "battleship", size: 4 },
        { type: "cruiser", size: 3 },
        { type: "submarine", size: 3 },
        { type: "destroyer", size: 2 },
      ];

      ships.forEach((ship) => {
        const inventoryItem = document.createElement("div");
        inventoryItem.classList.add("inventory-item");
        inventoryItem.textContent = `${ship.type} (${ship.size})`;
        inventory.appendChild(inventoryItem);
      });
    },

    BuildButton() {
      if (this.selectedShipType && this.selectedShipSize) {
        const field = document.getElementById("playerField");
        const inventory = document.querySelector(".inventory");
        const inventoryItems = inventory.querySelectorAll(".inventory-item");

        inventoryItems.forEach((item) => {
          if (item.textContent.includes(this.selectedShipType)) {
            item.remove();
          }
        });

        const selectedMenuItem = document.querySelector(".menu-item.selected");

        if (selectedMenuItem) {
          selectedMenuItem.remove();
        }

        field.classList.add("building");

        field.addEventListener("click", (e) => {
          const cell = e.target;

          if (cell.classList.contains("cell")) {
            const coordinates = this.GetCoordinates(cell);

            if (this.CanPlaceShip(coordinates)) {
              this.PlaceShip(coordinates);
              this.CheckReady();
            }
          }
        });
      }
    },

    GetCoordinates(cell) {
      const row = Array.from(cell.parentNode.children).indexOf(cell);
      const column = Array.from(cell.parentNode.parentNode.children).indexOf(
        cell.parentNode
      );

      return { row, column };
    },

    CanPlaceShip(coordinates) {
      const { row, column } = coordinates;
      const { selectedShipSize, selectedShipOrientation } = this;

      if (selectedShipOrientation === "horizontal") {
        for (let i = 0; i < selectedShipSize; i++) {
          const cell = this.playerField[row][column + i];

          if (!cell || cell.classList.contains("ship")) {
            return false;
          }
        }
      } else if (selectedShipOrientation === "vertical") {
        for (let i = 0; i < selectedShipSize; i++) {
          const cell = this.playerField[row + i][column];

          if (!cell || cell.classList.contains("ship")) {
            return false;
          }
        }
      }

      return true;
    },

    PlaceShip(coordinates) {
      const { row, column } = coordinates;
      const { selectedShipSize, selectedShipOrientation } = this;

      if (selectedShipOrientation === "horizontal") {
        for (let i = 0; i < selectedShipSize; i++) {
          const cell = this.playerField[row][column + i];
          cell.classList.add("ship");
        }
      } else if (selectedShipOrientation === "vertical") {
        for (let i = 0; i < selectedShipSize; i++) {
          const cell = this.playerField[row + i][column];
          cell.classList.add("ship");
        }
      }

      this.selectedShipType = null;
      this.selectedShipSize = null;
      this.selectedShipOrientation = null;
    },

    CheckReady() {
      const readyButton = document.querySelector(".ready-button");
      const ships = this.playerField.flat().filter((cell) =>
        cell.classList.contains("ship")
      );

      if (ships.length === 17) {
        readyButton.removeAttribute("disabled");
      }
    },
  };

  const game = new BattleshipGame();
  game.StartGame();

