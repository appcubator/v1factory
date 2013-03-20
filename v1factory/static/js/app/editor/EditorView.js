define(['../models/PageModel',
        '../collections/EntityCollection',
        '../collections/WidgetCollection',
        'WidgetEditorView',
        'WidgetClassPickerView',
        'WidgetContentEditorView',
        'WidgetLayoutEditorView',
        'DesignEditorView',
        'EditorGalleryView'],

  function(PageModel, EntityCollection, WidgetCollection, WidgetEditorView, WidgetClassPickerView, WidgetContentEditorView, WidgetLayoutEditorView, DesignEditorView, EditorGalleryView) {

  var EditorView = Backbone.View.extend({
    el        : document.body,
    className : 'sample',

    events    : {
      'click #save'          : 'save',
      'click #settings'      : 'showSettings',
      'click #settings-cross': 'hideSettings',
      'click #deploy'        : 'deploy'

    },

    initialize: function() {
      _.bindAll(this, 'save',
                      'deploy',
                      'style',
                      'hideSettings',
                      'showSettings',
                      'getContextEntities',
                      'keydown');

      var page = appState.pages[pageId];

      this.model            = new PageModel(page);
      this.entityCollection = new EntityCollection();
      this.contextCollection= new EntityCollection();


      this.widgetsCollection= new WidgetCollection();
      this.galleryEditor    = new EditorGalleryView(this.widgetsCollection, this.contextCollection, this.entityCollection);
      this.widgetEditor     = new WidgetEditorView(this.widgetsCollection, this.contextCollection.models, page);

      this.typePicker       = new WidgetClassPickerView(this.widgetsCollection);
      this.contentEditor    = new WidgetContentEditorView(this.widgetsCollection);
      this.layoutEditor     = new WidgetLayoutEditorView(this.widgetsCollection);

      this.designEditor     = new DesignEditorView(this.model, true);
      //this.gridEditor       = new GridEditorView();

      this.entityCollection.add(appState.entities);
      this.getContextEntities();

      this.style();
      this.render();
      $('#loading-gif').fadeOut().remove();
      window.addEventListener('keydown', this.keydown);

      key('⌘+s, ctrl+s', this.save);
    },

    render: function() {
      //this.el.appendChild(this.galleryEditor.el);
      // this.el.appendChild(this.gridEditor.el);
      this.el.appendChild(this.designEditor.el);
    },

    save : function() {
      var curAppState = _.clone(appState);

      curAppState.pages[pageId]['uielements'] = (this.widgetsCollection.toJSON() || []);
      curAppState.pages[pageId]['design_props'] = (this.designEditor.model.toJSON()['design_props']||[]);

      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/state/',
        data: JSON.stringify(curAppState),
        complete: function() { iui.dontAskBeforeLeave();},
        dataType: "JSON"
      });

      return false;
    },

    deploy: function() {
      this.save();

      var ThanksView = Backbone.ModalView.extend({
        tagName: 'div',
        className: 'deployed',
        initialize: function(text) {
          this.render(text.text);
        },
        render : function(text) {
          this.el.innerHTML = text;
          return this;
        }
      });


      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/deploy/',
        complete: function(data) { new ThanksView({ text: 'Your app is available at <a href="'+ data.responseText + '">'+ data.responseText +'</a>'}); },
        dataType: "JSON"
      });

    },

    showSettings: function() {
      $('#page-settings').animate({
        marginBottom : -10
      });
      return false;
    },

    style: function() {
      _(uieState).each(function(type) {
        _(type).each(function(elem) {
          var styleTag = document.createElement('style');
          var styleContent = elem.tagName + '.' + elem.class_name + '{';
          styleContent += elem.style;
          styleContent += '}';

          styleTag.innerHTML = styleContent;
          this.styleTag = styleTag;

          document.getElementsByTagName('head')[0].appendChild(styleTag);
        });
      });
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

      _(contextEntites).each(function(entityName) {
        self.contextCollection.add(self.entityCollection.findWhere({ name : entityName}));
      });
    },

    keydown: function(e) {
      switch(e.keyCode) {
        case 37:
          this.widgetsCollection.selectedEl.moveLeft();
          e.preventDefault();
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
            this.widgetsCollection.removeSelected(e);
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

  return EditorView;
});

