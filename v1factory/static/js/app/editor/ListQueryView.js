define([
  'backboneui',
  'backbone',
  'app/collections/WidgetCollection',
  'editor/WidgetView',
  'iui'
],function(BackboneUI, Backbone, WidgetCollection, WidgetView, iui) {

  var ListQueryView = BackboneUI.ModalView.extend({
    className : 'query-modal',
    width: 900,
    events: {
      'change .fields-to-display'   : 'fieldsToDisplayChanged',
      'click .belongs-to-user'      : 'belongsToUserChanged',
      'click .nmr-rows'             : 'nmrRowsChanged',
      'keydown #first-nmr, #last-nmr': 'nmrRowsNumberChanged',
      'change .sort-by'             : 'sortByChanged'
    },
    initialize: function(widgetModel, queryModel, rowModel) {
      _.bindAll(this, 'fieldsToDisplayChanged',
                      'belongsToUserChanged',
                      'nmrRowsChanged',
                      'nmrRowsNumberChanged',
                      'addedWidget',
                      'removedWidget',
                      'placeWidget');

      console.log(widgetModel);
      console.log(queryModel);

      this.widgetModel = widgetModel;
      this.queryModel  = queryModel;
      this.rowModel    = rowModel;

      this.entity = widgetModel.get('container_info').get('entity');

      this.widgetsCollection = this.rowModel.get('')

      this.widgetsCollection.bind('add', this.placeWidget);
      this.render();
    },

    render: function() {
      var self = this;

      var div = document.createElement('div');
      div.style.width = 320 + 'px';
      div.style.display = 'inline-block';

      var checks = {};
      var rFirstNmr=5, rLastNmr=5, rAllNmr = 0;
      var rFirst = '', rLast ='', rAll ='';

      if(String(this.model.get('numberOfRows')).indexOf('First') != -1) {
        rFirst = 'checked';
        rFirstNmr = (this.model.get('numberOfRows').replace('First-',''));
        if(rFirstNmr === "") rFirstNmr = 5;
      }
      else if (String(this.model.get('numberOfRows')).indexOf('Last') != -1) {
        rLast = 'checked';
        rLastNmr = (this.model.get('numberOfRows').replace('Last-',''));
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
        rAllNmr   : rAllNmr
      };

      var contentHTML = _.template(Templates.queryView, {entity: self.entity, query: self.model, c: checks});
      contentHTML += '<input type="submit" value="Done">';
      div.innerHTML = contentHTML;

      var editorDiv = document.createElement('div');
      editorDiv.className = 'list-editor-container';
      var listEditorHTML = _.template(Templates.listEditorView, {entity: self.entity, query: self.model, c: checks});
      editorDiv.innerHTML = listEditorHTML;

      this.el.appendChild(div);
      this.el.appendChild(editorDiv);
      return this;
    },

    fieldsToDisplayChanged: function(e) {
      console.log(this.model);
      var fieldsArray = _.clone(this.model.get('fieldsToDisplay'));

      if(e.target.checked) {
        fieldsArray.push(e.target.value);
        this.addedWidget(e.target.id);
        fieldsArray = _.uniq(fieldsArray);
      }
      else {
        this.removedWidget(e.target.id);
        fieldsArray = _.difference(fieldsArray, e.target.value);
      }

      this.model.set('fieldsToDisplay', fieldsArray);
    },

    addedWidget: function(fieldId) {
      var cid = String(fieldId).replace('field-', '');
      var fieldModel = this.entity.get('fields').get(cid);
      

      var widget = {};
      widget.layout = {
        top   : 0,
        left  : 0
      };

      widget.field = fieldModel.cid;

      var uieType = "text";
      if(fieldModel.get('type') == "image") {
        uieType = "image";
      }

      widget = _.extend(widget, uieState[uieType][0]);
      widget.content =  '{{'+this.entity.get('name')+'_'+fieldModel.get('name')+'}}';
      this.widgetsCollection.push(widget);
    },

    removedWidget: function(fieldId) {
      var self = this;
      var cid = String(fieldId).replace('field-', '');
      console.log(this.widgetsCollection);
      var widget = this.widgetsCollection.where({field: cid})[0];      
      this.widgetsCollection.remove(widget);
      widget.remove();
    },

    belongsToUserChanged: function(e) {
      if(e.target.checked) {
        var bool = (e.target.value == "true"? true : false);
        this.model.set('belongsToUser', bool);
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

        this.model.set('numberOfRows', val);
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

      this.model.set('numberOfRows', val);
      e.stopPropagation();
    },

    sortByChanged: function(e) {
      this.model.set('sortAccordingTo', e.target.value);
    },

    placeWidget: function(widgetModel) {
      var curWidget = new WidgetView(widgetModel);

      if(!widgetModel.isFullWidth()) this.$el.find('.editor-window').append(curWidget.el);
      // else iui.get('full-container').appendChild(curWidget.el);
      curWidget.resizableAndDraggable();
    }

  });

  return ListQueryView;
});
