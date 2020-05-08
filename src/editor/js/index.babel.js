"use strict";
import * as monaco from 'monaco-editor'
import FileData from './model/FileData.js'
import EditorFileData from './model/EditorFileData.js'
import FileContainer from './model/FileContainer.js'
import LocalStorage from './fs/localstorage.js'
import GistStorage from './fs/giststorage.js'
import GasStorage from './fs/gasstorage.js'
import HtmlStorage from './fs/htmlstorage.js'
import CachesLogic from './cacheslogic.js'

import BuilderLogic from './builderlogic.js'

var editor = null;
var currentFile = null;
var currentModelId = "source";
var fileContainer = new FileContainer();

var localstorage = new LocalStorage();
var gistStorage = new GistStorage();
var gasStorage = new GasStorage();
var htmlStorage = new HtmlStorage();
var cachesLogic = new CachesLogic();
var builderLogic = new BuilderLogic(cachesLogic);

/**
サービスワーカーの登録
キャッシュファイルの制御を可能にする
*/
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('./serviceWorker.bundle.js', { scope: './' }).then(function(registraion) {
    registraion.update();
  });
}

/* タブ切り替え処理 */
function changeTab(editor, desiredModelId) {
  let currentState = editor.saveViewState();
  let currentModel = editor.getModel();
  let data = currentFile.getEditorData();
  data[currentModelId].state = currentState;
  currentFile.setEditorData(data);

  editor.setModel(data[desiredModelId].model);
  editor.restoreViewState(data[desiredModelId].state);
  currentModelId = desiredModelId;
  editor.focus();
}

//１つ目のファイルを開く
function openFirst() {
  fileOpen(fileContainer.getFiles()[0]);
  $("#filelist").children("li").removeClass("uk-active");
  $("#filelist li:first").addClass("uk-active");
}

//Fileを開く
function fileOpen(filename){
  currentFile = fileContainer.getFile(filename,EditorFileData,monaco)
  currentModelId = "source";
  let data = currentFile.getEditorData();

  $("#edittab").empty();
  const tab = $('<li><a></a></li>');
  tab.on("click", (event) => {
    //タブの切替
    changeTab(editor,$(event.currentTarget).attr("id"));
  });
  
  for (let key in data) {
    let i = 0;
    let _tab = tab.clone(true);
    _tab.attr('id',key);
    _tab.children("a").append(data[key].caption);
    $("#edittab").append(_tab);
    if(key==currentModelId){
      _tab.addClass('uk-active');
      editor.setModel(data[currentModelId].model);
      editor.restoreViewState(data[currentModelId].state);
      editor.focus();
    }
    i++;
  };
  $.UIkit.switcher('#edittab').show(0);
}

// iframe内のコンテンツを更新
function refreshView (content) {
    // iframe内のコンテンツを更新
    $("#child-frame").attr("src", content);
  /*
    //$("#child-frame").attr("srcdoc", "");
    //$("#child-frame").attr("src", "./blank.html");
    var frame = document.getElementById("child-frame");
    frame.src = "./blank.html";
    frame.onload = function(){
       frame.onload=function(){};
       frame.contentDocument.open();
       frame.contentDocument.write(content);
       frame.contentDocument.close();
    }
 */
}

//プロジェクトファイルの読み込み
function loadProject (url,type,cb) {
  $.UIkit.notify("load..", { status: 'success', timeout: 1000 });
  $("#filelist").html('<li><i class="uk-icon-spinner uk-icon-spin"></i></li>');
  //iframeの初期化
  refreshView("./blank.html");
  //localから取得
  if(!url || type == "local"){
    localstorage.loadDraft(fileContainer, url, (fileContainer) => {
      refreshFileList()
      openFirst()
      return (cb)?cb():true
    })
  }
  if(type == "gas"){
      gasStorage.loadDraft(fileContainer, url, (fileContainer) => {
          refreshFileList();
          openFirst();
          return (cb)?cb():true;
      })
  }else if(type == "gist"){
      gistStorage.loadDraft(fileContainer, url, (fileContainer) => {
          refreshFileList();
          openFirst();
          return (cb)?cb():true;
      })
  }else if(type == "html"){
      htmlStorage.loadDraft(fileContainer, url, (fileContainer) => {
          refreshFileList();
          openFirst();
          return (cb)?cb():true;
      })
  }
}

//File一覧の更新
function refreshFileList () {
  $("#title").empty();
  $("#title").text(fileContainer.getProjectName());
  $("#filelist").empty();

  const file = $('<li ><a  class="file" data-url=""><input type="checkbox" class="fileSelect" > <i class="uk-icon-file uk-icon-mediu"></i> </a></li>');
  file.on("click", (event) => {
    fileOpen($(event.target).attr("data-uri"));
    $("#filelist").children("li").removeClass("uk-active");
    $(event.target.parentElement).addClass("uk-active");
  });
  
  fileContainer.getFiles().forEach((val, i) => {
    let _file = file.clone(true);
    _file.find('.fileSelect').attr('data-uri',val);
    _file.children('.file').attr('data-uri',val);
    _file.children('.file').append(val);
    $("#filelist").append(_file);
  });
}

//プロジェクト一覧表示
function projectjsonCallback (json, type) {
  $("#prjlist").empty();

  const prj = $('<li ><a  class="project" data-url=""><i class="uk-icon-file"></i></a></li>');
  prj.on("click", (event) => {
    loadProject($(event.target).attr("data-url"), type, () => {})
  });

  json.rows.forEach((val, i) => {
    // [{description, id, public},,]
    let _prj = prj.clone(true);
    _prj.children('.project').attr('data-url',val.id);
    _prj.children('.project').append(val.description);
    $("#prjlist").append(_prj);
  });
}

