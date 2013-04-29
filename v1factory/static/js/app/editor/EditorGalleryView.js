define([
  'app/collections/ElementCollection',
  'app/models/UserEntityModel',
  'app/models/ContainerWidgetModel',
  'app/models/WidgetModel',
  'dicts/constant-containers'
],
function(ElementCollection,
         UserEntityModel,
         ContainerWidgetModel,
         WidgetModel) {

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

    initialize   : function(widgetsCollection) {
       _.bindAll(this, 'render',
                       'appendEntity',
                       'appendContextEntity',
                       'appendElement',
                       'appendUserElements',
                       'dropped',
                       'setupSearch');

      this.elementsCollection   = new ElementCollection(defaultElements);
      this.widgetsCollection    = widgetsCollection;
      this.userModel = v1State.get('users');

      v1State.get('entities').bind('add',     this.appendEntity, this);
      g_contextCollection.bind('add',    this.appendContextEntity, this);
      this.elementsCollection.bind('add',this.appendElement, this);

      this.render();
    },

    render: function() {
      var self = this;
      this.appendUserElements();

      _(v1State.get('entities').models).each(function(entity) {
        self.appendEntity(entity);
      });

      _(g_contextCollection.models).each(function(entity) {
        self.appendContextEntity(entity);
      });

      _(self.elementsCollection.models).each(function(element) {
        if(element.get('className') == "buttons" ||
           element.get('className') == "textInputs" ||
           element.get('className') == "textAreas" ||
           element.get('className') == "dropdowns") return;
        self.appendElement(element);
      });

      this.$el.find('li').on('click', self.dropped);
      return this;
    },

    appendUserElements: function(){
      // Form, Data elements belonging to the user.

      var self = this;


      if(appState.users.local) {
        var tempLocal = '<li id="entity-user-Local Login" class="login authentication">'+
                     '<span class="name">Login Form</span></li>';

        //$(this.userList).append(tempFb);
        $(self.allList).append(tempLocal);
      }

      if(appState.users.facebook) {
        var tempFb = '<li id="entity-user-facebook" class="facebook authentication">' +
                     '<span class="name">Facebook Login Button</span></li>';

        //$(this.userList).append(tempFb);
        $(self.allList).append(tempFb);
      }

      if(appState.users.twitter) {
        var tempTw = '<li id="entity-user-twitter" class="twitter authentication">'+
                     '<span class="name"> Twitter Button</span></li>';

        //$(this.userList).append(tempTw);
        $(self.allList).append(tempTw);
      }

      if(appState.users.linkedin) {
        var tempLi = '<li id="entity-user-linkedin" class="linkedin authentication">'+
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

      $('.authentication').draggable({
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
      // if(entityModel.has('forms')) {
      //   _(entityModel.get('forms').models).each(function(form) {
      //     if(form.get('action') == "create") {
      //       var html = _.template(Templates.createFormButton, {entity: entityModel,
      //                                                          form: form});

      //       $(self.allList).append(html);
      //     }
      //   });
      // }
      var tempForm = '<li id="entity-<%= cid %>" class="create entity">'+
                     '<span class="name"><%= name %> Create Form</span></li>';
      $(this.allList).append(_.template(tempForm, context));


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
      var left, top, offsetLeft, offsetTop;

      this.dragActive = false;

      if(e.type != 'click') {
        offsetLeft = document.getElementById('elements-container').offsetLeft;
        offsetScrolledTop = $('#elements-container').offset().top;

        left = Math.round((e.pageX - offsetLeft)/GRID_WIDTH);
        top  = Math.round((e.pageY - offsetScrolledTop)/GRID_HEIGHT);

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
      widget.context = "";

      var targetEl;
      if(e.target.tagName == "LI") {
        targetEl = e.target;
      }
      else{
        targetEl = e.target.parentNode;
      }

      var className = targetEl.className;
      var id = targetEl .id;

      var hash, entityCid, formCid, action;
      var entity, form, field;

      if(/(authentication)/.exec(className)) {
        var formType = String(id).replace('entity-user-','');
        form = constantContainers[formType];
        console.log(form);
        widget.container_info = {};
        widget.container_info.entity = entity;
        widget.container_info.action = action;
        widget.container_info.form = form;
        var widgetContainerModel = new ContainerWidgetModel(widget);
        this.widgetsCollection.push(widgetContainerModel);

      }
      else if(/(entity)/.exec(className)) {

        hash      = String(id).split('-');
        console.log(id);
        console.log(hash);
        entityCid = hash[1];
        formCid   = hash[2];
        action    = className.split(' ')[0];

        if(entityCid === 'user'){
          entity = v1State.get('users');
          console.log(formCid);
          console.log(form);
        }
        else {
          entity = v1State.get('entities').get(entityCid);
          //form = entity.get('forms').get(formCid);
        }

        widget.container_info = {};
        widget.container_info.entity = entity;
        widget.container_info.action = action;

        if(form) {
          widget.container_info.form = form;
        }

        var widgetContainerModel = new ContainerWidgetModel(widget);
        this.widgetsCollection.push(widgetContainerModel);
      }
      else if (/(single-data)/.exec(className)) {
        id = String(id).replace('entity-','');
        var cid = id.split('-')[0];
        field   = id.split('-')[1];

        if(cid === this.userModel.cid || cid === "user") {
          entity = new UserEntityModel(appState.users);
          content =  '{{CurrentUser.'+field+'}}';
        }
        else {
          entity = v1State.get('entities').get(cid);
          content =  '{{page.'+entity.get('name')+'.'+field+'}}';
        }

        widget         = _.extend(widget, uieState['texts'][0]);
        widget.content =  content;
        var widgetModel = new WidgetModel(widget);
        this.widgetsCollection.push(widgetModel);
        widgetModel.select();
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
