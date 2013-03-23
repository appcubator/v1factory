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
      console.log(queryModel);
      this.entity = widgetModel.get('container_info').get('entity');
      this.render();
    },

    render: function() {
      var self = this;
      var contentHTML = '';
      contentHTML += '<h1 class="title">'+ this.entity.get('name') +' Table</h1>';
      // contentHTML += '<p>Please define the data you want to display</p>';
      contentHTML += '<hr>';
      contentHTML += '<p>What fields would you like to display?</p>';

      _.each(this.entity.get('fields').models, function(field) {
        var checked = '';
        if(_.contains(self.model.get('fieldsToDisplay'), field.get('name'))) checked = 'checked';
        contentHTML += '<input class="fields-to-display" type="checkbox" value="'+ field.get('name') +'" '+ checked +'>'+ field.get('name') +'<br>';
      });

      contentHTML += '<hr>';

      var checked = (this.model.get('belongsToUser') === false)? "checked" : '';
      console.log(checked);

      contentHTML += '<p>Do you want to show the rows that just belong to the logged in user?</p>';
      contentHTML += '<input type="radio" class="belongs-to-user" name="belongsTo" value="true" checked> Yes<br>' +
                     '<input type="radio" class="belongs-to-user" name="belongsTo" value="false"'+ checked +'> No<br>';

      contentHTML += '<hr>';
      contentHTML += '<p>How do you want to sort the rows?</p>';
      contentHTML += '<select class="sort-by">';

      contentHTML += '<option id="by-date">According to the date created</option>';

       _.each(this.entity.get('fields').models, function(field) {
        var selected = (('by-' + field.get('name') == self.model.get('sortAccordingTo'))? 'selected' : '');
        contentHTML += '<option value="by-'+ field.get('name') +'"'+ selected +'>Alphabetically according to '+ field.get('name') + '</option>';
      });

      contentHTML += '</select>';

      contentHTML += '<hr>';
      contentHTML += '<p>How many rows would you like to show?</p>';

      var rAll='', rFirst='', rLast='', rFirstNmr, rLastNmr;
      if(this.model.get('numberOfRows').indexOf('First') != -1) {
        rFirst = 'checked';
        rFirstNmr = this.model.get('numberOfRows').replace('First-','');
      }
      else if (this.model.get('numberOfRows').indexOf('Last') != -1) {
        rLast = 'checked';
        rLastNmr = this.model.get('numberOfRows').replace('Last-','');
      }
      else {
        rAll = 'checked';
      }

      contentHTML += '<input type="radio" class="nmr-rows" id="all-rows" name="nmrRows" value="All" '+ rAll+'> All<br>' +
                     '<input type="radio" class="nmr-rows" id="first-rows" name="nmrRows" value="First" '+ rFirst+'> First <input type="text" id="first-nmr" value="'+ (rFirstNmr||5)+'"> rows<br>'+
                     '<input type="radio" class="nmr-rows" id="last-rows" name="nmrRows" value="Last" '+ rLast + '> Last <input type="text" id="last-nmr" value="'+ (rLastNmr||5) +'"> rows<br>';


      contentHTML += '<hr>';
      contentHTML += '<p>All '+ String(this.entity.get('name')).toLowerCase() +'s</p>';
      contentHTML += '<hr>';
      contentHTML += '<input type="submit" value="Done">';

      this.el.innerHTML = contentHTML;
      return this;
    },

    fieldsToDisplayChanged: function(e) {
      console.log(this.model);
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
