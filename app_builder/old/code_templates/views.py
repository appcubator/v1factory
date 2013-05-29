from django.http import HttpResponse, HttpRequest, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect, render, get_object_or_404
from django.conf import settings

{% for m in models %}
{{ m.import_line() }}
{% endfor %}

{% for v in views %}
{{ v.render(env) }}

{% endfor %}
