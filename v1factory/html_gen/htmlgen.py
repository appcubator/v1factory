#!/usr/bin/env python
# -*- coding: utf-8 -*-

# SET UP SOME TYPES
import pdb
import simplejson
import jinja2
from jinja2 import Environment, FileSystemLoader

import os.path
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
j2_env = Environment(loader=FileSystemLoader(THIS_DIR))

class Column(object):
  def __init__(self):
    # will either be a dictionary representing uielement, or a DomTree.
    self.uiels = []
    self.margin_left = 0
    self.width = 0
    self.tree = None # uninitialized state

  def render(self):
    return j2_env.get_template("column.html").render(col=self)


class Row(object):
  def __init__(self):
    self.uiels = []
    margin_top = 0
    self.cols = None # uninitialized state

  def render(self):
    if self.cols is None:
      raise Exception()
    return j2_env.get_template("row.html").render(row=self)


class DomTree(object):
  def __init__(self):
    self.rows = []

  def render(self):
    return "\n".join([r.render() for r in self.rows ])


# FUNCTIONS TO CREATE THOSE TYPES

def split_to_rows(uiels, top_offset=0):
  """Given some uielements, separate them into non-overlapping rows"""
  # do a top down sweep, to identify continuous areas of emptiness
  # start with an empty row, and include the top-most block
  # then see if there are other blocks which lie on top of this.bottom_boundary.
  # if there are, add it to this row. start with that block and try again
  # if not, then end the row. create a new row and repeat if there are more blocks to place.

  rows = []
  if len(uiels) == 0:
    return rows

  sorted_uiels = sorted(uiels, key=lambda u: u['layout']['top'])

  # topmost uiel must be in the row
  current_row = Row()
  rows.append(current_row)
  current_block = sorted_uiels.pop(0)
  current_row.uiels.append(current_block)
  current_row.margin_top = current_block['layout']['top'] - top_offset

  # iterate over the uiels top down
  for u in sorted_uiels:
    current_bottom = current_block['layout']['top'] + current_block['layout']['height']
    u_top = u['layout']['top']
    u_bottom = u_top + u['layout']['height']

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

def split_to_cols(uiels):
  """Given some uielements, separate them into non-overlapping columns"""
  cols = []
  if len(uiels) == 0:
    return cols

  sorted_uiels = sorted(uiels, key=lambda u: u['layout']['left'])
  #pdb.set_trace()

  # leftmost uiel must be in the row
  current_col = Column()
  cols.append(current_col)
  current_block = sorted_uiels.pop(0)
  current_col.uiels.append(current_block)
  current_col.margin_left = current_block['layout']['left']

  # iterate over the uiels left down
  for u in sorted_uiels:
    current_right = current_block['layout']['left'] + current_block['layout']['width']
    u_left = u['layout']['left']
    u_right = u_left + u['layout']['width']

    #Two cases:
    #1. this block is in the current row.
    if u_left < current_right:
      current_col.uiels.append(u)
        #a. this block is extends longer than the current block
      if u_right > current_right:
        current_block = u
    #2. this block must be the left-most block in a new row
    else:
      current_col.width = current_right - current_col.uiels[0]['layout']['left']

      current_col = Column()
      cols.append(current_col)

      current_col.uiels.append(u)
      current_col.margin_left = u_left - current_right

      current_block = u

  # set the width of the last column
  current_right = current_block['layout']['left'] + current_block['layout']['width']
  current_col.width = current_right - current_col.uiels[0]['layout']['left']

  return cols

def create_tree(uiels, recursive_num=0, top_offset=0):
  """Given some uielements, create a nested row -> column -> row -> ... -> column -> uielement"""
  tree = DomTree()

  tree.rows = split_to_rows(uiels, top_offset=top_offset)
  for r in tree.rows:
    r.cols = split_to_cols(r.uiels)
    for c in r.cols:
      if len(c.uiels) == 1:
        c.tree = None # termination of recursion
      else:
        if len(tree.rows) == 1 and len(r.cols) == 1:
          # in this case, recursion will not terminate since input is not subdivided into smaller components
          # create a relative container and absolute position the contents.
          c.tree = None
        else:
          c.tree = create_tree(c.uiels, top_offset=r.uiels[0]['layout']['top'])
  return tree

test_file = open('sample-page.json')

test_page = simplejson.load(test_file)
test_file.close()
uielements = test_page['uielements']
dom_tree = create_tree(uielements)

result = j2_env.get_template("base.html").render(domtree=dom_tree)
import codecs
f = codecs.open("test_output.html", "w", "utf-8")
f.write(result)
f.close()
