from django.conf.urls import patterns, include, url
from django.conf import settings
import django.contrib.auth.views
import v1factory.base_views, v1factory.views
import django.views.generic.base

# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'v1factory.base_views.homepage'),
    url(r'^login/$', 'django.contrib.auth.views.login', {'template_name' : 'registration/login_page.html'}),
    url(r'^logout/$', 'django.contrib.auth.views.logout', {"next_page":"/"}),
    url(r'^connect_with/$', 'v1factory.base_views.get_linkedin'),
    url(r'^signup/$', 'v1factory.base_views.signup'),
)

urlpatterns += patterns('v1factory.views',
    url(r'filepick', django.views.generic.base.TemplateView.as_view(template_name="dev/filepicker-test.html")),

    url(r'^app/$', 'app_list'),
    url(r'^app/new/$', 'app_new'),
    url(r'^app/(\d+)/$', 'app_page'),
    url(r'^app/(\d+)/delete/$', 'app_delete'),
    # entities
    url(r'^app/(\d+)/entities/$', 'entities'),
    # editor
    # urls
    url(r'^app/(\d+)/urls/$', 'app_urls'),
    # statix
    url(r'^app/(\d+)/static/$', 'staticfiles'), # a GET returns the apps statics, a POST creates a static file entry.
    # getting/setting state
    url(r'^app/(\d+)/state/$', 'app_state'),

    # getting/setting uie state
    url(r'^app/(\d+)/uiestate/$', 'uie_state'),
    # deploy this ship!
    #url(r'^app/(\d+)/deploy/$', 'app_deploy'),
    # the rest
    url(r'^app/(\d+)/analytics/$', 'app_analytics'),
    url(r'^app/(\d+)/design/$', 'app_design'),
    url(r'^app/(\d+)/gallery/$', 'app_gallery'),
    url(r'^app/(\d+)/data/$', 'app_data'),
    url(r'^app/(\d+)/finances/$', 'app_finances'),
    url(r'^app/(\d+)/info/$', 'app_info'),
    url(r'^app/(\d+)/pages/$', 'app_pages'),
    url(r'^app/(\d+)/pages/editor/(\d+)$', 'app_editor'),

    url(r'^app/(\d+)/account/$', 'account'),

    url(r'^uielement/new/$', 'new_uielement'),

    url(r'^hipsterdesignersonly/$', 'designer_page'),
    url(r'^deploythisship/$', 'deploy_panel'), # list the deployments and their statuses
)

if settings.PRODUCTION:
  urlpatterns += patterns('app_builder.deployment.views',
      url(r'^deployment/$', 'list_deployments'), # list the deployments and their statuses
      url(r'^deployment/available_check/$', 'available_check'), # check if the domain is available
      url(r'^deployment/init/$', 'init_subdomain'), # set up directories and apache
      url(r'^deployment/(\d)/push/$', 'deploy_code'), # push the new code into the directory
  )

from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns += staticfiles_urlpatterns()
