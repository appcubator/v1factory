#!/usr/bin/env python
# -*- coding: utf-8 -*-

import codecs
import os.path
import pdb
import simplejson

from jinja2 import Environment, FileSystemLoader

class Renderable(object):
  """ Mixin representing a context that can render itself into a given
  environment. """
  def render(self, env):
    template_name = "{}.html".format(type(self).__name__.lower())
    return env.get_template(template_name).render(context=self, env=env)

class Column(Renderable):
  def __init__(self):
    # will either be a dictionary representing uielement, or a DomTree.
    self.uiels = []
    self.margin_left = 0
    self.width = 0
    self.tree = None # uninitialized state

class Row(Renderable):
  def __init__(self):
    self.uiels = []
    margin_top = 0
    self.cols = None # uninitialized state

class DomTree(Renderable):
  def __init__(self):
    self.rows = []

class TemplateRenderer(Renderable):
  """ Write a template using the new HTMLGen code """
  def __init__(self, state):
    self.state = state
    self.dom_tree = self.create_tree(self.state) # TODO FIXME: expensive action in __init__

  def create_tree(self, uiels, recursive_num=0, top_offset=0, left_offset=0):
    """Given some uielements, create a nested row -> column -> row -> ... -> column -> uielement"""
    tree = DomTree()

    tree.rows = self.split_to_rows(uiels, top_offset=top_offset)
    for r in tree.rows:
      r.cols = self.split_to_cols(r.uiels, left_offset=left_offset)
      for c in r.cols:
        if len(c.uiels) == 1:
          c.tree = None # termination of recursion
        else:
          if len(tree.rows) == 1 and len(r.cols) == 1:
            # in this case, recursion will not terminate since input is not subdivided into smaller components
            # create a relative container and absolute position the contents.
            c.tree = None
          else:
            c.tree = self.create_tree(c.uiels, top_offset=r.uiels[0].uie['layout']['top'], left_offset=c.uiels[0].uie['layout']['left'])
    return tree

  def split_to_cols(self, uiels, left_offset=0):
    """Given some uielements, separate them into non-overlapping columns"""
    cols = []
    if len(uiels) == 0:
      return cols

    sorted_uiels = sorted(uiels, key=lambda u: u.uie['layout']['left'])
    #pdb.set_trace()

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

if __name__ == "__main__":
  # Load the state from sample-page.json
  test_file = open('sample-page.json')
  state = simplejson.load(test_file)
  test_file.close()

  # Create the TemplateRenderer
  renderer = TemplateRenderer(state)

  # Create the template environment
  THIS_DIR = os.path.dirname(os.path.abspath(__file__))
  env = Environment(loader=FileSystemLoader(THIS_DIR))

  # Render the state into the environment
  output = renderer.render(env)

  f = codecs.open("test_output.html", "w", "utf-8")
  f.write(output)
  f.close()
