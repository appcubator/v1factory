import re
import simplejson
from jinja2 import Environment, PackageLoader

from app_builder.analyzer import Container, Node, Page, ListQuerysetWrapper, QuerysetWrapper, Renderable, process_link_lang

class Column(Renderable):
  def __init__(self):
    # will either be a dictionary representing uielement, or a DomTree.
    self.uiels = []
    self.margin_left = 0
    self.width = 0
    self.tree = None # uninitialized state
    self.has_overlapping_nodes = False

class Row(Renderable):
  def __init__(self):
    self.uiels = []
    margin_top = 0
    self.cols = None # uninitialized state

class DomTree(Renderable):
  def __init__(self):
    self.rows = []

class DjangoTemplate(Renderable):
  def __init__(self, name=None, filename=None, page=None):
    self.name = name
    self.filename = filename
    self.page = page

  @classmethod
  def create(cls, page):
    name = page.name.replace(" ", "_")
    self = cls(name=page.name, filename=name+".html", page=page)

    self.dom_tree = self.create_tree(page.uielements)

    return self

  def resolve_links(self, pages):

    # iterate through the elements, within containers as well
    for uie in self.page.uielements:
      if isinstance(uie, Container):
        for n in uie.nodes:
          n.wrap_link = False
          if 'href' in n.attribs:
            if isinstance(n.attribs['href'], Page):
              dest_view = n.attribs['href']._django_view
              if isinstance(uie, QuerysetWrapper):
                model_refs = dest_view.url.model_refs()
                # internal://Tweet_page/Tweet     =>     {% url webapp.views.Tweet_page item.id %}
                if len(model_refs) > 0:
                  assert len(model_refs) == 1, "more than one model ref on dest page, but only one in the for loop"
                  n.attribs['href'] = "{% url "+dest_view.view_path()+" item.id %}"
                  # this is allows other tags to be links
                  if n.tagname != 'a':
                    n.wrap_link = True
                    n.wrap_link_href = n.attribs['href']
                    del n.attribs['href'] # href should go in the wrapper anchor tag only
                  continue
              n.attribs['href'] = "{% url "+dest_view.view_path()+" %}"

              # this is allows other tags to be links
              if n.tagname != 'a':
                n.wrap_link = True
                n.wrap_link_href = n.attribs['href']
                del n.attribs['href'] # href should go in the wrapper anchor tag only

      else:
        uie.wrap_link = False
        if 'href' in uie.attribs:
          dest_view = uie.attribs['href']._django_view
          if isinstance(uie.attribs['href'], Page):
            uie.attribs['href'] = "{% url "+dest_view.view_path()+" %}"
            # this is allows other tags to be links
            if uie.tagname != 'a':
              uie.wrap_link = True
              uie.wrap_link_href = uie.attribs['href']
              del uie.attribs['href'] # href should go in the wrapper anchor tag only

  def properly_name_vars_in_q_container(self, models):
    """Replaces the model handlebars with the template text require to render the for loop properly"""
    query_containers = filter(lambda x: isinstance(x, QuerysetWrapper), self.page.uielements)
    plain_old_nodes = filter(lambda x: isinstance(x, Node), self.page.uielements)

    def fix_the_string(s, single=False):
      # function to do the replacing
      def repl_handlebars(match):
        unprocessed = match.group(1)
        tokens = unprocessed.split('.')
        context, access_tokens = tokens[0], tokens[1:]

        # model
        if context == 'CurrentUser':
          m = models.get_by_name('User')
        else:
          m = models.get_by_name(access_tokens[0])
          assert m is not None, access_tokens[0]

        # field
        if context == 'CurrentUser':
          f = m.fields.get_by_name(access_tokens[0])
          assert f is not None, access_tokens[0]
        else:
          f = m.fields.get_by_name(access_tokens[1])
          assert f is not None, access_tokens[1]

        # output line
        if context == 'CurrentUser':
          if f.name == 'username':
            return '{{user.username}}'
          else:
            return '{{user.get_profile.'+f.identifier()+'}}'
        elif context == 'loop':
          return "{{ item."+f.identifier()+" }}"
        elif context == 'page':
          return "{{ "+m.identifier().lower()+"."+f.identifier()+" }}"

      return re.sub(r'\{\{ ?([^\}]*) ?\}\}', repl_handlebars, s)

    for uie in query_containers:
      for n in uie.nodes:
        fix_attempt = fix_the_string(n.content(), single=False)
        n.set_content(fix_attempt)
        if n.tagname == 'img':
          n.attribs['src'] = fix_attempt
    for n in plain_old_nodes:
      fix_attempt = fix_the_string(n.content(), single=True)
      n.set_content(fix_attempt)
      if n.tagname == 'img':
        n.attribs['src'] = fix_attempt

  def create_tree(self, uiels, recursive_num=0, top_offset=0, left_offset=0):
    """Given some uielements, create a nested row -> column -> row -> ... -> column -> uielement"""
    tree = DomTree()

    tree.rows = self.split_to_rows(uiels, top_offset=top_offset)
    for i, r in enumerate(tree.rows):
      r.cols = self.split_to_cols(r.uiels, left_offset=left_offset)
      for c in r.cols:
        if len(c.uiels) == 1:
          c.tree = None # termination of recursion
        else:
          inner_top_offset=r.uiels[0].uie['layout']['top']
          inner_left_offset=c.uiels[0].uie['layout']['left']
          if len(tree.rows) == 1 and len(r.cols) == 1:
            # in this case, recursion will not terminate since input is not subdivided into smaller components
            # create a relative container and absolute position the contents.

            min_top = c.uiels[0].top
            max_bottom = c.uiels[0].top + c.uiels[0].height
            for uie in c.uiels:
              uie.top_offset = uie.top - inner_top_offset
              uie.left_offset = uie.left - inner_left_offset
              uie.overlap_styles = "position: absolute; top: %spx; left: %spx;" % (15* uie.top_offset, 80* uie.left_offset)
              min_top = min(uie.top, min_top)
              max_bottom = max(uie.top + uie.height, max_bottom)


            c.has_overlapping_nodes = True

            c.container_height = max_bottom - min_top

            c.tree = None
          else:
            c.tree = self.create_tree(c.uiels, top_offset=inner_top_offset, left_offset=inner_left_offset, recursive_num = recursive_num + 1)
    return tree

  def split_to_cols(self, uiels, left_offset=0):
    """Given some uielements, separate them into non-overlapping columns"""
    cols = []
    if len(uiels) == 0:
      return cols

    sorted_uiels = sorted(uiels, key=lambda u: u.uie['layout']['left'])

    # leftmost uiel must be in the row
    current_col = Column()
    cols.append(current_col)
    current_block = sorted_uiels.pop(0)
    current_col.uiels.append(current_block)
    current_col.margin_left = current_block.uie['layout']['left'] - left_offset

    # iterate over the uiels left down
    for u in sorted_uiels:
      current_right = current_block.uie['layout']['left'] + current_block.uie['layout']['width']
      u_left = u.uie['layout']['left']
      u_right = u_left + u.uie['layout']['width']

      #Two cases:
      #1. this block is in the current row.
      if u_left < current_right:
        current_col.uiels.append(u)
          #a. this block is extends longer than the current block
        if u_right > current_right:
          current_block = u
      #2. this block must be the left-most block in a new row
      else:
        current_col.width = current_right - current_col.uiels[0].uie['layout']['left']

        current_col = Column()
        cols.append(current_col)

        current_col.uiels.append(u)
        current_col.margin_left = u_left - current_right

        current_block = u

    # set the width of the last column
    current_right = current_block.uie['layout']['left'] + current_block.uie['layout']['width']
    current_col.width = current_right - current_col.uiels[0].uie['layout']['left']

    return cols

  def split_to_rows(self, uiels, top_offset=0):
    """Given some uielements, separate them into non-overlapping rows"""
    # do a top down sweep, to identify continuous areas of emptiness
    # start with an empty row, and include the top-most block
    # then see if there are other blocks which lie on top of this.bottom_boundary.
    # if there are, add it to this row. start with that block and try again
    # if not, then end the row. create a new row and repeat if there are more blocks to place.

    rows = []
    if len(uiels) == 0:
      return rows

    sorted_uiels = sorted(uiels, key=lambda u: u.uie['layout']['top'])

    # topmost uiel must be in the row
    current_row = Row()
    rows.append(current_row)
    current_block = sorted_uiels.pop(0)
    current_row.uiels.append(current_block)
    current_row.margin_top = current_block.uie['layout']['top'] - top_offset

    # iterate over the uiels top down
    for u in sorted_uiels:
      current_bottom = current_block.uie['layout']['top'] + current_block.uie['layout']['height']
      u_top = u.uie['layout']['top']
      u_bottom = u_top + u.uie['layout']['height']

      #Two cases:
      #1. this block is in the current row.
      if u_top < current_bottom:
        current_row.uiels.append(u)
          #a. this block is extends longer than the current block
        if u_bottom > current_bottom:
          current_block = u
      #2. this block must be the top-most block in a new row
      else:
        current_row = Row()
        rows.append(current_row)

        current_row.uiels.append(u)
        current_row.margin_top = u_top - current_bottom

        current_block = u

    return rows
