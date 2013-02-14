from django.db import models
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from app_builder.models import Class, Template

class App(models.Model):
  name = models.CharField(max_length=100)
  owner = models.ForeignKey(User, related_name='apps')

  classes = models.ManyToManyField(Class, related_name="+")
  templates = models.ManyToManyField(Template, related_name="+")

  def get_absolute_url(self):
    return reverse('v1factory.views.app_page', args=[str(self.id)])
