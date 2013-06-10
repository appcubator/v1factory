
import unittest
from app_builder.analyzer import App

class TestGenerator(object):


    def __init__(self):

        self.states = []




    def make_relational_fields(self):
        pass

    def make_prim_fields(self):
        pass

    def make_entity(self):
        pass

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
        s['info'] = {}


class TestTestGenerator(unittest.TestCase):
    pass

if __name__ == '__main__':
    unittest.main()