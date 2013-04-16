define(["editor/WidgetContentEditorView","editor/WidgetLayoutEditorView","backbone","mixins/BackboneUI","iui"],function(e,t){var n=Backbone.UIView.extend({el:document.getElementById("editor-page"),className:"editor-page fadeIn",tagName:"div",initialize:function(n,r){_.bindAll(this,"render","clear","setLocation","bindLocation","selectChanged"),this.widgetsCollection=n,this.containersCollection=r,this.model=n.selectedEl,this.widgetsCollection.bind("selected",this.selectChanged,this),this.containersCollection&&this.containersCollection.bind("selected",this.clear),this.model&&(this.model.bind("change:selected",this.selectChanged),this.contentEditor=new e(this.model),this.layoutEditor=new t(this.model),this.render(),this.bindLocation())},render:function(){var e=this;if(!iui.get("widget-wrapper-"+this.model.cid))return;iui.get("widget-wrapper-"+this.model.cid).appendChild(this.el),this.el.appendChild(this.layoutEditor.el),this.el.appendChild(this.contentEditor.el)},setLocation:function(){},bindLocation:function(){},selectChanged:function(n,r){this.widgetsCollection.selectedEl===null?(this.model=null,this.clear()):this.widgetsCollection.selectedEl!=this.model&&(this.clear(),this.model=this.widgetsCollection.selectedEl,this.model.bind("change:selected",this.selectChanged),this.contentEditor=new e(this.model),this.layoutEditor=new t(this.model),this.render(),this.bindLocation(),this.$el.fadeIn())},clear:function(){this.contentEditor&&this.contentEditor.clear(),this.layoutEditor&&this.layoutEditor.clear(),this.el.innerHTML="",this.model=null,this.$el.hide()}});return n});