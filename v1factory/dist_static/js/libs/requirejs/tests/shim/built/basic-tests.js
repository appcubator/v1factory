function D(){this.name="d"}(function(e){e.A={name:"a"}})(this),define("a",function(e){return function(){var t,n;return n=function(){window.globalA=this.A.name},t=n.apply(e,arguments),t||e.A.name}}(this)),define("d",function(){});var B={name:"b",aValue:A.name,dValue:new D};define("b",function(){});var C={name:"c",a:A,b:B};define("c",["a","b"],function(e){return function(){var t,n;return t||e.C}}(this));var e={nested:{e:{name:"e"}}};define("e",function(t){return function(){var n,r;return r=function(){return{name:e.nested.e.name+"Modified"}},n=r.apply(t,arguments),n||t.e.nested.e}}(this));var FCAP={name:"FCAP",globalA:A};define("f",["a"],function(e){return function(){var t,n;return n=function(e){return{name:FCAP.name,globalA:FCAP.globalA,a:e}},t=n.apply(e,arguments),t}}(this)),require({baseUrl:"./",shim:{a:{exports:"A.name",init:function(){window.globalA=this.A.name}},b:["a","d"],c:{deps:["a","b"],exports:"C"},e:{exports:"e.nested.e",init:function(){return{name:e.nested.e.name+"Modified"}}},f:{deps:["a"],init:function(e){return{name:FCAP.name,globalA:FCAP.globalA,a:e}}}}},["a","c","e","f"],function(e,t,n,r){doh.register("shimBasic",[function(s){s.is("a",e),s.is("a",window.globalA),s.is("a",t.b.aValue),s.is("b",t.b.name),s.is("c",t.name),s.is("d",t.b.dValue.name),s.is("eModified",n.name),s.is("FCAP",r.name),s.is("a",r.globalA.name),s.is("a",r.a)}]),doh.run()}),define("basic-tests",function(){});