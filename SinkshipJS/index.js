window.addEventListener("load", () => {
  SinkShip.init();
});

const limiter = document.createElement("div");
limiter.classList.add("limiter");

const playerFieldArray = [];
const computerFieldArray = [];

let SinkShip = {
  playerField: [],
  ComputerField: [],
  init() {
    document.body.appendChild(this.makeHeader());
    document.body.appendChild(this.makeMain());
    document.body.appendChild(this.makeFooter());
    this.launchShip();
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
    const computerField = this.BuildMenu();

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
  BuildMenu() {
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
    } else {
      td.innerHTML = data;
    }
    return td;
  },

  launchShip() {
    this.playerField[0][0].classList.add("left");
    this.playerField[0][1].classList.add("horizontal");
    this.playerField[0][2].classList.add("horizontal");
    this.playerField[0][3].classList.add("right");
  },
};
