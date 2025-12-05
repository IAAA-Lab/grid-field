from django.urls import path
from . import views
from .versioning import gitversioning

urlpatterns = [
    path('default', views.main_gridpage, name="default"),
    path('geojsonlvl8/', views.geojson_lvl8, name="geojsonlvl8"),
    path('geojsonlvl9/', views.geojson_lvl9, name="geojsonlvl9"),
    path('geojsonlvl10/', views.geojson_lvl10, name="geojsonlvl10"),
    path('geojsonlvl11/', views.geojson_lvl11, name="geojsonlvl11"),
    path('ajax/addrecordcallback/', views.add_records_to_db, name='addrecordcallback'),
    path('ajax/dwnldrecords/', views.download_all_records_csv, name='downloadrecords')
]

# gitversioning.setup_up_version_repo()