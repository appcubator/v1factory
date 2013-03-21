define(
 ['backboneui', 'backbone',
  'iui'],
  function(BackboneUI) {

console.log(BackboneUI);

  var TableQueryView = BackboneUI.ModalView.extend({
    className : 'query-modal',
    events: {
      'change .fields-to-display' : 'fieldsToDisplayChanged',
      'click .belongs-to-user' : 'belongsToUserChanged'
    },
    initialize: function(widgetModel, queryModel) {
      _.bindAll(this, 'fieldsToDisplayChanged', 'belongsToUserChanged');

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
        console.log('YOLOOOOO!');
        var checked = '';
        if(_.contains(self.model.get('fieldsToDisplay'), field.get('name'))) checked = 'checked';
        contentHTML += '<input class="fields-to-display" type="checkbox" value="'+ field.get('name') +'" '+ checked +'>'+ field.get('name') +'<br>';
      });

      contentHTML += '<hr>';

      contentHTML += '<p>Do you want to show the rows that just belong to the logged in user?</p>';
      contentHTML += '<input type="radio" class="belongs-to-user" name="group1" value="Yes"> Yes<br>' +
                     '<input type="radio" class="belongs-to-user" name="group1" value="No" checked> No<br>';

      contentHTML += '<hr>';
      contentHTML += '<p>How do you want to sort the rows?</p>';
      contentHTML += '<select>';

      contentHTML += '<option>According to the date created</option>';

       _.each(this.entity.get('fields').models, function(field) {
        contentHTML += '<option>Alphabetically according to '+ field.get('name') + '</option>';
      });
      contentHTML += '</select>';

      contentHTML += '<hr>';
      contentHTML += '<p>How many rows would you like to show?</p>';

      contentHTML += '<input type="radio" name="group1" value="All" checked> All<br>' +
                     '<input type="radio" name="group1" value="First"> First <input type="text" value="5"> rows<br>'+
                     '<input type="radio" name="group1" value="Last"> Last <input type="text" value="5"> rows<br>';


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

    }

  });

  return TableQueryView;
});
