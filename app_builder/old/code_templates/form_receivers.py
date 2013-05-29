from django.http import HttpResponse, HttpRequest
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect, render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt

def JSONResponse(serializable_obj, **kwargs):
   return HttpResponse(simplejson.dumps(serializable_obj), mimetype="application/json", **kwargs)

def ajax_redirect(request, *args, **kwargs):
  r = redirect(*args, **kwargs)
  if request.is_ajax():
    return HttpResponse(simplejson.dumps({ "redirect_to": r['Location'] }), mimetype='application/json')
  else:
    return r

{% for m in models %}
{{ m.import_line() }}
{% endfor %}

{% for v in form_receivers %}
{{ v.render(env) }}

{% endfor %}

from webapp.models import ExcelUploader, upload_user_excel as import_xl

@require_POST
@csrf_exempt
def upload_user_excel(request):
  assert request.POST['api_secret'] == 'uploadinG!!' # replace with some kind of passwd

  xl_file = request.FILES['excel_file']
  upldr = ExcelUploader(xl_file)
  created_cnt, updated_cnt, errors = import_xl(upldr)
  if len(errors) > 0:
    return JSONResponse({"errors":errors}, status=400)
  else:
    return JSONResponse({"updated": updated_cnt,
                         "created": created_cnt })
