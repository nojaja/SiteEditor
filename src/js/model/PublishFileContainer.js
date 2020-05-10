/***********************************************
Copyright 2017 - 2018
***********************************************/
/* v1.0.0 */
import FileContainer from './FileContainer.js'

const STATIC_CACHE_KEY = '1'
/* ------------------------------------------------
  ファイル管理クラス PublishFileContainer
------------------------------------------------ */
export class PublishFileContainer extends FileContainer {
  constructor (publicPath) {
    super()
    // キャッシュの初期化
    if(caches)caches.delete(STATIC_CACHE_KEY)
    this.publicPath = publicPath
  }

  /**
  キャッシュファイルの登録
  */
  async saveCache (url,source,type) {
      return new Promise((resolve, reject) => {
          const _type = type || 'application/javascript; charset=UTF-8'
          const _url = location.href.substr(0,location.href.substr(0,location.href.length-location.search.length).lastIndexOf("/")) // URLの最初のパスまで
          if(!caches) resolve()
          caches.open(STATIC_CACHE_KEY).then(cache => {
              const blob = new Blob([source], {type : _type})
              const response = new Response(blob,{ "status" : 200 , "statusText" : "OK" })
              cache.put(_url + url, response)
              resolve()
          })
      })
  }

  //ファイルキャッシュの更新
  refreshCache (fileCls, ...constructorParam) {
    this.getFiles().forEach((filename, i) => {
      const _file = this.getFile(filename,fileCls,...constructorParam) 
      if(filename.indexOf(this.publicPath)==0){
        this.saveCache(filename,_file.getContent(),_file.getType());
      }
    });
  }

  putFile (file) {
    let ret = super.putFile(file)
    const filename = file.getFilename() || ''
    if(filename.indexOf(this.publicPath)==0){
      this.saveCache(filename, file.getContent(), file.getType())
    }
    return ret
  }

  init () {
    // キャッシュの初期化
    if(caches)caches.delete(STATIC_CACHE_KEY)
    super.init (container)
  }
  
  setContainerJson (container) {
    // キャッシュの初期化
    if(caches)caches.delete(STATIC_CACHE_KEY)
    super.setContainerJson (container)
  }

}
export default PublishFileContainer
if (typeof window !== 'undefined') {
  !window.PublishFileContainer && (window.PublishFileContainer = PublishFileContainer)
}