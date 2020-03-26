from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from .models import *
from django.core.serializers import serialize, json
from django.http import HttpResponse


def default_map(request):
    return render(request, 'default.html', {})

def geojson_lvl8(request):
    data_as_geojson = serialize('geojson', list(Res8Wgs84.objects.all()))
    return HttpResponse(data_as_geojson, content_type='json')


def geojson_lvl9(request):
    data_as_geojson = serialize('geojson', list(Res9Wgs84.objects.all()))
    return HttpResponse(data_as_geojson, content_type='json')


def main_gridpage(request):
    print(" IN Main_giridpage")
    context = {
        "grid": [],
    }
    context["grid"] = serialize('geojson', list(Res8Wgs84.objects.all()))

    return render(request, "default.html", context)