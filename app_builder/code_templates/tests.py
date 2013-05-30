from django.test import TestCase
from django.test.client import Client

class StaticPagesTestCase(TestCase):

    def setUp(self):
        self.c = Client()

    {% for identifier, url in test.identifier_url_pairs %}
    def test_{{ identifier }}(self):
        r = self.c.get('{{ url }}')
        self.assertEqual(r.status_code, 200)

    {% endfor %}
