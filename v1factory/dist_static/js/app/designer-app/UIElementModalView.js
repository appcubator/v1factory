define(["mixins/BackboneModal"],function(){var e=Backbone.ModalView.extend({tagName:"div",className:"element-view",width:660,padding:0,events:{"keyup .style":"styleChanged","keyup .hover-style":"hoverStyleChanged","keyup .active-style":"activeStyleChanged","click .done":"closeModal","keyup .class_name":"classNameChaged","click .delete-elem":"deleteElement"},initialize:function(e){_.bindAll(this,"reRenderElement","renderStyleTags","styleChanged","hoverStyleChanged","activeStyleChanged","classNameChaged"),this.model=e,this.model.bind("change:style",this.renderStyleTags),this.model.bind("change:hoverStyle",this.renderStyleTags),this.model.bind("change:activeStyle",this.renderStyleTags),this.model.bind("change:value",this.reRenderElement),this.render()},render:function(){var e=document.createElement("div");e.className="node-wrapper";var t=_.template(ThemeTemplates.tempNode,{info:this.model.attributes});e.innerHTML=t,this.el.appendChild(e);var n=_.template(ThemeTemplates.tempPane,{info:this.model.attributes});return this.el.innerHTML+=n,this},deleteElement:function(){var e=this;this.model.collection.remove(e.model.cid),this.closeModal()},styleChanged:function(e){this.model.set("style",e.target.value)},hoverStyleChanged:function(e){this.model.set("hoverStyle",e.target.value)},activeStyleChanged:function(e){this.model.set("activeStyle",e.target.value)},reRenderElement:function(){this.$el.find(".node-wrapper").html(_.template(ThemeTemplates.tempNode,{info:this.model.attributes}))},renderStyleTags:function(e){console.log("rendier");var t=document.getElementById(this.model.cid+"-"+"style");console.log(t),t.innerHTML="."+this.model.get("class_name")+"{"+this.model.get("style")+"}";var n=document.getElementById(this.model.cid+"-"+"hover-style");n.innerHTML="."+this.model.get("class_name")+":hover {"+this.model.get("hoverStyle")+"}";var r=document.getElementById(this.model.cid+"-"+"active-style");r.innerHTML="."+this.model.get("class_name")+":active {"+this.model.get("activeStyle")+"}"},classNameChaged:function(e){console.log(e.target),this.model.set("class_name",e.target.value)}});return e});