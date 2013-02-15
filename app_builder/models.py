from django.db import models

""" ENTITIES
Class
    has many attributes (unique on name)
    has many instances

Attribute
    name
    type

Instance
    has many values
"""

""" VIEWS
Template
    name
    html // template
    queries
    url_regex

Query
    //prolly mongo encoded
"""
# entities

class Class(models.Model):
# has many instances
# has many attributes
# in the future, it could even have many functions
  name = models.CharField(max_length=100)

  def to_dict(self):
    d = {}
    d['name'] = self.name
    d['fields'] = {}
    for f in self.attributes.all():
      d['fields'].update({ f.name: f.type})
    return d

  @staticmethod
  def sync_classes(classes, new_class_hook=None):
    for c in classes:
# find or create the class
      if not Class.objects.filter(name=c['name']).exists():
        cls = Class(name=c['name'])
        cls.full_clean()
        cls.save()
        if new_class_hook is not None:
          new_class_hook(cls)
      else:
        cls = Class.objects.get(name=c['name'])
# create new fields
      current_field_names = cls.attributes.values_list('name', flat=True)
      for f, type in c['fields'].items():
        if f not in current_field_names:
          new_field = Attribute(_class=cls, name=f, type=type)
          new_field.full_clean()
          new_field.save()
# delete old fields
      orphan_field_names = set(current_field_names).difference(set(c['fields'].keys()))
      for f in orphan_field_names:
        a = cls.attributes.get(name=f)
        a.delete()


class Attribute(models.Model):
  _class = models.ForeignKey(Class, related_name="attributes")
  name = models.CharField(max_length=100)
  type = models.CharField(max_length=20)

class Instance(models.Model):
  _class = models.ForeignKey(Class, related_name="instances")

class Value(models.Model):
  _instance = models.ForeignKey(Instance, related_name="values")
  _attribute = models.ForeignKey(Attribute, related_name="values")

  number = models.FloatField(null=True, default=None)
  text = models.TextField(null=True, default=None)
  date = models.DateTimeField(null=True, default=None)
  email = models.EmailField(null=True, default=None)
  # also, files

# templates for rendering DB data in HTML
class Template(models.Model):
  name = models.CharField(max_length=100)
# may contain dynamic fields which can be filled in with a context
  html = models.TextField()

  def render_to_html(self, context):
    # rendering engine goes here
    return self.html

# for fetching DB data
class Query(models.Model):
  name = models.CharField(max_length=100, blank=True)
  q = models.TextField() #encoded mongo-like query
  templates = models.ForeignKey(Template, related_name="queries")

# url may be a pattern, and the "view" is rendered w/ context from pattern
class Route(models.Model):
  name = models.CharField(max_length=100, blank=True)
  url = models.CharField(max_length=100)
  view = models.ForeignKey(Template)
