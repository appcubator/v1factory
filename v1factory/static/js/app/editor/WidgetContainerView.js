define([
  'editor/TableQueryView',
  'editor/WidgetView',
  'editor/SubWidgetView',
  'app/views/FormEditorView',
  'dicts/constant-containers',
  'editor/editor-templates'
],
function( TableQueryView,
          WidgetView,
          SubWidgetView,
          FormEditorView) {

  var WidgetContainerView = WidgetView.extend({
    el: null,
    className: 'container-create',
    tagName : 'div',
    entity: null,
    type: null,
    events: {
      'click'         : 'select',
      'click .delete' : 'remove',
      'dblclick'      : 'showDetails'
    },

    initialize: function(widgetModel) {
      WidgetContainerView.__super__.initialize.call(this, widgetModel);
      var self = this;
      _.bindAll(this, 'render',
                      'reRender',
                      'placeWidget',
                      'placeFormElement',
                      'renderElements',
                      'showDetails');

      this.model.get('container_info').get('uielements').bind("add", this.placeWidget);

      var action = this.model.get('container_info').get('action');

      if(this.model.get('container_info').has('query')) {
        this.model.get('container_info').get('query').bind('change', this.reRender);
      }


      if(this.model.get('container_info').has('form')) {
        var form = this.model.get('container_info').get('form');
        if(form.get('fields').models.length < 2 &&
           form.get('action') != "facebook"     &&
           form.get('action') != "twitter"      &&
           form.get('action') != "linkedin") {
          new FormEditorView(form, this.model.get('container_info').get('entity'));
        }

        this.formModel = form;
        this.formModel.bind('change', this.reRender);
        this.formModel.get('fields').bind('remove', this.reRender);
        this.formModel.get('fields').bind('add', this.reRender);
        _(this.formModel.get('fields').models).each(function(model){ model.bind('change', self.reRender); });
      }

      this.render();
      this.resizableAndDraggable();
      this.renderElements();
    },

    render: function() {
      var self = this;
      var form;

      this.el.innerHTML = '';

      var width = this.model.get('layout').get('width');
      var height = this.model.get('layout').get('height');

      this.setTop(GRID_HEIGHT * this.model.get('layout').get('top'));
      this.setLeft(GRID_WIDTH * this.model.get('layout').get('left'));
      this.setHeight(height * GRID_HEIGHT);

      this.el.className += ' widget-wrapper span'+width;
      this.el.id = 'widget-wrapper-' + this.model.cid;

      if(this.model.get('container_info').get('action') == "table-gal") {
        var tableDiv = document.createElement('div');
        tableDiv.innerHTML = _.template(Templates.tableNode, this.model.get('container_info').get('query').attributes);
        this.el.appendChild(tableDiv);
      }

      if(this.model.get('container_info').has('form')) {
        self.form = document.createElement('form');
        self.el.appendChild(self.form);
      }

      return this;
    },

    reRender: function() {
      $( this.el ).resizable( "destroy" );
      $( this.el ).draggable( "destroy" );
      this.render();
      this.resizableAndDraggable();
      this.renderElements();
    },

    placeWidget: function(model, a) {
      var widgetView = new SubWidgetView(model);
      this.el.appendChild(widgetView.el);
      model.get('layout').bind('change', this.reRender);
    },

    placeFormElement: function(fieldModel) {
      var inp_class = uieState.textInputs[0].class_name;
      var fieldHtml = _.template(Templates.fieldNode, { field: fieldModel, inpClass: ""});
      $(this.form).append(fieldHtml);
    },

    renderElements : function() {
      var self  =this;
      _(this.model.get('container_info').get('uielements').models).each(function(widgetModel) {
        self.placeWidget(widgetModel);
      });

      if(this.model.get('container_info').has('form')) {
        _(this.formModel.get('fields').models).each(function(field) {
          self.placeFormElement(field);
        });
      }
    },

    showDetails: function() {
      if(this.model.get('container_info').get('action') === "table-gal") {
        new TableQueryView(this.model, 'table');
      }
      if(this.model.get('container_info').has('form')) {
        new FormEditorView(this.formModel,
                           this.model.get('container_info').get('entity'));
      }
    }
  });

  return WidgetContainerView;
});
