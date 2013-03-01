/*
 *  Editor - Widget Info
 *  Written by icanberk
 *
 *  Abstract:
 *  This module creates the list of pages
 *  that appears on the lef of the page.
 *  On any select, it saves the current changes
 *  on the open page, and opens a new page by
 *  creating a new WidgetEditorView.
 *
 *  It also contains the generic controllers like
 *  `unite` function.
 *
 *  Includes:
 *  - PagesView
 *
 */

var PagesView = Backbone.View.extend({
  el     : document.body,
  listEl : document.getElementById('pages-list'),
  events : {
    'click .new-page'       : 'clickedNewPage',
    'submit .new-page-form' : 'submittedNewPage',
    'click .exist-page'     : 'clickedOpen',
    'click #save'           : 'savePages',
    'click #settings'       : 'showSettings',
    'click .cross'          : 'hideSettings'
  },

  initialize: function() {
    _.bindAll(this, 'render',
                    'clickedNewPage',
                    'getContextEntities',
                    'hideSettings',
                    'submittedNewPage',
                    'savePages',
                    'savePage',
                    'showSettings',
                    'style',
                    'unite',
                    'clickedOpen');

    this.pages = appState.pages || [];
    this.render();
    this.style();
  },

  render: function() {
    var self = this;
    _(this.pages).each(function(page, ind) {
      self.listEl.innerHTML +=  '<li class="exist-page" id="page-'+ ind + '">' + page.page_name + '</li>';
    });
    self.listEl.innerHTML += '<li class="new-page"> + Create Page</li>' +
    '<form class="new-page-form" hi2 style="display:none;"><input class="new-page-name" type="text"></form>';
  },

  style: function() {
    _(appState.pageProps).each(function(val, key, ind) {
      var styleTag = document.createElement('style');
      styleTag.id = val.id;

      console.log("EEEE");
      console.log(val);

      
      var styleContent = (val.tag || '.sample') + ' {';
      styleContent += (val.css).replace(/<%=content%>/g, val.currentValue);
      styleContent += '}';

      styleTag.innerHTML = styleContent;
      this.styleTag = styleTag;

      document.getElementsByTagName('head')[0].appendChild(styleTag);
    });
  },

  clickedNewPage: function() {
    $('.new-page').hide();
    $('.new-page-form').fadeIn();
    $('.new-page-name').focus();
  },

  submittedNewPage: function(e) {

    e.preventDefault();
    var pageName = $('.new-page-name').val();
    var page = {'page_name': pageName, 'uielements' : []};

    this.pages.push(page);
    this.curPage = this.pages.length - 1;

    $('<li class="page" id="'+ pageName + '">' + pageName + '</li>').insertBefore('.new-page');
    $('.new-page-form').hide();
    $('.new-page-name').val('');
    $('.new-page').fadeIn();

    this.openPage(this.curPage);
  },

  openPage: function(pageInd) {
    if(this.widgetEditor) {
      this.savePage();
    }
    this.curPage = pageInd;
    this.widgetEditor = new WidgetEditorView(this.getContextEntities(pageInd),this.pages[pageInd]);
    document.getElementById('page-' + pageInd).className += ' selected';
    $('#loading-gif').fadeOut().remove();
  },

  getContextEntities: function(ind) {
    var name = this.pages[ind].name;
    var page = _.where(appState.urls, {page_name: name})[0];
    if(!page) {
      return [];
    }
    var contextEntites = _.filter(page.urlparts, function(str){ return (/\{\{([^\}]+)\}\}/g.exec(str)); });
    contextEntites = _.map(contextEntites, function(str){ return (/\{\{([^\}]+)\}\}/g.exec(str))[1];});
    return contextEntites;
  },

  savePage: function() {
    this.pages[this.curPage]['uielements'] = (this.widgetEditor.serializeWidgets() || []);
    if(this.designEditor){
      this.pages[this.curPage]['design-props'] = (this.designEditor.model.toJSON()['design-props']||[]);
    }
  },

  savePages: function() {
    this.savePage();
    appState.pages = this.pages;

    $.ajax({
      type: "POST",
      url: '/app/1/state/',
      data: JSON.stringify(appState),
      success: function() {},
      dataType: "JSON"
    });
  },

  unite: function(cor1, cor2) {
    var topLeft = {}, bottomRight = {};

    if(cor1.x < cor2.x) {
      topLeft.x =  cor1.x; bottomRight.x = cor2.x;
    } else {
      topLeft.x =  cor2.x; bottomRight.x = cor1.x;
    }

    if(cor1.y < cor2.y) {
      topLeft.y =  cor1.y; bottomRight.y = cor2.y;
    } else {
      topLeft.y =  cor2.y; bottomRight.y = cor1.y;
    }

    topLeft.x--; topLeft.y--;

    return {
      topLeft : topLeft,
      bottomRight: bottomRight
    };
  },

  clickedOpen: function(e) {
    var ind = String(e.target.id).replace('page-','');
    $('.selected.exist-page').removeClass('selected');
    this.openPage(ind);
    e.preventDefault();
  },

  showSettings: function(e) {
    var pageModel = new PageModel(appState.pages[self.curPage]);
    var view = new DesignEditorView(pageModel, true);
    this.designEditor = view;

    $('#page-settings').append(view.el);
    $('#page-settings').animate({
      marginBottom : -10
    });
    return false;
  },

  hideSettings: function(e) {
    $('#page-settings').animate({
      marginBottom : '-100%'
    });
    return false;
  }
});
