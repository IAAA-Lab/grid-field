from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.main_gridpage, name="default"),
    url(r'^geojsonlvl8/$', views.geojson_lvl8, name="geojsonlvl8"),
    url(r'^geojsonlvl9/$', views.geojson_lvl9, name="geojsonlvl9"),
    url(r'^ajax/addrecordcallback/$', views.add_records_to_db, name='addrecordcallback'),
    url(r'^ajax/dwnldrecords/$', views.download_all_records_csv, name='downloadrecords')
]