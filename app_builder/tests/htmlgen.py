import unittest
import re
from app_builder.htmlgen import Tag

class HtmlGenBasicTestCase(unittest.TestCase):

    def test_some_text(self):
        ptag = Tag('p', {}, content="Hulloooo")

        self.assertEqual(ptag.render(), "<p>Hulloooo</p>")

    def test_nest(self):
        ptag = Tag('p', {},
                content=Tag('p', {}, content="Hulloooo"))

        self.assertEqual(re.sub(r'\s', '', ptag.render()), "<p><p>Hulloooo</p></p>")

    def test_nest_list(self):
        ptag = Tag('body', {},
                     content=(Tag('p', {}, content="A"),
                              Tag('span', {}, content="B"),
                              Tag('a', {}, content=Tag('p', {}, content="C"))),
                             )

        self.assertEqual(
                re.sub(r'\s', '', ptag.render()),
                "<body><p>A</p><span>B</span><a><p>C</p></a></body>")

    def test_no_content(self):
        tag = Tag('p', {})
        self.assertEqual(tag.render(), '<p></p>')

    def test_void_tag(self):
        br = Tag('br', {})
        self.assertEqual(br.render(), '<br>')

    def test_attribs(self):
        atag = Tag('a', { 'href': 'http://google.com/' }, content="Google")
        self.assertEqual(atag.render(), '<a href="http://google.com/">Google</a>')

    def test_id_class_style_attrib_order(self):
        kwargs = { 'id': "container",
                  'class': "some classes here",
                  'style': "position:absolute",
                  'alt': "This is after the others" }
        div = Tag('div', kwargs, content="Test")
        print div.render()
        self.assertEqual(div.render(), '<div id="container" class="some classes here" style="position:absolute" alt="This is after the others">Test</div>')

    def test_html_escape(self):
        atag = Tag('a', { 'href': 'http:"><script' }, content="Google")
        self.assertEqual(atag.render(), '<a href="http:&#34;&gt;&lt;script">Google</a>')

if __name__ == "__main__":
    unittest.main()
