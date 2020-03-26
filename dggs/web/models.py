from django.db import models
from django.contrib.gis.db import models

# Create your models here.
class Res10Wgs84(models.Model):
    gid = models.AutoField(primary_key=True)
    id = models.CharField(max_length=254, blank=True, null=True)
    geom = models.MultiPolygonField(blank=True, null=True)

    class Meta:
        db_table = 'res_10_wgs84'


class Res11Wgs84(models.Model):
    gid = models.AutoField(primary_key=True)
    id = models.CharField(max_length=254, blank=True, null=True)
    geom = models.MultiPolygonField(blank=True, null=True)

    class Meta:
        db_table = 'res_11_wgs84'


class Res8Wgs84(models.Model):
    gid = models.AutoField(primary_key=True)
    id = models.CharField(max_length=254, blank=True, null=True)
    geom = models.MultiPolygonField(blank=True, null=True)

    class Meta:
        db_table = 'res_8_wgs84'


class Res9Wgs84(models.Model):
    gid = models.AutoField(primary_key=True)
    id = models.CharField(max_length=254, blank=True, null=True)
    geom = models.MultiPolygonField(blank=True, null=True)

    class Meta:
        db_table = 'res_9_wgs84'