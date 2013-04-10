define([
  'mixins/BackboneModal'
],
function() {

  var RowGalleryView = Backbone.View.extend({
    el     : null,
    events : {
    },

    initialize: function(rowModel){
      _.bindAll(this, 'render');

      this.render();
    },

    render: function() {
      //this.el.innerHTML += "<h3><div class='list-view list-type'>List View</div><div class='grid-view list-type'>Grid View</div></h3>";

      // var rowWidget = document.createElement('div');
      // this.rowWidget = rowWidget;
      // rowWidget.className = 'editor-window container-wrapper';
      // rowWidget.className += (' hi' + this.rowModel.get('layout').get('height'));
      // editorDiv.appendChild(rowWidget);

      // if(this.rowModel.get('isListOrGrid') == "list") {
      //   iui.resizableVertical(rowWidget, self);
      //   rowWidget.style.width = '100%';
      // }
      // else {
      //   iui.resizable(rowWidget, self);
      //   rowWidget.className += (' span' + this.rowModel.get('layout').get('width'));
      // }

      return this;
    }
  });

  return RowGalleryView;
});

