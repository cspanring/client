import DS from 'ember-data';

var attr = DS.attr;
var hasMany = DS.hasMany;

export default DS.Model.extend({
  name: attr('string'),
  description: attr('string'),
  npmjsUrl: attr('string'),
  repositoryUrl: attr('string'),
  latestVersion: attr('string'),
  latestVersionDate: attr('date'),
  categories: hasMany('category', {async: true})
});
