# GENERIC IMPORTS
from django.forms import ModelForm

# MODEL IMPORTS
from django.contrib.auth.models import User
from twitter.models import Tweet

# CODE
class TweetForm(ModelForm):
  class Meta:
    model = Tweet
    fields = ('content',)

class UserForm(ModelForm):
  class Meta:
    model = User
    fields = ('username', 'password', 'first_name')