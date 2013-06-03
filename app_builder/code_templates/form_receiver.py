def JSONResponse(serializable_obj, **kwargs):
    return HttpResponse(simplejson.dumps(serializable_obj), mimetype="application/json", **kwargs)

@require_POST
def {{ fr.identifier }}(request):
    form = {{ fr.form_id }}(request.POST)
    if form.is_valid():
        # do some stuff
        obj = form.save()
        return JSONResponse({})

    return JSONResponse(form.errors)

