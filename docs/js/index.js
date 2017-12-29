"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var editor = null;
var data = {
  source: {
    model: null,
    state: null
  },
  dom: {
    model: null,
    state: null
  },
  component: {
    model: null,
    state: null
  },
  app: {
    model: null,
    state: null
  },
  html: {
    model: null,
    state: null
  }
};
function changeTab(editor, desiredModelId) {
  var currentState = editor.saveViewState();
  var currentModel = editor.getModel();

  for (var key in data) {
    if (currentModel === data[key].model) {
      data[key].state = currentState;
    }
  }

  editor.setModel(data[desiredModelId].model);
  editor.restoreViewState(data[desiredModelId].state);
  editor.focus();
}

$("#edittab > li").on("click", function (event) {
  changeTab(editor, $(this).attr("id"));
});

/**
  ファイル管理
*/

var FileContainer = function () {
  function FileContainer() {
    _classCallCheck(this, FileContainer);

    this.container = {
      id: "",
      files: {},
      "public": true,
      "created_at": "2017-10-29T05:45:01Z",
      "updated_at": "2017-11-14T12:41:14Z",
      "description": ""
    };
  }

  _createClass(FileContainer, [{
    key: "getFiles",
    value: function getFiles() {
      // 配列のキーを取り出す
      var ret = [];
      for (var key in this.container["files"]) {
        if (!this.container["files"][key]["truncated"]) {
          ret.push(key);
        }
      }
      return ret;
    }
  }, {
    key: "getFile",
    value: function getFile(filename) {
      if (filename in this.container["files"]) {
        return new FileData(this.container["files"][filename]);
      }
    }
  }, {
    key: "putFile",
    value: function putFile(file) {
      var filename = file.getFilename();
      this.container["files"][filename] = file.getFileData();
      return true;
    }
  }, {
    key: "removeFile",
    value: function removeFile(filename) {
      var file = getFile(filename);
      file.remove();
      putFile(file);
    }
  }, {
    key: "setPublic",
    value: function setPublic(bool) {
      this.container["public"] = bool;
    }
  }, {
    key: "getPublic",
    value: function getPublic() {
      return this.container["public"];
    }
  }, {
    key: "setDescription",
    value: function setDescription(description) {
      this.container["description"] = description;
    }
  }, {
    key: "getDescription",
    value: function getDescription() {
      return this.container["description"];
    }
  }, {
    key: "setContainer",
    value: function setContainer(container) {
      this.container = container;
    }
  }, {
    key: "getContainer",
    value: function getContainer() {
      return this.container;
    }
  }, {
    key: "setContainerJson",
    value: function setContainerJson(container) {
      this.setContainer(JSON.parse(container));
    }
  }, {
    key: "getContainerJson",
    value: function getContainerJson() {
      return JSON.stringify(this.getContainer());
    }
  }, {
    key: "getGistData",
    value: function getGistData() {
      var gistdata = {
        "description": this.container["description"],
        "public": this.container["public"],
        "files": this.container["files"]
      };
      return gistdata;
    }
  }, {
    key: "getGistJsonData",
    value: function getGistJsonData() {
      return JSON.stringify(this.getGistData());
    }
  }]);

  return FileContainer;
}();

var FileData = function () {
  function FileData(file) {
    _classCallCheck(this, FileData);

    if (file instanceof FileData) {
      this.file = file.getFileData;
    } else {
      this.file = {
        "filename": file && file["filename"] ? file["filename"] : "",
        "type": file && file["type"] ? file["type"] : "text/plain",
        "language": file && file["language"] ? file["language"] : "Markdown",
        "size": file && file["size"] ? file["size"] : 0,
        "truncated": file && file["truncated"] ? file["truncated"] : false,
        "content": file && file["content"] ? file["content"] : ""
      };
    }
  }

  _createClass(FileData, [{
    key: "setLanguage",
    value: function setLanguage(language) {
      this.file["language"] = language;
    }
  }, {
    key: "getLanguage",
    value: function getLanguage() {
      return this.file["language"];
    }
  }, {
    key: "setType",
    value: function setType(type) {
      this.file["type"] = type;
    }
  }, {
    key: "getType",
    value: function getType() {
      return this.file["type"];
    }
  }, {
    key: "getSize",
    value: function getSize() {
      return this.file["size"];
    }
  }, {
    key: "setContent",
    value: function setContent(content) {
      this.file["content"] = content;
    }
  }, {
    key: "getContent",
    value: function getContent() {
      return this.file["content"];
    }
  }, {
    key: "setFilename",
    value: function setFilename(filename) {
      this.file["filename"] = filename;
    }
  }, {
    key: "getFilename",
    value: function getFilename() {
      return this.file["filename"];
    }
  }, {
    key: "getFileData",
    value: function getFileData() {
      return this.file;
    }
  }, {
    key: "getFileDataJson",
    value: function getFileDataJson() {
      return JSON.stringify(this.getFileData());
    }
  }, {
    key: "remove",
    value: function remove() {
      this.file["content"] = "";
      this.file["truncated"] = true;
    }
  }]);

  return FileData;
}();

