"A class for every file in the webapp, which knows how to create and write itself."

import re

from app_builder.manager import Manager
from app_builder.analyzer import CreateForm, EditForm, SignupForm, LoginForm

from model import DjangoModel, DjangoField
from view import DjangoView, DjangoLogoutView
from query import DjangoQuery
from template import DjangoTemplate
from url import DjangoUrl
from form_receiver import LoginFormReceiver, SignupFormReceiver, DjangoFormReceiver

from app import DjangoApp

def analyzed_app_to_app_components(analyzed_app, d_user):
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
          # parent_user is a foreign key on Blog, relating to User with related name "Blogs"
          df = DjangoField.create_relational('parent_%s' % (dm1.name,), f.name, dm2, dm1)
          dm2.fields.add(df)

  # create django templates
  for p in analyzed_app.pages.each():
    t = DjangoTemplate.create(p) # resolves links, creates row/column structure of html
    templates.add(t)
    # create the view function to get the data and serve the page
    v = DjangoView.create(p, analyzed_app, t)
    views.add(v)
    urls.add( DjangoUrl.create_get(p, v, analyzed_app, models) ) # add the urls entry for it
    v.queries = Manager(DjangoQuery)
    # create the query
    for q in p.queries.each():
      dq = DjangoQuery(q, analyzed_app)
      dq.find_model(models)
      v.queries.add(dq) # add the query to the view function

  # logout button
  lv = DjangoLogoutView(name='logout')
  views.add(lv)
  lu = DjangoUrl.create_get(p, lv, analyzed_app, models)
  lu.urlparts = ['logout']
  urls.add( lu )

  # now that we know all the queries, properly name the variables in the templates
  for t in templates.each():
    t.properly_name_vars_in_q_container(models)

  # form POST receiver creation
  for f in analyzed_app.forms.each():
    if isinstance(f, SignupForm):
      rec = SignupFormReceiver.create_signup(f, analyzed_app)
    elif isinstance(f, LoginForm):
      rec = LoginFormReceiver.create_login(f, analyzed_app)
    elif isinstance(f, EditForm):
      raise Exception("You found an edit form!")
    elif isinstance(f, CreateForm):
      rec = DjangoFormReceiver.create(f, analyzed_app)
    else:
      raise Exception("What is this form?: %s" % type(f))

    rec.find_model(models)
    form_receivers.add(rec)
    # create the url for the POST
    u = DjangoUrl.create_post(rec, analyzed_app, models)
    urls.add(u)

    if isinstance(f, CreateForm):
      rec.init_foreign_keys(models) # should automatically add foreign keys

  dw = DjangoApp(models, views, urls, templates, form_receivers, d_user)
  return dw
