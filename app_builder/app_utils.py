import xlrd as xls
import sqlite3 as sql
import subprocess
import os
import shlex

def get_xl_data(xl_file):
    xl_dict = dict()
    xf = xls.open_workbook(file_contents=xl_file.read())
    for sheet_name in xf.sheet_names():
	
        curr_sheet = xf.sheet_by_name(sheet_name)
        schema = []
        for colnum in range(curr_sheet.ncols):
            schema.append(curr_sheet.cell(0, colnum))
        # ensure no empty sheets are added unnecessarily
        if len(schema) > 0:
            xl_dict[sheet_name] = dict()
            xl_dict[sheet_name]['schema'] = schema
            xl_dict[sheet_name]['model_name'] = sheet_name
            data = []
            for r in range(curr_sheet.nrows):
                if r > 0:
                    datar = []
                    for c in range(curr_sheet.ncols):
                        datar.append(curr_sheet.cell(r,c))
                    data.append(datar)
            xl_dict[sheet_name]['data'] = data
    return xl_dict

def add_xl_data(xl_data, db_path):
    con = sql.connect(db_path)
    cr = con.cursor()
    model_name = xl_data['model_name']
    model_schema = ', '.join(xl_data['schema'])
    for r in xl_data['data']:
        cr.execute("insert or replace into " + model_name + "(" + model_schema + ") values (" + qn_str + ")", r)
    con.commit()
    con.close()

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
  
    def run_void_cmd(self, message_string):
        echo_cmd = r"echo '%s'" % message_string
        cmd = r"python %s/manage.py shell" % self.app_dir
        print "Running:", echo_cmd
        ps = subprocess.Popen(shlex.split(echo_cmd), env=self.env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        p = subprocess.Popen(shlex.split(cmd), env=self.env, stdin=ps.stdout, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        out, err = p.communicate()

    def run_cmd(self, message_string):
        echo_cmd = r"echo '%s'" % message_string
        cmd = r"python %s/manage.py shell" % self.app_dir
        print "Running:", echo_cmd
        ps = subprocess.Popen(shlex.split(echo_cmd), env=self.env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        p = subprocess.Popen(shlex.split(cmd), env=self.env, stdin=ps.stdout, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        out, err = p.communicate()
        # Gets the output of the django shell. Runs a command then we get another >>>. So we split and return the second last >>>.
        return out.split("\n>>> ")[-2]
    
