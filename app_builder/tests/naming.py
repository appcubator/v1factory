import unittest
from app_builder.naming import USNamespace, Identifier

class NewIdentifierTestCase(unittest.TestCase):

    def setUp(self):
        self.n = USNamespace()

    def test_basics(self):
        i = self.n.new_identifier('test', None)
        i2 = self.n.new_identifier('test', None)
        self.assertNotEqual(i.identifier , i2.identifier)

class NestingTestCase(unittest.TestCase):

    def setUp(self):
        n1 = USNamespace()
        i1 = n1.new_identifier('simplejson', None)

        # example of building from parents down
        n2 = USNamespace(parent_namespace=n1)
        i2 = n2.new_identifier('simplejson', None)

        # example from building parent afterward and adding children
        n3 = USNamespace()
        i3 = n3.new_identifier('simplejson', None)
        n3.add_child_namespace(n1)

        self.i1, self.i2, self.i3 = (i1, i2, i3)
        self.n1, self.n2, self.n3 = (n1, n2, n3)

    def test_resolved(self):
        print self.i1, self.i2, self.i3
        self.assertNotEqual(self.i1.identifier, self.i2.identifier)
        self.assertNotEqual(self.i2.identifier, self.i3.identifier)
        self.assertNotEqual(self.i1.identifier, self.i3.identifier)


if __name__ == "__main__":
    unittest.main()
