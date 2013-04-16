define(["app/models/PageModel","app/collections/UrlsCollection","app/views/UrlView","app/views/PageView","mixins/BackboneNameBox"],function(e,t,n,r){var i=Backbone.Collection.extend({model:e}),s=Backbone.View.extend({el:document.body,initialize:function(){_.bindAll(this,"render","createPage","appendPage","savePages"),this.render(),this.collection=new i,this.collection.bind("add",this.appendPage,this);var e=appState.urls||[];this.collection.add(appState.pages),$("#save-entities").on("click",this.savePages)},render:function(){this.listView=document.getElementById("list-pages");var e=new Backbone.NameBox({el:document.getElementById("create-page-box")});e.on("submit",this.createPage)},createPage:function(e,t){var n={urlparts:[]};n.urlparts[0]="page"+this.collection.models.length,this.collection.add({name:e,url:n}),this.savePages()},appendPage:function(e){var t=_.indexOf(this.collection.models,e),n=new r(e,t);this.listView.appendChild(n.el)},savePages:function(e){appState.pages=this.collection.toJSON(),$.ajax({type:"POST",url:"/app/"+appId+"/state/",data:JSON.stringify(appState),success:function(){},dataType:"JSON"})}});return s});