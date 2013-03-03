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
  curId        : 'all-elements',
  dragActive   : false,

  events : {
    'click .header' : 'sectionClicked'
  },

  initialize   : function(contextColl, entitiesColl) {
     _.bindAll(this, 'render',
                     'appendEntity',
                     'appendContextEntity',
                     'appendElement',
                     'dropped',
                     'mousemoveHandler',
                     'setupSearch');

    this.render();

    this.entitiesCollection  = entitiesColl;
    this.contextCollection   = contextColl;
    this.elementsCollection  = new ElementCollection();

    this.entitiesCollection.bind('add', this.appendEntity, this);
    this.contextCollection.bind('add',  this.appendContextEntity, this);
    this.elementsCollection.bind('add',  this.appendElement, this);

    this.elementsCollection.add(defaultElements);
  },

  render: function() {
    $('#item-gallery').css('top', -180);
    this.mY = 0;
    $('body').mousemove(this.mousemoveHandler);
  },

  appendEntity : function(entityModel) {
    console.log(entityModel);
    var context = {
      name : entityModel.get('name'),
      cid : entityModel.cid
    };

    var tempLi = '<li class="entity-<%= cid %> entity entity-list">'+
                  '<span class="name">List of <%= name %></span></li>';
    var tempForm = '<li class="entity-<%= cid %> entity form">'+
                    '<span class="name">Add <%= name %> Form</span></li>';
    var tempBtn = '<li class="entity-<%= cid %> entity addbutton">'+
                   '<span class="name">Add <%= name %> Button</span></li>';

    $(this.dataList).append(_.template(tempLi, context));
    $(this.allList).append(_.template(tempLi, context));

    $(this.dataList).append(_.template(tempForm, context));
    $(this.allList).append(_.template(tempForm, context));

    $(this.dataList).append(_.template(tempBtn, context));
    $(this.allList).append(_.template(tempBtn, context));
    // List X
    // Add X Form
    // Add X Button
    this.setupSearch();
  },

  appendContextEntity : function(entityModel) {
    // Edit X Form
    // Edit X Button
    // Delete X Button
    // Attr of X - UIElement
  },

  appendElement: function(elementModel) {
    var self = this;
    var tempLi = '<li class="<%= className %>"><span class="name"><%= text %></span></li>';
    var html = _.template(tempLi, elementModel.attributes);
    $(this.elementsList).append(html);
    $(this.allList).append(html);

    $('.' + elementModel.get('className')).draggable({
      cursor: "move",
      cursorAt: { top: -12, left: -20 },
      helper: function( event ) {
        return $(elementModel.get('el'));
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
    var top = e.pageY - $(window).scrollTop();

    if (e.pageY < this.mY && top < 300) {
      $('#item-gallery').css('top', 0);
    }
    if (e.pageY > this.mY && top > 300 && !this.dragActive) {
      $('#item-gallery').css('top', -180);
    }

    this.mY = e.pageY;
  },

  dropped : function(e, ui) {
    console.log(e);
    this.dragActive = false;
  }
});