var fileContainer = new FileContainer();
var test = new FileContainer();

$.ajax({
  url: "https://api.github.com/gists/84f22257f330b23ee0ba751468e40f49",
  dataType: "html"
}).done(function (d) {
  var test = new FileContainer();
  test.setContainer(d);
  console.log(test);
});

function changeSrc(url, cb) {
  $("#child-frame").attr("srcdoc", "");
  var frame = document.getElementById("child-frame");
  frame.onload = function () {};

  if (!url) {
    var doc = localDraft();
    if (doc) {
      data.source.model.setValue(localDraft());
      //$("#child-frame").attr("src", "./blank.html");
      return cb ? cb() : true;
    } else {
      url = $("#test5").attr("data-url");
    }
  }
  $.ajax({
    url: url,
    dataType: "html"
  }).done(function (d) {
    //editor.setValue(d);
    data.source.model.setValue(d);
    return cb ? cb() : true;
  });
}

$(".samples").on("click", function (event) {
  changeSrc($(this).attr("data-url"), function () {
    $.UIkit.notify("load..", { status: 'success', timeout: 1000 });
  });
});

//File一覧取得
var gasUrl = "https://script.google.com/macros/s/AKfycbzjYobwi6G61HPTeiUue67PlOHvnsj2E_SFgzi-CVoV/dev?p=/uid/reactcomponent/";
function projectjsonCallback(json) {
  $("#prjlist").empty();

  var prj = $('<li ><a  class="project" data-url=""><i class="uk-icon-file"></i></a></li>');
  prj.on("click", function (event) {
    $.UIkit.notify("load..", { status: 'success', timeout: 1000 });
    $.ajax(gasUrl + $(event.target).attr("data-url"), {
      type: 'get',
      data: { t: '1' },
      dataType: 'jsonp',
      jsonpCallback: "filescontentjsonCallback"
    });
  });

  json.rows.forEach(function (val, i) {
    var _prj = prj.clone(true);
    _prj.children('.project').attr('data-url', val[6] + '/' + val[1] + val[2]);
    _prj.children('.project').append(val[1]);
    $("#prjlist").append(_prj);
  });
}

$.ajax(gasUrl + '', {
  type: 'get',
  data: { t: '1' },
  dataType: 'jsonp',
  jsonpCallback: "projectjsonCallback"
});

//ファイル取得時の処理
function filescontentjsonCallback(json) {
  console.log(json);
  $("#child-frame").attr("srcdoc", "");
  var frame = document.getElementById("child-frame");
  frame.onload = function () {};

  if (json.ext == "fileContainer") {
    fileContainer.setContainerJson(json.content);
  } else {
    var file = new FileData();
    file.setFilename("index.html");
    file.setContent(json.content);
    fileContainer.putFile(file);
  }
  var _file = fileContainer.getFile(fileContainer.getFiles()[0]);
  var source = _file.getContent();

  data.source.model.setValue(source);
  filesjsonCallback();
}

//File一覧のcallback
function filesjsonCallback() {
  $("#filelist").empty();

  var file = $('<li ><a  class="file" data-url=""><i class="uk-icon-file"></i></a></li>');
  file.on("click", function (event) {
    $.UIkit.notify("load..", { status: 'success', timeout: 1000 });
    var _file = fileContainer.getFile($(event.target).attr("data-uri"));
    var source = _file.getContent();
    data.source.model.setValue(source);
  });

  fileContainer.getFiles().forEach(function (val, i) {
    console.log(i, val);
    var _file = file.clone(true);
    _file.children('.file').attr('data-uri', val);
    _file.children('.file').append(val);
    $("#filelist").append(_file);
  });
}

function saveDraftCallback(json) {
  console.log(json);
}

