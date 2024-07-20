const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  GetRecord: async (column,value) => {
    try {
      return await ipcRenderer.invoke('GetRecord',column,value);
    } catch (error) {
      console.error(error);
    }
  },
  GetName: async (column,value) => {
    try {
      return await ipcRenderer.invoke('GetName',column,value);
    } catch (error) {
      console.error(error);
    }
  },
  GetAllName: async () => {
    try {
      return await ipcRenderer.invoke('GetAllName');
    } catch (error) {
      console.error(error);
    }
  },
  DeleteRecord: async (ID) => {
    try {
      return await ipcRenderer.invoke('DeleteRecord',ID);
    } catch (error) {
      console.error(error);
    }
  },
  AddRecord: async (nameID,time,type) => {
    try {
      return await ipcRenderer.invoke('AddRecord',nameID,time,type);
    } catch (error) {
      console.error(error);
    }
  },
  DeleteNameRecord: async (ID) => {
    try {
      return await ipcRenderer.invoke('DeleteNameRecord',ID);
    } catch (error) {
      console.error(error);
    }
  },
  AddNameRecord: async (name) => {
    try {
      return await ipcRenderer.invoke('AddNameRecord',name);
    } catch (error) {
      console.error(error);
    }
  },
  WriteCSV: async () => {
    try {
      return await ipcRenderer.invoke('WriteCSV');
    } catch (error) {
      console.error(error);
    }
  },
  SaveState: async (state) => {
    try {
      return await ipcRenderer.invoke('SaveState',state);
    } catch (error) {
      console.error(error);
    }
  }
});
