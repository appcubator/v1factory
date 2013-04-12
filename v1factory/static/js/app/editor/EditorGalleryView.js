define([
  'app/collections/ElementCollection',
  'app/models/UserEntityModel',
  'backbone',
  'iui'
],
function(ElementCollection,
         UserEntityModel,
         Backbone) {

  var EditorGalleryView = Backbone.View.extend({
    el                  : iui.get('top-panel-bb'),
    allList             : iui.get('all-list'),
    elementsList        : iui.get('interface-list'),
    dataList            : iui.get('entities-list'),
    userList            : iui.get('user-list'),
    widgetsCollection   : null,
    containersCollection: null,
    curId               : 'all-elements',
    dragActive          : false,

    events : {
      'click .header' : 'sectionClicked'
    },

    initialize   : function(widgetsCollection, containersCollection) {
       _.bindAll(this, 'render',
                       'appendEntity',
                       'appendContextEntity',
                       'appendElement',
                       'appendUserElements',
                       'dropped',
                       'setupSearch');

      this.elementsCollection   = new ElementCollection(defaultElements);
      this.widgetsCollection    = widgetsCollection;
      this.containersCollection = containersCollection;

      this.userModel = g_userModel;

      g_entityCollection.bind('add',     this.appendEntity, this);
      g_contextCollection.bind('add',    this.appendContextEntity, this);
      this.elementsCollection.bind('add',this.appendElement, this);

      this.render();
    },

    render: function() {
      var self = this;
      this.appendUserElements();

      _(g_entityCollection.models).each(function(entity) {
        self.appendEntity(entity);
      });

      _(g_contextCollection.models).each(function(entity) {
        self.appendContextEntity(entity);
      });

      _(self.elementsCollection.models).each(function(element) {
        self.appendElement(element);
      });

      return this;
    },

    appendUserElements: function(){
      // Form, Data elements belonging to the user.

      var self = this;
      //g_entityCollection.push(appState.users, {silent : true});


      if(this.userModel.has('forms')) {
        _(this.userModel.get('forms').models).each(function(form) {

            var html = _.template(Templates.formButton, {entity: {cid: "user"},
                                                                  form: form});
            $(self.allList).append(html);
        });
      }

      if(appState.users.facebook) {
        var tempFb = '<li id="entity-user" class="facebook entity">'+
                     '<span class="name">Facebook Login Button</span></li>';

        //$(this.userList).append(tempFb);
        $(self.allList).append(tempFb);
      }
      if(appState.users.twitter) {
        var tempTw = '<li id="entity-user" class="twitter entity">'+
                     '<span class="name"> Twitter Button</span></li>';

        //$(this.userList).append(tempTw);
        $(self.allList).append(tempTw);
      }

      if(appState.users.linkedin) {
        var tempLi = '<li id="entity-user" class="linkedin entity">'+
                     '<span class="name">LinkedIn Login Button</span></li>';

        //$(this.userList).append(tempLi);
        $(self.allList).append(tempLi);
      }

      this.appendContextEntity(this.userModel);


      var context = {
        name : "User",
        cid : "user"
      };
      $(this.allList).append(_.template(Templates.tempLiTable, context));

      $('.entity').draggable({
        cursor: "move",
        cursorAt: { top: 0, left: 0 },
        helper: "clone",
        start : function(e) {
          self.dragActive = true;
        },
        stop: self.dropped
      });

      _(appState.users.fields).each(function(field) {
        var temp_context = {
          name : "User",
          attr : field.name,
          type : field.type
        };

        $(self.allList).append(_.template(Templates.tempLi, temp_context));
      });

      $('.single-data').draggable({
        cursor: "move",
        cursorAt: { top: 0, left: 0 },
        helper: "clone",
        start : function(e) {
          self.dragActive = true;
        },
        stop: self.dropped
      });
    },

    appendEntity : function(entityModel) {
      // Form, Data elements belonging to the entity
      var self = this;

      var context = {
        name : entityModel.get('name'),
        cid : entityModel.cid
      };

      $(this.allList).append(_.template(Templates.tempLiEntity, context));
      $(this.allList).append(_.template(Templates.tempLiTable, context));

      // Displaying just the create forms
      if(entityModel.has('forms')) {
        _(entityModel.get('forms').models).each(function(form) {
          if(form.get('action') == "create") {
            var html = _.template(Templates.createFormButton, {entity: entityModel,
                                                               form: form});

            $(self.allList).append(html);
          }
        });
      }

      $('.entity').draggable({
        cursor: "move",
        cursorAt: { top: 0, left: 0 },
        helper: "clone",
        start : function(e) {
          self.dragActive = true;
        },
        stop: self.dropped
      });
    },

    appendContextEntity : function(entityModel) {
      // Form, Data elements belonging to the entity
      var self = this;

      _(entityModel.get('fields').models).each(function(model, ind) {
        var context = {
          name : entityModel.get('name'),
          cid  : entityModel.cid,
          attr : model.get('name'),
          type : model.get('type')
        };

        $(self.allList).append(_.template(Templates.tempLiSingleData, context));
      });


      // Displaying just the edit forms
      if(entityModel.has('forms')) {
        _(entityModel.get('forms').models).each(function(form) {
          if(form.get('type') == "edit") {
            var html = _.template(Templates.createFormButton, {entity: entityModel,
                                                               form: form});

            $(self.allList).append(html);
          }
        });
      }

      $('.single-data').draggable({
        cursor: "move",
        cursorAt: { top: 0, left: 0 },
        helper: "clone",
        start : function(e) {
          self.dragActive = true;
        },
        stop: self.dropped
      });

    },

    appendElement: function(elementModel) {
      var self = this;
      var li = document.createElement('li');
      li.className = elementModel.get('className');
      li.innerHTML = '<span class="name">'+ elementModel.get('text')+'</span>';

      $(this.allList).append(li);

      $('.' + elementModel.get('className')).draggable({
        cursor  : "move",
        cursorAt: { top: 0, left: 0 },
        helper: function( event ) {
          return $(elementModel.get('el')).css('position','fixed');
        },
        start : function(e) {
          self.dragActive = true;
        },
        stop: self.dropped
      });

      $(li).on('click', self.dropped);
    },

    sectionClicked: function(e) {
      var newId = String(e.target.id).replace('cont-', '') + '-elements';
      $('#'+this.curId).hide();
      $('#'+newId).fadeIn();
      this.curId = newId;
      $('.selected').removeClass('selected');
      $(e.target).addClass('selected');
    },

    setupSearch: function() {
      // var options = {
      //   valueNames: ['name']
      // };
      // var featureList = new List('top-panel-bb', options);
    },

    dropped : function(e, ui) {
      var self = this;
      var widget = {};
      var left, top, offsetLeft;

      this.dragActive = false;

      if(e.type != 'click') {
        offsetLeft = document.getElementById('page-wrapper').offsetLeft + 100;
        left = Math.round((e.pageX - offsetLeft)/GRID_WIDTH);
        top  = Math.round((e.pageY - $('.page')[0].offsetTop - 180)/GRID_HEIGHT);

        if(top < 0) top = 0;
        if(left < 0) left = 0;
        if(left + 4 > 12) left = 8;
      }
      else {
        left = 0;
        top = 1;
        window.scrollTo(0,0);
      }

      widget.layout = {
        top   : top,
        left  : left
      };

      var className = e.target.className;
      var id = e.target.id;

      var hash, entityCid, formCid, action;
      var entity, form, field;

      if(/(entity)/.exec(className)) {

        hash      = String(id).split('-');
        entityCid = hash[1];
        formCid   = hash[2];
        action    = className.split(' ')[0];


        if(entityCid === 'user'){
          entity = g_userModel;
          form = entity.get('forms').get(formCid);
        }
        else {
          entity = g_entityCollection.get(entityCid);
          form = entity.get('forms').get(formCid);
        }

        widget.container_info = {};
        widget.container_info.entity = entity;
        widget.container_info.action = action;
        if(form) {
          widget.container_info.form = '{{' + form.get('name') + '}}';
        }

        this.containersCollection.push(widget);
      }
      else if (/(single-data)/.exec(className)) {
        id = String(id).replace('entity-','');
        var cid = id.split('-')[0];

        if(cid === this.userModel.cid) {
          entity = new UserEntityModel(appState.users);
        }
        else {
          entity = this.entitiesCollection.get(cid);
        }

        field          = id.split('-')[1];

        widget         = _.extend(widget, uieState['texts'][0]);
        widget.content =  '{{'+entity.get('name')+'.'+field+'}}';
        this.widgetsCollection.push(widget);
      }
      else {
        var type;
        type        = className.replace(' ui-draggable','');
        widget      = _.extend(widget, uieState[type][0]);
        widget.type = type;
        this.widgetsCollection.push(widget);
      }
    },

    determineType: function(className, id, widget) {
      var self = this;
    }
  });

  return EditorGalleryView;
});
