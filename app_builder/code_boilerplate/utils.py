from django.http import HttpResponse
from django.utils import simplejson


def json_response(data={}, errors={}, success=True):
    data.update({
        'errors': errors,
        'success': len(errors) == 0 and success,
    })
    return simplejson.dumps(data)


class JsonResponse(HttpResponse):
    
    def __init__(self, data={}, errors={}, success=True):
        json = json_response(data=data, errors=errors, success=success)
        super(JsonResponse, self).__init__(json, mimetype='application/json')
        