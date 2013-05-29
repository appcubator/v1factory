from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save

from social_auth.signals import pre_update
from social_auth.backends.facebook import FacebookBackend

import xlrd as xls

class ExcelUploader(object):

  def __init__(self, xl_file):
    xl_book = xls.open_workbook(file_contents=xl_file.read())
    self.book = xl_book

  def extract_data(self, fields):
    """
    IN:                                             OUT:
    ===                                             ===

    fields =                                          [{
        ['username','password']                         username: testing,
                                                        password: 123
    self(.book) =         < Book instance >           },
                                                      {
        username | password | randomfield | ...         username: testing2,
       =========================================        password: 1234
        testing  | 123      | hello       |           }]
        ---------------------------------------
        testing2 | 1234     | hello2      |
        ---------------------------------------
    """


    sheet = self.book.sheet_by_index(0)
    column_index_name_map = { c_name: i for i, c_name in enumerate(sheet.row_values(0)) }
    incl_cols = set( sheet.row_values(0) ).intersection(set( fields ))

    return_list = []

    # iterate through the rows and get the data for the selected columns
    for rowx in range(1, sheet.nrows):
      row = sheet.row(rowx)
      data = { c_name : row[column_index_name_map[c_name]].value for c_name in incl_cols }
      return_list.append(data)

    return return_list

def determine_common_fields(upldr, model_fields):
  """ Utility function used by upload_user_excel to find the
      common fields between the excel sheet and this user model """
  sheet = upldr.book.sheet_by_index(0)
  excel_fields = sheet.row_values(0) # assume it's an array of strings
    # TODO put some asserts in here for error reporting

  incl_fields = list(set(model_fields) & set(excel_fields))
  return incl_fields

{% for m in models %}
{{ m.render(env) }}

{% endfor %}

def facebook_extra_values(sender, user, response, details, **kwargs):
  profile = user.get_profile()
  profile.email_field = response.get('email')
  profile.first_name_field = response.get('first_name')
  profile.last_name_field = response.get('last_name')
  profile.save()

pre_update.connect(facebook_extra_values, sender=FacebookBackend)
