define([
  'backboneui',
  'backbone',
  'iui'
],function(BackboneUI) {

  var TableQueryView = BackboneUI.ModalView.extend({
    className : 'query-modal',
    events: {
      'change .fields-to-display'   : 'fieldsToDisplayChanged',
      'click .belongs-to-user'      : 'belongsToUserChanged',
      'click .nmr-rows'             : 'nmrRowsChanged',
      'keydown #first-nmr, #last-nmr': 'nmrRowsNumberChanged',
      'change .sort-by'             : 'sortByChanged'
    },
    initialize: function(widgetModel, queryModel) {
      _.bindAll(this, 'fieldsToDisplayChanged',
                      'belongsToUserChanged',
                      'nmrRowsChanged',
                      'nmrRowsNumberChanged');

      this.widgetModel = widgetModel;
      this.model = queryModel;
      this.entity = widgetModel.get('container_info').get('entity');
      this.render();
    },

    render: function() {
      var self = this;

      var checks = {};
      var rFirstNmr=5, rLastNmr=5, rAllNmr = 0;
      var rFirst = '', rLast ='', rAll ='';

      if(String(this.model.get('numberOfRows')).indexOf('First') != -1) {
        rFirst = 'checked';
        rFirstNmr = (this.model.get('numberOfRows').replace('First-',''));
        if(rFirstNmr === "") rFirstNmr = 5;
      }
      else if (String(this.model.get('numberOfRows')).indexOf('Last') != -1) {
        rLast = 'checked';
        rLastNmr = (this.model.get('numberOfRows').replace('Last-',''));
        if(rLastNmr === "") rLastNmr = 5;
      }
      else {
        rAll = 'checked';
      }

      checks = {
        rFirstNmr : rFirstNmr,
        rFirst    : rFirst,
        rLastNmr  : rLastNmr,
        rLast     : rLast,
        rAll      : rAll,
        rAllNmr   : rAllNmr
      };

      var contentHTML = _.template(Templates.queryView, {entity: self.entity, query: self.model, c: checks});
      contentHTML += '<input type="submit" value="Done">';

      this.el.innerHTML = contentHTML;
      return this;
    },

    fieldsToDisplayChanged: function(e) {
      var fieldsArray = _.clone(this.model.get('fieldsToDisplay'));

      if(e.target.checked) {
        fieldsArray.push(e.target.value);
        fieldsArray = _.uniq(fieldsArray);
      }
      else {
        fieldsArray = _.difference(fieldsArray, e.target.value);
      }

      this.model.set('fieldsToDisplay', fieldsArray);
    },

    belongsToUserChanged: function(e) {
      if(e.target.checked) {
        var bool = (e.target.value == "true"? true : false);
        this.model.set('belongsToUser', bool);
      }
    },

    nmrRowsChanged: function(e) {
      if(e.target.checked) {
        var val = e.target.value;

        if(val == 'First') {
          val += '-' + iui.get('first-nmr').value;
        } else if(val == 'Last') {
          val += '-' + iui.get('last-nmr').value;
        }

        this.model.set('numberOfRows', val);
      }
    },

    nmrRowsNumberChanged: function(e) {
      var val = '';
      if(e.target.id == 'first-nmr') {
        iui.get('first-rows').checked = true;
        val = 'First-' + e.target.value;
      }
      else if (e.target.id == 'last-nmr') {
        iui.get('last-rows').checked = true;
        val = 'Last-' + e.target.value;
      }

      this.model.set('numberOfRows', val);
      e.stopPropagation();
    },

    sortByChanged: function(e) {
      this.model.set('sortAccordingTo', e.target.value);
    }

  });

  return TableQueryView;
});
