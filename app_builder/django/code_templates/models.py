from django.db import models
from django.contrib.auth.models import User

{% for m in models %}
{{ m.render() }}
{% endfor %}
