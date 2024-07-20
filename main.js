const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const DataFrame = require('dataframe-js').DataFrame;
const fs = require('fs').promises;
const Papa = require('papaparse');

// ファイルパス
const csvDir = __dirname + '/../csvFiles'
const csvFilePath = csvDir + '/schedule.csv';
const nameFilePath = csvDir + '/name.csv';

//ヘッダー情報
const csvHeader = 'ID,time,nameID,type';
const addHeader = ['ID','time','nameID','type'];
const nameHeader = 'ID,name';
const addNameHeader = ['ID','name'];


// グローバル変数
let mainWindow = null;
let scheduleDataFrame;
let nameDataFrame;
let saveState = true; //trueが保存済み

// ウィンドウ作成
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: __dirname + '/preload.js',
      devTools: false//true
    },
  });

  mainWindow.loadURL('file://' + __dirname + '/main/home/index.html');
  mainWindow.webContents.openDevTools();

  // ×ボタンが押された際のイベント処理
  mainWindow.on('close', (event) => {
      // イベントのデフォルト動作を防ぐ
      event.preventDefault();

      //変更があったか
      if(saveState == false){
  
        // メッセージボックスを表示
        const choice = dialog.showMessageBoxSync(mainWindow, {
          type: 'question',
          buttons: ['キャンセル','変更を保存する', '保存せず閉じる(内容は破棄されます)'],
          title: 'メッセージ',
          message: '変更が保存されていません'
        });
    
        // 保存するか
        if (choice === 1) {
          WriteCSVFile();
          mainWindow.destroy();
        }if (choice === 2) {
          mainWindow.destroy();
        } 

      }else{
        mainWindow.destroy();
      }
    });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
};

async function CheckFiles(){

  fs.access(csvDir, fs.constants.F_OK, async (err) => {
    if (err) {
      await fs.mkdir(csvDir);
    }
  });
  fs.access(csvFilePath, fs.constants.F_OK, async (err) => {
    if (err) {
      await fs.writeFile(csvFilePath, csvHeader);
    }
  });

  fs.access(nameFilePath, fs.constants.F_OK, async (err) => {
    if (err) {
      await fs.writeFile(nameFilePath, nameHeader);
    }
  });

}

// CSVを読み込むハンドラ
async function ReadCSV(){
  try {
    // スケジュールファイルの読み込み
    const scheduleData = await fs.readFile(csvFilePath, 'utf8');
    scheduleDataFrame = new DataFrame(Papa.parse(scheduleData, { header: true, dynamicTyping: true }).data);

    // 名前ファイルの読み込み
    const nameData = await fs.readFile(nameFilePath, 'utf8');
    nameDataFrame = new DataFrame(Papa.parse(nameData, { header: true, dynamicTyping: true }).data);

    return 'Successfully loaded CSV files!';
  } catch (error) {
    console.error('Error reading CSV file:', error);
    return 'Error reading CSV file.';
  }
}


// アプリが起動したときの処理
app.on('ready', async() => {
  await CheckFiles();
  await ReadCSV();
  createWindow();
});


// レコードを取得するハンドラ
ipcMain.handle('GetRecord', async (event, column, value) => {
  try {
    // 抽出
    const filteredDf = await scheduleDataFrame.filter(row => row.get(column) == value);
    // DataFrameをJSONに変換
    return filteredDf.toDict();

  } catch (error) {
    console.error('Error getting record:', error);
    return 'Error getting record.';
  }
});

// 名前を取得するハンドラ
ipcMain.handle('GetName', async (event, column, value) => {
  try {
    // 抽出
    const filteredDf = await nameDataFrame.filter(row => row.get(column) == value);
    // DataFrameをJSONに変換
    return filteredDf.toDict();
  } catch (error) {
    console.error('Error getting name:', error);
    return 'Error getting name.';
  }
});

// 全ての名前を取得するハンドラ
ipcMain.handle('GetAllName', async (event) => {
  try {
    // DataFrameをJSONに変換
    return nameDataFrame.toDict();
  } catch (error) {
    console.error('Error getting All name:', error);
    return 'Error getting All name.';
  }
});

//行の削除
ipcMain.handle('DeleteRecord', async (event, ID) => {
  try {
    // 削除
    scheduleDataFrame = await scheduleDataFrame.filter(row => row.get('ID') != ID);

    saveState = false;
    return 'Successfully Remove Record!'
  } catch (error) {
    console.error('Error Remove Record:', error);
    return 'Error Remove Record.';
  }
});

//行の追加
ipcMain.handle('AddRecord', async (event, nameID,time,type) => {
  var newIndex = 0;
  try {
    //追加するIDの取得
    const getID = await scheduleDataFrame.toDict().ID

    //最初のスケジュールかどうか(スケジュールが空の場合追加するとエラーになるため)
    if(getID == undefined){

      newIndex = 1;
      const data = [[newIndex,time,nameID,type]];
      scheduleDataFrame = new DataFrame(data, addHeader);

    }else{
      newIndex = Math.max.apply(null,getID) + 1;
      // 追加
      scheduleDataFrame = await scheduleDataFrame.push({'ID':newIndex,'time':time,'nameID':nameID,'type':type})
    }

    saveState = false;
    return 'Successfully Add Record!'
  } catch (error) {
    console.error('Error Add Record:', error);
    return 'Error Add Record.';
  }
});

//名前行の削除
ipcMain.handle('DeleteNameRecord', async (event, ID) => {
  try {
    // 削除
    nameDataFrame = await nameDataFrame.filter(row => row.get('ID') != ID);

    //テキストボックスにフォーカスできないバグの対処
    mainWindow.blur();
    mainWindow.focus();

    saveState = false;
    return 'Successfully Remove Name Record!'
  } catch (error) {
    console.error('Error Remove Name Record:', error);
    return 'Error Remove Name Record.';
  }
});

//名前行の追加
ipcMain.handle('AddNameRecord', async (event, name) => {
  var newIndex = 0;
  try {
    //追加するIDの取得
    const getID = await nameDataFrame.toDict().ID

    //最初のスケジュールかどうか(スケジュールが空の場合追加するとエラーになるため)
    if(getID == undefined){

      newIndex = 1;
      const data = [[newIndex,name]];
      nameDataFrame = new DataFrame(data, addNameHeader);

    }else{
      newIndex = Math.max.apply(null,getID) + 1;
      // 追加
      nameDataFrame = await nameDataFrame.push({'ID':newIndex,'name':name})
    }

    saveState = false;
    return 'Successfully Add Name Record!'
  } catch (error) {
    console.error('Error Add Name Record:', error);
    return 'Error Add Name Record.';
  }
});

//ファイルの保存
function WriteCSVFile(){
  try {
    // CSVに変換してファイルに書き込む
    scheduleDataFrame.toCSV(true, csvFilePath);
    nameDataFrame.toCSV(true, nameFilePath);

    saveState = true;
    return 'Successfully Write File!'
  } catch (error) {
    console.error('Error Write File:', error);
    return 'Error Write File.';
  }
}
ipcMain.handle('WriteCSV', async (event) => {
  return WriteCSVFile();
});

ipcMain.handle('SaveState', async (event,state) => {
  try {
    if(state == null){
      return saveState;
    }else{
      saveState = state;
      return 'Successfully Change Save State!'
    }

  } catch (error) {
    console.error('Error Save State:', error);
    return 'Error Save State.';
  }
});