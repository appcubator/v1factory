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
                      'deploy',
                      'clickedPage',
                      'getContextEntities',
                      'keydown',
                      'clickedUrl',
                      'createPage');

      this.model             = v1State.get('pages').models[pageId];

      /* Globals */
      g_contextCollection    = new EntityCollection();
      this.getContextEntities();

      this.widgetsCollection    = this.model.get('uielements');

      this.galleryEditor    = new EditorGalleryView(this.widgetsCollection);
      this.widgetsManager   = new WidgetsManagerView(this.widgetsCollection);
      this.widgetEditorView = new WidgetEditorView(this.widgetsCollection);

      this.navbarEditor  = new NavbarEditorView(this.model.get('navbar'));
      this.urlModel      = this.model.get('url');

      /* Calls */
      this.render();

      var page = appState.pages[pageId];
      if(!page.uielements.length) {
        //new PageStylePicker(this.widgetsCollection);
      }

      /* Bindings */
      $(window).bind('keydown', this.keydown);
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
                                          '/editor/'+ ind +'">' + page.name +
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
      var curAppState = v1State.toJSON();
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
        var entity =  v1State.get('entities').getEntityWithName(entityName);
        g_contextCollection.push(entity);
      });
    },

    keydown: function(e) {
      if($._data($(window)[0],"events").keydown.length > 1) {
        return ;
      }

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
      var pageUrlPart = name.replace(' ', '_');
      var pageUrl = { urlparts : [pageUrlPart] };
      var pageInd = appState.pages.length;
      var pageModel = new PageModel({ name: name, url: pageUrl});
      v1State.get('pages').push(pageModel);

      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/state/',
        data: JSON.stringify(v1State.toJSON()),
        complete: function() {
          $('<li><a href="/app/'+ appId +'/editor/'+pageInd+'">'+name+'</a></li>').insertBefore($('#page-list').find(".new-page"));
        },
        dataType: "JSON"
      });
    }

  });

  return EditorView;
});

