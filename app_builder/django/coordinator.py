"A class for every file in the webapp, which knows how to create and write itself."

import re

from app_builder.manager import Manager
from app_builder.analyzer import SignupForm, LoginForm

from model import DjangoModel, DjangoField
from view import DjangoView
from query import DjangoQuery
from template import DjangoTemplate
from url import DjangoUrl
from form_receiver import DjangoFormReceiver

from app import DjangoApp

def analyzed_app_to_app_components(analyzed_app):
  models = Manager(DjangoModel)
  views = Manager(DjangoView)
  urls = Manager(DjangoUrl)
  templates = Manager(DjangoTemplate)
  form_receivers = Manager(DjangoFormReceiver)
  queries = []

  # create and add django models
  for m in analyzed_app.models.each():
    models.add( DjangoModel.create(m) ) # this skips the relational fields

  # create relational fields
  for am1 in analyzed_app.models.each():
    for f in am1.fields:
      if f.content_type == 'list of blah':
        am2 = f.related_model
        dm1 = models.get_by_name(am1.name)
        dm2 = models.get_by_name(am2.name)
        assert None not in [am1, am2, dm1, dm2]

        # normal action is to add a foreign key(dm1) to dm2
        # but there could be a m2m case
        m2m = False
        for f2 in am2.fields:
          if f2.content_type == 'list of blah' and f2.related_model == am1:
            m2m = True
            df = DjangoField.create_relational(f.name, f2.name, dm1, dm2, m2m=True)
            dm1.fields.add(df)
            break
        if not m2m:
          # if user has a list of blogs, then blog has a foreign key user
          # parent_user973947234 is a foreign key on Blog, relating to User with related name "Blogs"
          df = DjangoField.create_relational('parent_%s%s' % (dm1.name, id(f)), f.name, dm2, dm1)
          dm2.fields.add(df)

  for p in analyzed_app.pages.each():
    t = DjangoTemplate.create(p)
    templates.add(t)
    v = DjangoView.create(p, analyzed_app, t)
    views.add(v)
    urls.add( DjangoUrl.create_get(p, v, analyzed_app, models) )
    v.queries = Manager(DjangoQuery)
    # create the djangoquery and find it's django model.
    for q in p.queries.each():
      dq = DjangoQuery(q, analyzed_app)
      dq.find_model(models)
      v.queries.add(dq)

  # now that we know all the queries, replace template handlebars.
  for t in templates.each():
    t.properly_name_vars_in_q_container(models)

  for f in analyzed_app.forms.each():
    if isinstance(f, SignupForm):
      rec = DjangoFormReceiver.create_signup(f, analyzed_app)
      form_receivers.add(rec)
      u = DjangoUrl.create_post(rec, analyzed_app)
      urls.add(u)
    elif isinstance(f, LoginForm):
      pass
    else:
      rec = DjangoFormReceiver.create(f, analyzed_app)
      rec.find_model(models)
      form_receivers.add(rec)
      u = DjangoUrl.create_post(rec, analyzed_app)
      urls.add(u)

  dw = DjangoApp(models, views, urls, templates, form_receivers)
  return dw
