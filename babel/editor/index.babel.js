//var monaco = null;
var editor = null;
var currentFile = null;
var currentModelId = "source";

import FileData from './model/FileData.js'
import FileContainer from './model/FileContainer.js'

var gasUrl="https://script.google.com/macros/s/AKfycbzyNQRAwdTJ2yqdNzyD5-9nvb84kbkS4vztfcyuT8kwvqQhE-Lr/exec?p=/uid/reactcomponent/";
var gistUrl  = "https://api.github.com/gists/";
/**
サービスワーカーの登録
キャッシュファイルの制御を可能にする
*/
if (navigator.serviceWorker) {
  navigator.serviceWorker.register('./ws.js', { scope: './' }).then(function(registraion) {
    registraion.update();
  });
}

/* タブ切り替え処理 */
function changeTab(editor, desiredModelId) {
  var currentState = editor.saveViewState();
  var currentModel = editor.getModel();
  var data = currentFile.getEditorData();
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
  currentFile = fileContainer.getFile(filename);
  currentModelId = "source";
  var source = currentFile.getContent();
  var data = currentFile.getEditorData();
  $("#edittab").empty();
  var tab = $('<li><a></a></li>');
  tab.on("click", function (event) {
    //タブの切替
    changeTab(editor,$(this).attr("id"));
  });
  
  for (var key in data) {
    var i = 0;
    var _tab = tab.clone(true);
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
function refreshView(content){
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
function loadProject(url,type,cb) {
  $.UIkit.notify("load..", { status: 'success', timeout: 1000 });
  $("#filelist").html('<li><i class="uk-icon-spinner uk-icon-spin"></i></li>');
  //iframeの初期化
  refreshView("./blank.html");
  //localから取得
  if(!url){
    var doc = localDraft();
    if (doc){
      fileContainer.setContainerJson(doc);
      refreshFileList();
      openFirst();
      return (cb)?cb(doc):true;
    }
  }

  if(type == "gas"){
    $.getJSON(gasUrl+url+ "&callback=?",  { t: '1' }, function(json){
      console.log(json);
      if(json.ext==".gist"){
        return loadProject(json.content,"gist",cb);
      }else{
        fileContainer.init();
        var file = new FileData();
        file.setFilename("index.ahtml");
        file.setContent(json.content);
        fileContainer.putFile(file);
     
        refreshFileList();
        openFirst();
        return (cb)?cb(json):true;
      }
    });
  }else if(type == "gist"){
    $.getJSON(gistUrl+url).done(function(data) {
      fileContainer.setContainer(data);
      refreshFileList();
      openFirst();
      return (cb)?cb():true;
    });
  }else if(type == "html"){
    $.ajax({
      url: url
    }).done(function(data) {
      fileContainer.init();
      var file = new FileData();
      file.setFilename("index.html");
      file.setContent(data);
      fileContainer.putFile(file);
      refreshFileList();
      openFirst();
      return (cb)?cb():true;
    });
  }
}


$(".samples").on("click", function(event) {
  loadProject($(this).attr("data-url"),"html",function () {
  });
});

//File一覧の更新
function refreshFileList(){
  $("#filelist").empty();

  var file = $('<li ><a  class="file" data-url=""><input type="checkbox" class="fileSelect" > <i class="uk-icon-file uk-icon-mediu"></i> </a></li>');
    file.on("click", function (event) {
      fileOpen($(event.target).attr("data-uri"));
      $("#filelist").children("li").removeClass("uk-active");
      $(event.target.parentElement).addClass("uk-active");
      
    });
  
  fileContainer.getFiles().forEach(function(val, i) {
    console.log(i, val); 
    var _file = file.clone(true);
    _file.find('.fileSelect').attr('data-uri',val);
    _file.children('.file').attr('data-uri',val);
    _file.children('.file').append(val);
    $("#filelist").append(_file);
  });
}

//ファイルキャッシュの更新
function refreshCache(){
  fileContainer.getFiles().forEach(function(filename, i) {
    var _file = fileContainer.getFile(filename);
    saveCache('src/'+filename,_file.getContent(),_file.getType());
  });
}

//プロジェクト一覧表示
function projectjsonCallback(json){
  $("#prjlist").empty();

  var prj = $('<li ><a  class="project" data-url=""><i class="uk-icon-file"></i></a></li>');
    prj.on("click", function (event) {
      loadProject( $(event.target).attr("data-url"),"gas",function () {});
    });

  json.rows.forEach(function(val, i) {
    var _prj = prj.clone(true);
    _prj.children('.project').attr('data-url',val[6]+'/'+val[1]+val[2]);
    _prj.children('.project').append(val[1]);
    $("#prjlist").append(_prj);
  });
}

//プロジェクト一覧取得
$.getJSON(gasUrl+ "&callback=?",  { t: '1' }, function(json){
  projectjsonCallback(json);
});



var fileContainer = new FileContainer();

function saveDraft(source) {
  // ローカルストレージに最新の状態を保存
  var name = 'draftContainer'+location.pathname.replace(/\//g, '.');
  localStorage.setItem(name, fileContainer.getContainerJson());
  console.log("draftContainer:" + fileContainer.getContainerJson());
  $.UIkit.notify("save..", {status:'success',timeout : 1000});
}

function localDraft() {
  // ページが読み込まれたら、ローカルストレージから状態を読み込む
  var name1 = 'draftContainer'+location.pathname.replace(/\//g, '.');

  var name2 = 'draft'+location.pathname.replace(/\//g, '.');

  if(localStorage.getItem(name1)){
    fileContainer.setContainerJson(localStorage.getItem(name1));
  }else{
    var source = JSON.parse(localStorage.getItem(name2)) || null;
    var file = new FileData();
    file.setFilename("index.html");
    file.setContent(source);
    fileContainer.putFile(file);
  }
  console.log("fileContainer:" + fileContainer.getContainerJson());
  return fileContainer.getContainerJson();
}


/**
キャッシュファイルの登録
*/
const STATIC_CACHE_KEY = '1';
caches.delete(STATIC_CACHE_KEY);
var saveCache = async function(url,source,type){
    return new Promise(function(resolve, reject){
      var _type = type || 'application/javascript; charset=UTF-8';
      var _url = location.href.substr(0,location.href.substr(0,location.href.length-location.search.length).lastIndexOf("/"));//URLの最初のパスまで
      caches.open(STATIC_CACHE_KEY).then(cache => {
        var blob = new Blob([source], {type : _type});
        var response = new Response(blob,{ "status" : 200 , "statusText" : "OK" });
        cache.put(_url + "/test/"+url, response);
        resolve();
      })
    });
}


var htmlparser = Tautologistics.NodeHtmlParser;

var parseHtml = function(rawHtml) {
  return htmlparser.parseDOM(rawHtml, {
    enforceEmptyTags: true,
    ignoreWhitespace: true,
    caseSensitiveTags: true,
    caseSensitiveAttr: true,
    verbose: false
  });
};
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

var arg = new Object;
var pair=location.search.substring(1).split('&');
for(var i=0;pair[i];i++) {
    var kv = pair[i].split('=');
    arg[kv[0]]=kv[1];
}

var editorContainer = document.getElementById("container");

//View///////////////////////////////////////////////////
$(function() {
  require.config({
    paths: {
      vs:"js/monaco-editor/min/vs"
    }
  });
  require(["vs/editor/editor.main"], function() {
    editor = monaco.editor.create(editorContainer, {
      automaticLayout: true,
      model: null
    });
    fileContainer.setMonaco(monaco);
    var url = "";
    var type = "localStorage";
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
    loadProject(url,type,function () {
      refreshCache();
      compileAll();
    });

  });

  //全てのsourceのcompile
  function compileAll() {
    $.UIkit.notify("compile..", {status:'success',timeout : 1000});
    async function _compileAll() {
      function compileResolve(filename) {
        return new Promise(function(resolve) {
          var language = fileContainer.getFile(filename).getLanguage().toLowerCase();
          if(language=="ahtml"){
            resolve(compile(filename));
          }else if(language=="markdown"){
            resolve(mdcompile(filename));
          }else if(language=="javascript"){
            resolve(es6compile(filename));
          }else if(language=="sass"||language=="scss"){
            resolve(sasscompile(filename));
          }else {
            var _file = fileContainer.getFile(filename);
            saveCache('./'+filename,_file.getContent(),_file.getType());
            resolve(true);
          }
        });
      }
      const array = fileContainer.getFiles();
      const promiseAll = await Promise.all(
        array.map(async function(filename) {
          return await compileResolve(filename);
        })
      );
      return promiseAll;
    }
    _compileAll().then(function() {
      $.UIkit.notify("success..", {status:'success',timeout : 1000});
      refreshView("./test/index.html");
    });
  }

  async function compile(targetFile) {
    var webComponentParser = new WebComponentParser({
      builder: ReactComponentBuilder
    });

    var reactRootParser = new ReactRootComponentBuilder({
      builder: ReactComponentBuilder
    });

    var builder = new HtmlBuilder({});
    //var builder2 = new HtmlBuilder({});
    //var debugBuilder = new DebugBuilder({});
    var cssbuilder = new CSSBuilder({});
    var reactComponentBuilder = new ReactComponentBuilder({});
    var compiler1 = new Compiler(
      [cssbuilder, webComponentParser, reactRootParser],
      {}
    );
    var compiler2 = new Compiler([builder], {});

    //-ここからDemo用処理----------------------------------
    var data = (targetFile)?fileContainer.getFile(targetFile).getEditorData():currentFile.getEditorData();
    var filename = (targetFile)?fileContainer.getFile(targetFile).getFilename():currentFile.getFilename();
    filename = filename.substr(0,filename.lastIndexOf("."));

    var parseData = parseHtml(data.source.model.getValue().trim());
    data.dom.model.setValue(stringify(parseData));
    await saveCache(filename+'_dom.json',stringify(parseData),'application/json');
    compiler1.compile(parseData); //jsonオブジェクトを各種コードに変換します

    //editor4.setValue(cssbuilder.getNodes());

    webComponentParser.build(); //react化処理の実行
    //変換されたコードはwindowに読み込まれ実行可能になります。
    reactRootParser.build(); //react化処理の実行
    //変換されたコードはwindowに読み込まれ実行可能になります。
    data.component.model.setValue(webComponentParser.getResult());
    await saveCache(filename+'_component.js',webComponentParser.getResult());

    data.app.model.setValue(reactRootParser.getResult());
    await saveCache(filename+'_app.js',reactRootParser.getResult());

    (targetFile)?fileContainer.getFile(targetFile).setEditorData(data):currentFile.setEditorData(data);
    var bodyElements = parseData.getElementsByTagName("body");
    if (parseData.getElementsByTagName("head").length == 0) {
      var $html = parseData.getElementsByTagName("html");
      var newElement = $html[0].createElement("head");
      $html[0].insertBefore(newElement, bodyElements[0]);
    }
    var headElements = parseData.getElementsByTagName("head");
    headElements.forEach(function(headElement) {
      //head配下に追加
      var addpoint = headElement.getElementsByTagName("script")[0];
      {
        var newElement = headElement.createElement("script");
        var child = newElement.createTextNode(reactRootParser.getResult()+"\n//# sourceURL=app.js");
        newElement.appendChild(child);
        headElement.insertBefore(newElement, addpoint);
        addpoint = newElement;
      }
      {
        var newElement = headElement.createElement("script");
        var child = newElement.createTextNode(webComponentParser.getResult()+"\n//# sourceURL=Component.js");
        newElement.appendChild(child);
        headElement.insertBefore(newElement, addpoint);
        addpoint = newElement;
      }
      {
        var newElement = headElement.createElement("script");
        newElement.attributes = {
          src: [
            {
              type: "text",
              data: "https://unpkg.com/react-dom@16/umd/react-dom.development.js"
            }
          ]
        };
        headElement.insertBefore(newElement, addpoint);
        addpoint = newElement;
      }
      {
        var newElement = headElement.createElement("script");
        newElement.attributes = {
          src: [
            {
              type: "text",
              data: "https://unpkg.com/react@16/umd/react.development.js"
            }
          ]
        };
        headElement.insertBefore(newElement, addpoint);
        addpoint = newElement;
      }
      {
        var newElement = headElement.createElement("script");
        newElement.attributes = {
          src: [
            {
              type: "text",
              data:
                "//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"
            }
          ]
        };
        headElement.insertBefore(newElement, addpoint);
        addpoint = newElement;
      }
    }, this);

    bodyElements.forEach(function(bodyElement) {
      {
        var newElement = bodyElement.createElement("script");
        var child = newElement.createTextNode(`
 var render = function render() {
  ReactDOM.render(
    React.createElement(App, null),
    document.querySelector("#app")
  );
};

$(function() {
  render();
});`);
        newElement.appendChild(child);
        bodyElement.appendChild(newElement);
      }
    }, this);
    compiler2.compile(parseData.children); //jsonオブジェクトを各種コードに変換します
    data.html.model.setValue(builder.getNodes());
    await saveCache(filename+'.html',builder.getNodes(),'text/html; charset=UTF-8');
  }

  /* */
  async function mdcompile(targetFile) {
    var data = (targetFile)?fileContainer.getFile(targetFile).getEditorData():currentFile.getEditorData();
    var filename = (targetFile)?fileContainer.getFile(targetFile).getFilename():currentFile.getFilename();
    filename = filename.substr(0,filename.lastIndexOf("."));

    var parseData = marked(data.source.model.getValue().trim());
    data.html.model.setValue(parseData);
    await saveCache(filename+'.html',parseData,'text/html; charset=UTF-8');
  }

  /* */
  async function es6compile(targetFile) {
    var data = (targetFile)?fileContainer.getFile(targetFile).getEditorData():currentFile.getEditorData();
    var filename = (targetFile)?fileContainer.getFile(targetFile).getFilename():currentFile.getFilename();
    filename = filename.substr(0,filename.lastIndexOf("."));
    try {
      var parseData = Babel.transform(data.source.model.getValue().trim(),{"babelrc":false,"filename":filename,presets: ['es2015']});
      data.compiled.model.setValue(parseData.code);
      await saveCache(filename+'.js',parseData.code,'text/javascript; charset=UTF-8');
      data.source.decorations = data.source.model.deltaDecorations(data.source.decorations, { range: new monaco.Range(1,1,1,1), options : { } });
    } catch (e) {
      console.log(e);
      UIkit.notify(e.toString(), { status: 'warning', timeout: 1000 });
      //エラー箇所の表示
      data.source.decorations = data.source.model.deltaDecorations(data.source.decorations, [
         { range: new monaco.Range(e.loc.line,1,e.loc.line,1), options: { isWholeLine: true, linesDecorationsClassName: 'warningLineDecoration' }},
      ]);
    }
  }


  /* */
  async function sasscompile(targetFile) {
    var data = (targetFile)?fileContainer.getFile(targetFile).getEditorData():currentFile.getEditorData();
    var filename = (targetFile)?fileContainer.getFile(targetFile).getFilename():currentFile.getFilename();
    filename = filename.substr(0,filename.lastIndexOf("."));
    
    Sass.options('defaults');
    Sass.compile(data.source.model.getValue().trim(), async function(result) {
      if(result.status==0){
        console.log(result);
        data.compiled.model.setValue(result.text);
        data.source.decorations = data.source.model.deltaDecorations(data.source.decorations, { range: new monaco.Range(1,1,1,1), options : { } });
        await saveCache(filename+'.css',result.text,'text/css; charset=UTF-8');
      }else{
        UIkit.notify(result.message, { status: 'warning', timeout: 1000 });
        //エラー箇所の表示
        data.source.decorations = data.source.model.deltaDecorations(data.source.decorations, [
           { range: new monaco.Range(result.line,1,result.line,1), options: { isWholeLine: true, linesDecorationsClassName: 'warningLineDecoration' }},
        ]);
      }
    });
  }


  $("#run").on("click", function(event) {
    refreshCache();
    compileAll();
  });

  $("#test").on("click", function(event) {
    loadProject("https://api.github.com/gists/8e670a377e30a60520705d916a434a22", "gist", function () {});
  });


function saveGist(token){
    $.UIkit.notify("Share Gist..", { status: 'success', timeout: 1000 });
    
    var sendType = "POST";
    var gisturl = 'https://api.github.com/gists';
    if(fileContainer.getId()){
      sendType = "PATCH";
      gisturl = gisturl + "/"+fileContainer.getId();
    }

    $.ajax({
      url: gisturl,
      type: sendType,
      dataType: 'json',
      beforeSend: function beforeSend(xhr) {
        xhr.setRequestHeader("Authorization", "token " + token);
      },
      data: fileContainer.getGistJsonData()
    }).success(function (e) {
      console.log(e);
      $.UIkit.notify("complete!", { status: 'success', timeout: 1000 });
      
      //TODO ここにGASへの登録処理を追加する
      //URL https://script.google.com/macros/s/AKfycbzjYobwi6G61HPTeiUue67PlOHvnsj2E_SFgzi-CVoV/dev?p=/uid/reactcomponent/ ファイル名.gist&contents=gistID

    }).error(function (e) {
      console.warn("gist save error", e);
      $.UIkit.notify("error..", { status: 'error', timeout: 1000 });
    });
}

  $("#gist").on("click", function(event) {
    var token_key = 'gist_pat'+location.pathname.replace(/\//g, '.');
    var token = localStorage.getItem(token_key);
    if(!token){
      UIkit.modal.prompt('<p>Gist</p><br><p><a href="https://github.com/settings/tokens">Personal access tokens</a>:</p>', '',function (newtoken) {
        console.log('Confirmed.'+newtoken);
       token = newtoken;
       localStorage.setItem(token_key, token);
       saveGist(token);
      }, function () {
        console.log('Rejected.');
        return;
      });
    }else{
       saveGist(token);
    }
  });


  $("#fileRename").on("click", function(event) {
    $('.fileSelect:checkbox:checked').each(function(){
      var filename = $(this).attr("data-uri");
      UIkit.modal.prompt('<p>Rename File Name</p>', filename,function (newName) {
        console.log('newName '+newName);
        
        fileContainer.renameFile(filename,newName);
        refreshFileList();
      }, function () {
        console.log('Rejected.');
        return;
      });
    });
  });

  $("#fileDelete").on("click", function(event) {
    $('.fileSelect:checkbox:checked').each(function(){
      var filename = $(this).attr("data-uri");
      UIkit.modal.confirm('<p>Delete '+ filename +' File </p>', function () {
        console.log('filename '+filename);
        fileContainer.removeFile(filename);
        refreshFileList();
      }, function () {
        console.log('Rejected.');
        return;
      });
    });
  });

  $("#newfile").on("click", function(event) {
      UIkit.modal.prompt(`
<h3>New File</h3>
<h4>File Types Cheatsheet</h4>
<ul class="uk-list uk-list-striped uk-width-medium-1-3">
    <li><b>HTML</b> <span>.html</span> <span title="Markdown">.md</span> <span title="ReactHtml">.ahtml</span></li>
    <li><b>CSS</b> <span>.css</span> <span>.scss</span></li>
    <li><b>JavaScript</b> <span>.js</span> <span title="ECMASCRIPT6">.es6</span></li>
</ul>
<p>File Name:</p>`, '',function (newFile) {
        var file = new FileData();
        file.setFilename(newFile);
        file.setContent("");
        fileContainer.putFile(file);
        refreshFileList();
      }, function () {
        console.log('Rejected.');
        return;
      });
  });


  $('#container').bind('blur keydown keyup keypress change',function(){
        if(currentFile){
          var currentState = editor.saveViewState();
          var currentModel = editor.getModel();
          var data = currentFile.getEditorData();
          data[currentModelId].state = currentState;
          currentFile.setEditorData(data);
          fileContainer.putFile(currentFile);
        }
  });

  $(window).keydown(function(e) {
    if(e.keyCode === 120){
        refreshCache();
        compileAll();
        return false;
      }
    if(e.ctrlKey){
      if(e.keyCode === 83){
        saveDraft();
        refreshCache();
        return false;
      }
    }
  });

});

function stringify(str) {
  var cache = [];
  return JSON.stringify(
    str,
    function(key, value) {
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
