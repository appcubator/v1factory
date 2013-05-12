define([
  'app/models/PageModel',
  'app/collections/EntityCollection',
  'app/views/UrlView',
  'app/views/SimpleModalView',
  'app/views/ErrorModalView',
  'editor/WidgetsManagerView',
  'editor/WidgetEditorView',
  'editor/EditorGalleryView',
  'editor/PageStylePicker',
  'editor/NavbarEditorView',
  'app/tutorial/TutorialView',
  'mixins/BackboneNameBox',
  'app/editor/editor-templates'
],
function( PageModel,
          EntityCollection,
          UrlView,
          SimpleModalView,
          ErrorModalView,
          WidgetsManagerView,
          WidgetEditorView,
          EditorGalleryView,
          PageStylePicker,
          NavbarEditorView,
          TutorialView ) {

  var EditorView = Backbone.View.extend({
    className : 'editor-page',
    css: "bootstrap-editor",

    events    : {
      'click #save'          : 'save',
      'click #deploy'        : 'deploy',
      'click .menu-button.help' : 'help',
      'click .page'          : 'clickedPage',
      'click .url-bar'       : 'clickedUrl'
    },

    initialize: function(bone, pId) {
      _.bindAll(this, 'render',
                      'copy',
                      'paste',
                      'help',
                      'renderUrlBar',
                      'clickedPage',
                      'getContextEntities',
                      'clickedUrl',
                      'createPage',
                      'save',
                      'deploy',
                      'renderDeployResponse');

      if(pId) pageId = pId;

      iui.loadCSS(this.css);
      iui.loadCSS('jquery-ui');

      this.model             = v1State.get('pages').models[pageId];

      /* Globals */
      g_contextCollection    = new EntityCollection();
      this.getContextEntities();

      this.widgetsCollection    = this.model.get('uielements');

      this.galleryEditor    = new EditorGalleryView(this.widgetsCollection);
      this.widgetsManager   = new WidgetsManagerView(this.widgetsCollection);

      this.navbarEditor  = new NavbarEditorView(this.model.get('navbar'));
      this.urlModel      = this.model.get('url');



      var page = appState.pages[pageId];

      var self = this; // for binding deploy to ctrlshiftd
      /* Bindings */
      keyDispatcher.key('⌘+s, ctrl+s', this.save);
      keyDispatcher.key('⌘+c, ctrl+c', this.copy);
      keyDispatcher.key('⌘+v, ctrl+v', this.paste);
      keyDispatcher.key('⌘+shift+d, ctrl+shift+d', function(){ self.deploy({local:true}); });

    },

    render: function() {

      if(!this.el.innerHTML) this.el.innerHTML = iui.getHTML('editor-page');

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
      this.galleryEditor.render();
      this.widgetsManager.render();
      this.navbarEditor.render();

      $('#loading-gif').fadeOut().remove();
    },

    renderUrlBar: function() {
      this.$el.find('.url-bar').html(this.urlModel.getUrlString());
    },

    save : function(callback) {
      var $el = $('.menu-button.save');
      $el.fadeOut().html("<span>Saving...</span>").fadeIn();
      var curAppState = v1State.toJSON();
      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/state/',
        data: JSON.stringify(curAppState),
        complete: function() {
          iui.dontAskBeforeLeave();
        },
        success: function() {
          $el.html("<span>Saved</span>").fadeIn();
          if(typeof(callback) !== 'undefined'&&typeof(callback) == 'function')
            { callback(); }
          setTimeout(function(){
            $el.html("<span>Save</span>").fadeIn();
          },3000);
        },
        error: function(data, t) {
          var content = { text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon." };
          if(DEBUG) {
            content = { text: "LULZ  <br  />" + data.responseText };
          }
          new ErrorModalView(content);
        }
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

    deploy: function(options) {
      var url = '/app/'+appId+'/deploy/'
      if(options.local) url = url + 'local/'

      var self = this;
      iui.get('deploy').innerHTML = '<span>Deploying...</span>';

      $.ajax(url, {
        type: "POST",
        complete: function() {
          iui.get('deploy').innerHTML = '<span>Test Run</span>';
        },
        success: function(data) {
          self.renderDeployResponse(true, data, self);
        },
        error: function(jqXHR) {
          var data = JSON.parse(jqXHR.responseText);
          if(DEBUG)
            self.renderDeployResponse(false, data, self);
          else {
            var fakedata = { errors: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon." };
            self.renderDeployResponse(false, fakedata, self);
          }
        },
        dataType: "JSON"
      });
    },

    renderDeployResponse: function(success, responseData, self) {
      if(success)
      {
        new SimpleModalView({ text: 'Your app is available at <a target="_blank" href="'+ responseData.site_url + self.urlModel.getAppendixString() +'">'+ responseData.site_url + self.urlModel.getAppendixString() +'</a><br /><br />You can also see your code on <a target="_blank" href="'+ responseData.github_url +'">Github</a>', img:'happy_engineer.png'});
      }
      else
      {
        new ErrorModalView({ text: responseData.errors });
      }
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

