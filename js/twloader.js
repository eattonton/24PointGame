var TW_APP_VERSION = null;
function TW_LoadScriptFromVersion(script, scripts, callback){
    TW_SeriesLoadScripts([script], ()=>{
        TW_APP_VERSION = APP_VERSION;
        TW_SeriesLoadScripts(scripts, ()=>{
            if(typeof(callback) == "function") callback();
        })
    })
}
function TW_SeriesLoadScripts(scripts,callback) {
    if(typeof(scripts) != "object") var scripts = [scripts];
    if(Array.isArray(scripts) && scripts.length == 0){
        if(typeof(callback) == "function") callback();
        return;
    }
    var HEAD = document.getElementsByTagName("head").item(0) || document.documentElement;
    var s = new Array(), last = scripts.length - 1, recursiveLoad = function(i) {  
        s[i] = document.createElement("script");
        s[i].setAttribute("type","text/javascript");
        s[i].onload = s[i].onreadystatechange = function() { 
            if(!/*@cc_on!@*/0 || this.readyState == "loaded" || this.readyState == "complete") {
                this.onload = this.onreadystatechange = null; this.parentNode.removeChild(this); 
                if(i != last) recursiveLoad(i + 1); else if(typeof(callback) == "function") callback();
            }
        }
        if (scripts[i].indexOf('?') > -1) {
            s[i].setAttribute("src",scripts[i]+'&timestamp=' + (TW_APP_VERSION || Math.random()));
        }else{
            s[i].setAttribute("src",scripts[i]+'?timestamp=' + (TW_APP_VERSION || Math.random()));
        }
        HEAD.appendChild(s[i]);
    };
    recursiveLoad(0);
 }