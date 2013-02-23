from django.forms import ModelForm
from django.contrib.auth.models import User
from twitter.models import Tweet

class TweetForm3(ModelForm):
  class Meta:
    model = Tweet
    fields = ('content',)

  def __init__(self, user, *args, **kwargs):
    self.user = user
    super(TweetForm3, self).__init__(*args, **kwargs)

  def save(self, *args, **kwargs):
    self.instance.user = self.user
    return super(TweetForm3, self).save(*args, **kwargs)

class TweetForm1(ModelForm):
  class Meta:
    model = Tweet
    fields = ('content',)

  def __init__(self, user, *args, **kwargs):
    self.user = user
    super(TweetForm1, self).__init__(*args, **kwargs)

  def save(self, *args, **kwargs):
    self.instance.user = self.user
    return super(TweetForm1, self).save(*args, **kwargs)