function compileAll () {
    $.UIkit.notify("compile..", {status:'success',timeout : 1000});
    cachesLogic.refreshCache(fileContainer);
    builderLogic.compileAll(fileContainer, () => {
        $.UIkit.notify("success..", {status:'success',timeout : 1000});
        refreshView("./test/index.html");
    })
}

class DebugBuilder extends Builder {
  beforeCompile(src) {
    console.log("DebugBuilder", stringify(src));
  }
  beforeCreateNodes(src) {
    console.log("DebugBuilder-createNodes", stringify(src));
  }
  beforeCreateTagElement(src) {
    console.log("DebugBuilder-beforeCreateTagElement", stringify(src));
  }
}

var arg = new Object();
var pair = location.search.substring(1).split("&");
for (var i = 0; pair[i]; i++) {
  var kv = pair[i].split("=");
  arg[kv[0]] = kv[1];
}

//View///////////////////////////////////////////////////
$(document).ready(() => {
    const editorContainer = document.getElementById("container");
    editor = monaco.editor.create(editorContainer, {
      automaticLayout: true,
      model: null
    });
    let url = "";
    let type = "localStorage";
    if(arg["q"]){
      type = "html";
      url  = arg["q"];
    }else if(arg["g"]){
      type = "gist";
      url  = arg["g"];
    }else if(arg["ga"]){
      type = "gas";
      url  = arg["ga"];
    }
    //プロジェクト取得
    loadProject(url, type, () => {
      compileAll();
    });

    //プロジェクト一覧取得
    gistStorage.loadList((json, type) => {
        projectjsonCallback(json, type)
    });

  $("#run").on("click", (event) => {
    compileAll();
  });

  $("#test").on("click", (event) => {
    loadProject("8e670a377e30a60520705d916a434a22", "gist", () => {})
  });

  $(".samples").on("click", (event) => {
    loadProject($(event.currentTarget).attr("data-url"),"html",() => {})
  });

  $("#gist").on("click", (event) => {
    const token_key = 'gist_pat'+location.pathname.replace(/\//g, '.');
    const token = localStorage.getItem(token_key);
    if(!token){
      UIkit.modal.prompt('<p>Gist</p><br><p><a href="https://github.com/settings/tokens">Personal access tokens</a>:</p>', '', (newtoken) => {
        console.log('Confirmed.'+newtoken);
        token = newtoken;
        localStorage.setItem(token_key, token);
        gistStorage.saveGist(fileContainer,token);
      }, () => {
        console.log('Rejected.');
        return;
      });
    }else{
       gistStorage.saveGist(fileContainer,token);
    }
  });

  $("#titleEdit").on("click", (event) => {
      const title = $("#title").text();
      UIkit.modal.prompt('<p>title</p>', title, (newTitle) => {
        console.log('newTitle '+newTitle);
        fileContainer.setProjectName(newTitle);
        refreshFileList();
      }, () => {
        console.log('Rejected.');
        return;
      });
  });

  $("#fileRename").on("click", (event) => {
    $('.fileSelect:checkbox:checked').each( (index, element) => {
      const filename = $(element).attr("data-uri");
      UIkit.modal.prompt('<p>Rename File Name</p>', filename, (newName) => {
        console.log('newName '+newName);
        fileContainer.renameFile(filename,newName);
        refreshFileList();
      }, () => {
        console.log('Rejected.');
        return;
      });
    });
  });

  $("#fileDelete").on("click", (event) => {
    $('.fileSelect:checkbox:checked').each((index, element) => {
      const filename = $(element).attr("data-uri");
      UIkit.modal.confirm('<p>Delete '+ filename +' File </p>', () => {
        console.log('filename '+filename);
        fileContainer.removeFile(filename);
        refreshFileList();
      }, () => {
        console.log('Rejected.');
        return;
      });
    });
  });

  $("#newfile").on("click", (event) => {
      UIkit.modal.prompt(`
<h3>New File</h3>
<h4>File Types Cheatsheet</h4>
<ul class="uk-list uk-list-striped uk-width-medium-1-3">
    <li><b>HTML</b> <span>.html</span> <span title="Markdown">.md</span> <span title="ReactHtml">.ahtml</span></li>
    <li><b>CSS</b> <span>.css</span> <span>.scss</span></li>
    <li><b>JavaScript</b> <span>.js</span> <span title="ECMASCRIPT6">.es6</span></li>
</ul>
<p>File Name:</p>`, '', (newFile) => {
        let file = new EditorFileData(monaco)
        file.setFilename(newFile);
        file.setContent("");
        fileContainer.putFile(file);
        refreshFileList();
      }, () => {
        console.log('Rejected.');
        return;
      });
  });

  $('#container').bind('blur keydown keyup keypress change', () => {
        if(currentFile){
          let currentState = editor.saveViewState();
          let currentModel = editor.getModel();
          let data = currentFile.getEditorData();
          data[currentModelId].state = currentState;
          currentFile.setEditorData(data);
          fileContainer.putFile(currentFile);
        }
  });

  $(window).keydown( (e) => {
    if(e.keyCode === 120){
        compileAll();
        return false;
      }
    if(e.ctrlKey){
      if(e.keyCode === 83){
        localstorage.saveDraft(fileContainer);
        cachesLogic.refreshCache(fileContainer);
        return false;
      }
    }
  });
});

function stringify(str) {
  var cache = [];
  return JSON.stringify(
    str,
    function (key, value) {
      if (typeof value === "object" && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Circular reference found, discard key
          return;
        }
        // Store value in our collection
        cache.push(value);
      }
      if (key == "parentNode") return;
      return value;
    },
    "\t"
  );
}