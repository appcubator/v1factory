define(["backbone","app/models/EmailModel"],function(e,t){var n=e.Collection.extend({model:t,getEmailWithName:function(e){var t=this.where({name:e})[0];return t}});return n});