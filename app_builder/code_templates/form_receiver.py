from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
from django.utils import simplejson
from django.shortcuts import redirect, render, render_to_response, get_object_or_404


def JSONResponse(serializable_obj, **kwargs):
    return HttpResponse(simplejson.dumps(serializable_obj), mimetype="application/json", **kwargs)

@require_POST
def {{ fr.identifier }}(request):
    form = {{ fr.form_identifier }}(request.POST)
    if form.is_valid():
        # do some stuff
        obj = form.save()
        return JSONResponse({})

    return JSONResponse(form.errors)

