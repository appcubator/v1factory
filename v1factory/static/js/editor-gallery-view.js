/*
 *  Editor - Entities
 *  Written by icanberk
 *
 *  Abstract:
 *  This module creates and controls the entities section
 *  on the right of the editor page.
 *
 *  Includes:
 *  - EntityModel
 *  - EntityCollection
 *  - EntityView
 *  - EntitiesListView
 *
 */

var GalleryView = Backbone.View.extend({
  el           : document.getElementById('top-panel-bb'),
  allList      : document.getElementById('all-list'),
  elementsList : document.getElementById('interface-list'),
  dataList     : document.getElementById('entities-list'),
  userList     : document.getElementById('user-list'),
  curId        : 'all-elements',
  dragActive   : false,

  events : {
    'click .header' : 'sectionClicked'
  },

  initialize   : function(widgetsCollection, contextColl, entitiesColl) {
     _.bindAll(this, 'render',
                     'appendEntity',
                     'appendContextEntity',
                     'appendElement',
                     'appendUserElements',
                     'dropped',
                     'mousemoveHandler',
                     'setupSearch');

    this.render();

    this.entitiesCollection  = entitiesColl;
    this.contextCollection   = contextColl;
    this.elementsCollection  = new ElementCollection();
    this.widgetsCollection   = widgetsCollection;

    this.entitiesCollection.bind('add', this.appendEntity, this);
    this.contextCollection.bind('add',  this.appendContextEntity);
    this.elementsCollection.bind('add',  this.appendElement, this);

    this.elementsCollection.add(defaultElements);

    this.appendUserElements();

  },

  render: function() {
    // $('#item-gallery').css('top', -180);
    // this.mY = 0;
    $('body').mousemove(this.mousemoveHandler);
  },

  appendUserElements: function(){
    // Registration form
    // Login Form
    // Login with FB
    // Login with Twitter
    // Login with LinkedIn
    // Logout
    // Update User
    // Attribs

    if(appState.users.facebook) {
      var tempFb = '<li id="entity-<%= cid %>" class="facebook entity">'+
                   '<span class="name">Facebook Login Button</span></li>';

      $(this.userList).append(tempFb);
      $(this.allList).append(tempFb);
    }
    if(appState.users.twitter) {
      var tempTw = '<li id="entity-<%= cid %>" class="twitter entity">'+
                   '<span class="name"> Twitter Button</span></li>';

      $(this.userList).append(tempTw);
      $(this.allList).append(tempTw);
    }

    if(appState.users.linkedin) {
      var tempLi = '<li id="entity-<%= cid %>" class="linkedin entity">'+
                   '<span class="name">LinkedIn Login Button</span></li>';

      $(this.userList).append(tempLi);
      $(this.allList).append(tempLi);
    }


    var self = this;
    var tempLi   = '<li id="entity-<%= cid %>-<%= attr %>" class="large single-data">'+
                   '<span class="name">Show <%= name %> <%= attr %></span></li>';

    appState.users.fields.push({
      name : "Name",
      required: "",
      type :"text"
    });

    appState.users.fields.push({
      name : "Last Name",
      required: "",
      type :"text"
    });

    appState.users.fields.push({
      name : "Email",
      required: "",
      type :"text"
    });

    appState.users.name = "User";

    var model = this.entitiesCollection.push(appState.users, {silent : true});

    _(appState.users.fields).each(function(val, key, ind) {
      var context = {
        name : "User",
        cid  : model.cid,
        attr : val.name,
        type : val.type
      };

      $(self.userList).append(_.template(tempLi, context));
      $(self.allList).append(_.template(tempLi, context));
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

    this.setupSearch();

  },

  appendEntity : function(entityModel) {
    var self = this;
    var context = {
      name : entityModel.get('name'),
      cid : entityModel.cid
    };

    var tempLi   = '<li id="entity-<%= cid %>" class="query entity">'+
                   '<span class="name">List of <%= name %></span></li>';
    var tempForm = '<li id="entity-<%= cid %>" class="form entity">'+
                   '<span class="name">Add <%= name %> Form</span></li>';
    var tempBtn  = '<li id="entity-<%= cid %>" class="addbutton entity">'+
                   '<span class="name">Add <%= name %> Button</span></li>';

    $(this.dataList).append(_.template(tempLi, context));
    $(this.allList).append(_.template(tempLi, context));

    $(this.dataList).append(_.template(tempForm, context));
    $(this.allList).append(_.template(tempForm, context));

    $(this.dataList).append(_.template(tempBtn, context));
    $(this.allList).append(_.template(tempBtn, context));


    $('.entity').draggable({
      cursor: "move",
      cursorAt: { top: 0, left: 0 },
      helper: "clone",
      start : function(e) {
        self.dragActive = true;
      },
      stop: self.dropped
    });

    this.setupSearch();
  },

  appendContextEntity : function(entityModel) {
    // Edit X Form
    // Edit X Button
    // Delete X Button
    // Attr of X - UIElement

    var self = this;
    var tempLi   = '<li id="entity-<%= cid %>-<%= attr %>" class="large single-data">'+
                   '<span class="name">Show <%= name %> <%= attr %></span></li>';

    console.log(entityModel);

    _(entityModel.get('fields')).each(function(val, key, ind) {
      var context = {
        name : entityModel.get('name'),
        cid  : entityModel.cid,
        attr : val.name,
        type : val.type
      };

      $(self.dataList).append(_.template(tempLi, context));
      $(self.allList).append(_.template(tempLi, context));
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

    this.setupSearch();
  },

  appendElement: function(elementModel) {
    var self = this;
    var tempLi = '<li class="<%= className %>"><span class="name"><%= text %></span></li>';
    var html = _.template(tempLi, elementModel.attributes);
    $(this.elementsList).append(html);
    $(this.allList).append(html);

    $('.' + elementModel.get('className')).draggable({
      cursor: "move",
      cursorAt: { top: 0, left: 0 },
      helper: function( event ) {
        return $(elementModel.get('el')).css('position','fixed');
      },
      start : function(e) {
        self.dragActive = true;
      },
      stop: self.dropped
    });

    this.setupSearch();
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
    var options = {
      valueNames: ['name']
    };

    var featureList = new List('top-panel-bb', options);
  },

  mousemoveHandler: function(e) {
    // var top = e.pageY - $(window).scrollTop();

    // if (e.pageY < this.mY && top < 300) {
    //   $('#item-gallery').css('top', 0);
    // }
    // if (e.pageY > this.mY && top > 300 && !this.dragActive) {
    //   $('#item-gallery').css('top', -180);
    // }

    // this.mY = e.pageY;
  },

  dropped : function(e, ui) {
    this.dragActive = false;

    var left = Math.round((e.pageX - $('#body-container')[0].offsetLeft)/GRID_WIDTH);
    var top  = Math.round((e.pageY - $('#body-container')[0].offsetTop)/GRID_HEIGHT);

    var widget = this.determineType(e.target.className, e.target.id);
    widget.layout = {
        top   : top,
        left  : left,
        width : 16,
        height: 16
      };

    this.widgetsCollection.push(widget);
  },

  determineType: function(className, id) {
    var widget = {};

    if(/(entity)/.exec(className)) {
      var cid = String(id).replace('entity-','');
      var entity = this.entitiesCollection.get(cid);
      var action = className.split(' ')[0];
      console.log(action);

      widget.container_info = {
         entity : entity,
         action : action
      };
    }
    else if (/(single-data)/.exec(className)) {
      console.log(id);
      var id = String(id).replace('entity-','');
      console.log(id.split('-')[0]);

      var entity = this.entitiesCollection.get(id.split('-')[0]);
      var field = id.split('-')[1];

      widget = uiLibrary['text'][0];
      widget.content = {
        text : '{{'+entity.get('name')+'_'+field+'}}'
      };
    }
    else {
      var type = className.replace(' ui-draggable','');
      widget = uiLibrary[type][0];
      widget.type = type;
    }

    return widget;
  }

});
