define([
  'collections/WidgetCollection',
  'models/QueryModel',
  'models/EntityModel',
  'models/UserEntityModel',
  'models/FormModel',
  'models/RowModel',
  'collections/SlideCollection',
  'models/SlideModel',
  'dicts/constant-containers'
],
function(WidgetCollection,
         QueryModel,
         EntityModel,
         UserEntityModel,
         FormModel,
         RowModel,
         SlideCollection,
         SlideModel) {

  var ContainerInfoModel = Backbone.Model.extend({
    initialize: function(bone, isNew) {
      _.bindAll(this, 'setUpNew');

      this.set('uielements', new WidgetCollection(bone.uielements));

      if(bone.entity) {
        if(!bone.entity.attributes) {

          if(bone.entity == "User") {
            this.set('entity', v1State.get('users'));
          }
          else {
            this.set('entity', v1State.get('entities').getEntityWithName(bone.entity));
          }
        }
        else {
          this.set('entity', bone.entity);
        }
      }

      if(bone.slides) {
        this.set('slides', new SlideCollection());
      }

      if(bone.row) {
        this.set('row', new RowModel(bone.row));
      }

      if(bone.query) {
        this.set('query', new QueryModel(bone.query, this.get('entity')));
      }

      if(bone.form) {
        if(!bone.form.attributes) {
          this.set('form', new FormModel(bone.form, this.get('entity')));
        }
        else {
          this.set('form', bone.form);
        }
      }

      if(isNew) this.setUpNew(bone);
    },

    setUpNew: function(bone) {
      var self = this;
      var action = bone.action;

      if(bone.action == "signup") {
        this.set('uielements',  new WidgetCollection());

        _(constantContainers[bone.action]).each(function(element){
          elementDefault = uieState[element.type][0];
          element = _.extend(elementDefault, element);
          self.get('uielements').push(element);
        });
      }
      else if(action == "create") {
        var form = new FormModel({}, this.get('entity'));
        form.fillWithProps(this.get('entity'));
        this.set('form', form);
      }
      else if(action == 'table') {
        alert('yo');
        this.set('query', new QueryModel({}, this.get('entity')));
      }
      else if(action == 'show') {
        var queryModel = new QueryModel({}, this.get('entity'));
        var rowModel   = new RowModel({});
        self.set('query', queryModel);
        self.set('row', rowModel);
      }
      else if(action == 'table-gal') {
        var queryM = new QueryModel({}, this.get('entity'));
        self.set('query', queryM);
      }
      else if(action == "imageslider") {
        self.set('slides', new SlideCollection());
        self.get('slides').push(new SlideModel());
        self.get('slides').push(new SlideModel());
      }
      else if(action == "twitterfeed") {
        self.set('username', "icanberk");
      }
      else {
        alert('UFO!');
      }
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.uielements = this.get('uielements').toJSON();

      if(json.form) json.form = json.form.toJSON();
      if(json.query) json.query = this.get('query').toJSON();
      if(this.has('row')) json.row = this.get('row').toJSON();

      if(this.has('entity')) {
        if(typeof json.entity !== "string") {
          json.entity = json.entity.get('name');
        }
      }


      return json;
    }
  });

  return ContainerInfoModel;
});
