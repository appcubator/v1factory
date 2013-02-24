import re



def extract_from_brace(s):
  m = re.match(r'\{\{(.+)\}\}', s)
  if m is None: return None
  else:
    return m.groups()[0]

def url_parts_to_regex(url_parts):
  id_regex = r'(\d+)'
  def repl_model_with_id_regex(s):
    if extract_from_brace(s) is not None: # there is a model here.
      return id_regex
    else:
      return s
  return '^' + '/'.join(map(repl_model_with_id_regex, url_parts)) + '/$'

APP_NAME = "twitter"

class Page:

  @staticmethod
  def get_required_queries(template):
    qs = []
    for uie in template['uielements']:
      if uie['container-info'] is not None and uie['container-info']['action'] == 'show':
        qs.append('{}.objects.all()'.format(uie['container-info']['entity']))
    return qs

  def __init__(self, urls_d, analyzed_app):
    self.name = urls_d['page_name']
    self.url_parts = urls_d['urlparts']
    self.url_data = filter(lambda x: x is not None, map(extract_from_brace, self.url_parts)) # the free variables
    self._page_json = [ a for a in analyzed_app.templates if a['name'] == self.name ][0]
    self.queries = Page.get_required_queries(self._page_json)
    self.uielements = self._page_json['uielements']
    self.access_level = self._page_json['access-level']

def get_required_fields_from_model(entity):
  """Convenience function that does what it says"""
  return [ f for f in entity['fields'] if f['required']]

class Form:
  """a Form in an app indicates that a user will modify/create data,
       and html forms will be used to make those changes."""

  def __init__(self, form_container, form_id, parent_page):
    """Grab the entity and included fields"""
    self.form_id = form_id
    self.entity = form_container['container-info']['entity']
    self.parent_page = parent_page

    self.included_fields = []
    for uie in form_container['container-info']['elements']:
      if 'field-name' in uie:
        self.included_fields.append(uie['field-name'])

class AnalyzedApp:

  def __init__(self, app_state, app_name):
    self.name = app_name
    self.classes = app_state['entities']
    self.classes.append({"name":"User","fields":[{
        "name":"first_name",
        "type":"text",
        "required":True
      },{
        "name":"email",
        "type":"text",
        "required":True
      },{
        "name":"password",
        "type":"text",
        "required":True
      }]})
    self.templates = app_state['pages']
    self.urls = app_state['urls']
    self.forms = []

    self.pages = [ Page(d, self) for d in self.urls ]
    for p in self.pages:
      for i, uie in enumerate(p.uielements):
        if uie['container-info'] is not None and uie['container-info']['action'] == 'create':
          if uie['container-info']['entity'] == "User": continue
          if uie['container-info']['entity'] == "Session": continue
          form_obj = Form(uie, i, p)
          uie['container-info']['form'] = form_obj
          self.forms.append(form_obj)

