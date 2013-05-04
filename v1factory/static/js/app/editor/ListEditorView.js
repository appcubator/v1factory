define([
  'app/collections/WidgetCollection',
  'editor/WidgetView',
  'editor/RowEditorView',
  'editor/RowGalleryView',
  'mixins/BackboneModal',
  'iui'
],
function( WidgetCollection,
          WidgetView,
          RowEditorView,
          RowGalleryView ) {

  var ListEditorView = Backbone.ModalView.extend({
    className : 'list-editor-modal',
    width: 920,
    height: 500,
    padding: 0,
    events: {
      'change .fields-to-display'    : 'fieldsToDisplayChanged',
      'click .belongs-to-user'       : 'belongsToUserChanged',
      'click .nmr-rows'              : 'nmrRowsChanged',
      'keydown #first-nmr, #last-nmr': 'nmrRowsNumberChanged',
      'change .sort-by'              : 'sortByChanged',
      'change .item-goes-to'         : 'itemLinkChanged',
      'click .done-btn'              : 'closeModal'
    },
    initialize: function(widgetModel, queryModel, rowModel) {
      var self = this;

      _.bindAll(this, 'render',
                      'renderConstants',
                      'fieldsToDisplayChanged',
                      'belongsToUserChanged',
                      'nmrRowsChanged',
                      'nmrRowsNumberChanged',
                      'addedWidget',
                      'resized',
                      'resizing',
                      'itemLinkChanged');

      this.widgetModel = widgetModel;
      this.queryModel  = queryModel;
      this.rowModel    = rowModel;
      this.widgetsCollection = rowModel.get('uielements');

      this.entity = widgetModel.get('container_info').get('entity');


      this.render();
    },

    render: function() {
      var self = this;

      var editorDiv = document.createElement('div');
      editorDiv.className = 'list-editor-container';

      var RowEditorView = require('editor/RowEditorView');
      var rowView = new RowEditorView(this.rowModel, this.entity);

      this.rowEditorView = rowView;
      editorDiv.appendChild(rowView.el);

      var rowDiv = document.createElement('div');
      rowDiv.className = 'list-gallery-container elements-list';
      var rowGalleryView = new RowGalleryView(this.rowModel, this.entity);
      rowDiv.appendChild(rowGalleryView.el);


      this.$el.append('<h3>List Editor</h3>');
      this.el.appendChild(editorDiv);
      this.el.appendChild(rowDiv);
      this.$el.append('<div class="bottom-sect"><div class="q-mark"></div><div class="btn done-btn">Done</div></div>');

      return this;
    },

    renderConstants: function() {
      var self = this;

      $('.constant-elements').remove();
      for(var ii=0; ii <2; ii++) {
        var layout = _.clone(self.rowModel.get('layout'));
        layout.attributes.width = 6;
        var html = _.template(Templates.rowNode, { layout: layout,
                                          uielements: self.widgetsCollection.models });
        $('.list-editor-container').append('<div class="constant-elements">'+html+'</div>');
      }
    },

    fieldsToDisplayChanged: function(e) {
      var fieldsArray = _.clone(this.queryModel.get('fieldsToDisplay'));

      if(e.target.checked) {
        fieldsArray.push(e.target.value);
        this.addedWidget(e.target.id);
        fieldsArray = _.uniq(fieldsArray);
      }
      else {
        this.rowEditorView.removedWidget(e.target.id);
        fieldsArray = _.difference(fieldsArray, e.target.value);
      }

      this.queryModel.set('fieldsToDisplay', fieldsArray);
    },

    addedWidget: function(fieldId) {
      var cid = String(fieldId).replace('field-', '');
      var fieldModel = this.entity.get('fields').get(cid);

      var widget = {};
      widget.layout = {
        top   : 0,
        left  : 0,
        width : 2,
        height: 4
      };

      widget.field = fieldModel.cid;

      var uieType = "texts";
      if(fieldModel.get('type') == "image") {
        uieType = "images";
      }

      widget = _.extend(widget, uieState[uieType][0]);
      widget.content =  '{{'+this.entity.get('name')+'.'+fieldModel.get('name')+'}}';
      this.widgetsCollection.push(widget);
    },

    belongsToUserChanged: function(e) {
      if(e.target.checked) {
        var bool = (e.target.value == "true"? true : false);
        this.queryModel.set('belongsToUser', bool);
      }
    },

    nmrRowsChanged: function(e) {
      if(e.target.checked) {
        var val = e.target.value;

        if(val == 'First') {
          val += '-' + iui.get('first-nmr').value;
        } else if(val == 'Last') {
          val += '-' + iui.get('last-nmr').value;
        }

        this.queryModel.set('numberOfRows', val);
      }
    },

    nmrRowsNumberChanged: function(e) {
      var val = '';
      if(e.target.id == 'first-nmr') {
        iui.get('first-rows').checked = true;
        val = 'First-' + e.target.value;
      }
      else if (e.target.id == 'last-nmr') {
        iui.get('last-rows').checked = true;
        val = 'Last-' + e.target.value;
      }

      this.queryModel.set('numberOfRows', val);
      e.stopPropagation();
    },

    sortByChanged: function(e) {
      this.queryModel.set('sortAccordingTo', e.target.value);
    },

    resized: function() {
      this.rowWidget.style.width = '';
      this.rowWidget.style.height ='';
      this.rowWidget.className = 'editor-window container-wrapper ';
      this.rowWidget.className += 'span' + this.rowModel.get('layout').get('width');
      this.rowWidget.style.height = (this.rowModel.get('layout').get('height') * GRID_HEIGHT) + 'px';
      this.rowWidget.style.position = "relative";
    },

    resizing: function(e, ui) {
      var dHeight = (ui.size.height + 2) / GRID_HEIGHT;
      var dWidth = (ui.size.width + 2) / GRID_WIDTH;

      var deltaHeight = Math.round((ui.size.height + 2) / GRID_HEIGHT);
      var deltaWidth = Math.round((ui.size.width + 2) / GRID_WIDTH);

      this.rowModel.get('layout').set('width', deltaWidth);
      this.rowModel.get('layout').set('height', deltaHeight);
    },

    itemLinkChanged: function(e) {
      this.rowModel.set('goesTo', '{{' + e.target.value + '}}');
    }
  });

  return ListEditorView;
});
