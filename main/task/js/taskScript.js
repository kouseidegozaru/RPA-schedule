
// セルを作成する関数
function createCell(row, value) {
    var cell = row.insertCell();
    cell.innerHTML = value;
    return cell;
}

//レコードの削除
async function deleteNameRecord(id){
    var result = confirm("削除しますか？");
    if (result) {
        await window.api.DeleteNameRecord(id);
        location.reload();
    }
}

// JSONデータをテーブルに変換する関数
function jsonToTable(jsonData) {
    var table = document.createElement("table");

    if (Object.keys(jsonData).length !== 0) {
        var headerRow = table.insertRow();
        createCell(headerRow, 'タスク名');

        jsonData.ID.forEach(async (id, index) => {
            var row = table.insertRow();
            
            var name = jsonData.name[index];

            if (Object.keys(name).length !== 0) {
                createCell(row, name);
            } else {
                createCell(row, '名前未登録');
            }
            createCell(row, `<button onclick="deleteNameRecord(${id})">削除</button>`);
        });
    } else {
        table.innerHTML = '名前が未登録です';
    }

    return table;
}

// ページがロードされた時の処理
window.addEventListener("load", async function (event) {
    //task名の描画
    var record = await window.api.GetAllName();
    document.getElementById('table-container').appendChild(jsonToTable(record));

    //テキストボックスにフォーカス
    document.getElementById("taskName").focus();

});

//レコードの追加
addButton.addEventListener("click", async function (event) {

    const name = document.getElementById("taskName").value;

    if(name != ''){
        await window.api.AddNameRecord(name);
        location.reload();
    }
});
