var checkFile = 0;
var names = [];
var inputFiles = [];
var checkOutput = 0;

function handleFiles(files, nameTmp) {
  // console.log(" compare this inputFiles[0] with that 'files[0]' --", files[0]);    
  var file = files[0];
  var reader1 = new FileReader();
  console.log("create FileReader for ", nameTmp);
  reader1.onload = function(event) {
    var inputData = event.target.result;
    console.log("create inputData in handleFiles");
    createEmscriptenFiles(inputData, nameTmp);
    console.log("create createEmscriptenFiles for input ", nameTmp);
    names.push(nameTmp);        
  };        
  reader1.readAsText(file);
}

function starting() {
  document.getElementById("outputArea").value = " Ready to work \n";
}

function createEmscriptenFiles(inputData, name) {
  // console.log("createEmscriptenFiles");
  FS.createDataFile("/", name, inputData, true, true);
  // console.log("createEmscriptenFiles1");
  checkFile = checkFile + 1;
  // console.log("createEmscriptenFiles","checkfile = ", checkFile, name, " contains data: ", inputData )
}

function createEmscriptenOutputFiles() {
  console.log("createEmscriptenOutputFiles")
  _outputFile = FS.createDataFile("/", "output.txt","" , true, true);
  // var fff = FS.readFile("/output.txt", {encoding : "utf8" });
  console.log("empty createEmscriptenOutputFiles", _outputFile.contents);
}

var op = 1;
function runCalculate(op) {
  if (checkFile == 2) {
    document.getElementById("outputArea").value += " Calculate started \n";
    var operation = op
    // document.getElementById("template-select").value
    Module['callMain']([operation, names[0], names[1],"/output.txt"]);
    console.log("EXITSTATUS = ", EXITSTATUS);
    checkOutput = 1;
    var ff = FS.readFile("/output.txt", {encoding : "utf8" });
    console.log("Em out file after calc", ff); 
    // console.log("result in emscripten file system", FS.readFile("/output.txt", {encoding : "utf8" }))
    // _outputFile)     
    document.getElementById("outputArea").value += " Calculate result is ready \n";
  } else {
      document.getElementById("outputArea").value +=
      "Error:need to download argument's files! Now downloaded only " +
      checkFile + " file(s)." + "\n";
  }    
}

var resultToServer;

function prepareDownload() { 
  // FS.readFile()
  
  // console.log("start prepare download", _outputFile.contents);
  
  // console.log("typeof output", _outputFile.contents)
  // aa = new Uint8Array(_outputFile.contents);
  console.log("start prepare download")   
  var resultData = FS.readFile("/output.txt", {encoding : "utf8" });
  console.log("result Data from emscripten file: ", resultData);    
  resultToServer = JSON.stringify(resultData);
  // JSON.stringify(_outputFile.contents)
  // new Uint8Array(_outputFile.contents);
  // console.log(" end prepare download ");
  // console.log("typeof output new ", resultToServer)   
  // var blob = new Blob([resultToServer], {type: "text/plain"});
  // saveAs(blob, "result.txt");
}

function checkOutput1() {
  console.log(" start check  function 2 .");
  if (checkOutput === 1) {
    
    // do what you want with the result variable
    prepareDownload();
    
    console.log("end check function.");
    return;
  }
  setTimeout(checkOutput1, 1000);
}

Module['print'] = function(x) {
   if (x != "") {
      document.getElementById("outputArea").value += "" + "\n";
   }
};


