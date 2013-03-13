import re

class DjangoTemplate(object):
  from jinja2 import Environment, PackageLoader
  env = Environment(loader=PackageLoader('app_builder.django', 'code_templates/template_templates'))

  def __init__(self, name=None, filename=None, page=None):
    self.name = name
    self.filename = filename
    self.page = page

  @classmethod
  def create(cls, page, analyzed_app):
    from app_builder.analyzer import Container, Page
    name = page.name.replace(" ", "_")
    self = cls(name=page.name, filename=name+".html", page=page)

    # resolve links, doesn't yet support dynamic links.
    for uie in self.page.uielements:
      if isinstance(uie, Container):
        for n in uie.nodes:
          if 'href' in n.attribs:
            if isinstance(n.attribs['href'], Page):
              n.attribs['href'] = n.attribs['href'].route.static_url()
      else:
        if 'href' in uie.attribs:
          if isinstance(uie.attribs['href'], Page):
            uie.attribs['href'] = uie.attribs['href'].route.static_url()

    return self

  def properly_name_vars_in_q_container(self, models):
    """Replaces the model handlebars with the template text require to render the for loop properly"""
    from app_builder.analyzer import QuerysetWrapper
    query_containers = filter(lambda x: isinstance(x, QuerysetWrapper), self.page.uielements)
    for uie in query_containers:
      for n in uie.nodes:
        current_content = n.content()
        handlebars_search = re.findall(r'\{\{ ?([A-Za-z0-9]+)_(\w+) ?\}\}', current_content)
        # check validity
        for mname, fname in handlebars_search:
          m = models.get_by_name(mname)
          assert(m is not None) # if err, then mname is not a model
          f = m.fields.get_by_name(fname)
          assert(f is not None) # if err, then fname is not a field of the model
        # function to do the replacing
        def repl_handlebars(match):
          m = models.get_by_name(match.group(1))
          f = m.fields.get_by_name(match.group(2))
          return "{{ item."+f.identifier()+" }}"
        # replace the content.
        n.set_content(re.sub(r'\{\{ ?([A-Za-z0-9]+)_(\w+) ?\}\}', repl_handlebars, current_content))

  def render(self):
    template = DjangoTemplate.env.get_template('template.html')
    return template.render(uielements=self.page.uielements, css_props=self.page.design_props)
