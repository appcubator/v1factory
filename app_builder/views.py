from django.http import HttpResponse
from tests import master


def test(request):
    ret_code, debug_info = master.main()
    return HttpResponse("%s<br><br>%s" % (ret_code, debug_info))