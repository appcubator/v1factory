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
    url(r'^startx/$', 'v1factory.base_views.highland_view'),
    url(r'^thiel/$', 'v1factory.base_views.thiel_view'),
    url(r'^termsofservice/$', 'v1factory.base_views.terms_of_service'),
    url(r'^faq/$', 'v1factory.base_views.faq'),
    url(r'^account/$', 'v1factory.base_views.account'),
    url(r'^startx/video/$', 'v1factory.base_views.startx_video'),
    url(r'^tutorial/$', 'v1factory.base_views.tutorial'),
)

urlpatterns += patterns('v1factory.views',
    url(r'filepick', django.views.generic.base.TemplateView.as_view(template_name="dev/filepicker-test.html")),

    url(r'^app/$', 'app_list'),
    url(r'^app/new/$', 'app_new'),
    url(r'^app/(\d+)/delete/$', 'app_delete'),
    # entities
    url(r'^app/(\d+)/entities/xl/$', 'process_excel'),
    url(r'^app/(\d+)/entities/fetch_data/$', 'fetch_data'),

    # statix
    url(r'^app/(\d+)/static/$', 'staticfiles'), # a GET returns the apps statics, a POST creates a static file entry.
    url(r'^theme/(\d+)/static/$', 'themestaticfiles'), # a GET returns the apps statics, a POST creates a static file entry.
    # getting/setting state
    url(r'^app/(\d+)/state/$', 'app_state'),

    # getting/setting uie state
    url(r'^app/(\d+)/uiestate/$', 'uie_state'),
    url(r'^app/(\d+)/uiestate.less$', 'less_sheet'),
    url(r'^app/(\d+)/uiestate.css$', 'css_sheet'),

    # deploy
    url(r'^app/(\d+)/deploy/$', 'app_deploy'),
    url(r'^app/(\d+)/deploy/local/$', 'app_deploy_local'),

    # the rest
    url(r'^app/(\d+)/editor/(\d+)$', 'app_editor'),
    url(r'^app/(\d+)/', 'app_page'),

    # tutorial and logging
    url(r'^log/slide/$', 'log_slide'),

    url(r'^uielement/new/$', 'new_uielement'),

    url(r'^hipsterdesignersonly/$', 'designer_page'),
    url(r'^theme/new/$', 'theme_new'),
    url(r'^theme/(\d+)/$', 'theme_show'),
    url(r'^theme/(\d)/info/$', 'theme_info'),
    url(r'^theme/(\d)/edit/$', 'theme_edit'),
    url(r'^theme/(\d)/clone/$', 'theme_clone'),
    url(r'^theme/(\d)/delete/$', 'theme_delete'),
    url(r'^theme/(\d)/editor/(\d+)$', 'theme_page_editor'),
    url(r'^sendhostedemail/$', 'send_hosted_email'),

    url(r'^domains/([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,})/available_check/$', 'check_availability'),
    url(r'^domains/([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,})/register/$', 'register_domain'),

    url(r'^deploythisship/$', 'deploy_panel'), # a way to view and edit local and hosted deployments
    url(r'^deploy/local/$', 'deploy_local'), # tries to deploy locally
    url(r'^deploy/hosted/$', 'deploy_hosted'), # issues a command to the server to host a deployment
)

# production (hosted) deployments
if settings.PRODUCTION:
  urlpatterns += patterns('app_builder.deployment.views',
      url(r'^deployment/$', 'list_deployments'), # list the deployments and their statuses
      url(r'^deployment/available_check/$', 'available_check'), # check if the domain is available
      url(r'^deployment/init/$', 'init_subdomain'), # set up directories and apache
      url(r'^deployment/push/$', 'deploy_code'), # push the new code into the directory
      url(r'^deployment/delete/$', 'delete_deployment'), # push the new code into the directory
  )

from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns += staticfiles_urlpatterns()
