
import unittest
from app_builder.analyzer import App
import random

TABLE_NAME_LIST = ["Bottle", "Glass", "Spoon", "Screen", "Monitor", "Cable"]
USER_NAME_LIST = ["Admin", "Carpooler", "Driver", "Wizard", "PG", "VC"]

class TestGenerator(object):


    def __init__(self):

        self.states = self.make_state()


    def make_relational_fields(self):
        pass

    def make_prim_fields(self):
        pass

    def make_table(self):
        dict = {}
        dict['name'] = TABLE_NAME_LIST[random.randrange(0, 6)]
        dict['fields'] = {}
        dict['fields'][0] = self.make_prim_fields()
        dict['fields'][1] = self.make_prim_fields()
        dict['fields'][2] = self.make_relational_fields()

        return dict

    def make_page(self):
        pass

    def make_uielements(self):
        pass

    def make_standard_create_forms(self):
        pass

    def make_related_forms(self):
        pass

    def make_state(self):
        s = {}
        s['pages'] = []
        s['entities'] = []
        s['users'] = {}
        s['tables']
        s['info'] = {}


class TestTestGenerator(unittest.TestCase):
    pass

if __name__ == '__main__':
    unittest.main()