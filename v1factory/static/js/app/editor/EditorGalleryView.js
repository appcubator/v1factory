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
    widgetsCollection   : null,
    containersCollection: null,
    curId               : 'all-elements',
    dragActive          : false,

    events : { },

    initialize   : function(widgetsCollection) {
       _.bindAll(this, 'render',
                       'dropped',
                       'renderUIElementList',
                       'renderAuthenticationForms',
                       'renderCurrentUserElements',
                       'renderEntitiyFormsTablesLists',
                       'renderContextEntityForms',
                       'getFieldType');

      this.widgetsCollection = widgetsCollection;

      this.render();
    },

    render: function() {
      // Basic UI Elements
      // Authentication Forms
      // CurrentUser Elements
      // All Create Forms, Tables, Lists
      // Context Entity Elements and Update Forms
      var self = this;

      this.renderAuthenticationForms();
      this.renderCurrentUserElements();
      this.renderEntitiyFormsTablesLists();
      this.renderContextEntityForms();
      this.renderUIElementList();

      this.$el.find('li:not(.ui-draggable)').draggable({
        cursor: "move",
        cursorAt: { top: 0, left: 0 },
        helper: "clone",
        start : function(e) {
          self.dragActive = true;
        },
        stop: self.dropped
      });
      this.$el.find('li').on('click', self.dropped);
      return this;
    },

    renderUIElementList: function() {
      var self = this;
      var collection = new ElementCollection(defaultElements);

      _(collection.models).each(function(element) {
        if(element.get('className') == "buttons" ||
           element.get('className') == "textInputs" ||
           element.get('className') == "textAreas" ||
           element.get('className') == "dropdowns") return;

        self.appendUIElement(element);

      });
    },

    appendUIElement: function(elementModel) {
      var self = this;
      var li = document.createElement('li');
      li.className = 'uielement ' + elementModel.get('className');
      li.id='type-' + elementModel.get('className');
      li.innerHTML = '<span class="icon '+  elementModel.get('className') + '"></span><span class="name">'+ elementModel.get('text')+'</span>';
      $(this.allList).append(li);

      $(li).draggable({
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
    },

    renderAuthenticationForms: function() {
      var self = this;
      if(appState.users.local) {
        var tempLocal = '<li id="entity-user-Local Login" class="login authentication">'+
                     '<span class="name">Login Form</span></li>';
        $(self.allList).append(tempLocal);
      }

      if(appState.users.facebook) {
        var tempFb = '<li id="entity-user-facebook" class="facebook authentication">' +
                     '<span class="name">Facebook Login Button</span></li>';
        $(self.allList).append(tempFb);
      }

      if(appState.users.twitter) {
        var tempTw = '<li id="entity-user-twitter" class="twitter authentication">'+
                     '<span class="name"> Twitter Button</span></li>';
        $(self.allList).append(tempTw);
      }

      if(appState.users.linkedin) {
        var tempLi = '<li id="entity-user-linkedin" class="linkedin authentication">'+
                     '<span class="name">LinkedIn Login Button</span></li>';
        $(self.allList).append(tempLi);
      }
    },

    renderCurrentUserElements: function() {
      var self = this;
      var tempLi = ['<li class="current-user" id="current-user-<%= id %>">',
                      '<span class="current-user-icon"></span>',
                      '<span class="wide-text">Current User <%= field_name %></span>',
                    '</li>'].join('\n');

      _(v1State.get('users').get('fields').models).each(function(field) {
        var context = { id : field.cid, field_name : field.get('name') };
        $(self.allList).append(_.template(tempLi, context));
      });
    },

    renderEntitiyFormsTablesLists: function() {
      var self = this;
      var tempCreateFormLi = ['<li class="entity-create-form" id="entity-<%= entity_id %>">',
                              '<span class="create-form-icon"></span>',
                              '<span class="wide-text"><%= entity_name %> Create Form</span>',
                              '</li>'].join('\n');

      var tempTableLi      = ['<li class="entity-table" id="entity-<%= entity_id %>">',
                              '<span class="table-icon"></span>',
                              '<span class="wide-text"><%= entity_name %> Table</span>',
                              '</li>'].join('\n');

      var tempListLi       = ['<li class="entity-list" id="entity-<%= entity_id %>">',
                              '<span class="list-icon"></span>',
                              '<span class="wide-text"><%= entity_name %> List</span>',
                              '</li>'].join('\n');

      _(v1State.get('entities').models).each(function(entityModel) {
        var context = { entity_id : entityModel.cid, entity_name : entityModel.get('name')};
        $(self.allList).append(_.template(tempCreateFormLi, context));
        $(self.allList).append(_.template(tempTableLi, context));
        $(self.allList).append(_.template(tempListLi, context));
      });

    },

    renderContextEntityForms: function() {
      var self = this;
      var tempLi = ['<li class="context-entity" id="context-field-<%= entity_id %>-<%= field_id %>">',
                      '<span class="plus-icon"></span>',
                      '<span class="wide-text"><%= entity_name %> <%= field_name %></span>',
                    '</li>'].join('\n');

      var tempLiForm = ['<li class="context-entity-update" id="update-<%= entity_id %>">',
                          '<span class="form-icon"></span>',
                          '<span class="wide-text"><%= entity_name %> Update Form</span>',
                        '</li>'].join('\n');


      _(g_contextCollection.models).each(function(entity) {
        var entityName = entity.get('name');
        var entityId = entity.cid;
        var context = {entity_id : entityId, entity_name : entityName};
        //$(self.allList).append(_.template(tempLiForm, context));

        _(entity.get('fields').models).each(function(field) {
          var context = { entity_id : entityId, entity_name : entityName,
                          field_id : field.cid, field_name: field.get('name') };

          $(self.allList).append(_.template(tempLi, context));
        });

      });
    },

    dropped : function(e, ui) {
      var self = this;

      var left = 0; var top = 1;
      if(e.type != 'click') {
        left = self.findLeft(e, ui);
        top  = self.findTop(e, ui);
      }

      var widget = {};
      widget.layout = { top: top, left: left };
      widget.context = "";

      var targetEl = e.target;
      if(e.target.tagName != "LI") {
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
        widget.container_info.entity = "User";
        widget.container_info.action = "signup";
        widget.container_info.form = form;
        var widgetContainerModel = new ContainerWidgetModel(widget);
        this.widgetsCollection.push(widgetContainerModel);

      }
      else if(/(context-entity)/.exec(className)) {
        hash = String(id).replace('context-field-','');
        hash = hash.split('-');
        entity = v1State.get('entities').get(hash[0]);
        field = entity.get('fields').get(hash[1]);

        var editorContext = this.editorContext ? this.editorContext : "page";

        content =  '{{' + editorContext +'.'+ entity.get('name') +'.'+field.get('name')+'}}';

        widget         = _.extend(widget, uieState[self.getFieldType(field)][0]);
        widget.content =  content;
        var widgetModel = new WidgetModel(widget);
        this.widgetsCollection.push(widgetModel);
        widgetModel.select();
      }
      else if(/(entity)/.exec(className)) {
        cid  = String(id).replace('entity-','');

        widget.container_info = {};
        widget.container_info.entity = v1State.get('entities').get(cid);
        if(/(entity-create-form)/.exec(className)) {
          widget.container_info.action = "create";
        }
        if(/(entity-create-form)/.exec(className)) {
          //widget.container_info.action = "update";
        }
        if(/(entity-table)/.exec(className)) {
          widget.container_info.action = "table";
        }
        if(/(entity-list)/.exec(className)) {
          widget.container_info.action = "show";
        }

        var widgetContainerModel = new ContainerWidgetModel(widget);
        this.widgetsCollection.push(widgetContainerModel);
      }
      else if (/(current-user)/.exec(className)) {
        var field_id = String(id).replace('current-user-','');
        field = v1State.get('users').get('fields').get(field_id);

        entity = v1State.get('users');
        content =  '{{CurrentUser.'+field.get('name')+'}}';

        widget         = _.extend(widget, uieState[self.getFieldType(field)][0]);
        widget.content =  content;
        var widgetModel = new WidgetModel(widget);
        this.widgetsCollection.push(widgetModel);
        widgetModel.select();
      }
      else if (/(uielement)/.exec(className)){
        var type    = id.replace('type-','');
        widget      = _.extend(widget, uieState[type][0]);
        widget.type = type;
        this.widgetsCollection.push(widget);
      }
      else {
        alert('ufo!');
      }
    },

    findLeft: function(e, ui) {
      var offsetLeft = document.getElementById('elements-container').offsetLeft;
      var left = Math.round((e.pageX - offsetLeft)/GRID_WIDTH);
      if(left < 0) left = 0;
      if(left + 4 > 12) left = 8;

      return left;
    },

    findTop: function(e, ui) {
      var offsetScrolledTop = $('#elements-container').offset().top;
      var top  = Math.round((e.pageY - offsetScrolledTop)/GRID_HEIGHT);
      if(top < 0) top = 0;

      return top;
    },

    getFieldType: function (fieldModel) {
      var type;

      switch(fieldModel.get('type')) {
        case "text":
        case "date":
        case "number":
        case "email":
          type = "texts";
          break;
        case "image":
          type = "images";
          break;
      }

      return type;
    }

  });

  return EditorGalleryView;
});
