from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.main_gridpage, name="default"),
    url(r'^geojsonlvl8/$', views.geojson_lvl8, name="geojsonlvl8"),
    url(r'^geojsonlvl9/$', views.geojson_lvl9, name="geojsonlvl9"),
]