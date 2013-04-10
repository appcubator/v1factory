define([
  'app/models/PageModel',
  'app/models/UserEntityModel',
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
  'editor/NavbarEditorView',
  'mixins/BackboneModal',
  '../../libs/keymaster/keymaster.min'
],function(PageModel,
           UserEntityModel,
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
           NavbarEditorView) {

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

      /* Globals */
      g_entityCollection     = new EntityCollection(appState.entities);
      g_contextCollection    = new EntityCollection();
      g_userModel            = new UserEntityModel(appState.users);

      this.model                = new PageModel(page);
      this.containersCollection = new ContainersCollection();
      this.widgetsCollection    = new WidgetCollection();

      this.galleryEditor    = new EditorGalleryView(this.widgetsCollection, this.containersCollection);
      this.widgetsManager   = new WidgetsManagerView(this.widgetsCollection, this.containersCollection, page);
      this.widgetEditorView = new WidgetEditorView(this.widgetsCollection, this.containersCollection);

      this.navbarEditor  = new NavbarEditorView(this.model.get('navbar'));
      this.urlModel      = this.model.get('url');

      this.containersCollection.on('selected', this.containerSelected);
      this.widgetsCollection.on('selected', this.widgetSelected);

      /* Calls */
      this.getContextEntities();
      this.render();

      if(!page.uielements.length) {
        new PageStylePicker(this.widgetsCollection);
      }

      /* Bindings */
      window.addEventListener('keydown', this.keydown);
      key('⌘+s, ctrl+s', this.save);
      key('⌘+shift+d, ctrl+shift+d', this.deployLocal);

      $('#loading-gif').fadeOut().remove();
    },

    render: function() {
      this.style();

      iui.get('page-list').innerHTML += '<li>'+appState.pages[pageId].name+'</li>';
      _(appState.pages).each(function(page, ind) {
        if(pageId == ind) return;
        iui.get('page-list').innerHTML += '<li><a href="'+ '/app/' + appId +
                                          '/pages/editor/'+ ind +'">' + page.name +
                                          '</a></li>';
      });

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
      var curAppState   = _.clone(appState);
      var newCollection = _.clone(this.widgetsCollection);

      _(this.containersCollection.models).each(function(container) {
        newCollection.remove(container.get('container_info').get('uielements').models);
      });

      var widgets    = (newCollection.toJSON() || []);
      var containers = (this.containersCollection.toJSON() || []);
      var elems      = _.union(widgets, containers);

      curAppState.pages[pageId]['uielements'] = elems;
      curAppState.pages[pageId]['navbar']     = this.model.get('navbar').toJSON();
      curAppState.entities                    = g_entityCollection.toJSON();
      curAppState.users                       = g_userModel.toJSON();

      return curAppState;
    },

    deploy: function() {
      var self = this;
      var deployFn = function() {

        $.ajax({
          type: "POST",
          url: '/app/'+appId+'/deploy/',
          complete: function(data) {
            new SimpleModalView({ text: 'Your app is available at <a href="'+ data.responseText + self.urlModel.getAppendixString() +'">'+ data.responseText + self.urlModel.getAppendixString() +'</a>', img:'happy_engineer.png'});
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
        if(key == "basecss") return;

        _(type).each(function(elem) {
          if(elem.attribs) return;

          var styleTag = document.createElement('style');
          var styleContent = '.page '+elem.tagName + '.' + elem.class_name + '{';
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
      var entityModels = [];
      var contextEntites = _.filter(self.model.get('url').get('urlparts'), function(str){ return (/\{\{([^\}]+)\}\}/g.exec(str)); });
      contextEntites = _.map(contextEntites, function(str){ return (/\{\{([^\}]+)\}\}/g.exec(str))[1];});

      _(contextEntites).each(function(entityName) {
        g_contextCollection.add(g_entityCollection.getEntityWithName(entityName));
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
      this.widgetsCollection.unselectAll();
    },

    widgetSelected: function(a, b) {
      this.containersCollection.unselectAll();
    }

  });

  return EditorView;
});

