from django.contrib.auth.models import User
from django.db import models
class Tweet(models.Model):
  content = models.TextField()
  user = models.ForeignKey(User)
