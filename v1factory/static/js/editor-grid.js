/*
 *  Editor - Grid
 *  Written by icanberk
 *
 *  Abstract:
 *  This module creates the grid and arranges the interaction
 *  between the user and the page. Once an element is
 *  created, it passes the information to WidgetEditor.
 *  It is not supposed to store or change any widget.
 *
 *  Includes:
 *  - GridEditorView
 *
 */
var currentCoord;

var GridEditorView = Backbone.View.extend({
  el             : document.getElementById('body-container'),
  initCor        : {},
  lastCor        : {},
  selectorActive : false,
  itemGallery    : document.getElementById('item-gallery'),
  events : {
    "mousedown .span1"           : "mousedown",
    "mouseup div.editing"        : "mouseup",
    "mouseover .span1"           : "mouseover",
    "click .widget-prev"         : "addWidget"
    //"click .item-gallery .header": "hideItemGallery"
  },

  initialize: function(item){
    _.bindAll(this, 'render',
                    'mousedown',
                    'mouseup',
                    'mouseover',
                    'coordselector',
                    'clearSelections',
                    'expandInterfaceEl',
                    'popItemGallery',
                    'hideItemGallery',
                    'addWidget');

    $('.interface-elements').on('click', this.expandInterfaceEl);
    $('.data-elements').on('click', this.expandInterfaceEl);

    this.render();
  },

  render: function() {

    for(var y=1; y < 37; y++) {
      var row = document.createElement('div');
      $(row).addClass('row editing');
      row.id = 'row_' + y;
      $(row).data('row', y);
      for(var x=1; x < 33; x++) {
        var square = document.createElement('div');
        $(square).addClass('span1 editing');
        $(square).data({
          xcor : x,
          ycor : y
        });
        square.id = x+'_'+y;
        $(row).append(square);
        $(row).appendTo(this.el);
      }
    }
  },

  clearSelections: function() {
    $('.cselected').removeClass('cselected');
    this.selectorActive = false;
  },

  mousedown: function(e) {
    $('.cselected').removeClass('cselected');
    this.initCor.x = $(e.target).data('xcor');
    this.initCor.y = $(e.target).data('ycor');
    this.selectorActive = true;
    this.hideItemGallery();
  },

  mouseup: function(e) {
    this.selectorActive = false;
    this.lastCor.x = $(e.target).data('xcor');
    this.lastCor.y = $(e.target).data('ycor');
    currentCoord = {initCor: this.initCor , lastCor: this.lastCor};
    this.popItemGallery(e.pageX, e.pageY);
  },

  mouseover: function(e) {
    curCor = { };
    curCor.x = $(e.target).data('xcor');
    curCor.y = $(e.target).data('ycor');

    if(this.selectorActive) {
      $('.cselected').removeClass('cselected');
      this.coordselector(this.initCor.x, curCor.x, this.initCor.y, curCor.y);
    }
  },

  coordselector: function(x1, x2, y1, y2) {
    var x, y, xg, xs, yg, ys;

    if(x1 < x2) {
      for(x = x1; x <= x2; x++) {
        ycombinator(x);
      }
    }
    else {
      for(x = x1; x >= x2; x--) {
        ycombinator(x);
      }
    }

    function ycombinator(x) {
      if(y1 < y2) {
        for(y=y1; y <= y2; y++) {
            $('#'+x+'_'+y).addClass('cselected');
        }
      }
      else {
        for(y=y1; y >= y2; y--) {
          $('#'+x+'_'+y).addClass('cselected');
        }
      }
    }
  },

  popItemGallery: function(x, y) {
    $(this.itemGallery).animate({
       'right': 20
    });
  },

  hideItemGallery: function() {
    $(this.itemGallery).animate({
       'right': -320
    });
  },

  addWidget: function(e) {
    e.preventDefault();

    var id = e.target.id || e.target.parentNode.id;
    pagesView.widgetEditor.addWidget(id, this.initCor, this.lastCor);
    this.hideItemGallery();
    this.clearSelections();
  },

  expandInterfaceEl: function(e) {
    if($(e.target).hasClass('widget-prev')) {
      return true;
    }

    $('.expanded').removeClass('expanded');
    $(e.target.parentNode).addClass('expanded');
    return false;
  }
});
