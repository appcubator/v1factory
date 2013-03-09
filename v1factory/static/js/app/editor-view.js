
var EditorView = Backbone.View.extend({
  el        : document.body,
  className : 'sample',

  events    : {
    'click #save'          : 'save',
    'click #settings'      : 'showSettings',
    'click #settings-cross': 'hideSettings'

  },

  initialize: function() {
    _.bindAll(this, 'save',
                    'hideSettings',
                    'showSettings',
                    'getContextEntities',
                    'keydown');

    var page = appState.pages[pageId];

    this.model            = new PageModel(page);
    this.entityCollection = new EntityCollection();
    this.contextCollection= new EntityCollection();



    this.widgetsCollection= new WidgetCollection();
    this.galleryEditor    = new GalleryView(this.widgetsCollection, this.contextCollection, this.entityCollection);
    this.widgetEditor     = new WidgetEditorView(this.widgetsCollection, this.contextCollection.models, page);
    this.widgetInfoEditor = new WidgetInfoView(this.widgetsCollection);

    this.designEditor     = new DesignEditorView(this.model, true);
    this.gridEditor       = new GridEditorView();

    this.entityCollection.add(appState.entities);
    this.getContextEntities();

    this.render();
    $('#loading-gif').fadeOut().remove();
    window.addEventListener('keydown', this.keydown);
  },

  render: function() {
    this.el.appendChild(this.galleryEditor.el);
    this.el.appendChild(this.widgetEditor.el);
    this.el.appendChild(this.gridEditor.el);
    this.el.appendChild(this.designEditor.el);
  },

  save : function() {
    console.log(this.widgetsCollection.toJSON());
    appState.pages[pageId]['uielements'] = (this.widgetsCollection.toJSON() || []);
    appState.pages[pageId]['design_props'] = (this.designEditor.model.toJSON()['design_props']||[]);

    console.log(appState.pages[pageId]['uielements']);

    $.ajax({
      type: "POST",
      url: '/app/'+appId+'/state/',
      data: JSON.stringify(appState),
      success: function() {},
      dataType: "JSON"
    });
  },

  showSettings: function() {
    $('#page-settings').animate({
      marginBottom : -10
    });
    return false;
  },

  hideSettings: function() {
    $('#page-settings').animate({
      marginBottom : '-100%'
    });
    return false;
  },

  getContextEntities: function() {
    var self = this;
    var name = appState.pages[pageId].name;
    var page = _.where(appState.urls, {page_name: name})[0];
    if(!page) {
      return [];
    }

    var entityModels = [];
    var contextEntites = _.filter(page.urlparts, function(str){ return (/\{\{([^\}]+)\}\}/g.exec(str)); });
    contextEntites = _.map(contextEntites, function(str){ return (/\{\{([^\}]+)\}\}/g.exec(str))[1];});

    console.log(self.entityCollection);
    _(contextEntites).each(function(entityName) {
      console.log(self.entityCollection);
      self.contextCollection.add(self.entityCollection.findWhere({ name : entityName}));
      console.log(entityModels);
    });
  },

  keydown: function(e) {
    switch(e.keyCode) {
      case 37:
        this.widgetsCollection.selectedEl.moveLeft();
        break;
      case 38:
        this.widgetsCollection.selectedEl.moveUp();
        e.preventDefault();
        break;
      case 39:
        this.widgetsCollection.selectedEl.moveRight();
        e.preventDefault();
        break;
      case 40:
        this.widgetsCollection.selectedEl.moveDown();
        e.preventDefault();
        break;
      case 8: //backspace
        if(this.widgetsCollection.selectedEl) {
          e.preventDefault();
          this.widgetsCollection.removeSelected();
          return false;
        }
        break;
      case 27: //escape
        if(this.widgetsCollection.selectedEl) {
          this.widgetsCollection.selectedEl = null;
          this.widgetsCollection.unselectAll();
        }
        return false;
    }
  }
});
