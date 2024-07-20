async function createCellContent(type) {
    var content = '';
    var record = await window.api.GetRecord('type', type);

    if (Object.keys(record).length !== 0) {
        for (const [index, id] of record.ID.entries()) {
            var name = await window.api.GetName('ID', record.nameID[index]);
            if (Object.keys(name).length !== 0) {
                content += `<P>${name.name[0]}</p>`;
            } else {
                content += '<p>名前未登録</p>';
            }
        }
    }

    return content;
}

function createCell(display,linkNumber) {
    var cell = document.createElement('td');
    var url = `window.location.href='../form/form.html?type=${linkNumber}&display=${display}'`;
    cell.setAttribute('onclick', url);
    cell.innerHTML = `<span>${display}</span>`;
    
    return cell;
}

async function createTable() {
    var table = document.createElement('table');
    var numbers = Array.from({ length: 31 }, (_, index) => index + 1);
    var rows = [];

    while (numbers.length > 0) {
        rows.push(numbers.splice(0, 7));
    }

    for (const rowNumbers of rows) {
        var row = table.insertRow();
        
        for (const number of rowNumbers) {
            var cell = createCell(number,-1*number);
            cell.innerHTML += await createCellContent(-1*number);
            row.appendChild(cell);
        }
    }

    return table;
}

async function createOtherTable() {
    var table = document.createElement("table");

    //1行目
    var weekRow = table.insertRow();
    var daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

    for (const [i, day] of daysOfWeek.entries()) {
        var cell = createCell(daysOfWeek[i],i + 1);
        cell.innerHTML += await createCellContent(i + 1);
        weekRow.appendChild(cell);
    }

    table.appendChild(weekRow);

    //2行目
    var dataRow2 = document.createElement("tr");
    
    var dailyDateCell = createCell('毎日',0);
    dailyDateCell.innerHTML += await createCellContent(0);
    dataRow2.appendChild(dailyDateCell);

    var lastDayOfMonthCell = createCell('月末',8);
    lastDayOfMonthCell.innerHTML += await createCellContent(8);
    dataRow2.appendChild(lastDayOfMonthCell);

    table.appendChild(dataRow2);

    return table;
}

window.addEventListener("load", async function (event) {
    document.getElementById('otherTable').appendChild(await createOtherTable());
    document.getElementById('DateTable').appendChild(await createTable());

});

save.addEventListener("click", async function (event) {
    var result = confirm("保存しますか？");
    if (result) {
        await window.api.WriteCSV();
    }
    
});
