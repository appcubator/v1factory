import unittest
from app_builder.codes import DjangoField, DjangoModel, DjangoPageView, DjangoTemplate, DjangoURLs, DjangoStaticPagesTestCase
from app_builder.uielements import Node, Layout


class DjangoFieldCreationTestCase(unittest.TestCase):

    def test_django_type(self):
        f = DjangoField("some_id", "text")
        self.assertEqual(f.django_type, 'TextField')
        f = DjangoField("some_id", "number")
        self.assertEqual(f.django_type, 'FloatField')


class DjangoFieldKwargsTestCase(unittest.TestCase):

    def setUp(self):
        self.canon_types = ['text', 'number', 'date', 'email', 'image', '_CREATED', '_MODIFIED', ]

    def test_required_kwarg(self):
        for t in self.canon_types:
            f = DjangoField("some_id", t, required=True)
            f2 = DjangoField("some_id", t, required=False)
            self.assertNotIn('blank', f.kwargs())
            self.assertTrue(f2.kwargs()['blank'])

    def test_auto_created(self):
        f = DjangoField("some_id", '_CREATED')
        f2 = DjangoField("some_id", '_MODIFIED')
        self.assertTrue(f.kwargs()['auto_now_add'])
        self.assertTrue(f2.kwargs()['auto_now'])


class DjangoModelCreateFieldTestCase(unittest.TestCase):

    def setUp(self):
        self.model = DjangoModel("test_model")

    def test_create_field(self):
        self.model.create_field("idk", "text", True)
        self.model.create_field("idk2", "number", True)
        self.model.create_field("idk2", "date", True)

        self.assertEqual(len(self.model.fields), 3)


class DjangoTemplateSplitToRowsTestCase(unittest.TestCase):

    def setUp(self):
        self.template = DjangoTemplate("test_template")

    def test_rows_are_divided_if_separated(self):
        node1 = Node(layout=Layout(top=0, left=0, width=5, height=5), content="")
        node2 = Node(layout=Layout(top=6, left=0, width=5, height=5), content="")
        node3 = Node(layout=Layout(top=12, left=0, width=5, height=5), content="")
        uiels = [node1, node2, node3]

        rows = self.template.split_to_rows(uiels)
        self.assertEqual(len(rows), 3)

    def test_rows_are_divided_if_sep_but_touching(self):
        node1 = Node(layout=Layout(top=0, left=0, width=5, height=5), content="")
        node2 = Node(layout=Layout(top=5, left=0, width=5, height=5), content="")
        node3 = Node(layout=Layout(top=10, left=0, width=5, height=5), content="")
        uiels = [node1, node2, node3]

        rows = self.template.split_to_rows(uiels)
        self.assertEqual(len(rows), 3)

    def test_rows_are_not_divided_if_overlap(self):
        node1 = Node(layout=Layout(top=0, left=0, width=5, height=5), content="")
        node2 = Node(layout=Layout(top=4, left=0, width=5, height=5), content="")
        node3 = Node(layout=Layout(top=8, left=0, width=5, height=5), content="")
        uiels = [node1, node2, node3]

        rows = self.template.split_to_rows(uiels)
        self.assertEqual(len(rows), 1)

    def test_rows_are_not_divided_if_side_by_side(self):
        node1 = Node(layout=Layout(top=0, left=0, width=5, height=5), content="")
        node2 = Node(layout=Layout(top=0, left=20, width=5, height=5), content="")
        node3 = Node(layout=Layout(top=20, left=0, width=5, height=5), content="")
        uiels = [node1, node2, node3]

        rows = self.template.split_to_rows(uiels)
        self.assertEqual(len(rows), 2)
        self.assertEqual(len(rows[0].uiels), 2)
        self.assertEqual(len(rows[1].uiels), 1)



if __name__ == '__main__':
    unittest.main()
