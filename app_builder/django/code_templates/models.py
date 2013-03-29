from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save

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
