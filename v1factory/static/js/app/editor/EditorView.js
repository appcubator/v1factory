define([
  'app/models/PageModel',
  'app/collections/EntityCollection',
  'app/collections/WidgetCollection',
  'app/collections/ContainersCollection',
  'app/views/UrlView',
  'app/views/SimpleModalView',
  'editor/WidgetsManagerView',
  'editor/WidgetEditorView',
  'editor/EditorGalleryView',
  'editor/PageStylePicker',
  'editor/NavbarEditorView',
  'app/tutorial/TutorialView',
  'mixins/BackboneNameBox',
  '../../libs/keymaster/keymaster.min'
],
function( PageModel,
          EntityCollection,
          WidgetCollection,
          ContainersCollection,
          UrlView,
          SimpleModalView,
          WidgetsManagerView,
          WidgetEditorView,
          EditorGalleryView,
          PageStylePicker,
          NavbarEditorView,
          TutorialView ) {

  var EditorView = Backbone.View.extend({
    el        : document.body,
    className : 'sample',

    events    : {
      'click #save'          : 'save',
      'click #deploy'        : 'deploy',
      'click .menu-button.help' : 'help',
      'click .page'          : 'clickedPage',
      'click .url-bar'       : 'clickedUrl'
    },

    initialize: function() {
      _.bindAll(this, 'render',
                      'copy',
                      'paste',
                      'help',
                      'renderUrlBar',
                      'save',
                      'deployLocal',
                      'amendAppState',
                      'deploy',
                      'clickedPage',
                      'getContextEntities',
                      'keydown',
                      'clickedUrl',
                      'createPage');

      /* Globals */
      g_contextCollection    = new EntityCollection();

      this.model                = v1State.get('pages').models[pageId];
      console.log(v1State.get('pages').models[pageId]);
      //this.containersCollection = new ContainersCollection();
      this.widgetsCollection    = this.model.get('uielements');

      this.galleryEditor    = new EditorGalleryView(this.widgetsCollection);
      this.widgetsManager   = new WidgetsManagerView(this.widgetsCollection);
      this.widgetEditorView = new WidgetEditorView(this.widgetsCollection);

      this.navbarEditor  = new NavbarEditorView(this.model.get('navbar'));
      this.urlModel      = this.model.get('url');

      /* Calls */
      this.getContextEntities();
      this.render();

      var page = appState.pages[pageId];
      if(!page.uielements.length) {
        //new PageStylePicker(this.widgetsCollection);
      }

      /* Bindings */
      window.addEventListener('keydown', this.keydown);
      key('⌘+s, ctrl+s', this.save);
      key('⌘+c, ctrl+c', this.copy);
      key('⌘+v, ctrl+v', this.paste);
      key('⌘+shift+d, ctrl+shift+d', this.deployLocal);

      $('#loading-gif').fadeOut().remove();
    },

    render: function() {

      iui.get('page-list').innerHTML += '<li>'+appState.pages[pageId].name+'</li>';
      _(appState.pages).each(function(page, ind) {
        if(pageId == ind) return;
        iui.get('page-list').innerHTML += '<li><a href="'+ '/app/' + appId +
                                          '/pages/editor/'+ ind +'">' + page.name +
                                          '</a></li>';
      });

      var createBox = new Backbone.NameBox({tagName: 'li', className:'new-page', txt:'New Page'});
      createBox.on('submit', this.createPage);

      iui.get('page-list').appendChild(createBox.el);

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

    help: function(e) {
      new TutorialView([6]);
    },

    copy: function(e) {
      if(this.widgetsManager.copy()) { }
    },

    paste: function(e) {
      if(this.widgetsManager.paste()){
        e.stopPropagation();
      }
    },

    amendAppState : function() {
      var curAppState   = _.clone(appState);
      var newCollection = _.clone(this.widgetsCollection);
      var widgets    = (newCollection.toJSON() || []);

      curAppState.pages[pageId]['uielements'] = widgets;
      curAppState.pages[pageId]['navbar']     = this.model.get('navbar').toJSON();
      curAppState.entities                    = v1State.get('entities').toJSON();
      curAppState.users                       = v1State.get('users').toJSON();

      return curAppState;
    },

    deploy: function() {
      var self = this;

      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/deploy/',
        success: function(data) {
          window.open(data.site_url);
          new SimpleModalView({ text: 'Your app is available at <a href="'+ data.site_url + self.urlModel.getAppendixString() +'">'+ data.site_url + self.urlModel.getAppendixString() +'</a><br /><br />You can also see your code on <a href="'+ data.github_url +'">Github</a>', img:'happy_engineer.png'});
        },
        dataType: "JSON"
      });
    },

    deployLocal: function() {

      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/deploy/local/',
        success: function(data) {
          window.open(data.site_url);
          new SimpleModalView({ text: 'Your app is available at <a href="'+ data.site_url + '">'+ data.site_url +'</a>'});
        },
        dataType: "JSON"
      });

    },

    getContextEntities: function() {
      var self = this;
      var entityModels = [];
      var contextEntites = _.filter(self.model.get('url').get('urlparts'), function(str){ return (/\{\{([^\}]+)\}\}/g.exec(str)); });
      contextEntites = _.map(contextEntites, function(str){ return (/\{\{([^\}]+)\}\}/g.exec(str))[1];});

      _(contextEntites).each(function(entityName) {
        g_contextCollection.add(v1State.get('entities').getEntityWithName(entityName));
      });
    },

    keydown: function(e) {
      switch(e.keyCode) {
        case 37:
          if(this.widgetsCollection.selectedEl) {
            this.widgetsCollection.selectedEl.moveLeft();
          }
          e.preventDefault();
          break;
        case 38:
          if(this.widgetsCollection.selectedEl) {
            this.widgetsCollection.selectedEl.moveUp();
          }
          e.preventDefault();
          break;
        case 39:
          if(this.widgetsCollection.selectedEl) {
            this.widgetsCollection.selectedEl.moveRight();
          }
          e.preventDefault();
          break;
        case 40:
          if(this.widgetsCollection.selectedEl) {
            this.widgetsCollection.selectedEl.moveDown();
          }
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
    },

    clickedPage: function() {
      if(this.widgetsCollection.selectedEl) {
        this.widgetsCollection.selectedEl = null;
        this.widgetsCollection.unselectAll();
      }
    },

    clickedUrl: function() {
      var newView =  new UrlView(this.urlModel);
      newView.onClose = this.renderUrlBar;
    },

    createPage: function(name) {
      var pageUrl = { urlparts : [] };
      pageUrl.urlparts[0] = "page" + appState.pages.length;
      pageInd = appState.pages.length;
      var pageModel = new PageModel({ name: name, url: pageUrl});
      v1State.get('pages').push(pageModel);

      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/state/',
        data: JSON.stringify(appState),
        complete: function() {
          console.log('<li><a herf="/app/4/pages/editor/'+pageInd+'">'+name+'</a></li>');
          $('<li><a href="/app/4/pages/editor/'+pageInd+'">'+name+'</a></li>').insertBefore($('#page-list').find(".new-page"));
        },
        dataType: "JSON"
      });
    }

  });

  return EditorView;
});