function saveDraft(source) {
  // ローカルストレージに最新の状態を保存

  var name = 'draftContainer' + location.pathname.replace(/\//g, '.');

  localStorage.setItem(name, fileContainer.getContainerJson());

  console.log("draftContainer:" + fileContainer.getContainerJson());
  $.UIkit.notify("save..", { status: 'success', timeout: 1000 });
}
function localDraft() {
  // ページが読み込まれたら、ローカルストレージから状態を読み込む
  var name1 = 'draftContainer' + location.pathname.replace(/\//g, '.');

  var name2 = 'draft' + location.pathname.replace(/\//g, '.');
  var source = "";

  if (localStorage.getItem(name1)) {
    fileContainer.setContainerJson(localStorage.getItem(name1));
    var file = fileContainer.getFile(fileContainer.getFiles()[0]);
    source = file.getContent();
  } else {
    source = JSON.parse(localStorage.getItem(name2)) || null;
    var file = new FileData();
    file.setFilename("index.html");
    file.setContent(source);
    fileContainer.putFile(file);
  }
  console.log("source:" + JSON.stringify(source));
  console.log("fileContainer:" + fileContainer.getContainerJson());
  filesjsonCallback();
  return source;
}

if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/ws.js', { scope: '/js/test/' }).then(function (registraion) {
    registraion.update();
  });
}

var STATIC_CACHE_KEY = '1';
caches.delete(STATIC_CACHE_KEY);
function saveCache(url, source, type) {
  var _type = type || 'application/javascript; charset=UTF-8';
  var _url = location.href.substr(0, location.href.length - location.pathname.length); //URLの最初のパスまで
  caches.open(STATIC_CACHE_KEY).then(function (cache) {
    var blob = new Blob([source], { type: _type });
    var response = new Response(blob, { "status": 200, "statusText": "OK" });
    cache.put(_url + "/js/test/" + url, response);
  });
}

var htmlparser = Tautologistics.NodeHtmlParser;

var parseHtml = function parseHtml(rawHtml) {
  return htmlparser.parseDOM(rawHtml, {
    enforceEmptyTags: true,
    ignoreWhitespace: true,
    caseSensitiveTags: true,
    caseSensitiveAttr: true,
    verbose: false
  });
};

var DebugBuilder = function (_Builder) {
  _inherits(DebugBuilder, _Builder);

  function DebugBuilder() {
    _classCallCheck(this, DebugBuilder);

    return _possibleConstructorReturn(this, (DebugBuilder.__proto__ || Object.getPrototypeOf(DebugBuilder)).apply(this, arguments));
  }

  _createClass(DebugBuilder, [{
    key: "beforeCompile",
    value: function beforeCompile(src) {
      console.log("DebugBuilder", stringify(src));
    }
  }, {
    key: "beforeCreateNodes",
    value: function beforeCreateNodes(src) {
      console.log("DebugBuilder-createNodes", stringify(src));
    }
  }, {
    key: "beforeCreateTagElement",
    value: function beforeCreateTagElement(src) {
      console.log("DebugBuilder-beforeCreateTagElement", stringify(src));
    }
  }]);

  return DebugBuilder;
}(Builder);

var arg = new Object();
var pair = location.search.substring(1).split('&');
for (var i = 0; pair[i]; i++) {
  var kv = pair[i].split('=');
  arg[kv[0]] = kv[1];
}

var editorContainer = document.getElementById("container");

