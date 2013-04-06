from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save

from social_auth.signals import pre_update
from social_auth.backends.facebook import FacebookBackend

{% for m in models %}
{{ m.render(env) }}

{% endfor %}

def facebook_extra_values(sender, user, response, details, **kwargs):
  profile = user.get_profile()
  profile.email_field = response.get('email')
  profile.first_name_field = response.get('first_name')
  profile.last_name_field = response.get('last_name')
  profile.save()

pre_update.connect(facebook_extra_values, sender=FacebookBackend)