function globalRun() {
  var path1;
  var path2;
  var operation;
  var result_uri;

  function ajaxRequest(url, type, data, callback, errorCallback) {
    if (!$.isFunction(callback)){
      callback = function(){
       console.log("get without callback function")
      }
    }  
    return $.ajax({
      url: url,
      type: type,
      async: false,
      data: data,    
      success: function(response){ 
        callback(response);
      },
      contentType: type,
      error: function(){
        errorCallback();
      }
    });
  }

  function parseTask(response) {
    // console.log("response for GET 'task' ", response);
    var task = JSON.parse(response);
    // console.log(" 'task' by json parse", task)
    path1 = task.matrix1;
    console.log("path1", path1)
    path2 = task.matrix2;
    console.log("path2", path2)
    operation = task.operation;
    result_uri = task.result_uri
  }

  function recordInputFirst(response) {
    inputFiles[0] =  new Blob([response], {type: "text/plain"});
    // console.log(" compare this inputFiles[0] with that 'files[0]' --", inputFiles[0]);
    handleFiles(inputFiles, "input1.txt");
    // console.log(" End of first request file.");
    url = 'http://localhost:8800' + path2;
    ajaxRequest(url, "GET", "", recordToInputArray, errorRecordInput2);
  }

  function recordToInputArray(response) {
    console.log("start request file");
          
    inputFiles[0] = new Blob([response], {type: "text/plain"});
    // console.log(" create blob with file argument : ", inputFiles[0]);
    handleFiles(inputFiles, "input2.txt");
    createEmscriptenOutputFiles();
    check();
    // console.log("end request file and calc 2");
  }

  function errorGetTask() {
    console.log("ajax : request 'task' error");
  }

  function errorRecordInput1() {
    console.log("ajax : request 1st argument error");
  }

  function errorRecordInput2() {
    console.log("ajax : request 2st argument error");
  }
  
  function check() {
    console.log("start check function.");
    if (checkFile === 2) {      
      // do what you want with the result variable      
      runCalculate(1);
      // checkOutput1();
      prepareDownload();
      url = 'http://localhost:8800' + result_uri;

      $.ajax({
        url: url,
        type: 'PUT',
        data: resultToServer,
        success: function(response){
          console.log(" upload result file is successfull");
        },
        // contentType: 'json',
        error: function(){console.log("error while putting")}
      });

      console.log("end check function.");
      return;
    }
    setTimeout(check, 1000);
  }

  starting();
  var url = 'http://localhost:8800/tasks';

  // $.ajax({
  //   url: 'http://localhost:8800/tasks',
  //   type: 'GET',
  //   async: false,
  //   data: '',
  //   success: function(response){
  //     console.log("response for GET 'task' ", response);
  //     task = JSON.parse(response);
  //     console.log(" 'task' by json parse", task)
  //     path1 = task.matrix1;
  //     console.log("path1", path1)
  //     path2 = task.matrix2;
  //     console.log("path2", path2)
  //     operation = task.operation;
  //     result_uri = task.result_uri
  //   },
  //   error: function(){
  //     console.log("ajax : request 'task' error");
  //   }
  // });

  ajaxRequest(url, "GET", "", parseTask, errorGetTask);



  url = 'http://localhost:8800' + path1;
  console.log("url", url);
  
  ajaxRequest(url, "GET", "", recordInputFirst, errorRecordInput1);

  // $.ajax({
  //   url: url,
  //   type: 'GET',
  //   async: false,
  //   data: '',
  //   success: function(response){
  //     // var blob = new Blob([response], {type: "text/plain"});
  //     inputFiles[0] =  new Blob([response], {type: "text/plain"});
  //     // console.log(" compare this inputFiles[0] with that 'files[0]' --", inputFiles[0]);
  //     handleFiles(inputFiles, "input1.txt");
  //     console.log(" End of first request file.");

  //     url = 'http://localhost:8800' + path2;
  //     // $.ajax({
  //     //   url: url,
  //     //   type: 'GET',
  //     //   async: false,
  //     //   data: '',
  //     //   success: function(response){
  //     //     console.log("start request file 2");
          
  //     //     inputFiles[0] = new Blob([response], {type: "text/plain"});
  //     //     // console.log(" create blob with file argument : ", inputFiles[0]);
  //     //     handleFiles(inputFiles, "input2.txt");
  //     //     createEmscriptenOutputFiles();
          
          

  //     //     check();
  //     //     console.log("end request file and calc 2");
          
          
  //     //     // console.log("inputFiles", inputFiles[0]);
  //     //     // console.log("response data i : ", response);
  //     //   },
  //     //   // complete: function(xhr, status){
  //     //   // },
  //     //   error: function(){
  //     //     console.log("ajax : request 2st argument error");
  //     //   }
  //     // });
  //   },
  //   error: function(){
  //     console.log("ajax : request 1st argument error");
  //   }
  // });


};