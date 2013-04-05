define([
  'app/models/PageModel',
  'app/collections/EntityCollection',
  'app/collections/WidgetCollection',
  'app/collections/ContainersCollection',
  'app/collections/UrlsCollection',
  'app/views/UrlView',
  'app/views/SimpleModalView',
  'editor/WidgetsManagerView',
  'editor/WidgetClassPickerView',
  'editor/WidgetEditorView',
  'editor/DesignEditorView',
  'editor/EditorGalleryView',
  'editor/PageStylePicker',
  'backbone',
  'backboneui',
  '../../libs/keymaster/keymaster.min'
],function(PageModel,
           EntityCollection,
           WidgetCollection,
           ContainersCollection,
           UrlsCollection,
           UrlView,
           SimpleModalView,
           WidgetsManagerView,
           WidgetClassPickerView,
           WidgetEditorView,
           DesignEditorView,
           EditorGalleryView,
           PageStylePicker,
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
      'click .page'          : 'clickedPage',
      'click .url-bar'       : 'clickedUrl'
    },

    initialize: function() {
      _.bindAll(this, 'render',
                      'renderUrlBar',
                      'save',
                      'deployLocal',
                      'amendAppState',
                      'deploy',
                      'style',
                      'clickedPage',
                      'hideSettings',
                      'showSettings',
                      'getContextEntities',
                      'containerSelected',
                      'widgetSelected',
                      'keydown',
                      'clickedUrl');

      var page = appState.pages[pageId];


      this.model                = new PageModel(page);
      this.entityCollection     = new EntityCollection();
      this.contextCollection    = new EntityCollection();
      this.containersCollection = new ContainersCollection();
      this.widgetsCollection    = new WidgetCollection();

      this.galleryEditor    = new EditorGalleryView(this.widgetsCollection, this.containersCollection, this.contextCollection, this.entityCollection);
      this.widgetsManager   = new WidgetsManagerView(this.widgetsCollection, this.containersCollection, this.contextCollection.models, page);

      //this.typePicker       = new WidgetClassPickerView(this.widgetsCollection);
      this.widgetEditorView = new WidgetEditorView(this.widgetsCollection, this.containersCollection);

      this.designEditor     = new DesignEditorView(this.model, true);

      this.urlModel = this.model.get('url');

      this.entityCollection.add(appState.entities);
      this.getContextEntities();

      this.containersCollection.on('selected', this.containerSelected);
      this.widgetsCollection.on('selected', this.widgetSelected);

      if(!page.uielements.length) {
        new PageStylePicker(this.widgetsCollection);
      }

      this.style();
      this.render();
      $('#loading-gif').fadeOut().remove();
      window.addEventListener('keydown', this.keydown);

      key('⌘+s, ctrl+s', this.save);
      key('⌘+shift+r, ctrl+shift+r', this.deployLocal);
    },

    render: function() {
      this.el.appendChild(this.designEditor.el);
      this.renderUrlBar();
    },

    renderUrlBar: function() {
      this.$el.find('.url-bar').html(this.urlModel.getUrlString());
    },

    save : function(callback) {

      $('#save').fadeOut().html("<span>Saving...</span>").fadeIn();
      var curAppState = this.amendAppState();
      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/state/',
        data: JSON.stringify(curAppState),
        complete: function() {
          iui.dontAskBeforeLeave();
        },
        success: function() {
          $('#save').html("<span>Saved</span>").fadeIn();
          if(typeof(callback) !== 'undefined'&&typeof(callback) == 'function')
            { callback(); }
          setTimeout(function(){
            $('#save').html("<span>Save</span>").fadeIn();
          },3000);
        },
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

      var deployFn = function() {

        $.ajax({
          type: "POST",
          url: '/app/'+appId+'/deploy/',
          complete: function(data) {
            new SimpleModalView({ text: 'Your app is available at <a href="'+ data.responseText + '">'+ data.responseText +'</a>'});
          },
          dataType: "JSON"
        });
      };

      this.save(deployFn);
    },

    deployLocal: function() {
      this.save();

      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/deploy/local/',
        complete: function(data) {
          new SimpleModalView({ text: 'Your app is available at <a href="'+ data.responseText + '">'+ data.responseText +'</a>'});
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

      var basecss = uieState.basecss;
      basecss = basecss.replace('body {', '.page {');
      basecss = basecss.replace('body{', '.page {');
      var styleTag = document.createElement('style');
      styleTag.id = "basecss";
      styleTag.innerHTML = basecss;
      document.getElementsByTagName('head')[0].appendChild(styleTag);

      _(uieState).each(function(type, key) {
        console.log(key);
        if(key == "basecss") return;

        _(type).each(function(elem) {
          console.log(elem);
          if(elem.attribs) return;

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
          else if(this.widgetsCollection.selectedEl) {
            this.widgetsCollection.selectedEl.moveLeft();
          }
          e.preventDefault();
          break;
        case 38:
          if(this.containersCollection.selectedEl) {
            this.containersCollection.selectedEl.moveUp();
          }
          else if(this.widgetsCollection.selectedEl) {
            this.widgetsCollection.selectedEl.moveUp();
          }
          e.preventDefault();
          break;
        case 39:
          if(this.containersCollection.selectedEl) {
            this.containersCollection.selectedEl.moveRight();
          }
          else if(this.widgetsCollection.selectedEl) {
            this.widgetsCollection.selectedEl.moveRight();
          }
          e.preventDefault();
          break;
        case 40:
          if(this.containersCollection.selectedEl) {
            this.containersCollection.selectedEl.moveDown();
          }
          else if(this.widgetsCollection.selectedEl) {
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

    clickedUrl: function() {
      var newView =  new UrlView(this.urlModel);
      newView.onClose = this.renderUrlBar;
    },

    containerSelected: function(e) {
      console.log(this.widgetsCollection);
      this.widgetsCollection.unselectAll();
    },

    widgetSelected: function(a, b) {
      this.containersCollection.unselectAll();
    }

  });

  return EditorView;
});

