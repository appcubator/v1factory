from django.contrib.auth.forms import UserCreationForm
from webapp.models import UserProfile
from django.contrib.auth import authenticate, login
from django import forms

class UserProfileCreationForm(forms.ModelForm):
  class Meta:
    model = UserProfile
    fields = ({% for f in form_receiver.userprofile_fields %}"{{ f.identifier() }}", {% endfor %})

@require_POST
def {{ form_receiver.identifier() }}(request):
  """Create a User object"""
  uform = UserCreationForm(request.POST)
  pform = UserProfileCreationForm(request.POST)
  if uform.is_valid() and pform.is_valid():
    user = uform.save()
    profile = pform.save(commit=False)
    profile.user = user
    profile.save()

    new_user = authenticate(username=request.POST['username'],
                            password=request.POST['password1'])
    login(request, new_user)
    return ajax_redirect(request, '/')
  else:
    errors = {}
    errors.update(uform.errors)
    errors.update(pform.errors)
    return HttpResponse(simplejson.dumps(errors), mimetype="application/json")
