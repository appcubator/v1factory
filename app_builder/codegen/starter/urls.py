# GENERIC IMPORTS
from django.conf.urls import patterns, include, url
from django.views.generic import RedirectView
from django.views.generic.list import ListView
from django.views.generic.edit import CreateView
from django.contrib.auth.models import User

# ENTITY IMPORTS
from twitter.models import Tweet

# VIEW IMPORTS
from twitter.views import TweetListView, TweetCreateView
from twitter.views import UserListView, UserCreateView
from twitter.views import HomepageRedirectView

urlpatterns = patterns('',
# user entity
  url(r'^login/$', 'django.contrib.auth.views.login' ),
  url(r'^logout/$', 'django.contrib.auth.views.logout'),
  url(r'^users/$', UserListView.as_view()),
  url(r'^users/new/$', UserCreateView.as_view()),

# tweet entities
  url(r'^$', HomepageRedirectView.as_view()),
  url(r'^tweets/$', TweetListView.as_view()),
  url(r'^tweets/new/$', TweetCreateView.as_view()),
)
