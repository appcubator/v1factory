from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save

from social_auth.signals import pre_update
from social_auth.backends.facebook import FacebookBackend

{% for m in models %}
{{ m.render() }}
{% endfor %}

# Automatically create a UserProfile when a User is created.
def create_profile(sender, **kw):
  user = kw["instance"]
  if kw["created"]:
    profile = UserProfile(m_User=user)
    profile.save()
post_save.connect(create_profile, sender=User)

def facebook_extra_values(sender, user, response, details, **kwargs):
    profile = user.get_profile()
    profile.m_Email = response.get('email')
    profile.m_First_Name = response.get('first_name')
    profile.m_Last_Name = response.get('last_name')
    profile.save()
pre_update.connect(facebook_extra_values, sender=FacebookBackend)
