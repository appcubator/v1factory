
import unittest
from app_builder.analyzer import App
import random

TABLE_NAME_LIST = ["Bottle", "Glass", "Spoon", "Screen", "Monitor", "Cable"]
USER_NAME_LIST = ["Admin", "Carpooler", "Driver", "Wizard", "PG", "VC"]
PRIM_FIELD_LIST = ["Name", "Number Of Kids", "Money In The Bank", "Brew", "Favorite Language", "T-Shirt Size"]
FIELD_TYPES_LIST = ["number", "text", "image", "date", "email", "file"]
URLPART_LIST = ["profile", "barn", "beard", "pool", "notebook", "ryangosling"]
TRUE_OR_FALSE = [True, False]
ALIGNMENT_LIST = ["left", "center", "right"]


class TestGenerator(object):

    def __init__(self):

        self.states = self.make_state()

    def make_relational_fields(self):
        pass

    def make_prim_fields(self):
        dict = {}
        dict['name'] = PRIM_FIELD_LIST[random.randrange(0, 6)]
        dict['type'] = FIELD_TYPES_LIST[random.randrange(0, 6)]
        dict['required'] = TRUE_OR_FALSE[random.randrange(0, 2)]

        return dict

    def make_table(self):
        dict = {}
        dict['name'] = TABLE_NAME_LIST[random.randrange(0, 6)]
        dict['fields'] = []
        dict['fields'].append(self.make_prim_fields())
        dict['fields'].append(self.make_prim_fields())
        dict['fields'].append(self.make_relational_fields())

        return dict

    def make_user(self):
        dict = {}
        dict['name'] = USER_NAME_LIST[random.randrange(0, 6)]
        dict['fields'] = []
        dict['fields'].append(self.make_prim_fields())
        dict['fields'].append(self.make_prim_fields())
        dict['fields'].append(self.make_relational_fields())

        return dict

    def make_page(self):
        dict = {}
        dict['url'] = {}
        dict['url']['urlparts'] = []
        dict['url']['urlparts'].append(URLPART_LIST[random.randrange(0, 6)])
        dict['url']['urlparts'].append(URLPART_LIST[random.randrange(0, 6)])

        dict['navbar'] = self.make_navbar()
        dict['footer'] = self.make_footer()
        dict['uielements'] = []
        for i in range(0, random.randrange(0, 12)):
            dict['uielements'].append(self.make_uielement())

        return dict

    def make_navbar(self):
        dict = {}
        dict['isFixed'] = TRUE_OR_FALSE[random.randrange(0, 2)]
        dict['brandName'] = "HelloThere",
        dict['isHidden'] = TRUE_OR_FALSE[random.randrange(0, 2)]
        dict['links'] = []
        for i in range(0, random.randrange(0, 6)):
            dict['links'].append(self.make_navbar_link)
        return dict

    def make_footer(self):
        dict = {}
        dict['isFixed'] = TRUE_OR_FALSE[random.randrange(0, 2)]
        dict['customText'] = "CustomText",
        dict['isHidden'] = TRUE_OR_FALSE[random.randrange(0, 2)]
        dict['links'] = []
        for i in range(0, random.randrange(0, 6)):
            dict['links'].append(self.make_navbar_link)
        return dict

    def make_navbar_link(self):
        dict = {}
        dict['url'] = "internal://Homepage"
        dict['title'] = "NavbarItem"

        return dict

    def make_uielement(self):
        dict = {}
        dict['type'] = 'node'
        dict['layout'] = self.make_layout()
        pass

    def make_layout(self):
        dict = {}
        dict['top'] = random.randrange(0, 10)
        dict['height'] = random.randrange(0, 10)
        dict['width'] = random.randrange(0, 12)
        dict['left'] = random.randrange(0, 10)
        dict['t_padding'] = random.randrange(0, 5)
        dict['b_padding'] = random.randrange(0, 5)
        dict['l_padding'] = random.randrange(0, 5)
        dict['r_padding'] = random.randrange(0, 5)
        dict['alignment'] = ALIGNMENT_LIST[random.randrange(0, 3)]
        return dict

    def make_standard_create_forms(self):
        pass

    def make_related_forms(self):
        pass

    def make_state(self):
        s = {}

        s['pages'] = []
        for i in range(0, random.randrange(0, 6)):
            s['pages'].append(self.make_page())

        s['users'] = []
        for i in range(0, random.randrange(0, 6)):
            s['users'].append(self.make_user())

        s['tables'] = []
        for i in range(0, random.randrange(0, 6)):
            s['tables'].append(self.make_table())

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