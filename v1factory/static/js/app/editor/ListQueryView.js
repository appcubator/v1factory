define([
  'app/collections/WidgetCollection',
  'editor/WidgetView',
  'mixins/BackboneModal',
  'iui'
],function(WidgetCollection, WidgetView) {

  var ListQueryView = Backbone.ModalView.extend({
    className : 'query-modal',
    width: 920,
    height: 600,
    events: {
      'change .fields-to-display'    : 'fieldsToDisplayChanged',
      'click .belongs-to-user'       : 'belongsToUserChanged',
      'click .nmr-rows'              : 'nmrRowsChanged',
      'keydown #first-nmr, #last-nmr': 'nmrRowsNumberChanged',
      'change .sort-by'              : 'sortByChanged',
      'change .item-goes-to'         : 'itemLinkChanged'
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
                      'removedWidget',
                      'placeWidget',
                      'resized',
                      'resizing',
                      'itemLinkChanged');

      this.widgetModel = widgetModel;
      this.queryModel  = queryModel;
      this.rowModel    = rowModel;

      this.entity = widgetModel.get('container_info').get('entity');

      this.widgetsCollection = this.rowModel.get('uielements');
      this.widgetsCollection.bind('add', this.placeWidget);

      this.rowModel.get('layout').bind('change', this.renderConstants);
      this.queryModel.bind('change', this.renderConstants);
      this.rowModel.bind('change', this.renderConstants);

      this.render();

      _(self.widgetsCollection.models).each(function(widgetModel) {
        widgetModel.bind('change', self.renderConstants);
        self.placeWidget(widgetModel);
      });

      this.renderConstants();
    },

    render: function() {
      var self = this;

      var div = document.createElement('div');
      div.className = "query-view-panel";
      div.style.width = 260 + 'px';
      div.style.height = (this.height-4) + 'px';
      div.style.display = 'inline-block';

      var checks = {};
      var rFirstNmr=5, rLastNmr=5, rAllNmr = 0;
      var rFirst = '', rLast ='', rAll ='';

      if(String(this.queryModel.get('numberOfRows')).indexOf('First') != -1) {
        rFirst = 'checked';
        rFirstNmr = (this.queryModel.get('numberOfRows').replace('First-',''));
        if(rFirstNmr === "") rFirstNmr = 5;
      }
      else if (String(this.queryModel.get('numberOfRows')).indexOf('Last') != -1) {
        rLast = 'checked';
        rLastNmr = (this.queryModel.get('numberOfRows').replace('Last-',''));
        if(rLastNmr === "") rLastNmr = 5;
      }
      else {
        rAll = 'checked';
      }

      checks = {
        rFirstNmr : rFirstNmr,
        rFirst    : rFirst,
        rLastNmr  : rLastNmr,
        rLast     : rLast,
        rAll      : rAll,
        rAllNmr   : rAllNmr,
        row       : true
      };

      var contentHTML = _.template(Templates.queryView, {entity: self.entity, query: self.queryModel, row: self.rowModel, c: checks});
      div.innerHTML = contentHTML;

      var editorDiv = document.createElement('div');
      editorDiv.className = 'list-editor-container';

      var rowWidget = document.createElement('div');
      this.rowWidget = rowWidget;
      rowWidget.className = 'editor-window container-wrapper';
      rowWidget.className += (' hi' + this.rowModel.get('layout').get('height'));
      editorDiv.appendChild(rowWidget);

      if(this.rowModel.get('isListOrGrid') == "list") {
        iui.resizableVertical(rowWidget, self);
        rowWidget.style.width = '100%';
      }
      else {
        iui.resizable(rowWidget, self);
        rowWidget.className += (' span' + this.rowModel.get('layout').get('width'));
      }

      var actionDiv = document.createElement('div');
      actionDiv.className = 'list-action-editor';
      actionDiv.innerHTML = "<h1 class='title'>List Action</h1>";
      var linksToStr = "<label>Each item goes to <select class='item-goes-to'>";
      linksToStr += ('<option>None</option>');
      _(appState.pages).each(function(page) {
        if(_.contains(page.url.urlparts, '{{'+ self.queryModel.entity.get('name')  +'}}')) {
           linksToStr += ('<option>' + page.name + '</option>');
        }
      });

      linksToStr += "</select></label>";
      actionDiv.innerHTML += linksToStr;

      this.el.appendChild(div);
      this.el.appendChild(editorDiv);
      this.el.appendChild(actionDiv);
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
        this.removedWidget(e.target.id);
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

    removedWidget: function(fieldId) {
      var self = this;
      var cid = String(fieldId).replace('field-', '');
      var widget = this.widgetsCollection.where({field: cid})[0];

      if(!widget) {
        var model = this.entity.get('fields').get(cid);
        widget = this.widgetsCollection.where({content: "{{" + self.entity.get('name') + '.' + model.get('name') + '}}'})[0];
      }

      this.widgetsCollection.remove(widget);
      $('#widget-wrapper-' + widget.cid).remove();
      widget.remove();
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

    placeWidget: function(widgetModel) {

      widgetModel.get('layout').bind('change', this.renderConstants);
      var curWidget = new WidgetView(widgetModel);

      if(!widgetModel.isFullWidth()) this.rowWidget.appendChild(curWidget.el);
      curWidget.resizableAndDraggable();
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

  return ListQueryView;
});
