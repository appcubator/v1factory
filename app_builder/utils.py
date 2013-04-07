import xlrd as xls
import sqlite3 as sql
import subprocess
import os
import shlex
import simplejson
import re
import hashlib

"""
  A class that stores various utilities used across the v1factory stack.
  This currently cotains the following utilities:
  1) Brace Extraction, {{ Str }} => Str
  2) Excel document related docs
  3) Hashing to create an API key
"""

# Creates a secure hash API key using the user's attribute.
def get_api_key(d_user):
  user_name = d_user['user_name']
  date_joined = d_user['date_joined']
  hash_string = user_name + str(date_joined)
  return hashlib.sha224(hash_string).hexdigest()

def extract_from_brace(s):
  "Takes a string out of the brace wrappers"
  m = re.match(r'\{\{(.+)\}\}', s)
  if m is None: return None
  else:
    return m.groups()[0].strip()

# Takes in an excel file object and returns a dictionary
# with the schema, model name and data of the excel sheet.
def get_xl_data(xl_file):
  xl_dict = dict()
  xf = xls.open_workbook(file_contents=xl_file.read())
  for sheet_name in xf.sheet_names():
    curr_sheet = xf.sheet_by_name(sheet_name)
    schema = ['id']
    for colnum in range(curr_sheet.ncols):
      # Replace spaces and dashes
      schema.append('m_' + curr_sheet.cell(0, colnum).value.replace(" ", "_").replace("-",""))
    # ensure no empty sheets are added unnecessarily
    if len(schema) > 1:
      xl_dict[sheet_name] = dict()
      xl_dict[sheet_name]['schema'] = schema
      xl_dict[sheet_name]['model_name'] = sheet_name
      data = []
      for r in range(curr_sheet.nrows):
        if r > 0:
          datar = []
          for c in range(curr_sheet.ncols):
            datar.append(curr_sheet.cell(r,c).value)
          data.append(datar)
      xl_dict[sheet_name]['data'] = data
  return xl_dict

# Gets at most limit records from the model_name table at the 
# database referenced by db_path. This returns a json representation
# with two key value pairs - schema and data.
# 
# Makes raw SQL queries to the databases to fetch the data.
def get_model_data(model_name, db_path, limit=100):
  model_name = model_name.lower()
  con = sql.connect(db_path)
  cr = con.cursor()
  li = []
  for row in cr.execute("select * from webapp_" + model_name + " limit " + str(limit)):
    row_li = list(row)
    # replace raw escaped characters in the sql output
    for e in row_li:
      e = str(e).replace('\"','')
    li.append(row_li)
  ans = dict()
  cr.execute("SELECT sql FROM sqlite_master WHERE type='table' and name='webapp_" + model_name + "'")
  schema_out =  cr.fetchall()
  # Hack to extract fields out of SQL output
  schema_fields = schema_out[0][0].split('"')[3:]
  schema_li = []
  for i in range(len(schema_fields)):
    if i%2 == 0:
      # Get rid of m_ prefixes for fields and replace _ with spaces
      if i == 0:
        schema_li.append(model_name + "_id")
      else:
        # fix possible space issues
        schema_li.append(schema_fields[i][2:].replace('_', ' '))
  con.close()
  ans['schema'] = schema_li
  ans['data'] = li
  return simplejson.dumps(ans)

# Populates the model_name table at the database at db_path with 
# the records in the xl_data dictionary object. This object is returned
# from the get_xl_data() call.
# 
# Makes raw SQL queries to the databases to add the data in.
def add_xl_data(xl_data, fe_data, app_state_entities, db_path):
  con = sql.connect(db_path)
  cr = con.cursor()
  for sheet in xl_data:
    model_name = "webapp_" + xl_data[sheet]['model_name'].lower()
    model_schema = ', '.join(xl_data[sheet]['schema'])
    if sheet not in app_state_entities:
      create_new_xl_table(xl_data[sheet], sheet, fe_data, db_path)
    elif not has_same_schema(model_name, db_path):
      create_new_xl_table(xl_data[sheet], sheet, fe_data, db_path, update=True)
    qn_list = []
    for i in range(len(xl_data[sheet]['schema'])-1):
      qn_list.append('?')
    qn_str = ','.join(qn_list)
    # Delete all rows and update.
    try:
      if 'data' in xl_data[sheet]:
        cr.execute("delete from " + model_name);
      for r in xl_data[sheet]['data']:
        cr.execute("insert or replace into " + model_name + "(" + model_schema + ") values ((SELECT 1 + coalesce((SELECT max(id) FROM " + model_name + "), 0))," + qn_str + ")", tuple(r))
    except sql.OperationalError, e:
      print "Failed to add xl data at %s" % db_path
      print str(e)
  con.commit()
  con.close()

def has_same_schema(xl_sheet, db_path):
  model_name = "webapp_" + xl_sheet['model_name'].lower()
  model_schema = xl_sheet['schema']
  schema_obj = simplejson.loads(get_model_data(model_name, db_path, limit=1))
  schema = schema_obj['schema']
  if len(schema) != len(model_schema):
    return False
  for i in range(len(schema)):
    ms = model_schema[i].replace(' ','_')
    if schema[i] != ms:
      print "Schema is not the same: %s %s" %(schema[i], ms)
      return False
  return True

def create_new_xl_table(xl_sheet, sheet, fe_data, db_path, update=False):
  con = sql.connect(db_path)
  cr = con.cursor()
  model_name = "webapp_" + xl_sheet['model_name'].lower()
  schema = xl_sheet['schema']
  schema_li = []
  for s in schema:
    if s == "id":
      schema_li.append("id int")
    else:
      # TODO(nkhadke,icanberk): Once front end data comes in
      # replace the database creation with strong types.
      # schema_li.append(s + " " + fe_data['type'][s])      
      schema_li.append('"' + s + '"')
  query = "create table " + model_name + "(\n"
  for s in schema_li:
    query += '   ' + s + ",\n"
  query = query[:-2]
  query += ")"
  try:
    if update:
      cr.execute("drop table " + model_name)
    cr.execute(query);
  except:
    print "Failed to create new table %s" % model_name

# REPL for django shell of generated app
class AppMessager:
  def __init__(self, app_dir):
    self.app_dir = app_dir
    env = os.environ.copy()
    if "DJANGO_SETTINGS_MODULE" in env:
      del env["DJANGO_SETTINGS_MODULE"]
      # Hack to make syncdb work.
      env["PATH"] = "/var/www/v1factory/venv/bin:" + env["PATH"]
    self.env = env

  # Ignores the return value of the command in message_string
  def run_void_cmd(self, message_string):
    echo_cmd = r"echo '%s'" % message_string
    cmd = r"python %s/manage.py shell" % self.app_dir
    print "Running:", echo_cmd
    ps = subprocess.Popen(shlex.split(echo_cmd), env=self.env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    p = subprocess.Popen(shlex.split(cmd), env=self.env, stdin=ps.stdout, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out, err = p.communicate()

  # Returns the result of the command in message_string
  def run_cmd(self, message_string):
    echo_cmd = r"echo '%s'" % message_string
    cmd = r"python %s/manage.py shell" % self.app_dir
    print "Running:", echo_cmd
    ps = subprocess.Popen(shlex.split(echo_cmd), env=self.env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    p = subprocess.Popen(shlex.split(cmd), env=self.env, stdin=ps.stdout, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out, err = p.communicate()
    # Gets the output of the django shell. Runs a command then we get another >>>. So we split and return the second last >>>.
    return out.split("\n>>> ")[-2]

