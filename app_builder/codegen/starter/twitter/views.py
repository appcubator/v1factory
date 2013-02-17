# GENERIC IMPORTS
from django.views.generic import RedirectView
from django.views.generic.list import ListView
from django.views.generic.edit import CreateView

# FORM IMPORTS
from twitter.forms import TweetForm
from twitter.forms import UserForm

# MODEL IMPORTS
from django.contrib.auth.models import User
from twitter.models import Tweet

# CODE
class UserListView(ListView):
  model = User

class TweetListView(ListView):
  model = Tweet

class UserCreateView(CreateView):
  template_name = 'auth/user_form.html'
  form_class = UserForm
  success_url = '/users/'

  def form_valid(self, form):
    return super(TweetCreateView, self).form_valid(form)

class TweetCreateView(CreateView):
  template_name = 'twitter/tweet_form.html'
  form_class = TweetForm
  success_url = '/tweets/'

  def form_valid(self, form):
    form.instance.author = self.request.user
    return super(TweetCreateView, self).form_valid(form)

class HomepageRedirectView(RedirectView):
  url = "/tweets/"
  permanent = False
