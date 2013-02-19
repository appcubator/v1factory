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
  return '^' + '/'.join(map(repl_model_with_id_regex, url_parts) + '/$'

APP_NAME = "twitter"

class Page:
  def __init__(self, url_d, analyzed_app):
    self.name = urls_d['page_name']
    self.url_parts = urls_d['urlparts']
    self.url_data = filter(lambda x: x is not None, map(extract_from_brace, self.url_parts)) # the free variables
    _page_json = [ a for a in analyzed_app.templates if a['name'] == self.name ][0]
    self.queries = get_required_queries(page_json)
    self.uielements = page_json['uielements']

  def get_required_queries(template):
    qs = []
    for uie in template['uielements']:
      if uie['type'].find('container-show') != -1:
        qs.append('{}.objects.all()'.format(uie['entity']))
    return qs


class AnalyzedApp:

  def __init__(self, app_state, app_name):
    self.name = app_name
    self.classes = app_state['entities']
    self.templates = app_state['pages']
    self.urls = app_state['urls']

    self.pages = [ Page(d, self) for d in self.urls ]
