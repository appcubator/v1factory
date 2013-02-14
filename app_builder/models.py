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

  def render_to_response(self, context):
    return HttpResponse(self.html)

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
