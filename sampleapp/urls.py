from django.conf.urls import patterns, include, url
urlpatterns = patterns('',
  url(r'', include('social_auth.urls')),
  url(r'^login/$', 'django.contrib.auth.views.login' ),
  url(r'^logout/$', 'django.contrib.auth.views.logout'),
  url(r'^tweets/$', 'twitter.views.view_homepage'),
  url(r'^tweet/new/$', 'twitter.views.view_new_tweet'),

  url(r'^formsubmit/Tweet/3/$', 'twitter.form_receivers.save_TweetForm3'),
  url(r'^formsubmit/Tweet/1/$', 'twitter.form_receivers.save_TweetForm1'),
)