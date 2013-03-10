"A class for every file in the webapp, which knows how to create and write itself."

import re
from app_builder.manager import Manager
import os
import os.path
import shutil
import tempfile
from os.path import join

from model import DjangoModel
from view import DjangoView
from query import DjangoQuery
from template import DjangoTemplate
from url import DjangoUrl
from form_receiver import DjangoFormReceiver

def analyzed_app_to_app_components(analyzed_app):
  models = Manager(DjangoModel)
  views = Manager(DjangoView)
  urls = Manager(DjangoUrl)
  templates = Manager(DjangoTemplate)
  form_receivers = Manager(DjangoFormReceiver)
  queries = []

  # create and add django models
  for m in analyzed_app.models.each():
    models.add( DjangoModel.create(m, analyzed_app) )

  for p in analyzed_app.pages.each():
    t = DjangoTemplate.create(p, analyzed_app)
    templates.add(t)
    v = DjangoView.create(p, analyzed_app, t)
    views.add(v)
    urls.add( DjangoUrl.create_get(p, v, analyzed_app) )
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
    from app_builder.analyzer import SignupForm
    if isinstance(f, SignupForm):
      pass
    else:
      rec = DjangoFormReceiver.create(f, analyzed_app)
      rec.find_model(models)
      form_receivers.add(rec)
      u = DjangoUrl.create_post(rec, analyzed_app)
      urls.add(u)

  from app import DjangoApp
  dw = DjangoApp(models, views, urls, templates, form_receivers)
  return dw
