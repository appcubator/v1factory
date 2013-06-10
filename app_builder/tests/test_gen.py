
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
        s['tables'] = []
        s['info'] = {}

        return s


class IsComprehensiveTestCase(unittest.TestCase):

    def setUp(self):
        t = TestGenerator()
        self.d = t.make_state()
        #self.app = App.create_from_dict(d)

    def test_has_multiple_entities(self):
        import pprint
        pprint.pprint(self.d)
        pass

    def test_each_entity_has_multiple_primitive_fields_of_all_types(self):
        pass

    def test_each_entity_has_at_least_two_relational_fields(self):
        pass

    def test_all_relational_fields_occur_at_least_twice(self):
        pass

    def test_has_multiple_page(self):
        pass

    def test_have_pages_with_multiple_entities_in_context(self):
        pass

    def test_each_page_has_at_least_two_forms(self):
        pass

    def test_all_entities_have_create_forms(self):
        pass

    def test_some_create_forms_have_no_relations(self):
        pass

    def test_has_relational_create_form_involving_user(self):
        pass

    def test_has_relational_create_form_involving_page(self):
        pass

    def test_have_redirect_and_refresh(self):
        pass

if __name__ == '__main__':
    unittest.main()