let urlParameters;

// URLからクエリ文字列を取得する関数
function getParameters(url) {
    const queryString = url.split('?')[1];

    if (!queryString) {
        return {};
    }

    const params = {};
    const keyValuePairs = queryString.split('&');

    keyValuePairs.forEach(pair => {
        const [key, value] = pair.split('=');
        params[key] = decodeURIComponent(value);
    });

    return params;
}

// セルを作成する関数
function createCell(row, value) {
    var cell = row.insertCell();
    cell.innerHTML = value;
    return cell;
}

//レコードの削除
async function deleteRecord(id){
    var result = confirm("削除しますか？");
    if (result) {
        await window.api.DeleteRecord(id);
        location.reload();
    }
}

// JSONデータをテーブルに変換する関数
function jsonToTable(jsonData) {
    var table = document.createElement("table");

    if (Object.keys(jsonData).length !== 0) {
        var headerRow = table.insertRow();
        createCell(headerRow, 'タスク名');
        createCell(headerRow, '実行開始時間');

        jsonData.ID.forEach(async (id, index) => {
            var row = table.insertRow();
            
            var name = await window.api.GetName('ID', jsonData.nameID[index]);

            if (Object.keys(name).length !== 0) {
                createCell(row, name.name[0]);
            } else {
                createCell(row, '名前未登録');
            }
            createCell(row, jsonData.time[index]);
            createCell(row, `<button onclick="deleteRecord(${id})">削除</button>`);
        });
    } else {
        table.innerHTML = 'スケジュールが未登録です';
    }

    return table;
}

function jsonToSelect(jsonData) {
    // Select要素を取得
    var select = document.createElement("select");
    select.setAttribute('id', 'selected');
  
    // 選択肢をクリア
    select.innerHTML = '';
    if(jsonData != null){
        // JSONデータを反復処理してオプションを作成
        for (var i = 0; i < jsonData.ID.length; i++) {
        var option = document.createElement('option');
        option.value = jsonData.ID[i]; // JSONデータの値を取得
        option.text = jsonData.name[i];   // JSONデータの表示テキストを取得
        select.appendChild(option);      // オプションを追加
        }
    }
    return select;
}

// ページがロードされた時の処理
window.addEventListener("load", async function (event) {
    //urlパラメーターの取得
    const currentUrl = window.location.href;
    urlParameters = getParameters(currentUrl);

    //type名の表示
    var h2 = document.createElement("h2");
    h2.innerHTML = urlParameters.display;
    document.getElementById('typeName').appendChild(h2);

    //対象のtyoeのスケジュールの描画
    var record = await window.api.GetRecord('type', urlParameters.type);
    document.getElementById('table-container').appendChild(jsonToTable(record));

    //セレクトボックスの描画
    var names = await window.api.GetAllName();
    document.getElementById('selectName').appendChild(jsonToSelect(names))
});

//レコードの追加
addButton.addEventListener("click", async function (event) {

    const nameID = document.getElementById("selected").value;
    var time = document.getElementById("timeInput").value;
    const type = urlParameters.type;

    if(nameID != '' && time != ''){
        time = time + ':00';
        await window.api.AddRecord(nameID,time,type);
        location.reload();
    }
});
