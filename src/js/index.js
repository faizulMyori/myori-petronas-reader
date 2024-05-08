let { remote } = require("electron");
import { read } from './utils/myori-reader.js';

// PLC Function
const net = require('net');
const client = new net.Socket();
var isPLCConnected = false;
// var s1PLCData = false;
// var myTimeout
client.on('data', (data) => {
  document.getElementById('plc_data').innerHTML = data.toString();
});

client.on('close', () => {
  isPLCConnected = false;
  document.getElementById('plc_status').innerHTML = 'Connecting...';
startServer()
});

client.on('error', (err) => {
  console.log(err);
  isPLCConnected = false;
  document.getElementById('plc_status').innerHTML = 'Connecting...';
});

const startServer = () => {
    client.connect(9000, '169.254.132.10', () => {
      isPLCConnected = true;
      document.getElementById('plc_status').innerHTML = 'Connected';
      document.getElementById('plc_status').style.color = 'green';
    });
};

const sendData = (message) => {
  console.log(message)
  // client.write(message);
};

startServer();

document.getElementById('submitPlc').addEventListener('click', () => {
  sendData(document.getElementById('writeToPLC').value);
})

// NFC Function
const { NFC } = require('nfc-pcsc');
const nfc = new NFC();
const nfcCard = require('nfccard-tool');
var readerOpt = [];

nfc.on('reader', reader => {
    readerOpt.push(reader);
    var readers = document.getElementsByClassName('nfc_list')
    
    for (let r of readers) {
        var opt = document.createElement('option');
        opt.value = reader.name;
        opt.innerHTML = reader.name;
        if (!reader.name.includes("SAM")) {
            r.appendChild(opt);
        }
    }
   
    reader.on('end', () => {
		console.log(`${reader.reader.name}  device removed`);
	});
});

var item6 = [];
var excelData = [];
document.getElementById('nfc_reader1').addEventListener('change', () => {
  var selectedDevice = document.getElementById('nfc_reader1').value;
  if (selectedDevice !== '') {
    var reader = readerOpt.find(e => e.name == selectedDevice);
    reader.aid = 'F222222222';
    var countNFC = 0;
    reader.on('card', async card => {
        const tag = card.uid;
        countNFC = countNFC + 1;
	      // clearTimeout(myTimeout);
        insertToTable({
          "no": countNFC,
          "uid": tag,
          "data": "",
          "status": "OK",
        }, "table1")

        item6.push({
          "uid": tag,
          "data": "",
          "type": "child"
        })

        if (item6.length === 5) {
          excelData.push({
            child: item6,
            parent: {
              "uid": "",
              "data": "",
              "type": "parent"
            }
          })
          item6 = [];
        }

        sendData("s1_ok")

        setTimeout(timeout, 1000)
    });
  } else {
    remote.getCurrentWindow().reload()
  }
})

function timeout() {
  return sendData("s1_ng")
}

document.getElementById('nfc_reader2').addEventListener('change', () => {
    var selectedDevice = document.getElementById('nfc_reader2').value;
    if (selectedDevice !== '') {
      var reader = readerOpt.find(e => e.name == selectedDevice);
      reader.aid = 'F222222222';
      var countNFC = 0;
  
      reader.on('card', async card => {
        const tag = card.uid;
        countNFC = countNFC + 1;

        insertToTable({
          "no": countNFC,
          "uid": tag,
          "data": "",
          "status": "OK",
        }, "table2")

        excelData[countNFC - 1].parent = {
          "uid": tag,
          "data": "",
          "type": "parent"
        }

        // const data = await read(reader)
        // if (data) {
        //   insertToTable({
        //     "no": countNFC,
        //     "uid": tag,
        //     "data": data,
        //     "status": "OK",
        //   }, "table2")

        //   excelData[countNFC - 1].parent = {
        //     "uid": tag,
        //     "data": data,
        //     "type": "parent"
        //   }
        // } else {
        //   insertToTable({
        //     "no": countNFC,
        //     "uid": tag,
        //     "data": data,
        //     "status": "ERR",
        //   }, "table2")
        // }
      });
    } else {
      remote.getCurrentWindow().reload()
    }
})

document.getElementById('downloadExcel').addEventListener('click', () => {
  let data = processData(excelData)

  const excelHeader = [
    "UID",
    "Data",
    "Type",
  ]

  const XLSX = require('xlsx');

  const worksheet = XLSX.utils.json_to_sheet(data)

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Petronas");

  XLSX.utils.sheet_add_aoa(worksheet, [excelHeader], { origin: "A1" });

  let wscols = []
  excelHeader.map(arr => {
    wscols.push({ wch: arr.length + 5 })
  })
  worksheet["!cols"] = wscols;

  XLSX.writeFile(workbook, remote.app.getPath("downloads") + "/Petronas NFC Lists.xlsx", { compression: true });
})

function processData(data) {
  var combinedData = [];
  
  data.map(arr => {
    arr.child.map(arr2 => {
      combinedData.push(arr2)
    })
    combinedData.push(arr.parent)
  })

  return combinedData;
}

function insertToTable(data, tableID){
  var table = document.getElementById(tableID);
  
  var row = table.insertRow(0);

  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  var cell4 = row.insertCell(3);

  cell1.innerHTML = data.no;
  cell2.innerHTML = data.uid;
  cell3.innerHTML = data.data;
  cell4.innerHTML = data.status;
}