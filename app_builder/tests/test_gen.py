
import unittest
from app_builder.analyzer import App
import random

TABLE_NAME_LIST = ["Bottle", "Glass", "Spoon", "Screen", "Monitor", "Cable"]
USER_NAME_LIST = ["Admin", "Carpooler", "Driver", "Wizard", "PG", "VC"]
PRIM_FIELD_LIST = ["Name", "Number Of Kids", "Money In The Bank", "Brew", "Favorite Language", "T-Shirt Size"]
FIELD_TYPES_LIST = ["number", "text", "image", "date", "email", "file"]
RELATIONAL_FIELD_TYPES_LIST = ["fk", "o2o", "m2m"]
RELATED_NAME_FIELD_TYPES_LIST = ["Socks", "Trousers", "Tweet", "Keyboard"]
URLPART_LIST = ["profile", "barn", "beard", "pool", "notebook", "ryangosling"]
TRUE_OR_FALSE = [True, False]
ALIGNMENT_LIST = ["left", "center", "right"]


class TestGenerator(object):

    def __init__(self):

        self.state = {}

    def make_relational_fields(self):
        d = {}
        d['name'] = PRIM_FIELD_LIST[random.randrange(0, 6)]
        d['type'] = RELATIONAL_FIELD_TYPES_LIST[random.randrange(0, 3)]
        d['required'] = TRUE_OR_FALSE[random.randrange(0, 2)]
        d['entity_name'] = random.choice(self.state['users'])['name']
        d['related_name'] = random.choice(RELATED_NAME_FIELD_TYPES_LIST)
        return d

    def make_prim_fields(self):
        d = {}
        d['name'] = PRIM_FIELD_LIST[random.randrange(0, 6)]
        d['type'] = FIELD_TYPES_LIST[random.randrange(0, 6)]
        d['required'] = TRUE_OR_FALSE[random.randrange(0, 2)]
        return d

    def make_table(self):
        d = {}
        d['name'] = TABLE_NAME_LIST[random.randrange(0, 6)]
        d['fields'] = []
        d['fields'].append(self.make_prim_fields())
        d['fields'].append(self.make_prim_fields())
        return d

    def make_user(self):
        d = {}
        d['name'] = USER_NAME_LIST[random.randrange(0, 6)]
        d['fields'] = []
        d['fields'].append(self.make_prim_fields())
        d['fields'].append(self.make_prim_fields())
        return d

    def make_page(self):
        d = {}
        d['url'] = {}
        d['url']['urlparts'] = []
        d['url']['urlparts'].append(URLPART_LIST[random.randrange(0, 6)])
        d['url']['urlparts'].append(URLPART_LIST[random.randrange(0, 6)])

        d['navbar'] = self.make_navbar()
        d['footer'] = self.make_footer()
        d['uielements'] = []
        for i in range(0, random.randrange(0, 12)):
            d['uielements'].append(self.make_node())
        for i in range(0, random.randrange(0, 12)):
            d['uielements'].append(self.make_standard_create_forms())

        return d

    def make_navbar(self):
        d = {}
        d['isFixed'] = TRUE_OR_FALSE[random.randrange(0, 2)]
        d['brandName'] = "HelloThere",
        d['isHidden'] = TRUE_OR_FALSE[random.randrange(0, 2)]
        d['links'] = []
        for i in range(0, random.randrange(0, 6)):
            d['links'].append(self.make_navbar_link)
        return d

    def make_footer(self):
        d = {}
        d['isFixed'] = TRUE_OR_FALSE[random.randrange(0, 2)]
        d['customText'] = "CustomText",
        d['isHidden'] = TRUE_OR_FALSE[random.randrange(0, 2)]
        d['links'] = []
        for i in range(0, random.randrange(0, 6)):
            d['links'].append(self.make_navbar_link)
        return d

    def make_navbar_link(self):
        d = {}
        d['url'] = "internal://Homepage"
        d['title'] = "NavbarItem"

        return d

    def make_node(self):
        d = {}
        d['type'] = 'node'
        d['layout'] = self.make_layout()
        d['data'] = {}

        d['data']['isSingle'] = False
        d['data']['content_attribs'] = {}
        d['data']['hoverStyle'] = ""
        d['data']['class_name'] = "header-1"
        d['data']['content'] = "Welcome to Alper Games"
        d['data']['tagName'] = "h1"
        d['data']['type'] = "headerTexts"

        return d

    def make_layout(self):
        d = {}
        d['top'] = random.randrange(0, 10)
        d['height'] = random.randrange(0, 10)
        d['width'] = random.randrange(0, 12)
        d['left'] = random.randrange(0, 10)
        d['t_padding'] = random.randrange(0, 5)
        d['b_padding'] = random.randrange(0, 5)
        d['l_padding'] = random.randrange(0, 5)
        d['r_padding'] = random.randrange(0, 5)
        d['alignment'] = ALIGNMENT_LIST[random.randrange(0, 3)]
        return d

    def make_standard_create_forms(self):
        pass

    def make_related_forms(self):
        pass

    def make_state(self):
        s = self.state

        s['pages'] = []
        for i in range(0, random.randrange(0, 6)):
            s['pages'].append(self.make_page())

        s['users'] = []
        for i in range(1, random.randrange(0, 6)):
            s['users'].append(self.make_user())

        s['tables'] = []
        for i in range(1, random.randrange(0, 6)):
            s['tables'].append(self.make_table())

        [t['fields'].append(self.make_relational_fields()) for t in s['tables']]

        s['info'] = {}

        return s


class IsComprehensiveTestCase(unittest.TestCase):

    def setUp(self):
        t = TestGenerator()
        self.d = t.make_state()
        #self.app = App.create_from_d(d)

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