//View///////////////////////////////////////////////////
$(function () {
  require.config({
    paths: {
      vs: "js/monaco-editor/min/vs"
    }
  });
  require(["vs/editor/editor.main"], function () {
    data.source.model = monaco.editor.createModel("", "html");
    data.dom.model = monaco.editor.createModel("", "json");
    data.component.model = monaco.editor.createModel("", "javascript");
    data.app.model = monaco.editor.createModel("", "javascript");
    data.html.model = monaco.editor.createModel("html", "html");

    editor = monaco.editor.create(editorContainer, {
      automaticLayout: true,
      model: data.source.model
    });

    var url = arg["q"] ? arg["q"] : arg["g"] ? arg["g"] : "";

    changeSrc(url, function () {
      compile();
    });
  });

  function compile() {
    var webComponentParser = new WebComponentParser({
      builder: ReactComponentBuilder
    });

    var reactRootParser = new ReactRootComponentBuilder({
      builder: ReactComponentBuilder
    });

    var builder = new HtmlBuilder({});
    //var builder2 = new HtmlBuilder({});
    var debugBuilder = new DebugBuilder({});
    var cssbuilder = new CSSBuilder({});
    var reactComponentBuilder = new ReactComponentBuilder({});
    var compiler1 = new Compiler([cssbuilder, webComponentParser, reactRootParser], {});
    var compiler2 = new Compiler([builder], {});
    //var compiler3 = new Compiler([builder2], {});

    //-ここからDemo用処理----------------------------------
    var parseData = parseHtml(data.source.model.getValue().trim());
    data.dom.model.setValue(stringify(parseData));
    saveCache('dom.json', stringify(parseData), 'application/json');
    compiler1.compile(parseData); //jsonオブジェクトを各種コードに変換します

    //editor4.setValue(cssbuilder.getNodes());

    webComponentParser.build(); //react化処理の実行
    //変換されたコードはwindowに読み込まれ実行可能になります。
    reactRootParser.build(); //react化処理の実行
    //変換されたコードはwindowに読み込まれ実行可能になります。
    data.component.model.setValue(webComponentParser.getResult());
    saveCache('component.js', webComponentParser.getResult());

    data.app.model.setValue(reactRootParser.getResult());
    saveCache('app.js', reactRootParser.getResult());

    var bodyElements = parseData.getElementsByTagName("body");
    if (parseData.getElementsByTagName("head").length == 0) {
      var $html = parseData.getElementsByTagName("html");
      var newElement = $html[0].createElement("head");
      $html[0].insertBefore(newElement, bodyElements[0]);
    }
    var headElements = parseData.getElementsByTagName("head");
    headElements.forEach(function (headElement) {
      //head配下に追加
      var addpoint = headElement.getElementsByTagName("script")[0];
      {
        var newElement = headElement.createElement("script");
        var child = newElement.createTextNode(reactRootParser.getResult() + "\n//# sourceURL=app.js");
        newElement.appendChild(child);
        headElement.insertBefore(newElement, addpoint);
        addpoint = newElement;
      }
      {
        var newElement = headElement.createElement("script");
        var child = newElement.createTextNode(webComponentParser.getResult() + "\n//# sourceURL=Component.js");
        newElement.appendChild(child);
        headElement.insertBefore(newElement, addpoint);
        addpoint = newElement;
      }
      {
        var newElement = headElement.createElement("script");
        newElement.attributes = {
          src: [{
            type: "text",
            data: "https://unpkg.com/react-dom@16/umd/react-dom.development.js"
          }]
        };
        headElement.insertBefore(newElement, addpoint);
        addpoint = newElement;
      }
      {
        var newElement = headElement.createElement("script");
        newElement.attributes = {
          src: [{
            type: "text",
            data: "https://unpkg.com/react@16/umd/react.development.js"
          }]
        };
        headElement.insertBefore(newElement, addpoint);
        addpoint = newElement;
      }
      {
        var newElement = headElement.createElement("script");
        newElement.attributes = {
          src: [{
            type: "text",
            data: "//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"
          }]
        };
        headElement.insertBefore(newElement, addpoint);
        addpoint = newElement;
      }
    }, this);

    bodyElements.forEach(function (bodyElement) {
      {
        var newElement = bodyElement.createElement("script");
        var child = newElement.createTextNode("\n var render = function render() {\n  ReactDOM.render(\n    React.createElement(App, null),\n    document.querySelector(\"#app\")\n  );\n};\n\n$(function() {\n  render();\n});");
        newElement.appendChild(child);
        bodyElement.appendChild(newElement);
      }
    }, this);
    compiler2.compile(parseData.children); //jsonオブジェクトを各種コードに変換します
    //compiler3.compile(bodyElements[0].children); //jsonオブジェクトを各種コードに変換します
    data.html.model.setValue(builder.getNodes());
    saveCache('index.html', builder.getNodes(), 'text/html; charset=UTF-8');

    // iframe内のコンテンツのdocumentオブジェクト追加
    //$("#child-frame").attr("srcdoc", builder.getNodes());

    // iframe内のコンテンツを更新
    $("#child-frame").attr("srcdoc", "");
    //$("#child-frame").attr("src", "./blank.html");
    var frame = document.getElementById("child-frame");
    frame.src = "./blank.html";
    frame.onload = function () {
      frame.onload = function () {};
      frame.contentDocument.open();
      frame.contentDocument.write(builder.getNodes());
      frame.contentDocument.close();
      $.UIkit.notify("compile..", { status: 'success', timeout: 1000 });
    };
  }

  $("#run").on("click", function (event) {
    compile();
  });

  $("#gist").on("click", function (event) {
    var gistdata = {
      "description": "posting gist test",
      "public": true,
      "files": {
        "test.html": {
          "content": data.source.model.getValue()
        }
      }
    };
    $.ajax({
      url: 'https://api.github.com/gists',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify(gistdata)
    }).success(function (e) {

      console.log(e);
    }).error(function (e) {
      console.warn("gist save error", e);
    });
  });

  $(window).keydown(function (e) {
    if (e.keyCode === 120) {
      compile();
      return false;
    }
    if (e.ctrlKey) {
      if (e.keyCode === 83) {
        saveDraft(data.source.model.getValue());
        return false;
      }
    }
  });
});

function stringify(str) {
  var cache = [];
  return JSON.stringify(str, function (key, value) {
    if ((typeof value === "undefined" ? "undefined" : _typeof(value)) === "object" && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    if (key == "parentNode") return;
    return value;
  }, "\t");
}