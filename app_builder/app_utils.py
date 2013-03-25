import xlrd as xls
import sqlite3 as sql

def get_xl_data(xl_file):
    xl_dict = dict()
    xf = xls.open_workbook(xl_file)
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
    print xl_dict

def add_xl_data(xl_data, db_path):
    con = sql.connect(db_path)
    cr = con.cursor()
    model_name = xl_data['model_name']
    model_schema = ', '.join(xl_data['schema'])
    for r in xl_data['data']:
        cr.execute("insert into " + model_name + "(" + model_schema + ") values (" + qn_str + ")", r)
    con.commit()
    con.close()
