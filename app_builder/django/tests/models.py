import unittest
from app_builder.django.models import DjangoModel

class DjangoModelCreation(unittest.TestCase):
  def setUp(self):
    # mock analyzed app model
    self.abs_model
    self.analyzed_app

  def test_creation(self):
    dm = DjangoModel.create(self.abs_model, self.analyzed_app)

class DjangoModelRender(unittest.TestCase):
  def setUp(self):
    self.abs_model
    self.analyzed_app
    dm = DjangoModel.create(self.abs_model, self.analyzed_app)

  def test_render(self):
    out = dm.render()
