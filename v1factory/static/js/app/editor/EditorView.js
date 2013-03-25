define([
  'app/models/PageModel',
  'app/collections/EntityCollection',
  'app/collections/WidgetCollection',
  'app/collections/ContainersCollection',
  'editor/WidgetsManagerView',
  'editor/WidgetClassPickerView',
  'editor/WidgetEditorView',
  'editor/DesignEditorView',
  'editor/EditorGalleryView',
  'backbone',
  'backboneui',
  '../../libs/keymaster/keymaster.min'
],function(PageModel,
           EntityCollection,
           WidgetCollection,
           ContainersCollection,
           WidgetsManagerView,
           WidgetClassPickerView,
           WidgetEditorView,
           DesignEditorView,
           EditorGalleryView,
           Backbone,
           BackboneUI) {

  var EditorView = Backbone.View.extend({
    el        : document.body,
    className : 'sample',

    events    : {
      'click #save'          : 'save',
      'click #settings'      : 'showSettings',
      'click #settings-cross': 'hideSettings',
      'click #deploy'        : 'deploy',
      'click .page'          : 'clickedPage'
    },

    initialize: function() {
      _.bindAll(this, 'save',
                      'amendAppState',
                      'deploy',
                      'style',
                      'clickedPage',
                      'hideSettings',
                      'showSettings',
                      'getContextEntities',
                      'containerSelected',
                      'widgetSelected',
                      'keydown');

      var page = appState.pages[pageId];

      this.model                = new PageModel(page);
      this.entityCollection     = new EntityCollection();
      this.contextCollection    = new EntityCollection();
      this.containersCollection = new ContainersCollection();
      this.widgetsCollection    = new WidgetCollection();

      this.galleryEditor    = new EditorGalleryView(this.widgetsCollection, this.containersCollection, this.contextCollection, this.entityCollection);
      this.widgetsManager   = new WidgetsManagerView(this.widgetsCollection, this.containersCollection, this.contextCollection.models, page);

      this.typePicker       = new WidgetClassPickerView(this.widgetsCollection);
      this.widgetEditorView = new WidgetEditorView(this.widgetsCollection);

      this.designEditor     = new DesignEditorView(this.model, true);

      this.entityCollection.add(appState.entities);
      this.getContextEntities();

      this.containersCollection.on('selected', this.containerSelected);
      this.widgetsCollection.on('selected', this.widgetSelected);

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

      var curAppState = this.amendAppState();
      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/state/',
        data: JSON.stringify(curAppState),
        complete: function() { iui.dontAskBeforeLeave();},
        success: function() { alert('save successful'); },
        error: function(jqxhr, t) { alert('Error saving! ' + t); console.log(jqxhr); }
      });

      return false;
    },

    amendAppState : function() {
      var curAppState = _.clone(appState);

      var newCollection = _.clone(this.widgetsCollection);

      _(this.containersCollection.models).each(function(container) {
        newCollection.remove(container.get('container_info').get('uielements').models);
      });

      var widgets = (newCollection.toJSON() || []);
      var containers = (this.containersCollection.toJSON() || []);
      var elems = _.union(widgets, containers);

      curAppState.pages[pageId]['uielements'] = elems;
      curAppState.pages[pageId]['design_props'] = (this.designEditor.model.toJSON()['design_props']||[]);

      return curAppState;
    },

    deploy: function() {
      this.save();

      var ThanksView = BackboneUI.ModalView.extend({
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
        complete: function(data) {
          new ThanksView({ text: 'Your app is available at <a href="'+ data.responseText + '">'+ data.responseText +'</a>'});
        },
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
        self.contextCollection.add(self.entityCollection.where({ name : entityName})[0]);
      });
    },

    keydown: function(e) {
      switch(e.keyCode) {
        case 37:
          if(this.containersCollection.selectedEl) {
            this.containersCollection.selectedEl.moveLeft();
          }
          else {
            this.widgetsCollection.selectedEl.moveLeft();
          }
          e.preventDefault();
          break;
        case 38:
          if(this.containersCollection.selectedEl) {
            this.containersCollection.selectedEl.moveUp();
          }
          else {
            this.widgetsCollection.selectedEl.moveUp();
          }
          e.preventDefault();
          break;
        case 39:
          if(this.containersCollection.selectedEl) {
            this.containersCollection.selectedEl.moveRight();
          }
          else {
            this.widgetsCollection.selectedEl.moveRight();
          }
          e.preventDefault();
          break;
        case 40:
          if(this.containersCollection.selectedEl) {
            this.containersCollection.selectedEl.moveDown();
          }
          else {
            this.widgetsCollection.selectedEl.moveDown();
          }
          e.preventDefault();
          break;
        case 8: //backspace
          if(this.widgetsCollection.selectedEl) {
            this.widgetsCollection.removeSelected(e);
          }
          if(this.containersCollection.selectedEl) {
            this.containersCollection.removeSelected(e);
          }
          break;
        case 27: //escape
          if(this.widgetsCollection.selectedEl) {
            this.widgetsCollection.selectedEl = null;
            this.widgetsCollection.unselectAll();
          }

          if(this.containersCollection.selectedEl) {
            this.containersCollection.selectedEl = null;
            this.containersCollection.unselectAll();
          }
          return false;
      }
    },

    clickedPage: function() {
      if(this.widgetsCollection.selectedEl) {
        this.widgetsCollection.selectedEl = null;
        this.widgetsCollection.unselectAll();
      }

      if(this.containersCollection.selectedEl) {
        this.containersCollection.selectedEl = null;
        this.containersCollection.unselectAll();
      }
    },

    containerSelected: function(e) {
      this.widgetsCollection.unselectAll();
    },

    widgetSelected: function(a, b) {
      this.containersCollection.unselectAll();
    }

  });

  return EditorView;
});

