define([
  '../collections/ElementCollection',
  'backbone'
],function(ElementCollection, Backbone) {

  var EditorGalleryView = Backbone.View.extend({
    el           : document.getElementById('top-panel-bb'),
    allList      : document.getElementById('all-list'),
    elementsList : document.getElementById('interface-list'),
    dataList     : document.getElementById('entities-list'),
    userList     : document.getElementById('user-list'),
    widgetsCollection : null,
    containersCollection:null,
    curId        : 'all-elements',
    dragActive   : false,

    events : {
      'click .header' : 'sectionClicked'
    },

    initialize   : function(widgetsCollection, containersCollection, contextColl, entitiesColl) {
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
      this.containersCollection = containersCollection;


      this.entitiesCollection.bind('add', this.appendEntity, this);
      this.contextCollection.bind('add',  this.appendContextEntity, this);
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
      var self = this;

      if(appState.users.local) {
        var tempLogin = '<li id="entity-<%= cid %>" class="login entity">'+
                        '<span class="name">User Login Form</span></li>';

        //$(this.userList).append(tempLogin);
        $(this.allList).append(tempLogin);
      }

      if(appState.users.local) {
        var tempLogin = '<li id="entity-<%= cid %>" class="signup entity">'+
                        '<span class="name">User Signup Form</span></li>';

        //$(this.userList).append(tempLogin);
        $(this.allList).append(tempLogin);
      }

      if(appState.users.facebook) {
        var tempFb = '<li id="entity-<%= cid %>" class="facebook entity">'+
                     '<span class="name">Facebook Login Button</span></li>';

        //$(this.userList).append(tempFb);
        $(this.allList).append(tempFb);
      }
      if(appState.users.twitter) {
        var tempTw = '<li id="entity-<%= cid %>" class="twitter entity">'+
                     '<span class="name"> Twitter Button</span></li>';

        //$(this.userList).append(tempTw);
        $(this.allList).append(tempTw);
      }

      if(appState.users.linkedin) {
        var tempLi = '<li id="entity-<%= cid %>" class="linkedin entity">'+
                     '<span class="name">LinkedIn Login Button</span></li>';

        //$(this.userList).append(tempLi);
        $(this.allList).append(tempLi);
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

      var tempLi = '<li id="entity-<%= cid %>-<%= attr %>" class="large single-data">'+
                     '<span class="name">Show <%= name %> <%= attr %></span></li>';



      var model = this.entitiesCollection.push(appState.users, {silent : true});

      _(appState.users.fields.models).each(function(model) {
        var context = {
          name : "User",
          cid  : model.cid,
          attr : model.get('name'),
          type : model.get('type')
        };

        //$(self.userList).append(_.template(tempLi, context));
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

      var tempLi   = '<li id="entity-<%= cid %>" class="show entity">'+
                     '<span class="name">List of <%= name %></span></li>';
       $(this.allList).append(_.template(tempLi, context));

      var tempForm = '<li id="entity-<%= cid %>" class="create entity">'+
                     '<span class="name">Add <%= name %> Form</span></li>';
      $(this.allList).append(_.template(tempForm, context));

      var tempBtn  = '<li id="entity-<%= cid %>" class="addbutton entity">'+
                     '<span class="name">Add <%= name %> Button</span></li>';
      $(this.allList).append(_.template(tempBtn, context));

      var tempTable  = '<li id="entity-<%= cid %>" class="table-gal entity">'+
                     '<span class="name"><%= name %> Table</span></li>';
      $(this.allList).append(_.template(tempTable, context));


      $('.entity').draggable({
        cursor: "move",
        cursorAt: { top: 0, left: 0 },
        helper: "<div>abc</div>",
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

      _(entityModel.get('fields').models).each(function(model, ind) {
        var context = {
          name : entityModel.get('name'),
          cid  : entityModel.cid,
          attr : model.get('name'),
          type : model.get('type')
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
      var li = document.createElement('li');
      li.className = elementModel.get('className');
      li.innerHTML = '<span class="name">'+ elementModel.get('text')+'</span>';

      // var tempLi = '<li class="<%= className %>"></li>';
      // var html = _.template(tempLi, elementModel.attributes);
      $(this.elementsList).append(li);
      $(this.allList).append(li);

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
      var self = this;
      this.dragActive = false;
      var left, top;

      if(e.type != 'click') {
        left = Math.round((e.pageX - $('.page')[0].offsetLeft - 120)/GRID_WIDTH);
        top  = Math.round((e.pageY - $('.page')[0].offsetTop - 80)/GRID_HEIGHT);
      }
      else {
        left = 0;
        top = 1;
        window.scrollTo(0,0);
      }


      var widget = {};
      widget.layout = {
        top   : top,
        left  : left,
        width : 4,
        height: 8
      };

      var className = e.target.className;
      var id = e.target.id;

      if(/(entity)/.exec(className)) {
        var cid = String(id).replace('entity-','');
        var entity = this.entitiesCollection.get(cid);
        var action = className.split(' ')[0];

        widget.container_info = {
           entity : entity,
           action : action
        };

        this.containersCollection.push(widget);
      }
      else if (/(single-data)/.exec(className)) {
        var id = String(id).replace('entity-','');
        var entity = this.entitiesCollection.get(id.split('-')[0]);
        var field = id.split('-')[1];

        widget = uieState['text'][0];
        widget.content =  '{{'+entity.get('name')+'_'+field+'}}';
        this.widgetsCollection.push(widget);
      }
      else {
        var type = className.replace(' ui-draggable','');
        widget = _.extend(widget, uieState[type][0]);
        widget.type = type;
        //self.widgetsCollection.push(widget);
        this.widgetsCollection.push(widget);
      }
    },

    determineType: function(className, id, widget) {
      var self = this;
    }
  });

  return EditorGalleryView;
});
