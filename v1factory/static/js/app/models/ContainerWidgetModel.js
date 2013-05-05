define([
  'app/models/WidgetModel',
  'app/models/ContentModel',
  'app/models/LayoutModel',
  'app/models/ContainerInfoModel',
  'app/models/FormModel',
  'editor/TableQueryView',
  'editor/ListEditorView',
  'app/models/QueryModel',
  'app/models/RowModel',
  'app/views/FormEditorView',
  'app/collections/WidgetCollection',
  'dicts/constant-containers'
],
function(WidgetModel,
         ContentModel,
         LayoutModel,
         ContainerInfoModel,
         FormModel,
         TableQueryView,
         ListEditorView,
         QueryModel,
         RowModel,
         FormEditorView,
         WidgetCollection) {

  var ContainerWidgetModel = WidgetModel.extend({
    selected: false,

    defaults: {
      'container_info' : null,
      'deletable' : true
    },

    initialize: function(bone) {
      ContainerWidgetModel.__super__.initialize.call(this, bone);
      var self = this;

      this.set('container_info', new ContainerInfoModel(this.get('container_info')));

      if(this.get('container_info').get('uielements').length || this.get('container_info').has('query')) {
        return;
      }

      if(this.get('container_info').has('form')) {

      }
      else if(constantContainers[this.get('container_info').get('action')]) {
        this.get('container_info').set('uielements',  new WidgetCollection());

        _(constantContainers[this.get('container_info').get('action')]).each(function(element){
          elementDefault = uieState[element.type][0];
          element = _.extend(elementDefault, element);
          self.get('container_info').get('uielements').push(element);
          //self.get('container_info')widgetsCollections.push(element);
        });
      }
      else {
        var action = this.get('container_info').get('action') ;

        console.log(this.get('container_info'));
        if(action == "create") {
          if(!this.get('container_info').has('form')) {
            var form = new FormModel({}, this.get('container_info').get('entity'));
            this.get('container_info').set('form', form);
          }
        }
        else if(this.get('container_info').get('action') == 'table') {
          if(!this.get('container_info').has('query')) {
            this.get('container_info').set('query', new QueryModel({}, this.get('container_info').get('entity')));
          }
        }
        else {
          this.containerHandler[this.get('container_info').get('action')].call(this);
        }
      }

    },

    toJSON : function() {
      var json = _.clone(this.attributes);
      json = _.omit(json, 'selected', 'deletable');

      json.content_attribs = this.get('content_attribs').toJSON()|| {};
      json.content = this.get('content')||'';
      json.layout  = this.get('layout').toJSON();
      if(json.container_info) {
        json.container_info = this.get('container_info').toJSON();
      }

      if(this.has('container_info')) {
        json.container_info = this.get('container_info').toJSON();
      }

      return json;
    },


    containerHandler: {
      'show' : function() {
        var self = this;
        var isNew = false;

        if(!self.get('container_info').has('query')) {
          var queryModel = new QueryModel({}, this.get('container_info').get('entity'));
          var rowModel   = new RowModel({});

          self.get('container_info').set('query', queryModel);
          self.get('container_info').set('row', rowModel);

          new ListEditorView(self, queryModel, rowModel);
        }
      },
      'table-gal' : function() {
        alert('dont delete me');
        var self = this;
        var isNew = false;

        if(!self.get('container_info').has('query')) {
          var queryModel = new QueryModel({}, this.get('container_info').get('entity'));
          self.get('container_info').set('query', queryModel);
        }

      }
    }
  });

  return ContainerWidgetModel;
});
