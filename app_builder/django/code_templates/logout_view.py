from django.contrib.auth import logout as auth_logout # avoid colliding with the following logout function

def {{ v.identifier() }}(request):
  """Logs out the user and displays 'You are logged out' message."""
  auth_logout(request)
  return redirect("/")
